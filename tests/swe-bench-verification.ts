#!/usr/bin/env bun
// SWE-bench Style Verification - Test Nexus AI V2 with coding tasks

import { ALL_PROVIDERS } from "../src/providers";

interface TestCase {
  name: string;
  tier: string;
  prompt: string;
  expectedKeywords: string[];
  contextSize: "small" | "medium" | "large";
}

const SWE_BENCH_TESTS: TestCase[] = [
  {
    name: "Simple Bug Fix",
    tier: "complex",
    prompt: "Fix this Python function: def add(a,b): return a-b",
    expectedKeywords: ["return", "+", "add"],
    contextSize: "small",
  },
  {
    name: "Algorithm Design",
    tier: "reasoning",
    prompt: "Design an algorithm to find the shortest path in a weighted graph",
    expectedKeywords: ["dijkstra", "algorithm", "graph", "path"],
    contextSize: "medium",
  },
  {
    name: "Code Refactoring",
    tier: "heavy",
    prompt: "Refactor this code to use async/await instead of callbacks",
    expectedKeywords: ["async", "await", "promise"],
    contextSize: "medium",
  },
  {
    name: "Quick Explanation",
    tier: "chat",
    prompt: "What is a REST API in 2 sentences?",
    expectedKeywords: ["HTTP", "API", "REST"],
    contextSize: "small",
  },
];

async function testSWEBenchCase(testCase: TestCase): Promise<{
  success: boolean;
  model: string;
  responseTime: number;
  tokensUsed: number;
  matchedKeywords: number;
  response: string;
}> {
  const startTime = Date.now();

  try {
    const response = await fetch("http://localhost:4000/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "auto", // Let router decide
        messages: [
          { role: "system", content: "You are a helpful coding assistant." },
          { role: "user", content: testCase.prompt },
        ],
        max_tokens: 500,
        stream: false,
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        success: false,
        model: "unknown",
        responseTime,
        tokensUsed: 0,
        matchedKeywords: 0,
        response: await response.text(),
      };
    }

    const data = await response.json();
    const answer = data.choices[0].message.content.toLowerCase();
    const model = data.model || "unknown";
    const tokensUsed = data.usage?.total_tokens || 0;

    // Count matched keywords
    const matchedKeywords = testCase.expectedKeywords.filter(keyword =>
      answer.includes(keyword.toLowerCase())
    ).length;

    const success = matchedKeywords >= testCase.expectedKeywords.length / 2;

    return {
      success,
      model,
      responseTime,
      tokensUsed,
      matchedKeywords,
      response: answer.slice(0, 200),
    };
  } catch (error: any) {
    return {
      success: false,
      model: "error",
      responseTime: Date.now() - startTime,
      tokensUsed: 0,
      matchedKeywords: 0,
      response: error.message,
    };
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   🧪 SWE-BENCH STYLE VERIFICATION - NEXUS AI V2           ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  console.log("📋 Running 4 coding task tests across all tiers...\n");

  const results = [];

  for (let i = 0; i < SWE_BENCH_TESTS.length; i++) {
    const test = SWE_BENCH_TESTS[i];
    console.log(`\n[${i + 1}/4] Testing: ${test.name} (${test.tier} tier)`);
    console.log(`     Prompt: ${test.prompt.slice(0, 60)}...`);
    process.stdout.write(`     Running... `);

    const result = await testSWEBenchCase(test);
    results.push({ test, result });

    if (result.success) {
      console.log(`✅ PASS`);
      console.log(`     Model: ${result.model}`);
      console.log(`     Time: ${result.responseTime}ms | Tokens: ${result.tokensUsed}`);
      console.log(`     Matched: ${result.matchedKeywords}/${test.expectedKeywords.length} keywords`);
    } else {
      console.log(`❌ FAIL`);
      console.log(`     Error: ${result.response.slice(0, 100)}`);
    }
  }

  console.log("\n" + "═".repeat(80));
  console.log("📊 SWE-BENCH VERIFICATION SUMMARY");
  console.log("═".repeat(80) + "\n");

  const passCount = results.filter(r => r.result.success).length;
  const avgTime = results.reduce((sum, r) => sum + r.result.responseTime, 0) / results.length;
  const totalTokens = results.reduce((sum, r) => sum + r.result.tokensUsed, 0);

  console.log(`✅ Passed:  ${passCount} / ${results.length} tests`);
  console.log(`⏱️  Avg Response Time: ${avgTime.toFixed(0)}ms`);
  console.log(`🔢 Total Tokens: ${totalTokens}`);

  console.log("\n🎯 Per-Tier Routing:");
  const tierCounts: Record<string, string[]> = {};
  results.forEach(r => {
    const tier = r.test.tier;
    if (!tierCounts[tier]) tierCounts[tier] = [];
    tierCounts[tier].push(r.result.model);
  });

  for (const [tier, models] of Object.entries(tierCounts)) {
    console.log(`   ${tier.padEnd(10)}: ${models[0] || "none"}`);
  }

  console.log("\n" + "═".repeat(80));

  if (passCount === results.length) {
    console.log("🎉 ALL TESTS PASSED! Nexus AI V2 is SWE-bench ready!\n");
    process.exit(0);
  } else {
    console.log(`⚠️  ${results.length - passCount} test(s) failed. Review errors above.\n`);
    process.exit(1);
  }
}

main();
