#!/usr/bin/env bun
// Discover ALL models available from each provider

// Load .env
const envFile = Bun.file("../.env");
if (await envFile.exists()) {
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

interface ModelInfo {
  id: string;
  provider: string;
  contextLength?: number;
  description?: string;
  capabilities?: string[];
}

interface ProviderInfo {
  name: string;
  baseUrl: string;
  totalModels: number;
  models: ModelInfo[];
  error?: string;
}

const providers = [
  {
    name: "GROQ",
    keyEnv: "GROQ_API_KEY",
    baseUrl: "https://api.groq.com/openai/v1",
  },
  {
    name: "Gemini",
    keyEnv: "GEMINI_API_KEY",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    altEndpoint: true, // Uses different format
  },
  {
    name: "SiliconFlow",
    keyEnv: "SILICONFLOW_API_KEY",
    baseUrl: "https://api.siliconflow.com/v1",
  },
  {
    name: "NVIDIA",
    keyEnv: "NVIDIA_API_KEY",
    baseUrl: "https://integrate.api.nvidia.com/v1",
  },
  {
    name: "Poolside",
    keyEnv: "POOLSIDE_API_KEY",
    baseUrl: "https://inference.poolside.ai/v1",
  },
];

async function discoverModels(provider: any): Promise<ProviderInfo> {
  const result: ProviderInfo = {
    name: provider.name,
    baseUrl: provider.baseUrl,
    totalModels: 0,
    models: [],
  };

  try {
    const apiKey = process.env[provider.keyEnv];
    if (!apiKey) {
      result.error = `Missing ${provider.keyEnv}`;
      return result;
    }

    let response;

    if (provider.name === "Gemini") {
      // Gemini uses a different endpoint
      response = await fetch(
        `${provider.baseUrl}/models?key=${apiKey}`,
        {
          signal: AbortSignal.timeout(15000),
        }
      );
    } else {
      // Standard OpenAI-compatible endpoint
      response = await fetch(`${provider.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(15000),
      });
    }

    if (!response.ok) {
      result.error = `HTTP ${response.status}: ${await response.text().catch(() => "No response")}`;
      return result;
    }

    const data = await response.json();

    // Parse based on provider format
    if (provider.name === "Gemini") {
      // Gemini format: { models: [...] }
      if (data.models && Array.isArray(data.models)) {
        result.totalModels = data.models.length;
        result.models = data.models
          .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
          .map((m: any) => ({
            id: m.name.replace("models/", ""),
            provider: provider.name,
            contextLength: m.inputTokenLimit || undefined,
            description: m.displayName || m.description,
            capabilities: m.supportedGenerationMethods,
          }));
      }
    } else {
      // OpenAI-compatible format: { data: [...] }
      if (data.data && Array.isArray(data.data)) {
        result.totalModels = data.data.length;
        result.models = data.data.map((m: any) => ({
          id: m.id,
          provider: provider.name,
          contextLength: m.context_length || m.max_model_len || undefined,
          description: m.description,
        }));
      }
    }
  } catch (error: any) {
    result.error = error.message;
  }

  return result;
}

async function main() {
  console.log("🔍 Discovering ALL models from each provider...\n");

  const allResults: ProviderInfo[] = [];
  const allModels: ModelInfo[] = [];

  for (const provider of providers) {
    console.log(`\n📡 Querying ${provider.name}...`);
    const result = await discoverModels(provider);
    allResults.push(result);

    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    } else {
      console.log(`✅ Found ${result.totalModels} models`);
      
      // Show models with 200k+ context
      const largeContext = result.models.filter(m => m.contextLength && m.contextLength >= 200000);
      if (largeContext.length > 0) {
        console.log(`\n   🎯 Models with 200k+ context:`);
        largeContext.forEach(m => {
          console.log(`   - ${m.id.padEnd(40)} ${m.contextLength?.toLocaleString().padStart(10)} tokens`);
        });
      }

      // Show all models
      console.log(`\n   All available models:`);
      result.models.slice(0, 10).forEach(m => {
        const ctx = m.contextLength ? `${m.contextLength.toLocaleString()} tokens` : "Unknown context";
        console.log(`   - ${m.id.padEnd(40)} ${ctx}`);
      });
      if (result.models.length > 10) {
        console.log(`   ... and ${result.models.length - 10} more`);
      }

      allModels.push(...result.models);
    }
  }

  // Summary
  console.log("\n\n" + "=".repeat(80));
  console.log("📊 COMPREHENSIVE SUMMARY");
  console.log("=".repeat(80));

  console.log(`\nTotal models discovered: ${allModels.length}`);
  
  const with200k = allModels.filter(m => m.contextLength && m.contextLength >= 200000);
  console.log(`Models with 200k+ context: ${with200k.length}`);

  if (with200k.length > 0) {
    console.log("\n🏆 TOP CANDIDATES (200k+ context):\n");
    console.log("Model ID".padEnd(45), "Provider".padEnd(15), "Context Limit");
    console.log("-".repeat(80));
    
    with200k
      .sort((a, b) => (b.contextLength || 0) - (a.contextLength || 0))
      .forEach(m => {
        console.log(
          m.id.padEnd(45),
          m.provider.padEnd(15),
          (m.contextLength?.toLocaleString() || "Unknown").padStart(12)
        );
      });
  }

  // Save full results
  await Bun.write(
    "./scripts/all-models-discovered.json",
    JSON.stringify(allResults, null, 2)
  );
  console.log("\n💾 Full results saved to scripts/all-models-discovered.json");

  // Create filtered list for models with 200k+
  if (with200k.length > 0) {
    await Bun.write(
      "./scripts/models-200k-plus.json",
      JSON.stringify(with200k, null, 2)
    );
    console.log("💾 200k+ models saved to scripts/models-200k-plus.json");
  }
}

main();
