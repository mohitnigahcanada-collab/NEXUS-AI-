// Nexus AI - SQLite Database (persistent stats, keys, settings)

import { Database } from "bun:sqlite";
import { join } from "path";

const DB_PATH = join(import.meta.dir, "..", "data", "nexus.db");

// Ensure data directory exists
import { mkdirSync } from "fs";
try {
  mkdirSync(join(import.meta.dir, "..", "data"), { recursive: true });
} catch {}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.run("PRAGMA journal_mode = WAL");
db.run("PRAGMA synchronous = NORMAL");
db.run("PRAGMA busy_timeout = 5000"); // Wait up to 5s if database is locked

// ─── Schema ──────────────────────────────────────────────────────

db.run(`
  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    tokens INTEGER DEFAULT 0,
    cost REAL DEFAULT 0,
    latency INTEGER DEFAULT 0,
    success INTEGER DEFAULT 1,
    timestamp INTEGER NOT NULL,
    routed_from TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS provider_keys (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    label TEXT,
    active INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL,
    last_used INTEGER
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS benchmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    latency_p50 INTEGER,
    latency_p95 INTEGER,
    tokens_per_second REAL,
    success_rate REAL,
    tested_at INTEGER NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    prefix TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    last_used INTEGER,
    active INTEGER DEFAULT 1
  )
`);

// Indexes for performance
db.run("CREATE INDEX IF NOT EXISTS idx_requests_timestamp ON requests(timestamp)");
db.run("CREATE INDEX IF NOT EXISTS idx_requests_model ON requests(model)");
db.run("CREATE INDEX IF NOT EXISTS idx_benchmarks_model ON benchmarks(model)");

// ─── Queries ─────────────────────────────────────────────────────

export const queries = {
  // Requests
  insertRequest: db.prepare(
    "INSERT INTO requests (model, tokens, cost, latency, success, timestamp, routed_from) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ),

  getRequestsSince: db.prepare(
    "SELECT * FROM requests WHERE timestamp >= ? ORDER BY timestamp DESC"
  ),

  getRequestStats: db.prepare(`
    SELECT 
      model,
      COUNT(*) as total_requests,
      SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
      SUM(tokens) as total_tokens,
      SUM(cost) as total_cost,
      AVG(latency) as avg_latency,
      MIN(latency) as min_latency,
      MAX(latency) as max_latency
    FROM requests 
    WHERE timestamp >= ?
    GROUP BY model
  `),

  getDailyStats: db.prepare(`
    SELECT 
      DATE(timestamp / 1000, 'unixepoch') as day,
      COUNT(*) as requests,
      SUM(tokens) as tokens,
      SUM(cost) as cost,
      AVG(latency) as avg_latency
    FROM requests
    WHERE timestamp >= ?
    GROUP BY day
    ORDER BY day
  `),

  getRecentRequests: db.prepare(
    "SELECT * FROM requests ORDER BY timestamp DESC LIMIT ?"
  ),

  // Settings
  getSetting: db.prepare("SELECT value FROM settings WHERE key = ?"),
  setSetting: db.prepare(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)"
  ),

  // API Keys
  insertApiKey: db.prepare(
    "INSERT INTO api_keys (id, name, key_hash, prefix, created_at) VALUES (?, ?, ?, ?, ?)"
  ),
  getApiKeys: db.prepare("SELECT id, name, prefix, created_at, last_used, active FROM api_keys"),
  getApiKeyByHash: db.prepare("SELECT * FROM api_keys WHERE key_hash = ? AND active = 1"),
  deactivateApiKey: db.prepare("UPDATE api_keys SET active = 0 WHERE id = ?"),
  touchApiKey: db.prepare("UPDATE api_keys SET last_used = ? WHERE id = ?"),

  // Provider Keys
  insertProviderKey: db.prepare(
    "INSERT OR REPLACE INTO provider_keys (id, provider, api_key_encrypted, label, active, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ),
  getProviderKeys: db.prepare("SELECT id, provider, label, active, created_at, last_used FROM provider_keys"),
  getProviderKey: db.prepare("SELECT * FROM provider_keys WHERE provider = ? AND active = 1"),
  deactivateProviderKey: db.prepare("UPDATE provider_keys SET active = 0 WHERE id = ?"),

  // Benchmarks
  insertBenchmark: db.prepare(
    "INSERT INTO benchmarks (model, latency_p50, latency_p95, tokens_per_second, success_rate, tested_at) VALUES (?, ?, ?, ?, ?, ?)"
  ),
  getLatestBenchmarks: db.prepare(`
    SELECT * FROM benchmarks 
    WHERE tested_at = (SELECT MAX(tested_at) FROM benchmarks)
    ORDER BY model
  `),
};

// ─── Helper Functions ────────────────────────────────────────────

export function recordRequest(data: {
  model: string;
  tokens: number;
  cost: number;
  latency: number;
  success: boolean;
  timestamp: number;
  routedFrom?: string;
}) {
  queries.insertRequest.run(
    data.model,
    data.tokens,
    data.cost,
    data.latency,
    data.success ? 1 : 0,
    data.timestamp,
    data.routedFrom || null
  );
}

export function getSetting(key: string, defaultValue: string = ""): string {
  const row = queries.getSetting.get(key) as { value: string } | null;
  return row?.value ?? defaultValue;
}

export function setSetting(key: string, value: string): void {
  queries.setSetting.run(key, value);
}

export { db };
