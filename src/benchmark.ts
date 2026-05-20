// Nexus AI - Auto-Benchmark (test all providers, rank by speed/quality)

import { getAllProviders, type ProviderConfig } from "./providers";
import { queries } from "./db";
import { events } from "./events";

const BENCHMARK_PROMPT = [
  { role: "user" as const, content: "Respond with exactly: 'Hello, Nexus AI is operational.' Nothing else." },
];

interface BenchmarkResult {
  model: string;
  latencyP50: number;
  latencyP95: number;
  tokensPerSecond: number;
  successRate: number;
  testedAt: number;
}

async function benchmarkProvider(
  provider: ProviderConfig,
  runs: number = 3
): Promise<BenchmarkResult | null> {
  const key = process.env[provider.keyEnv];
  if (!key) return null;

  const latencies: number[] = [];
  let successes = 0;
  let totalTokens = 0;
  let totalTime = 0;

  for (let i = 0; i < runs; i++) {
    try {
      const url = provider.baseUrl.includes("googleapis.com")
        ? `${provider.baseUrl}/chat/completions?key=${key}`
        : `${provider.baseUrl}/chat/completions`;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (!provider.baseUrl.includes("googleapis.com")) {
        headers["Authorization"] = `Bearer ${key}`;
      }

      const start = Date.now();
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: provider.model,
          messages: BENCHMARK_PROMPT,
          max_tokens: 30,
          temperature: 0,
        }),
      });
      const latency = Date.now() - start;

      if (response.ok) {
        const data = (await response.json()) as any;
        latencies.push(latency);
        successes++;
        const tokens = data.usage?.completion_tokens || 10;
        totalTokens += tokens;
        totalTime += latency;
      }
    } catch {
      // Skip failed runs
    }

    // Small delay between runs to avoid rate limits
    await new Promise((r) => setTimeout(r, 500));
  }

  if (latencies.length === 0) return null;

  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || latencies[latencies.length - 1] || 0;
  const tps = totalTime > 0 ? (totalTokens / totalTime) * 1000 : 0;

  return {
    model: provider.name,
    latencyP50: p50,
    latencyP95: p95,
    tokensPerSecond: Math.round(tps * 10) / 10,
    successRate: Math.round((successes / runs) * 100),
    testedAt: Date.now(),
  };
}

export async function runBenchmark(): Promise<BenchmarkResult[]> {
  const providers = getAllProviders();
  const results: BenchmarkResult[] = [];

  events.emit({
    type: "request",
    timestamp: Date.now(),
    data: { action: "benchmark_started", models: providers.map((p) => p.name) },
  });

  // Run benchmarks sequentially to avoid rate limits
  for (const provider of providers) {
    const result = await benchmarkProvider(provider);
    if (result) {
      results.push(result);
      // Persist to DB
      queries.insertBenchmark.run(
        result.model,
        result.latencyP50,
        result.latencyP95,
        result.tokensPerSecond,
        result.successRate,
        result.testedAt
      );
    }
  }

  events.emit({
    type: "request",
    timestamp: Date.now(),
    data: { action: "benchmark_completed", results: results.length },
  });

  return results;
}

export function getLatestBenchmarks(): BenchmarkResult[] {
  const rows = queries.getLatestBenchmarks.all() as any[];
  return rows.map((r) => ({
    model: r.model,
    latencyP50: r.latency_p50,
    latencyP95: r.latency_p95,
    tokensPerSecond: r.tokens_per_second,
    successRate: r.success_rate,
    testedAt: r.tested_at,
  }));
}
