#!/usr/bin/env bun
// 🔥🔥🔥 EVEN HARDER INDUSTRY BENCHMARKS - EXPERT LEVEL
// These tests are designed to break AI models!

interface ExpertTest {
  id: string;
  category: "expert-coding" | "expert-reasoning" | "expert-math" | "expert-system";
  difficulty: "nightmare" | "impossible";
  name: string;
  prompt: string;
  verifyFunction: (response: string) => { passed: boolean; score: number; reason: string };
  timeLimit: number;
}

const EXPERT_TESTS: ExpertTest[] = [
  {
    id: "EXPERT-001",
    category: "expert-coding",
    difficulty: "nightmare",
    name: "Implement Raft Consensus Algorithm",
    prompt: `Implement the core of the Raft distributed consensus algorithm in TypeScript.

Requirements:
- Leader election with randomized timeouts
- Log replication with consistency checks
- Handle network partitions correctly
- Provide RequestVote and AppendEntries RPC handlers
- Include proper state machine (Follower/Candidate/Leader)

Show ONLY the critical code structure (classes and key methods). No need for full implementation, but demonstrate understanding.`,
    verifyFunction: (response) => {
      const lower = response.toLowerCase();
      let score = 0;
      
      if (lower.includes("raft")) score += 1;
      if (lower.includes("leader") && lower.includes("follower") && lower.includes("candidate")) score += 3;
      if (lower.includes("requestvote") || lower.includes("request vote")) score += 2;
      if (lower.includes("appendentries") || lower.includes("append entries")) score += 2;
      if (lower.includes("election") && lower.includes("timeout")) score += 1;
      if (lower.includes("log") && (lower.includes("replicate") || lower.includes("replication"))) score += 1;
      
      return {
        passed: score >= 7,
        score: (score / 10) * 100,
        reason: `Raft consensus: ${score}/10 points`
      };
    },
    timeLimit: 120000,
  },

  {
    id: "EXPERT-002",
    category: "expert-math",
    difficulty: "nightmare",
    name: "Prove P vs NP implications",
    prompt: `You discover a polynomial-time algorithm for 3-SAT (a known NP-complete problem).

Question: What are the immediate implications for cryptography, optimization, and computational complexity theory? 

List 5 specific real-world systems that would break, and explain why in technical detail.`,
    verifyFunction: (response) => {
      const lower = response.toLowerCase();
      let score = 0;
      
      if (lower.includes("p") && lower.includes("np")) score += 1;
      if (lower.includes("crypto") || lower.includes("encryption") || lower.includes("rsa")) score += 2;
      if (lower.includes("np-complete") || lower.includes("reduction")) score += 2;
      if (lower.includes("break") || lower.includes("collapse")) score += 1;
      if ((response.match(/\d\./g) || []).length >= 5) score += 2; // Lists 5+ items
      if (lower.includes("factoring") || lower.includes("discrete log")) score += 1;
      if (lower.includes("blockchain") || lower.includes("bitcoin")) score += 1;
      
      return {
        passed: score >= 7,
        score: (score / 10) * 100,
        reason: `P vs NP implications: ${score}/10 points`
      };
    },
    timeLimit: 90000,
  },

  {
    id: "EXPERT-003",
    category: "expert-reasoning",
    difficulty: "impossible",
    name: "Byzantine Generals Problem",
    prompt: `Four Byzantine generals need to coordinate an attack. One general is a traitor who sends contradictory messages.

Initial messages:
- General A tells B: "Attack at dawn"
- General A tells C: "Attack at noon"  
- General A tells D: "Attack at dawn"
- General B tells C: "I heard A say dawn"
- General B tells D: "I heard A say noon"
- General C tells D: "I heard A say noon"

Using the Byzantine Fault Tolerance algorithm, determine:
1. Who is the traitor?
2. What should the consensus decision be?
3. Show your reasoning step-by-step`,
    verifyFunction: (response) => {
      const lower = response.toLowerCase();
      let score = 0;
      
      if (lower.includes("byzantine")) score += 1;
      if (lower.includes("traitor") || lower.includes("faulty")) score += 1;
      if (lower.includes("general a") || lower.includes("a is")) score += 2;
      if (lower.includes("consensus") || lower.includes("majority")) score += 2;
      if (lower.includes("step") || lower.includes("1.") || lower.includes("first")) score += 1;
      if (lower.includes("dawn") || lower.includes("noon")) score += 1;
      if (lower.includes("vote") || lower.includes("count")) score += 2;
      
      return {
        passed: score >= 7,
        score: (score / 10) * 100,
        reason: `Byzantine generals: ${score}/10 points (Traitor is General A)`
      };
    },
    timeLimit: 90000,
  },

  {
    id: "EXPERT-004",
    category: "expert-system",
    difficulty: "nightmare",
    name: "Design Globally Distributed Lock",
    prompt: `Design a globally distributed lock service (like Google's Chubby) that works across 5 datacenters with these constraints:

- 99.999% availability (5 minutes downtime/year max)
- Strong consistency (no split-brain scenarios)
- Sub-100ms lock acquisition latency
- Handles datacenter failures gracefully
- Byzantine fault tolerance

Explain:
1. Your consistency protocol choice (Paxos, Raft, etc) and why
2. How you handle network partitions
3. Quorum strategy across datacenters
4. Clock synchronization approach`,
    verifyFunction: (response) => {
      const lower = response.toLowerCase();
      let score = 0;
      
      if (lower.includes("paxos") || lower.includes("raft") || lower.includes("consensus")) score += 2;
      if (lower.includes("quorum")) score += 2;
      if (lower.includes("partition") || lower.includes("split brain") || lower.includes("split-brain")) score += 2;
      if (lower.includes("clock") || lower.includes("time") || lower.includes("sync")) score += 1;
      if (lower.includes("lease") || lower.includes("heartbeat") || lower.includes("timeout")) score += 1;
      if (lower.includes("majority") || lower.includes("n/2")) score += 1;
      if (lower.includes("datacenter") || lower.includes("region")) score += 1;
      
      return {
        passed: score >= 7,
        score: (score / 10) * 100,
        reason: `Distributed lock design: ${score}/10 points`
      };
    },
    timeLimit: 120000,
  },

  {
    id: "EXPERT-005",
    category: "expert-coding",
    difficulty: "impossible",
    name: "Find bug in production database migration",
    prompt: `This Postgres migration ran on prod and caused data corruption. Find ALL bugs:

\`\`\`sql
BEGIN;

-- Add new column
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;

-- Migrate existing data
UPDATE users 
SET email_verified = true 
WHERE email_verified_at IS NOT NULL;

-- Make it non-null
ALTER TABLE users ALTER COLUMN email_verified SET NOT NULL;

-- Drop old column
ALTER TABLE users DROP COLUMN email_verified_at;

COMMIT;
\`\`\`

The migration succeeded but 10,000 user records were corrupted. What went wrong? List ALL issues and the correct migration.`,
    verifyFunction: (response) => {
      const lower = response.toLowerCase();
      let score = 0;
      
      if (lower.includes("default false") || lower.includes("default value")) score += 2;
      if (lower.includes("race") || lower.includes("timing") || lower.includes("after the update")) score += 3;
      if (lower.includes("set not null") || lower.includes("non-null")) score += 2;
      if (lower.includes("order") || lower.includes("before") || lower.includes("sequence")) score += 2;
      if (lower.includes("rollback") || lower.includes("transaction")) score += 1;
      
      return {
        passed: score >= 7,
        score: (score / 10) * 100,
        reason: `Migration bug: ${score}/10 points (Bug: DEFAULT false overrides UPDATE)`
      };
    },
    timeLimit: 60000,
  },
];

