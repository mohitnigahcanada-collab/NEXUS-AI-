// Nexus AI - Main Entry Point (Backend + WebSocket + Frontend Serving)

import { Hono } from "hono";
import { cors } from "hono/cors";
import { handleChatCompletion } from "./gateway";
import { getAllProviders, ALL_PROVIDERS } from "./providers";
import { stats } from "./stats";
import { getCircuitStatus } from "./circuit-breaker";
import { events, type NexusEvent } from "./events";
import { createApiKey, listApiKeys, revokeApiKey, validateApiKey } from "./api-keys";
import { runBenchmark, getLatestBenchmarks } from "./benchmark";
import { getSetting, setSetting } from "./db";
import { getAllVariants } from "./variants";
import { healthMonitor } from "./health-monitor";
import { exec } from "bun";
// import { loadKeysFromKeyring } from "./keyring-loader";

// Load API keys from GNOME Keyring (secure storage) - DISABLED for benchmarking
// loadKeysFromKeyring().catch(console.error);

// Start health monitoring system
healthMonitor.start();

const app = new Hono();
const PORT = parseInt(process.env.NEXUS_PORT || "4000");

async function loadLocalEnvFile() {
  const envFile = Bun.file(".env");
  if (!(await envFile.exists())) return;

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

await loadLocalEnvFile();

// Track WebSocket upgrade path
const WS_PATH = "/ws";

// CORS for dashboard
app.use("/api/*", cors({ origin: "*" }));

// ─── OpenAI-Compatible Endpoints ─────────────────────────────────

app.post("/v1/chat/completions", async (c) => {
  const body = await c.req.json();

  // Validate unified API key if provided
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer nxs_")) {
    const key = authHeader.slice(7);
    const valid = await validateApiKey(key);
    if (!valid) {
      return c.json({ error: { message: "Invalid API key", type: "invalid_api_key" } }, 401);
    }
  }

  const result = await handleChatCompletion(body);

  if (result.headers.get("Content-Type") === "text/event-stream") {
    return new Response(result.body, {
      status: result.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Nexus-Model": result.headers.get("X-Nexus-Model") || "",
      },
    });
  }

  const data = await result.json();
  return c.json(data, result.status as any);
});

app.get("/v1/models", (c) => {
  const models = getAllProviders().map((p) => ({
    id: p.name,
    object: "model",
    created: 1700000000,
    owned_by: "nexus-ai",
    permission: [],
  }));
  return c.json({ object: "list", data: models });
});

// ─── Dashboard API ───────────────────────────────────────────────

// Overview stats
app.get("/api/stats", (c) => {
  const todayStats = stats.getTodayStats();
  const weekStats = stats.getWeekStats();
  const circuits = getCircuitStatus();

  return c.json({
    today: todayStats,
    week: weekStats,
    providers: circuits,
  });
});

// Per-model breakdown
app.get("/api/stats/models", (c) => {
  const since = parseInt(c.req.query("since") || String(Date.now() - 24 * 60 * 60 * 1000));
  const modelStats = stats.getModelStats(since);
  return c.json({ models: modelStats });
});

// Daily historical data (for charts)
app.get("/api/stats/history", (c) => {
  const days = parseInt(c.req.query("days") || "7");
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  const daily = stats.getDailyStats(since);
  return c.json({ daily });
});

// Recent activity log
app.get("/api/activity", (c) => {
  const limit = parseInt(c.req.query("limit") || "20");
  return c.json({ logs: stats.getRecentLogs(limit) });
});

// ─── Provider Management ─────────────────────────────────────────

// List all available models with their status
app.get("/api/models", (c) => {
  const circuits = getCircuitStatus();
  const benchmarks = getLatestBenchmarks();
  const benchmarkMap = Object.fromEntries(benchmarks.map((b) => [b.model, b]));

  const models = getAllProviders().map((p) => ({
    id: p.name,
    category: p.category,
    tier: p.tier,
    costPer1kTokens: p.costPer1kTokens,
    healthy: circuits[p.name]?.healthy ?? true,
    failures: circuits[p.name]?.failures ?? 0,
    hasKey: !!process.env[p.keyEnv],
    benchmark: benchmarkMap[p.name] || null,
  }));

  return c.json({ models });
});

// List available variants (fast, balance, pro, xmax, auto)
app.get("/api/variants", (c) => {
  const variants = getAllVariants();
  const circuits = getCircuitStatus();
  
  const enrichedVariants = variants.map(v => {
    let healthy = true;
    let avgLatency: number | null = null;
    
    if (v.currentModel && v.currentModel !== "varies") {
      const provider = ALL_PROVIDERS[v.currentModel];
      healthy = circuits[v.currentModel]?.healthy ?? true;
      avgLatency = provider?.benchmarks?.latency || null;
    }
    
    return {
      ...v,
      healthy,
      avgLatency,
    };
  });
  
  return c.json({ variants: enrichedVariants });
});

