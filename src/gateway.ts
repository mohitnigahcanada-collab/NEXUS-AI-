// Nexus AI - Core Gateway (OpenAI-compatible proxy with smart routing)

import { getProvider, getAllProviders, OPENAI_COST_PER_1K, type ProviderConfig } from "./providers";
import { autoRoute } from "./router";
import { isProviderHealthy, recordFailure, recordSuccess } from "./circuit-breaker";
import { stats } from "./stats";
import { getSetting } from "./db";
import { events } from "./events";

interface ChatRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  [key: string]: unknown;
}

// ─── Streaming Support ───────────────────────────────────────────

function getApiKey(provider: ProviderConfig): string {
  return process.env[provider.keyEnv] || "";
}

function getFallbackChain(originalModel: string): string[] {
  const allModels = ["nexus-flash", "nexus-air", "nexus-deep", "nexus-core", "nexus-pro", "nexus-code", "nexus-lite"];
  return allModels.filter((m) => m !== originalModel);
}

function buildProviderRequest(
  provider: ProviderConfig,
  body: ChatRequest,
  stream: boolean
): { url: string; headers: Record<string, string>; body: string } {
  const key = getApiKey(provider);
  if (!key) throw new Error(`No API key for ${provider.keyEnv}`);

  const url = `${provider.baseUrl}/chat/completions`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const finalUrl = url;
  headers["Authorization"] = `Bearer ${key}`;

  const requestBody = {
    ...body,
    model: provider.model,
    stream,
    ...(stream && { stream_options: { include_usage: true } }),
  };

  return { url: finalUrl, headers, body: JSON.stringify(requestBody) };
}

async function callProvider(
  provider: ProviderConfig,
  body: ChatRequest
): Promise<{ response: Response; latency: number }> {
  const { url, headers, body: reqBody } = buildProviderRequest(provider, body, false);

  const start = Date.now();
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: reqBody,
  });
  const latency = Date.now() - start;

  return { response, latency };
}

async function callProviderStream(
  provider: ProviderConfig,
  body: ChatRequest
): Promise<{ response: Response; startTime: number }> {
  const { url, headers, body: reqBody } = buildProviderRequest(provider, body, true);

  const startTime = Date.now();
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: reqBody,
  });

  return { response, startTime };
}

