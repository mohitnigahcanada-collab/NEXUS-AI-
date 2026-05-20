// Nexus AI - Unified API Key Management
// Generate and validate "nxs_" prefixed keys that route to all providers

import { queries } from "./db";

const KEY_PREFIX = "nxs_";
const KEY_LENGTH = 48;

function generateRandomKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const bytes = crypto.getRandomValues(new Uint8Array(KEY_LENGTH));
  for (const byte of bytes) {
    result += chars[byte % chars.length];
  }
  return `${KEY_PREFIX}${result}`;
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createApiKey(name: string): Promise<{ id: string; key: string; prefix: string }> {
  const id = crypto.randomUUID();
  const key = generateRandomKey();
  const keyHash = await hashKey(key);
  const prefix = key.slice(0, 8) + "...";

  queries.insertApiKey.run(id, name, keyHash, prefix, Date.now());

  return { id, key, prefix };
}

export async function validateApiKey(key: string): Promise<boolean> {
  if (!key.startsWith(KEY_PREFIX)) return false;

  const keyHash = await hashKey(key);
  const row = queries.getApiKeyByHash.get(keyHash) as { id: string } | null;

  if (row) {
    queries.touchApiKey.run(Date.now(), row.id);
    return true;
  }

  return false;
}

export function listApiKeys(): Array<{
  id: string;
  name: string;
  prefix: string;
  created_at: number;
  last_used: number | null;
  active: number;
}> {
  return queries.getApiKeys.all() as any[];
}

export function revokeApiKey(id: string): void {
  queries.deactivateApiKey.run(id);
}
