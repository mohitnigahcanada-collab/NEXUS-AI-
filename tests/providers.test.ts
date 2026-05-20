// Tests for src/providers.ts
import { test, expect, describe } from "bun:test";
import { getProvider, getAllProviders, getProvidersByTier, PROVIDERS } from "../src/providers";

describe("providers", () => {
  test("getAllProviders returns 7 providers", () => {
    const all = getAllProviders();
    expect(all.length).toBe(7);
  });

  test("getProvider returns correct provider by name", () => {
    const flash = getProvider("nexus-flash");
    expect(flash).toBeTruthy();
    expect(flash!.name).toBe("nexus-flash");
    expect(flash!.category).toBe("fast");
    expect(flash!.baseUrl).toContain("groq.com");
  });

  test("getProvider returns undefined for unknown model", () => {
    expect(getProvider("nexus-doesntexist")).toBeUndefined();
  });

  test("all providers have required fields", () => {
    const all = getAllProviders();
    for (const p of all) {
      expect(p.name).toBeTruthy();
      expect(p.baseUrl).toStartWith("https://");
      expect(p.model).toBeTruthy();
      expect(p.keyEnv).toBeTruthy();
      expect(p.tier).toBeGreaterThanOrEqual(1);
      expect(p.tier).toBeLessThanOrEqual(4);
      expect(typeof p.costPer1kTokens).toBe("number");
      expect(["fast", "general", "reasoning", "code", "free"]).toContain(p.category);
    }
  });

  test("getProvidersByTier filters correctly", () => {
    const tier1 = getProvidersByTier(1);
    expect(tier1.length).toBeGreaterThan(0);
    for (const p of tier1) {
      expect(p.tier).toBe(1);
    }
  });

  test("provider names never expose real backend names", () => {
    const all = getAllProviders();
    for (const p of all) {
      expect(p.name).toStartWith("nexus-");
      // Name should NOT contain provider names
      expect(p.name).not.toContain("groq");
      expect(p.name).not.toContain("gemini");
      expect(p.name).not.toContain("nvidia");
      expect(p.name).not.toContain("siliconflow");
      expect(p.name).not.toContain("poolside");
    }
  });

  test("costPer1kTokens is always less than OpenAI GPT-4o", () => {
    const all = getAllProviders();
    for (const p of all) {
      expect(p.costPer1kTokens).toBeLessThan(0.005); // GPT-4o is $5/1M = $0.005/1k
    }
  });
});
