#!/usr/bin/env bun
// Nexus AI V2 - Test Script
// Verifies all configuration and shows model lineup

import { ALL_PROVIDERS, getProviderStats, getProvidersByTier } from "../src/providers-v2";
import { smartRoute, analyzeTask, evaluateContextEscalation } from "../src/router-v2";

console.log("🎯 NEXUS AI V2 - CONFIGURATION TEST\n");
console.log("=" .repeat(80));

// Test 1: Show all providers
console.log("\n📊 PROVIDER OVERVIEW:");
const stats = getProviderStats();
console.log(`Total models: ${stats.total}`);
console.log(`\nBy tier:`);
console.log(`  - Complex Coding: ${stats.byTier.complex} models`);
console.log(`  - Reasoning: ${stats.byTier.reasoning} models`);
console.log(`  - Heavy Lifting: ${stats.byTier.heavy} models`);
console.log(`  - Simple Chat: ${stats.byTier.chat} models`);
console.log(`\nBy provider:`);
console.log(`  - g4f: ${stats.providers.g4f} models (FREE GPT-4o + Claude!)`);
console.log(`  - Gemini: ${stats.providers.gemini} models`);
console.log(`  - SiliconFlow: ${stats.providers.siliconflow} models`);
console.log(`  - GROQ: ${stats.providers.groq} models`);
console.log(`\nBest scores:`);
console.log(`  - SWE-bench: ${stats.bestScores.sweBench}% (GPT-4o via g4f)`);
console.log(`  - MMLU: ${stats.bestScores.mmlu}% (Gemini 3.1 Pro)`);
console.log(`  - Latency: ${stats.bestScores.latency}ms (Llama 3.1-8B)`);

// Test 2: Show each tier
console.log("\n\n" + "=" .repeat(80));
console.log("🏆 TIER 1: COMPLEX CODING + DEBUG (24% workload)\n");
const complexProviders = getProvidersByTier("complex");
complexProviders.forEach((p, i) => {
  console.log(`${i + 1}. ${p.name}`);
  console.log(`   Model: ${p.model}`);
  console.log(`   SWE-bench: ${p.benchmarks?.sweBench}% | Context: ${(p.contextLimit / 1000).toFixed(0)}k | Latency: ${p.benchmarks?.latency}ms`);
  console.log(`   Provider: ${p.requiresG4F ? 'g4f (FREE)' : p.keyEnv.replace('_API_KEY', '')}`);
  console.log();
});

console.log("=" .repeat(80));
console.log("🧠 TIER 2: PLANNING/REASONING (40% workload)\n");
const reasoningProviders = getProvidersByTier("reasoning");
reasoningProviders.forEach((p, i) => {
  console.log(`${i + 1}. ${p.name}`);
  console.log(`   Model: ${p.model}`);
  console.log(`   MMLU: ${p.benchmarks?.mmlu}% | Context: ${(p.contextLimit / 1000).toFixed(0)}k | Latency: ${p.benchmarks?.latency}ms`);
  console.log(`   Provider: ${p.requiresG4F ? 'g4f (FREE)' : p.keyEnv.replace('_API_KEY', '')}`);
  console.log();
});

console.log("=" .repeat(80));
console.log("⚡ TIER 3: HEAVY LIFTING CODING (36% workload)\n");
const heavyProviders = getProvidersByTier("heavy");
heavyProviders.forEach((p, i) => {
  console.log(`${i + 1}. ${p.name}`);
  console.log(`   Model: ${p.model}`);
  console.log(`   Context: ${(p.contextLimit / 1000).toFixed(0)}k | Latency: ${p.benchmarks?.latency}ms`);
  console.log(`   Provider: ${p.requiresG4F ? 'g4f (FREE)' : p.keyEnv.replace('_API_KEY', '')}`);
  console.log();
});

console.log("=" .repeat(80));
console.log("💬 TIER 4: SIMPLE CHAT\n");
const chatProviders = getProvidersByTier("chat");
chatProviders.forEach((p, i) => {
  console.log(`${i + 1}. ${p.name}`);
  console.log(`   Model: ${p.model}`);
  console.log(`   Context: ${(p.contextLimit / 1000).toFixed(0)}k | Latency: ${p.benchmarks?.latency}ms`);
  console.log(`   Provider: ${p.requiresG4F ? 'g4f (FREE)' : p.keyEnv.replace('_API_KEY', '')}`);
  console.log();
});

// Test 3: Test routing logic
console.log("\n" + "=" .repeat(80));
console.log("🎯 INTELLIGENT ROUTING TESTS\n");

const testCases = [
  {
    name: "Complex Coding",
    messages: [{ role: "user", content: "Debug this complex error trace and fix the memory leak in this algorithm" }],
  },
  {
    name: "Planning",
    messages: [{ role: "user", content: "Design a scalable microservices architecture for an e-commerce platform" }],
  },
  {
    name: "Heavy Lifting",
    messages: [{ role: "user", content: "Implement a user authentication system with JWT tokens and refresh logic" }],
  },
  {
    name: "Simple Chat",
    messages: [{ role: "user", content: "What is React and how does it work?" }],
  },
];

testCases.forEach(test => {
  const route = smartRoute(test.messages);
  console.log(`Test: ${test.name}`);
  console.log(`  → Routed to: ${route.provider} (${route.tier} tier)`);
  console.log(`  → Reason: ${route.reason}`);
  console.log(`  → Fallback chain: ${route.fallbackChain.slice(0, 2).join(' → ') || 'None'}`);
  console.log();
});

// Test 4: Context escalation
console.log("=" .repeat(80));
console.log("📈 CONTEXT ESCALATION TESTS\n");

const contextTests = [
  { tokens: 15000, name: "Small context" },
  { tokens: 50000, name: "Medium context" },
  { tokens: 100000, name: "Large context" },
  { tokens: 150000, name: "Very large context" },
  { tokens: 850000, name: "Massive context" },
];

contextTests.forEach(test => {
  const escalation = evaluateContextEscalation(test.tokens, "nexus-code-stable");
  console.log(`${test.name} (${test.tokens.toLocaleString()} tokens)`);
  console.log(`  → Level: ${escalation.currentLevel}`);
  console.log(`  → Should escalate: ${escalation.shouldEscalate ? 'Yes' : 'No'}`);
  if (escalation.shouldEscalate) {
    console.log(`  → Suggested: ${escalation.suggestedProvider}`);
  }
  if (escalation.warning) {
    console.log(`  → Warning: ${escalation.warning}`);
  }
  console.log();
});

console.log("=" .repeat(80));
console.log("\n✅ CONFIGURATION TEST COMPLETE!\n");
console.log("Next steps:");
console.log("1. Test g4f server connectivity");
console.log("2. Integrate router into gateway");
console.log("3. Update dashboard UI");
console.log("4. Test each model endpoint");
console.log("\n🚀 Nexus AI V2 is ready!");
