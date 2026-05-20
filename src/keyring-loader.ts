// Load API keys from GNOME Keyring (Seahorse) for security
// Falls back to .env if keyring is unavailable

import { $ } from "bun";

interface KeyringKeys {
  GROQ_API_KEY?: string;
  GEMINI_API_KEY?: string;
  SILICONFLOW_API_KEY?: string;
  NVIDIA_API_KEY?: string;
  POOLSIDE_API_KEY?: string;
}

async function getKeyFromKeyring(keyName: string): Promise<string | null> {
  try {
    const result = await $`secret-tool lookup service nexus-ai key ${keyName}`.text();
    return result.trim() || null;
  } catch {
    return null;
  }
}

export async function loadKeysFromKeyring(): Promise<KeyringKeys> {
  console.log("🔐 Loading API keys from GNOME Keyring...");

  const keys: KeyringKeys = {
    GROQ_API_KEY: await getKeyFromKeyring("groq") || undefined,
    GEMINI_API_KEY: await getKeyFromKeyring("gemini") || undefined,
    SILICONFLOW_API_KEY: await getKeyFromKeyring("siliconflow") || undefined,
    NVIDIA_API_KEY: await getKeyFromKeyring("nvidia") || undefined,
    POOLSIDE_API_KEY: await getKeyFromKeyring("poolside") || undefined,
  };

  // Count how many keys were loaded
  const loadedCount = Object.values(keys).filter(k => k).length;
  
  if (loadedCount === 0) {
    console.log("⚠️  No keys found in keyring, falling back to .env");
    return {};
  }

  console.log(`✅ Loaded ${loadedCount}/5 API keys from GNOME Keyring`);
  
  // Set environment variables
  for (const [key, value] of Object.entries(keys)) {
    if (value) {
      process.env[key] = value;
    }
  }

  return keys;
}

// Check if keys exist in keyring
export async function checkKeyringStatus(): Promise<{hasKeys: boolean; count: number}> {
  const keys = await loadKeysFromKeyring();
  const count = Object.values(keys).filter(k => k).length;
  return { hasKeys: count > 0, count };
}