// Test a provider connection
app.post("/api/models/:model/test", async (c) => {
  const model = c.req.param("model");
  const provider = ALL_PROVIDERS[model];
  if (!provider) return c.json({ error: "Model not found" }, 404);

  const key = process.env[provider.keyEnv];
  if (!key) return c.json({ error: "No API key configured", healthy: false }, 200);

  try {
    const url = `${provider.baseUrl}/chat/completions`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    };

    const start = Date.now();
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: provider.model,
        messages: [{ role: "user", content: "Say ok" }],
        max_tokens: 5,
      }),
    });
    const latency = Date.now() - start;

    return c.json({ healthy: response.ok, latency, status: response.status });
  } catch (err: any) {
    return c.json({ healthy: false, error: err.message });
  }
});

// ─── API Key Management ──────────────────────────────────────────

app.get("/api/keys", (c) => {
  return c.json({ keys: listApiKeys() });
});

app.post("/api/keys", async (c) => {
  const { name } = await c.req.json();
  if (!name) return c.json({ error: "Name is required" }, 400);
  const result = await createApiKey(name);
  return c.json(result, 201);
});

app.delete("/api/keys/:id", (c) => {
  const id = c.req.param("id");
  revokeApiKey(id);
  return c.json({ ok: true });
});

// ─── Benchmark ───────────────────────────────────────────────────

app.get("/api/benchmark", (c) => {
  const results = getLatestBenchmarks();
  return c.json({ benchmarks: results });
});

app.post("/api/benchmark/run", async (c) => {
  const results = await runBenchmark();
  return c.json({ benchmarks: results });
});

// ─── Settings ────────────────────────────────────────────────────

app.get("/api/settings", (c) => {
  return c.json({
    dailyBudget: stats.getBudget(),
    modelOverride: getSetting("model_override", "auto"),
    port: PORT,
    version: "1.0.0",
  });
});

app.put("/api/settings", async (c) => {
  const body = await c.req.json();
  if (body.dailyBudget !== undefined) {
    stats.setBudget(body.dailyBudget);
  }
  if (body.modelOverride !== undefined) {
    const modelOverride = String(body.modelOverride);
    if (modelOverride !== "auto" && !ALL_PROVIDERS[modelOverride]) {
      return c.json({ error: "Invalid model override" }, 400);
    }
    setSetting("model_override", modelOverride);
  }
  return c.json({ ok: true });
});

// ─── Health & Monitoring ─────────────────────────────────────────

app.get("/health", (c) => {
  const todayStats = stats.getTodayStats();
  const weekStats = stats.getWeekStats();
  const circuits = getCircuitStatus();
  const healthReport = healthMonitor.getHealthReport();
  
  return c.json({ 
    status: healthReport.overallHealth === "healthy" ? "ok" : healthReport.overallHealth,
    version: "2.0.0-bulletproof",
    health: healthReport,
    today: todayStats,
    week: weekStats,
    providers: circuits
  });
});

app.get("/api/health/detailed", (c) => {
  return c.json(healthMonitor.getHealthReport());
});

// ─── Service Management ───────────────────────────────────────────

// Get recent logs (last 100 lines from both files)
app.get("/api/logs", async (c) => {
  const lines = parseInt(c.req.query("lines") || "100");
  const logFiles = [
    "/home/mohit/nexus-ai-v2/logs/nexus.log",
    "/home/mohit/nexus-ai-v2/logs/nexus-error.log",
  ];

  const entries: { source: string; line: string }[] = [];

  for (const logFile of logFiles) {
    try {
      const file = Bun.file(logFile);
      if (await file.exists()) {
        const text = await file.text();
        const allLines = text.split("\n").filter(l => l.trim());
        const recentLines = allLines.slice(-lines);
        for (const line of recentLines) {
          entries.push({
            source: logFile.endsWith("error.log") ? "error" : "info",
            line,
          });
        }
      }
    } catch (err) {
      entries.push({ source: "system", line: `[Error reading ${logFile}]: ${err}` });
    }
  }

  // Sort by recency (approximate since we don't have timestamps parsed)
  return c.json({ entries: entries.reverse() });
});

