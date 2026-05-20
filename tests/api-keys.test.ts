// Tests for src/api-keys.ts
import { test, expect, describe } from "bun:test";
import { createApiKey, validateApiKey, listApiKeys, revokeApiKey } from "../src/api-keys";

describe("api-keys", () => {
  test("createApiKey generates a key with nxs_ prefix", async () => {
    const result = await createApiKey("Test Key");
    expect(result.key).toStartWith("nxs_");
    expect(result.key.length).toBeGreaterThan(20);
    expect(result.id).toBeTruthy();
    expect(result.prefix).toStartWith("nxs_");
    expect(result.prefix).toEndWith("...");
  });

  test("validateApiKey returns true for valid key", async () => {
    const { key } = await createApiKey("Validation Test");
    const valid = await validateApiKey(key);
    expect(valid).toBe(true);
  });

  test("validateApiKey returns false for invalid key", async () => {
    const valid = await validateApiKey("nxs_totallyFakeKeyThatDoesntExist12345");
    expect(valid).toBe(false);
  });

  test("validateApiKey returns false for non-nxs prefixed key", async () => {
    const valid = await validateApiKey("sk-fake-openai-key");
    expect(valid).toBe(false);
  });

  test("listApiKeys returns created keys", async () => {
    const { id } = await createApiKey("List Test Key");
    const keys = listApiKeys();
    const found = keys.find((k) => k.id === id);
    expect(found).toBeTruthy();
    expect(found!.name).toBe("List Test Key");
    expect(found!.active).toBe(1);
  });

  test("revokeApiKey makes key invalid", async () => {
    const { id, key } = await createApiKey("Revoke Test");

    // Valid before revocation
    expect(await validateApiKey(key)).toBe(true);

    // Revoke
    revokeApiKey(id);

    // Invalid after revocation
    expect(await validateApiKey(key)).toBe(false);
  });
});
