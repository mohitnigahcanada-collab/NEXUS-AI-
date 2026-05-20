// Tests for src/db.ts - SQLite persistence
import { test, expect, describe } from "bun:test";
import { recordRequest, queries, getSetting, setSetting } from "../src/db";

describe("database", () => {
  test("recordRequest writes to database", () => {
    const timestamp = Date.now();
    recordRequest({
      model: "nexus-flash",
      tokens: 100,
      cost: 0.0003,
      latency: 250,
      success: true,
      timestamp,
    });

    const rows = queries.getRequestsSince.all(timestamp - 1000) as any[];
    const found = rows.find((r: any) => r.timestamp === timestamp && r.model === "nexus-flash");
    expect(found).toBeTruthy();
    expect(found.tokens).toBe(100);
    expect(found.latency).toBe(250);
    expect(found.success).toBe(1);
  });

  test("getSetting returns default when key doesn't exist", () => {
    const value = getSetting("nonexistent_key_xyz", "default_val");
    expect(value).toBe("default_val");
  });

  test("setSetting persists and getSetting retrieves", () => {
    setSetting("test_key_123", "hello_world");
    const value = getSetting("test_key_123");
    expect(value).toBe("hello_world");
  });

  test("setSetting overwrites existing value", () => {
    setSetting("overwrite_test", "first");
    expect(getSetting("overwrite_test")).toBe("first");

    setSetting("overwrite_test", "second");
    expect(getSetting("overwrite_test")).toBe("second");
  });

  test("getRecentRequests returns limited results", () => {
    // Insert several requests
    for (let i = 0; i < 5; i++) {
      recordRequest({
        model: "nexus-air",
        tokens: 50,
        cost: 0.0001,
        latency: 100 + i * 10,
        success: true,
        timestamp: Date.now() + i,
      });
    }

    const recent = queries.getRecentRequests.all(3) as any[];
    expect(recent.length).toBe(3);
  });

  test("getRequestStats groups by model", () => {
    const since = Date.now() - 10000;
    const stats = queries.getRequestStats.all(since) as any[];
    // Should have entries (we inserted nexus-flash and nexus-air above)
    expect(stats.length).toBeGreaterThan(0);
    expect(stats[0]).toHaveProperty("model");
    expect(stats[0]).toHaveProperty("total_requests");
    expect(stats[0]).toHaveProperty("total_tokens");
  });
});