// Transform SSE stream: rewrite model name, capture usage
function createStreamTransformer(brandedModel: string, provider: ProviderConfig, startTime: number) {
  let buffer = "";
  let totalTokens = 0;

  return new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      buffer += decoder.decode(chunk, { stream: true });

      const lines = buffer.split("\n");
      // Keep the last potentially incomplete line in buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();

          if (data === "[DONE]") {
            // Record stats before sending DONE
            const latency = Date.now() - startTime;
            const cost = (totalTokens / 1000) * provider.costPer1kTokens;
            stats.record({
              model: brandedModel,
              tokens: totalTokens,
              cost,
              latency,
              timestamp: Date.now(),
              success: true,
            });
            // Publish live request event for streaming completion
            events.publish({
              type: "request",
              timestamp: Date.now(),
              data: {
                model: brandedModel,
                status: "stream completed",
                latency,
                tokens: totalTokens,
                cost,
                success: true,
              },
            });
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            // Rewrite model to branded name
            parsed.model = brandedModel;
            // Capture usage if present (final chunk from some providers)
            if (parsed.usage) {
              totalTokens = parsed.usage.total_tokens || parsed.usage.prompt_tokens + parsed.usage.completion_tokens || 0;
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(parsed)}\n\n`));
          } catch {
            // Pass through unparseable lines as-is
            controller.enqueue(encoder.encode(`${line}\n`));
          }
        } else if (line.trim() === "") {
          // Empty lines are part of SSE protocol, skip
        } else {
          // Non-data lines (comments, etc)
          controller.enqueue(encoder.encode(`${line}\n`));
        }
      }
    },

    flush(controller) {
      // Handle any remaining buffer
      if (buffer.trim()) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(`${buffer}\n`));
      }
      // If we never got usage data, record with estimate
      if (totalTokens === 0) {
        const latency = Date.now() - startTime;
        stats.record({
          model: brandedModel,
          tokens: 0,
          cost: 0,
          latency,
          timestamp: Date.now(),
          success: true,
        });
      }
    },
  });
}

export async function handleChatCompletion(body: ChatRequest): Promise<Response> {
  // Budget check
  if (!stats.canSpend()) {
    return new Response(
      JSON.stringify({
        error: { message: "Daily budget exceeded. Reset tomorrow or increase budget.", type: "budget_exceeded" },
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // Route: auto or manual
  let modelName = body.model;
  if (modelName === "auto" || !getProvider(modelName)) {
    const modelOverride = getSetting("model_override", "auto");
    modelName = getProvider(modelOverride) ? modelOverride : autoRoute(body.messages);
  }

  const isStream = body.stream === true;

  // Try primary provider + fallbacks
  const attempts = [modelName, ...getFallbackChain(modelName)];

  for (const attempt of attempts) {
    const provider = getProvider(attempt);
    if (!provider) continue;
    if (!isProviderHealthy(attempt)) continue;
    if (!getApiKey(provider)) continue;

    try {
      // ─── Streaming Path ─────────────────────────────────────
      if (isStream) {
        const { response, startTime } = await callProviderStream(provider, body);

        if (!response.ok) {
          if (response.status >= 429) {
            recordFailure(attempt);
            continue;
          }
          recordFailure(attempt);
          continue;
        }

        if (!response.body) {
          recordFailure(attempt);
          continue;
        }

        recordSuccess(attempt);

        // Pipe through transformer that rewrites model name + captures usage
        const transformer = createStreamTransformer(attempt, provider, startTime);
        const transformedStream = response.body.pipeThrough(transformer);

        return new Response(transformedStream, {
          status: 200,
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Nexus-Model": attempt,
          },
        });
      }

      // ─── Non-Streaming Path ─────────────────────────────────
      const { response, latency } = await callProvider(provider, body);

      if (!response.ok) {
        if (response.status >= 429) {
          recordFailure(attempt);
          continue;
        }
        recordFailure(attempt);
        continue;
      }

      const data = await response.json() as any;
      recordSuccess(attempt);

      // Calculate tokens and cost
      const tokens = data.usage?.total_tokens || 0;
      const cost = (tokens / 1000) * provider.costPer1kTokens;

      stats.record({
        model: attempt,
        tokens,
        cost,
        latency,
        timestamp: Date.now(),
        success: true,
      });

      // Publish live request event for dashboard
      events.publish({
        type: "request",
        timestamp: Date.now(),
        data: {
          model: attempt,
          status: "completed",
          latency,
          tokens,
          cost,
          success: true,
        },
      });

      // Rewrite response to show our model name
      data.model = attempt;

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      recordFailure(attempt);
      stats.record({
        model: attempt,
        tokens: 0,
        cost: 0,
        latency: 0,
        timestamp: Date.now(),
        success: false,
      });
      
      // Publish error event for dashboard
      events.publish({
        type: "error",
        timestamp: Date.now(),
        data: {
          model: attempt,
          message: err.message || "Provider request failed",
          success: false,
        },
      });
      
      continue;
    }
  }

  // All providers failed
  const errorResponse = {
    error: { message: "All providers failed. Please try again.", type: "all_providers_failed" },
  };

  if (isStream) {
    // Return error as SSE for streaming clients
    const encoder = new TextEncoder();
    const errorChunk = `data: ${JSON.stringify({ error: errorResponse.error })}\n\ndata: [DONE]\n\n`;
    return new Response(encoder.encode(errorChunk), {
      status: 503,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  return new Response(JSON.stringify(errorResponse), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
}
