#!/usr/bin/env bun
// Ping all providers to test connectivity and get model info

// Load .env manually (Bun sometimes needs explicit path)
const envFile = Bun.file("../.env");
if (await envFile.exists()) {
  const text = await envFile.text();
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator <= 0) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    const quoted = (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
    if (quoted) value = value.slice(1, -1);
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

import { PROVIDERS } from "../src/providers";

interface PingResult {
  provider: string;
  model: string;
  baseUrl: string;
  status: "success" | "failed" | "error";
  latency?: number;
  contextLimit?: number;
  error?: string;
  details?: any;
}

async function pingProvider(name: string, config: any): Promise<PingResult> {
  const startTime = Date.now();
  const result: PingResult = {
    provider: name,
    model: config.model,
    baseUrl: config.baseUrl,
    status: "error",
  };

  try {
    const apiKey = process.env[config.keyEnv];
    if (!apiKey) {
      result.error = `Missing ${config.keyEnv}`;
      result.status = "error";
      return result;
    }

    // Try to get model info or list models
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Different auth formats for different providers
    if (config.keyEnv === "GEMINI_API_KEY") {
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    // Try models endpoint first
    let response = await fetch(`${config.baseUrl}/models`, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok && config.keyEnv === "GEMINI_API_KEY") {
      // Gemini might need different endpoint
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        { signal: AbortSignal.timeout(10000) }
      );
    }

    const latency = Date.now() - startTime;
    result.latency = latency;

    if (response.ok) {
      const data = await response.json();
      result.status = "success";
      result.details = data;

      // Try to extract context limit from response
      if (data.data && Array.isArray(data.data)) {
        const modelData = data.data.find((m: any) => 
          m.id === config.model || m.id.includes(config.model.split("/").pop())
        );
        if (modelData?.context_length) {
          result.contextLimit = modelData.context_length;
        }
      } else if (data.models && Array.isArray(data.models)) {
        const modelData = data.models.find((m: any) =>
          m.name?.includes(config.model.split("/").pop())
        );
        if (modelData?.inputTokenLimit) {
          result.contextLimit = modelData.inputTokenLimit;
        }
      }
    } else {
      result.status = "failed";
      result.error = `HTTP ${response.status}: ${await response.text().catch(() => "No error text")}`;
    }
  } catch (error: any) {
    result.status = "error";
    result.error = error.message;
  }

  return result;
}

async function main() {
  console.log("🔍 Pinging all Nexus AI providers...\n");

  const results: PingResult[] = [];

  for (const [name, config] of Object.entries(PROVIDERS)) {
    console.log(`⏳ Testing ${name} (${config.model})...`);
    const result = await pingProvider(name, config);
    results.push(result);

    const statusIcon =
      result.status === "success"
        ? "✅"
        : result.status === "failed"
        ? "⚠️"
        : "❌";
    console.log(
      `${statusIcon} ${name}: ${result.status} ${
        result.latency ? `(${result.latency}ms)` : ""
      }`
    );
    if (result.contextLimit) {
      console.log(`   Context: ${result.contextLimit.toLocaleString()} tokens`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error.slice(0, 100)}`);
    }
    console.log();
  }

  // Summary
  console.log("\n📊 Summary:\n");
  console.log("Provider".padEnd(20), "Status".padEnd(10), "Latency".padEnd(10), "Context Limit");
  console.log("-".repeat(70));

  results.forEach((r) => {
    console.log(
      r.provider.padEnd(20),
      r.status.padEnd(10),
      r.latency ? `${r.latency}ms`.padEnd(10) : "N/A".padEnd(10),
      r.contextLimit ? r.contextLimit.toLocaleString() : "Unknown"
    );
  });

  // Save results
  await Bun.write(
    "./scripts/provider-ping-results.json",
    JSON.stringify(results, null, 2)
  );
  console.log("\n💾 Results saved to scripts/provider-ping-results.json");
}

main();
