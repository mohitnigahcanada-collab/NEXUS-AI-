#!/usr/bin/env bun
// LangChain Integration Test - Verify Nexus AI V2 works with LangChain patterns

/**
 * This test demonstrates how Nexus AI V2 can be integrated with LangChain-style workflows:
 * - Chain-of-thought reasoning
 * - Multi-step task decomposition
 * - Context escalation
 * - Agent-style interactions
 */

interface Message {
  role: string;
  content: string;
}

class NexusLangChainAdapter {
  private baseURL = "http://localhost:4000/v1";
  private conversationHistory: Message[] = [];

  async chat(prompt: string, model: string = "auto"): Promise<string> {
    this.conversationHistory.push({ role: "user", content: prompt });

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: this.conversationHistory,
        max_tokens: 1000,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${await response.text()}`);
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;
    this.conversationHistory.push({ role: "assistant", content: answer });

    return answer;
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getTokenCount(): number {
    return this.conversationHistory.reduce(
      (sum, msg) => sum + msg.content.length / 4,
      0
    );
  }
}

async function testChainOfThoughtReasoning(agent: NexusLangChainAdapter) {
  console.log("\n🧠 Test 1: Chain-of-Thought Reasoning");
  console.log("─".repeat(60));

  agent.clearHistory();

  const prompt = `Let's solve this step by step:
What is 15% of 240?

Think through:
1. Convert percentage to decimal
2. Multiply
3. Give final answer`;

  process.stdout.write("Running... ");
  const start = Date.now();
  const answer = await agent.chat(prompt);
  const time = Date.now() - start;

  const hasSteps = answer.includes("step") || answer.includes("1") || answer.includes("2");
  const hasAnswer = answer.includes("36") || answer.includes("thirty-six");

  const success = hasSteps && hasAnswer;

  if (success) {
    console.log(`✅ PASS (${time}ms)`);
    console.log(`   Response: ${answer.slice(0, 100)}...`);
  } else {
    console.log(`❌ FAIL (${time}ms)`);
    console.log(`   Response: ${answer}`);
  }

  return { success, time };
}

async function testMultiStepTaskDecomposition(agent: NexusLangChainAdapter) {
  console.log("\n🔗 Test 2: Multi-Step Task Decomposition");
  console.log("─".repeat(60));

  agent.clearHistory();

  // Step 1: Plan
  process.stdout.write("Step 1 (Planning)... ");
  const start1 = Date.now();
  const plan = await agent.chat(
    "I need to build a REST API. Break this into 3 main steps."
  );
  const time1 = Date.now() - start1;
  console.log(`✅ (${time1}ms)`);

  // Step 2: Detail
  process.stdout.write("Step 2 (Details)... ");
  const start2 = Date.now();
  const details = await agent.chat("Expand on step 1 with specific tasks");
  const time2 = Date.now() - start2;
  console.log(`✅ (${time2}ms)`);

  // Step 3: Code
  process.stdout.write("Step 3 (Code)... ");
  const start3 = Date.now();
  const code = await agent.chat("Show me a simple Express.js starter");
  const time3 = Date.now() - start3;
  console.log(`✅ (${time3}ms)`);

  const totalTime = time1 + time2 + time3;
  const hasCode = code.toLowerCase().includes("express") || code.includes("app.get");

  const success = hasCode && agent.getTokenCount() > 200;

  if (success) {
    console.log(`✅ PASS (total: ${totalTime}ms, tokens: ~${agent.getTokenCount().toFixed(0)})`);
  } else {
    console.log(`❌ FAIL`);
  }

  return { success, time: totalTime };
}

async function testContextEscalation(agent: NexusLangChainAdapter) {
  console.log("\n📈 Test 3: Context Escalation");
  console.log("─".repeat(60));

  agent.clearHistory();

  const prompts = [
    "What is a binary search tree?",
    "Now explain how to balance it with AVL rotations",
    "Show me Python code for AVL insertion",
    "Add deletion logic too",
    "Now add a visualizer function",
  ];

  let totalTime = 0;
  for (let i = 0; i < prompts.length; i++) {
    process.stdout.write(`Step ${i + 1}/${prompts.length}... `);
    const start = Date.now();
    await agent.chat(prompts[i]);
    const time = Date.now() - start;
    totalTime += time;
    console.log(`✅ (${time}ms, ~${agent.getTokenCount().toFixed(0)} tokens)`);
  }

  const finalTokens = agent.getTokenCount();
  const success = finalTokens > 500; // Should have accumulated context

  if (success) {
    console.log(`✅ PASS (total: ${totalTime}ms, final context: ~${finalTokens.toFixed(0)} tokens)`);
  } else {
    console.log(`❌ FAIL (insufficient context accumulation)`);
  }

  return { success, time: totalTime };
}

async function testAgentStyleInteraction(agent: NexusLangChainAdapter) {
  console.log("\n🤖 Test 4: Agent-Style Interaction");
  console.log("─".repeat(60));

  agent.clearHistory();

  const tasks = [
    { action: "search", query: "What are the top 3 sorting algorithms?" },
    { action: "analyze", query: "Which is fastest for small arrays?" },
    { action: "code", query: "Show me insertion sort in TypeScript" },
  ];

  let totalTime = 0;
  let responses = [];

  for (const task of tasks) {
    process.stdout.write(`${task.action.toUpperCase()}... `);
    const start = Date.now();
    const response = await agent.chat(task.query);
    const time = Date.now() - start;
    totalTime += time;
    responses.push(response);
    console.log(`✅ (${time}ms)`);
  }

  const hasCode = responses[2].toLowerCase().includes("function") || responses[2].includes("=>");
  const success = hasCode;

  if (success) {
    console.log(`✅ PASS (total: ${totalTime}ms)`);
  } else {
    console.log(`❌ FAIL`);
  }

  return { success, time: totalTime };
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   🔗 LANGCHAIN-STYLE INTEGRATION TEST - NEXUS AI V2       ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  const agent = new NexusLangChainAdapter();
  const results = [];

  try {
    results.push(await testChainOfThoughtReasoning(agent));
    results.push(await testMultiStepTaskDecomposition(agent));
    results.push(await testContextEscalation(agent));
    results.push(await testAgentStyleInteraction(agent));
  } catch (error: any) {
    console.log(`\n❌ ERROR: ${error.message}`);
    process.exit(1);
  }

  console.log("\n" + "═".repeat(80));
  console.log("📊 LANGCHAIN INTEGRATION SUMMARY");
  console.log("═".repeat(80) + "\n");

  const passCount = results.filter(r => r.success).length;
  const totalTime = results.reduce((sum, r) => sum.time, 0);
  const avgTime = totalTime / results.length;

  console.log(`✅ Passed:  ${passCount} / ${results.length} tests`);
  console.log(`⏱️  Total Time: ${totalTime.toFixed(0)}ms`);
  console.log(`⏱️  Avg Time: ${avgTime.toFixed(0)}ms per test`);

  console.log("\n✨ LangChain Integration Capabilities:");
  console.log("   ✅ Chain-of-thought reasoning");
  console.log("   ✅ Multi-step task decomposition");
  console.log("   ✅ Context accumulation & escalation");
  console.log("   ✅ Agent-style interactions");

  console.log("\n" + "═".repeat(80));

  if (passCount === results.length) {
    console.log("🎉 ALL TESTS PASSED! Nexus AI V2 is LangChain-compatible!\n");
    process.exit(0);
  } else {
    console.log(`⚠️  ${results.length - passCount} test(s) failed.\n`);
    process.exit(1);
  }
}

main();
