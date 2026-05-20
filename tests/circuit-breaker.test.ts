// Tests for src/circuit-breaker.ts
import { test, expect, describe, beforeEach } from "bun:test";
import { isProviderHealthy, recordFailure, recordSuccess, getCircuitStatus } from "../src/circuit-breaker";

describe("circuit-breaker", () => {
  // Reset by recording success before each test
  beforeEach(() => {
    recordSuccess("test-provider");
    recordSuccess("test-provider-2");
  });

  test("new provider is healthy by default", () => {
    expect(isProviderHealthy("brand-new-provider")).toBe(true);
  });

  test("provider stays healthy after 1-2 failures", () => {
    recordFailure("test-provider");
    expect(isProviderHealthy("test-provider")).toBe(true);

    recordFailure("test-provider");
    expect(isProviderHealthy("test-provider")).toBe(true);
  });

  test("provider becomes unhealthy after 3 failures (circuit opens)", () => {
    recordFailure("test-provider");
    recordFailure("test-provider");
    recordFailure("test-provider");
    expect(isProviderHealthy("test-provider")).toBe(false);
  });

  test("recording success resets circuit", () => {
    recordFailure("test-provider");
    recordFailure("test-provider");
    recordFailure("test-provider");
    expect(isProviderHealthy("test-provider")).toBe(false);

    recordSuccess("test-provider");
    expect(isProviderHealthy("test-provider")).toBe(true);
  });

  test("getCircuitStatus returns status for all tracked providers", () => {
    recordFailure("test-provider");
    recordFailure("test-provider-2");
    recordFailure("test-provider-2");
    recordFailure("test-provider-2");

    const status = getCircuitStatus();
    expect(status["test-provider"]).toEqual({ healthy: true, failures: 1 });
    expect(status["test-provider-2"]).toEqual({ healthy: false, failures: 3 });
  });
});