// Test runner
async function runExpertTest(modelName: string, test: ExpertTest) {
  const startTime = Date.now();
  
  try {
    const response = await fetch("http://localhost:4000/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: "You are a world-class expert in computer science, distributed systems, and algorithms. Answer with precision and depth." },
          { role: "user", content: test.prompt }
        ],
        max_tokens: 3000,
        temperature: 0.2,
        stream: false,
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        testId: test.id,
        testName: test.name,
        passed: false,
        score: 0,
        responseTime,
        error: await response.text(),
      };
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;
    const verification = test.verifyFunction(answer);

    return {
      testId: test.id,
      testName: test.name,
      passed: verification.passed,
      score: verification.score,
      responseTime,
      reason: verification.reason,
      preview: answer.slice(0, 200),
    };
  } catch (error: any) {
    return {
      testId: test.id,
      testName: test.name,
      passed: false,
      score: 0,
      responseTime: Date.now() - startTime,
      error: error.message,
    };
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   💀💀💀 EXPERT LEVEL BENCHMARKS - NIGHTMARE MODE        ║");
  console.log("║   These tests are designed to break even the best AIs     ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const modelsToTest = [
    "nexus-brain-deep",      // Current champion
    "nexus-code-deep",       // DeepSeek coding
    "nexus-work-fast",       // Fast worker
  ];

  console.log(`🎯 Testing ${modelsToTest.length} models on ${EXPERT_TESTS.length} NIGHTMARE challenges\n`);

  const allResults: any[] = [];

  for (const model of modelsToTest) {
    console.log(`\n${"═".repeat(70)}`);
    console.log(`🔥 Testing: ${model}`);
    console.log("═".repeat(70));

    for (const test of EXPERT_TESTS) {
      process.stdout.write(`  [${test.difficulty.toUpperCase()}] ${test.id} ${test.name.slice(0, 35).padEnd(35)}... `);
      
      const result = await runExpertTest(model, test);
      allResults.push({ model, ...result });

      if (result.error) {
        console.log(`❌ ERROR`);
        console.log(`      ${result.error.slice(0, 80)}`);
      } else if (result.passed) {
        console.log(`✅ PASS (${result.score.toFixed(0)}% - ${result.responseTime}ms)`);
      } else {
        console.log(`❌ FAIL (${result.score.toFixed(0)}% - ${result.responseTime}ms)`);
      }
    }

    const modelResults = allResults.filter(r => r.model === model);
    const passCount = modelResults.filter(r => r.passed).length;
    const avgScore = modelResults.reduce((sum, r) => sum + r.score, 0) / modelResults.length;

    console.log(`\n  💀 Nightmare Score: ${passCount}/${EXPERT_TESTS.length} passed | Avg: ${avgScore.toFixed(1)}%`);
  }

  console.log("\n\n" + "═".repeat(80));
  console.log("🏆 EXPERT LEVEL RESULTS");
  console.log("═".repeat(80) + "\n");

  const modelScores = modelsToTest.map(model => {
    const results = allResults.filter(r => r.model === model);
    return {
      model,
      passCount: results.filter(r => r.passed).length,
      totalTests: results.length,
      avgScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      avgTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length,
    };
  }).sort((a, b) => b.avgScore - a.avgScore);

  console.log("📊 NIGHTMARE MODE RANKINGS:\n");
  modelScores.forEach((m, i) => {
    const medal = i === 0 ? "💀" : i === 1 ? "☠️ " : "👻";
    console.log(`${medal} ${(i + 1)}. ${m.model.padEnd(25)} | ${m.passCount}/${m.totalTests} passed | Score: ${m.avgScore.toFixed(1)}% | Time: ${m.avgTime.toFixed(0)}ms`);
  });

  console.log("\n" + "═".repeat(80));
  if (modelScores[0].avgScore > 0) {
    console.log(`🏆 EXPERT CHAMPION: ${modelScores[0].model} with ${modelScores[0].avgScore.toFixed(1)}% score!`);
  } else {
    console.log("💀 ALL MODELS FAILED! These tests are truly NIGHTMARE level!");
  }
  console.log("═".repeat(80) + "\n");
}

main();