// Restart service (admin only - check for secret header)
app.post("/api/restart", async (c) => {
  const authHeader = c.req.header("X-Admin-Token");
  const expectedToken = process.env.NEXUS_ADMIN_TOKEN;

  if (!expectedToken || authHeader !== expectedToken) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // Emit restart event to WebSocket clients
    events.emit({
      type: "restart",
      timestamp: Date.now(),
      data: { reason: "manual_restart", initiatedBy: "admin" },
    });

    // Give time for the response to be sent
    setTimeout(async () => {
      try {
        // Use systemctl restart
        const result = await exec(["systemctl", "restart", "nexus-backend"], {
          stdout: "pipe",
          stderr: "pipe",
        });
        console.log("Restart command output:", result.stdout, result.stderr);
      } catch (err: any) {
        console.error("Restart failed:", err);
      }
    }, 500);

    return c.json({ ok: true, message: "Restart initiated" });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ─── Info ────────────────────────────────────────────────────────

app.get("/v1", (c) => {
  return c.json({
    status: "Nexus AI Gateway is running",
    version: "1.0.0",
    endpoints: {
      chat: "POST /v1/chat/completions",
      models: "GET /v1/models",
      health: "GET /health",
      dashboard: "GET /",
      api: {
        stats: "GET /api/stats",
        models: "GET /api/models",
        keys: "GET /api/keys",
        benchmark: "GET /api/benchmark",
        settings: "GET /api/settings",
      },
    },
    models: Object.keys(ALL_PROVIDERS).concat(["auto"]),
  });
});

// ─── Start ───────────────────────────────────────────────────────

const modelList = Object.entries(ALL_PROVIDERS)
  .reduce((acc: any, [name, config]) => {
    if (!acc[config.tier]) acc[config.tier] = [];
    acc[config.tier].push(name);
    return acc;
  }, {});

console.log(`
╔═══════════════════ NEXUS AI v2.0.0 ═══════════════════╗
║                                                         ║
║  Gateway:   http://localhost:${PORT}/v1                  ║
║  Dashboard: http://localhost:${PORT}                     ║
║                                                         ║
║  🎯 16 Models | 4 Tiers | 5 Providers                  ║
║                                                         ║
║  Complex Coding:  4 models (GPT-4o, Claude, DeepSeek)  ║
║  Reasoning:       4 models (Gemini 3.1 Pro, 2.5 Pro)   ║
║  Heavy Lifting:   4 models (DeepSeek, Llama 3.3-70B)   ║
║  Simple Chat:     4 models (Llama 3.1-8B, Gemma 2-9B)  ║
║                                                         ║
║  Use "auto" for intelligent routing 🚀                 ║
║                                                         ║
╚═══════════════════════════════════════════════════════════╝
`);

// ─── WebSocket for live events ───────────────────────────────────

const wsClients = new Set<any>();

events.subscribe((event: NexusEvent) => {
  const message = JSON.stringify(event);
  for (const ws of wsClients) {
    try {
      ws.send(message);
    } catch {
      wsClients.delete(ws);
    }
  }
});

// ─── Watchdog removed - it was killing the service every 60s ────

// ─── Bun.serve with WebSocket + Hono ─────────────────────────────

const server = Bun.serve({
  port: PORT,
  hostname: "::",
  fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname === WS_PATH) {
      const upgraded = server.upgrade(req);
      if (upgraded) return undefined;
      return new Response("WebSocket upgrade failed", { status: 400 });
    }

    // Serve dashboard HTML at root (with bundling support)
    if (url.pathname === "/" || url.pathname === "/dashboard") {
      return new Response(Bun.file("./src/dashboard/index.html"), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Serve dashboard assets (JS, CSS, fonts, etc.)
    if (url.pathname.startsWith("/dashboard/") || 
        url.pathname.match(/\.(tsx?|jsx?|css)$/)) {
      const filePath = url.pathname.startsWith("/dashboard/") 
        ? `./src${url.pathname}`
        : `./src/dashboard${url.pathname}`;
      const file = Bun.file(filePath);
      return new Response(file);
    }

    // All other routes handled by Hono
    return app.fetch(req);
  },
  websocket: {
    open(ws) {
      wsClients.add(ws);
      ws.send(JSON.stringify({
        type: "init",
        timestamp: Date.now(),
        data: {
          today: stats.getTodayStats(),
          week: stats.getWeekStats(),
          providers: getCircuitStatus(),
        },
      }));
    },
    message(ws, message) {
      if (message === "ping") ws.send("pong");
    },
    close(ws) {
      wsClients.delete(ws);
    },
  },
  development: {
    hmr: true,
  },
});

// ─── Graceful Shutdown ───────────────────────────────────────────

function shutdown(signal: string) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  // Stop health monitoring
  healthMonitor.stop();
  
  // Close all WebSocket connections
  for (const ws of wsClients) {
    try {
      ws.close(1000, "Server shutting down");
    } catch {}
  }
  wsClients.clear();
  
  // Give time for connections to close
  setTimeout(() => {
    console.log("Shutdown complete.");
    process.exit(0);
  }, 1000);
}

// Handle shutdown signals
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGABRT", () => shutdown("SIGABRT"));

// Handle uncaught errors gracefully
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  // Don't exit - log and continue
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason);
  // Don't exit - log and continue
});
