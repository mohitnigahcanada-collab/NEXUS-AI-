// Nexus AI - Main Entry Point (Backend + WebSocket + Frontend Serving)

import { Hono } from "hono";
import { cors } from "hono/cors";
import { handleChatCompletion } from "./gateway";
import { getAllProviders, PROVIDERS } from "./providers";
import { stats } from "./stats";
import { getCircuitStatus } from "./circuit-breaker";
import { events, type NexusEvent } from "./events";
import { createApiKey, listApiKeys, revokeApiKey, validateApiKey } from "./api-keys";
import { runBenchmark, getLatestBenchmarks } from "./benchmark";
import { getSetting, setSetting } from "./db";
import dashboardHtml from "./dashboard/index.html";

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

// Test a provider connection
app.post("/api/models/:model/test", async (c) => {
  const model = c.req.param("model");
  const provider = PROVIDERS[model];
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
    if (modelOverride !== "auto" && !PROVIDERS[modelOverride]) {
      return c.json({ error: "Invalid model override" }, 400);
    }
    setSetting("model_override", modelOverride);
  }
  return c.json({ ok: true });
});

// ─── Server Control (Restart/Stop) ───────────────────────────────

let serverStatus = { running: true, startTime: Date.now() };

app.get("/api/server/status", (c) => {
  return c.json({
    running: serverStatus.running,
    uptime: Date.now() - serverStatus.startTime,
    pid: process.pid,
    port: PORT,
    version: "2.0.1-bulletproof",
  });
});

app.post("/api/server/restart", async (c) => {
  // Broadcast restart event to all WebSocket clients
  events.publish({
    type: "system",
    timestamp: Date.now(),
    data: { action: "restart", message: "Server restarting..." },
  });

  // Schedule restart after response is sent
  setTimeout(() => {
    console.log("\n🔄 Server restart initiated from dashboard...\n");
    // Use Bun's subprocess to restart
    Bun.spawn(["bun", "run", "src/index.ts"], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["inherit", "inherit", "inherit"],
    });
    // Exit current process
    process.exit(0);
  }, 500);

  return c.json({ ok: true, message: "Restarting server..." });
});

app.post("/api/server/stop", async (c) => {
  // Broadcast stop event to all WebSocket clients
  events.publish({
    type: "system",
    timestamp: Date.now(),
    data: { action: "stop", message: "Server stopping..." },
  });

  // Schedule stop after response is sent
  setTimeout(() => {
    console.log("\n⏹️ Server stopped from dashboard.\n");
    process.exit(0);
  }, 500);

  return c.json({ ok: true, message: "Server stopping..." });
});

// ─── Health (backward compat) ────────────────────────────────────

app.get("/health", (c) => {
  const todayStats = stats.getTodayStats();
  const weekStats = stats.getWeekStats();
  const circuits = getCircuitStatus();
  return c.json({ status: "ok", version: "1.0.0", today: todayStats, week: weekStats, providers: circuits });
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
    models: ["nexus-flash", "nexus-air", "nexus-deep", "nexus-pro", "nexus-code", "nexus-lite", "auto"],
  });
});

// ─── Start ───────────────────────────────────────────────────────

console.log(`
╔═══════════════════ NEXUS AI v1.0.0 ═══════════════════╗
║                                                         ║
║  Gateway:   http://localhost:${PORT}/v1                  ║
║  Dashboard: http://localhost:${PORT}                     ║
║                                                         ║
║  Models:                                                ║
║    nexus-flash  → Ultra-fast responses                  ║
║    nexus-air    → Balanced & efficient                  ║
║    nexus-deep   → Deep thinking                         ║
║    nexus-pro    → Premium reasoning                     ║
║    nexus-code   → Code specialist                       ║
║    nexus-lite   → Free tier                             ║
║    auto         → Smart routing (recommended)           ║
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

// ─── Bun.serve with WebSocket + Hono ─────────────────────────────

const server = Bun.serve({
  port: PORT,
  hostname: "::",
  routes: {
    "/": dashboardHtml,
    "/dashboard": dashboardHtml,
  },
  fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname === WS_PATH) {
      const upgraded = server.upgrade(req);
      if (upgraded) return undefined;
      return new Response("WebSocket upgrade failed", { status: 400 });
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
});
