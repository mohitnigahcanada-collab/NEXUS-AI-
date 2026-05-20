#!/usr/bin/env bun
// Dedicated SWE-bench test for reasoning models + carwash logic test

interface ReasoningTest {
  name: string;
  prompt: string;
  expectedKeywords: string[];
  category: "algorithm" | "logic" | "math" | "planning";
}

const REASONING_TESTS: ReasoningTest[] = [
  {
    name: "Dijkstra Algorithm",
    prompt: "Explain Dijkstra's shortest path algorithm step by step with pseudocode",
    expectedKeywords: ["dijkstra", "shortest", "path", "priority", "queue"],
    category: "algorithm",
  },
  {
    name: "Carwash Logic Puzzle",
    prompt: `You want to go to a carwash. You can either walk (15 mins) or drive (5 mins). 
However, if you drive, you need to find parking which takes 10 minutes on average.
Which is faster and why? Think step by step.`,
    expectedKeywords: ["walk", "15", "drive", "parking", "faster"],
    category: "logic",
  },
  {
    name: "Math Reasoning",
    prompt: "If a train travels 120 km in 2 hours, then speeds up by 20 km/h for the next hour, how far does it travel total?",
    expectedKeywords: ["120", "60", "80", "200", "kilometer"],
    category: "math",
  },
  {
    name: "System Design Planning",
    prompt: "Design a distributed cache system. What are the 3 most critical components?",
    expectedKeywords: ["cache", "distributed", "consistency", "storage"],
    category: "planning",
  },
];

async function testReasoningModel(modelName: string, test: ReasoningTest): Promise<{
  success: boolean;
  responseTime: number;
  matchedKeywords: number;
  response: string;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const response = await fetch("http://localhost:4000/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: "You are an expert problem solver and educator. Think step by step." },
          { role: "user", content: test.prompt },
        ],
        max_tokens: 800,
        temperature: 0.7,
        stream: false,
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        responseTime,
        matchedKeywords: 0,
        response: "",
        error: errorText,
      };
    }

    const data = await response.json();
    const answer = data.choices[0].message.content.toLowerCase();

    // Count matched keywords
    const matchedKeywords = test.expectedKeywords.filter(keyword =>
      answer.includes(keyword.toLowerCase())
    ).length;

    const success = matchedKeywords >= Math.ceil(test.expectedKeywords.length / 2);

    return {
      success,
      responseTime,
      matchedKeywords,
      response: answer.slice(0, 300),
    };
  } catch (error: any) {
    return {
      success: false,
      responseTime: Date.now() - startTime,
      matchedKeywords: 0,
      response: "",
      error: error.message,
    };
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   🧠 DEDICATED REASONING MODEL TEST - NEXUS AI V2         ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Test reasoning tier models
  const reasoningModels = [
    "nexus-brain-max",    // Gemini 3.1 Pro (92 MMLU)
    "nexus-brain-ultra",  // GPT-4o via g4f (88 MMLU)
    "nexus-brain-pro",    // Gemini 2.5 Pro (90 MMLU)
    "nexus-brain-deep",   // DeepSeek-V4 (89 MMLU)
  ];

  const results: any[] = [];

  for (const model of reasoningModels) {
    console.log(`\n🎯 Testing Model: ${model}`);
    console.log("─".repeat(70));

    const modelResults = [];

    for (const test of REASONING_TESTS) {
      process.stdout.write(`  [${test.category}] ${test.name}... `);
      const result = await testReasoningModel(model, test);
      modelResults.push({ test, result });

      if (result.error) {
        console.log(`❌ ERROR`);
        console.log(`      ${result.error.slice(0, 80)}`);
      } else if (result.success) {
        console.log(`✅ PASS (${result.responseTime}ms, ${result.matchedKeywords}/${test.expectedKeywords.length} keywords)`);
      } else {
        console.log(`❌ FAIL (${result.matchedKeywords}/${test.expectedKeywords.length} keywords)`);
      }
    }

    const passCount = modelResults.filter(r => r.result.success).length;
    const avgTime = modelResults.reduce((sum, r) => sum + r.result.responseTime, 0) / modelResults.length;

    results.push({
      model,
      passCount,
      totalTests: modelResults.length,
      avgTime,
      results: modelResults,
    });

    console.log(`  Summary: ${passCount}/${modelResults.length} passed | Avg: ${avgTime.toFixed(0)}ms`);
  }

  console.log("\n" + "═".repeat(80));
  console.log("📊 REASONING MODEL COMPARISON");
  console.log("═".repeat(80) + "\n");

  console.log("Model                    | Pass Rate | Avg Time | Status");
  console.log("─".repeat(80));

  let bestModel = null;
  let bestScore = 0;

  for (const r of results) {
    const passRate = ((r.passCount / r.totalTests) * 100).toFixed(0);
    const score = r.passCount;
    const status = r.passCount === r.totalTests ? "✅ PERFECT" : 
                   r.passCount >= r.totalTests / 2 ? "⚠️  GOOD" : "❌ POOR";

    console.log(`${r.model.padEnd(24)} | ${passRate.padStart(3)}%      | ${r.avgTime.toFixed(0).padStart(5)}ms  | ${status}`);

    if (score > bestScore) {
      bestScore = score;
      bestModel = r.model;
    }
  }

  console.log("\n🏆 BEST REASONING MODEL: " + bestModel);

  // Carwash test detailed analysis
  console.log("\n" + "═".repeat(80));
  console.log("🚗 CARWASH LOGIC TEST DETAILED RESULTS");
  console.log("═".repeat(80) + "\n");

  for (const r of results) {
    const carwashTest = r.results.find((t: any) => t.test.name === "Carwash Logic Puzzle");
    if (carwashTest) {
      console.log(`${r.model}:`);
      if (carwashTest.result.success) {
        console.log(`  ✅ CORRECT reasoning`);
        console.log(`  Response preview: ${carwashTest.result.response.slice(0, 150)}...`);
      } else {
        console.log(`  ❌ FAILED to solve logic puzzle`);
        if (carwashTest.result.error) {
          console.log(`  Error: ${carwashTest.result.error.slice(0, 100)}`);
        }
      }
      console.log();
    }
  }

  console.log("═".repeat(80));

  const totalPass = results.reduce((sum, r) => sum + r.passCount, 0);
  const totalTests = results.reduce((sum, r) => sum + r.totalTests, 0);

  console.log(`\n✅ Total: ${totalPass}/${totalTests} tests passed`);
  console.log(`🎯 Best Model: ${bestModel} (${bestScore}/${REASONING_TESTS.length} correct)\n`);
}

main();
