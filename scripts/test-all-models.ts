// Test all 16 models for connectivity and response

import { ALL_PROVIDERS } from "../src/providers";

const TEST_PROMPT = "Say 'OK' if you can hear me";

async function testModel(modelName: string) {
  const provider = ALL_PROVIDERS[modelName];
  if (!provider) {
    return { model: modelName, status: "NOT_FOUND", error: "Model not in config" };
  }

  try {
    const response = await fetch("http://localhost:4000/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: TEST_PROMPT }],
        max_tokens: 10,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { model: modelName, status: "FAILED", error };
    }

    const data = await response.json();
    return {
      model: modelName,
      status: "SUCCESS",
      response: data.choices?.[0]?.message?.content || "No response",
      tier: provider.tier,
      contextLimit: provider.contextLimit,
    };
  } catch (error: any) {
    return {
      model: modelName,
      status: "ERROR",
      error: error.message,
    };
  }
}

async function main() {
  console.log("🧪 Testing all 16 Nexus AI V2 models...\n");

  const models = Object.keys(ALL_PROVIDERS);
  console.log(`Total models to test: ${models.length}\n`);

  const results = [];
  for (const model of models) {
    process.stdout.write(`Testing ${model}... `);
    const result = await testModel(model);
    results.push(result);
    
    if (result.status === "SUCCESS") {
      console.log(`✅ SUCCESS`);
    } else {
      console.log(`❌ ${result.status}`);
    }
  }

  console.log("\n" + "═".repeat(80));
  console.log("📊 RESULTS SUMMARY");
  console.log("═".repeat(80) + "\n");

  const byTier: Record<string, any[]> = {
    complex: [],
    reasoning: [],
    heavy: [],
    chat: [],
  };

  for (const result of results) {
    const tier = ALL_PROVIDERS[result.model]?.tier || "unknown";
    byTier[tier]?.push(result);
  }

  for (const [tier, models] of Object.entries(byTier)) {
    if (models.length === 0) continue;
    
    console.log(`\n🎯 ${tier.toUpperCase()} TIER (${models.length} models)`);
    console.log("─".repeat(80));
    
    for (const m of models) {
      const status = m.status === "SUCCESS" ? "✅" : "❌";
      const context = m.contextLimit ? `${(m.contextLimit / 1000).toFixed(0)}k` : "N/A";
      console.log(`  ${status} ${m.model.padEnd(30)} [${context.padStart(6)} context]`);
      if (m.error) console.log(`      ⚠️  ${m.error}`);
    }
  }

  const successCount = results.filter(r => r.status === "SUCCESS").length;
  const failCount = results.filter(r => r.status !== "SUCCESS").length;

  console.log("\n" + "═".repeat(80));
  console.log(`✅ Success: ${successCount} / ${results.length}`);
  console.log(`❌ Failed:  ${failCount} / ${results.length}`);
  console.log("═".repeat(80) + "\n");

  if (failCount > 0) {
    console.log("⚠️  Some models failed. Check your API keys in .env\n");
    process.exit(1);
  }

  console.log("🎉 All models operational!\n");
}

main();
