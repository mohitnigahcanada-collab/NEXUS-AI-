#!/usr/bin/env bun
// 🔥 HARD INDUSTRY-STANDARD BENCHMARKS - Real tests, no mercy!

interface BenchmarkTest {
  id: string;
  category: "coding" | "reasoning" | "debugging" | "system-design" | "algorithm";
  difficulty: "hard" | "very-hard" | "expert";
  name: string;
  prompt: string;
  verifyFunction: (response: string) => { passed: boolean; score: number; reason: string };
  timeLimit: number; // ms
  expectedTier: "complex" | "reasoning" | "heavy" | "chat";
}

// ═══════════════════════════════════════════════════════════════════
// CATEGORY 1: HARD CODING CHALLENGES (SWE-bench style)
// ═══════════════════════════════════════════════════════════════════

const CODING_TESTS: BenchmarkTest[] = [
  {
    id: "CODE-001",
    category: "coding",
    difficulty: "hard",
    name: "Implement LRU Cache with O(1) operations",
    prompt: `Implement an LRU (Least Recently Used) cache with O(1) get and put operations.
Requirements:
- get(key): Return value if exists, -1 otherwise
- put(key, value): Insert/update value. If cache full, evict LRU item
- Must use HashMap + Doubly Linked List
- Provide TypeScript implementation with proper types
- Include capacity parameter in constructor

Show ONLY the code, no explanations.`,
    verifyFunction: (response) => {
      const lower = response.toLowerCase();
      let score = 0;
      const checks = [
        { test: lower.includes("class") && lower.includes("lru"), points: 2, name: "Has LRU class" },
        { test: lower.includes("map") || lower.includes("hashmap"), points: 2, name: "Uses HashMap" },
        { test: lower.includes("get") && lower.includes("key"), points: 2, name: "Has get method" },
        { test: lower.includes("put") && lower.includes("key"), points: 2, name: "Has put method" },
        { test: lower.includes("capacity"), points: 1, name: "Has capacity limit" },
        { test: lower.includes("node") || lower.includes("list"), points: 1, name: "Uses linked structure" },
      ];
      
      checks.forEach(check => { if (check.test) score += check.points; });
      
      return {
        passed: score >= 8,
        score: (score / 10) * 100,
        reason: `LRU Cache implementation: ${score}/10 points`
      };
    },
    timeLimit: 60000,
    expectedTier: "complex"
  },
  
  {
    id: "CODE-002",
    category: "coding",
    difficulty: "very-hard",
    name: "Fix subtle race condition in concurrent code",
    prompt: `Find and fix the race condition in this TypeScript code:

\`\`\`typescript
class Counter {
  private count = 0;
  
  async increment() {
    const current = this.count;
    await new Promise(resolve => setTimeout(resolve, 10));
    this.count = current + 1;
  }
  
  getCount() { return this.count; }
}
\`\`\`

Explain the bug AND provide the fixed code with proper synchronization.`,
    verifyFunction: (response) => {
      const lower = response.toLowerCase();
      let score = 0;
      
      if (lower.includes("race") || lower.includes("concurrent")) score += 2;
      if (lower.includes("lock") || lower.includes("mutex") || lower.includes("semaphore") || lower.includes("atomic")) score += 3;
      if (lower.includes("await") && lower.includes("lock")) score += 2;
      if (lower.includes("queue") || lower.includes("serial")) score += 2;
      if (response.includes("class Counter") && response.includes("fix")) score += 1;
      
      return {
        passed: score >= 6,
        score: (score / 10) * 100,
        reason: `Race condition fix: ${score}/10 points`
      };
    },
    timeLimit: 45000,
    expectedTier: "complex"
  },

  {
    id: "CODE-003",
    category: "coding",
    difficulty: "expert",
    name: "Implement Red-Black Tree insertion",
    prompt: `Implement a Red-Black Tree insertion algorithm in TypeScript.
Requirements:
- Self-balancing binary search tree
- Must maintain all 5 red-black properties
- Handle color flips and rotations correctly
- Include proper type definitions

Provide ONLY the insert() method and necessary helper methods.`,
    verifyFunction: (response) => {
      const lower = response.toLowerCase();
      let score = 0;
      
      if (lower.includes("red") && lower.includes("black")) score += 2;
      if (lower.includes("rotate")) score += 2;
      if (lower.includes("color") || lower.includes("red") || lower.includes("black")) score += 2;
      if (lower.includes("insert")) score += 2;
      if (lower.includes("balance") || lower.includes("fix")) score += 1;
      if (lower.includes("parent")) score += 1;
      
      return {
        passed: score >= 7,
        score: (score / 10) * 100,
        reason: `Red-Black Tree: ${score}/10 points`
      };
    },
    timeLimit: 90000,
    expectedTier: "complex"
  }
];

// ═══════════════════════════════════════════════════════════════════
// CATEGORY 2: HARD REASONING CHALLENGES (MMLU/GPQA style)
// ═══════════════════════════════════════════════════════════════════

const REASONING_TESTS: BenchmarkTest[] = [
  {
    id: "REASON-001",
    category: "reasoning",
    difficulty: "hard",
    name: "Multi-step logic puzzle with constraints",
    prompt: `Solve this logic puzzle:

Five people (Alice, Bob, Carol, Dave, Eve) sit in a row.
Constraints:
1. Alice sits exactly 2 seats away from Bob
2. Carol doesn't sit next to Dave
3. Eve sits at one of the ends
4. Bob is not at an end
5. Dave sits between two people

Question: What are ALL possible seating arrangements? List them and explain your reasoning step by step.`,
    verifyFunction: (response) => {
      const lower = response.toLowerCase();
      let score = 0;
      
      if (lower.includes("eve") && (lower.includes("end") || lower.includes("first") || lower.includes("last"))) score += 2;
      if (lower.includes("alice") && lower.includes("bob") && (lower.includes("2") || lower.includes("two"))) score += 2;
      if (lower.includes("carol") && lower.includes("dave")) score += 1;
      if (lower.includes("step") || lower.includes("first") || lower.includes("constraint")) score += 2;
      if ((response.match(/[A-E][a-z]+.*[A-E][a-z]+.*[A-E][a-z]+.*[A-E][a-z]+.*[A-E][a-z]+/g) || []).length >= 2) score += 3;
      
      return {
        passed: score >= 7,
        score: (score / 10) * 100,
        reason: `Logic puzzle: ${score}/10 points`
      };
    },
    timeLimit: 60000,
    expectedTier: "reasoning"
  },

  {
    id: "REASON-002",
    category: "reasoning",
    difficulty: "very-hard",
    name: "Probability with Bayes theorem",
    prompt: `A rare disease affects 0.1% of the population. A test for this disease:
- True Positive Rate (Sensitivity): 99%
- False Positive Rate: 5%

If someone tests positive, what is the probability they ACTUALLY have the disease?

Show your work using Bayes' theorem step by step.`,
    verifyFunction: (response) => {
      const lower = response.toLowerCase();
      let score = 0;
      
      if (lower.includes("bayes")) score += 2;
      if (lower.includes("0.001") || lower.includes("0.1%")) score += 1;
      if (lower.includes("0.99") || lower.includes("99%")) score += 1;
      if (lower.includes("0.05") || lower.includes("5%")) score += 1;
      if (lower.includes("1.9") || lower.includes("2%") || lower.includes("0.019") || lower.includes("0.02")) score += 3;
      if (lower.includes("false positive") || lower.includes("true positive")) score += 1;
      if (lower.includes("p(") || lower.includes("probability")) score += 1;
      
      return {
        passed: score >= 7,
        score: (score / 10) * 100,
        reason: `Bayes theorem: ${score}/10 points (answer should be ~2%)`
      };
    },
    timeLimit: 45000,
    expectedTier: "reasoning"
  },

  {
    id: "REASON-003",
    category: "reasoning",
    difficulty: "expert",
    name: "Complex optimization problem",
    prompt: `You're planning a road trip visiting 6 cities with these constraints:
- Start and end at City A
- Must visit City D before City E
- Cannot go directly from B to F (road closed)
- Distance matrix (symmetric):
  A-B: 100, A-C: 150, A-D: 200, A-E: 180, A-F: 220
  B-C: 120, B-D: 90, B-E: 160, B-F: 140
  C-D: 110, C-E: 100, C-F: 130
  D-E: 80, D-F: 170
  E-F: 90

Find the SHORTEST route that visits all cities exactly once and returns to A.
Show your reasoning process.`,
    verifyFunction: (response) => {
      const lower = response.toLowerCase();
      let score = 0;
      
      if (lower.includes("a") && lower.includes("b") && lower.includes("c") && lower.includes("d") && lower.includes("e") && lower.includes("f")) score += 2;
      if (lower.includes("distance") || lower.includes("km") || lower.includes("shortest")) score += 1;
      if (lower.match(/\d{3,4}/)) score += 2; // Has total distance calculation
      if (lower.includes("constraint") || lower.includes("d before e") || lower.includes("road closed")) score += 2;
      if (lower.includes("route") || lower.includes("path")) score += 1;
      if (response.includes("→") || response.includes("->") || response.match(/[A-F]-[A-F]/)) score += 2;
      
      return {
        passed: score >= 7,
        score: (score / 10) * 100,
        reason: `TSP optimization: ${score}/10 points`
      };
    },
    timeLimit: 90000,
    expectedTier: "reasoning"
  }
];

// ═══════════════════════════════════════════════════════════════════
// CATEGORY 3: REAL-WORLD DEBUGGING (Industry scenarios)
// ═══════════════════════════════════════════════════════════════════

const DEBUGGING_TESTS: BenchmarkTest[] = [
  {
    id: "DEBUG-001",
    category: "debugging",
    difficulty: "hard",
    name: "Memory leak in Node.js application",
    prompt: `This Express.js app has a memory leak. Find it and explain how to fix:

\`\`\`javascript
const express = require('express');
const app = express();
const users = [];

app.get('/register', (req, res) => {
  const user = {
    id: Date.now(),
    name: req.query.name,
    callback: () => console.log(\`User \${user.id} logged in\`)
  };
  users.push(user);
  res.json({ success: true });
});

app.get('/stats', (req, res) => {
  res.json({ totalUsers: users.length });
});
\`\`\`

Identify ALL issues and provide fixed code.`,
    verifyFunction: (response) => {
      const lower = response.toLowerCase();
      let score = 0;
      
      if (lower.includes("memory") && lower.includes("leak")) score += 2;
      if (lower.includes("closure") || lower.includes("reference")) score += 3;
      if (lower.includes("callback") || lower.includes("function")) score += 2;
      if (lower.includes("unbounded") || lower.includes("grow") || lower.includes("accumulate")) score += 2;
      if (lower.includes("remove") || lower.includes("limit") || lower.includes("cleanup")) score += 1;
      
      return {
        passed: score >= 6,
        score: (score / 10) * 100,
        reason: `Memory leak detection: ${score}/10 points`
      };
    },
    timeLimit: 45000,
    expectedTier: "complex"
  },

  {
    id: "DEBUG-002",
    category: "debugging",
    difficulty: "very-hard",
    name: "SQL N+1 query problem",
    prompt: `This code causes performance issues. Identify the problem and fix it:

\`\`\`typescript
async function getUsersWithPosts() {
  const users = await db.query('SELECT * FROM users');
  
  const result = [];
  for (const user of users) {
    const posts = await db.query('SELECT * FROM posts WHERE user_id = ?', [user.id]);
    result.push({ ...user, posts });
  }
  
  return result;
}
\`\`\`

What's the issue? How many queries does this execute for 100 users?
Provide optimized code.`,
    verifyFunction: (response) => {
      const lower = response.toLowerCase();
      let score = 0;
      
      if (lower.includes("n+1") || lower.includes("n + 1")) score += 3;
      if (lower.includes("join")) score += 3;
      if (lower.includes("101") || (lower.includes("100") && lower.includes("1"))) score += 2;
      if (lower.includes("batch") || lower.includes("single query")) score += 1;
      if (lower.includes("performance") || lower.includes("slow")) score += 1;
      
      return {
        passed: score >= 6,
        score: (score / 10) * 100,
        reason: `N+1 query problem: ${score}/10 points`
      };
    },
    timeLimit: 45000,
    expectedTier: "complex"
  }
];

// ═══════════════════════════════════════════════════════════════════
// CATEGORY 4: SYSTEM DESIGN (Architecture challenges)
// ═══════════════════════════════════════════════════════════════════

const SYSTEM_DESIGN_TESTS: BenchmarkTest[] = [
  {
    id: "DESIGN-001",
    category: "system-design",
    difficulty: "hard",
    name: "Design URL shortener with analytics",
    prompt: `Design a URL shortener service (like bit.ly) that handles 1 million requests/day.

Requirements:
- Generate short URLs (7 characters)
- Track click analytics (views, locations, referrers)
- 99.9% uptime SLA
- Handle viral traffic spikes (100x normal load)

Describe:
1. Database schema
2. Caching strategy
3. How to generate unique short codes
4. Scaling approach

Be specific and technical.`,
    verifyFunction: (response) => {
      const lower = response.toLowerCase();
      let score = 0;
      
      if (lower.includes("base62") || lower.includes("hash") || lower.includes("random")) score += 2;
      if (lower.includes("redis") || lower.includes("cache") || lower.includes("memcache")) score += 2;
      if (lower.includes("database") || lower.includes("sql") || lower.includes("nosql")) score += 1;
      if (lower.includes("load balancer") || lower.includes("horizontal") || lower.includes("scale")) score += 2;
      if (lower.includes("analytics") || lower.includes("track") || lower.includes("click")) score += 1;
      if (lower.includes("collision") || lower.includes("unique")) score += 1;
      if (lower.includes("cdn") || lower.includes("distributed")) score += 1;
      
      return {
        passed: score >= 7,
        score: (score / 10) * 100,
        reason: `System design: ${score}/10 points`
      };
    },
    timeLimit: 90000,
    expectedTier: "reasoning"
  },

  {
    id: "DESIGN-002",
    category: "system-design",
    difficulty: "very-hard",
    name: "Design distributed rate limiter",
    prompt: `Design a distributed rate limiter for a microservices architecture.

Requirements:
- 1000 requests per minute per user
- Works across multiple servers
- No single point of failure
- Accurate within 5% margin
- Low latency (<10ms overhead)

Explain:
1. Algorithm choice (token bucket, sliding window, etc)
2. How to handle distributed state
3. Handling clock skew between servers
4. Race condition prevention`,
    verifyFunction: (response) => {
      const lower = response.toLowerCase();
      let score = 0;
      
      if (lower.includes("token") || lower.includes("bucket") || lower.includes("window") || lower.includes("leaky")) score += 2;
      if (lower.includes("redis") || lower.includes("distributed") || lower.includes("shared state")) score += 2;
      if (lower.includes("clock") || lower.includes("timestamp") || lower.includes("sync")) score += 2;
      if (lower.includes("atomic") || lower.includes("lua") || lower.includes("lock")) score += 2;
      if (lower.includes("partition") || lower.includes("consistent hash")) score += 1;
      if (lower.includes("failover") || lower.includes("replicate")) score += 1;
      
      return {
        passed: score >= 7,
        score: (score / 10) * 100,
        reason: `Distributed rate limiter: ${score}/10 points`
      };
    },
    timeLimit: 90000,
    expectedTier: "reasoning"
  }
];

// ═══════════════════════════════════════════════════════════════════
// BENCHMARK RUNNER
// ═══════════════════════════════════════════════════════════════════

const ALL_TESTS = [
  ...CODING_TESTS,
  ...REASONING_TESTS,
  ...DEBUGGING_TESTS,
  ...SYSTEM_DESIGN_TESTS
];

interface TestResult {
  modelName: string;
  testId: string;
  testName: string;
  category: string;
  difficulty: string;
  passed: boolean;
  score: number;
  responseTime: number;
  reason: string;
  response?: string;
  error?: string;
}

async function runBenchmark(modelName: string, test: BenchmarkTest): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch("http://localhost:4000/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: "You are an expert software engineer and computer scientist. Provide accurate, detailed technical answers." },
          { role: "user", content: test.prompt }
        ],
        max_tokens: 2000,
        temperature: 0.3, // Lower temperature for accuracy
        stream: false,
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        modelName,
        testId: test.id,
        testName: test.name,
        category: test.category,
        difficulty: test.difficulty,
        passed: false,
        score: 0,
        responseTime,
        reason: "API Error",
        error: errorText.slice(0, 100),
      };
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    // Verify answer
    const verification = test.verifyFunction(answer);

    return {
      modelName,
      testId: test.id,
      testName: test.name,
      category: test.category,
      difficulty: test.difficulty,
      passed: verification.passed,
      score: verification.score,
      responseTime,
      reason: verification.reason,
      response: answer.slice(0, 200),
    };
  } catch (error: any) {
    return {
      modelName,
      testId: test.id,
      testName: test.name,
      category: test.category,
      difficulty: test.difficulty,
      passed: false,
      score: 0,
      responseTime: Date.now() - startTime,
      reason: "Exception",
      error: error.message,
    };
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   🔥 HARD INDUSTRY BENCHMARKS - NEXUS AI V2               ║");
  console.log("║   Real tests. No mercy. Find the champions.               ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const modelsToTest = [
    // Complex Coding tier
    "nexus-code-deep",
    "nexus-code-stable",
    
    // Reasoning tier
    "nexus-brain-deep",
    
    // Heavy tier
    "nexus-work-fast",
    "nexus-work-smart",
    
    // Chat tier
    "nexus-chat-instant",
  ];

  console.log(`📋 Testing ${modelsToTest.length} models across ${ALL_TESTS.length} hard challenges\n`);
  console.log(`Categories:`);
  console.log(`  🔧 Coding: ${CODING_TESTS.length} tests`);
  console.log(`  🧠 Reasoning: ${REASONING_TESTS.length} tests`);
  console.log(`  🐛 Debugging: ${DEBUGGING_TESTS.length} tests`);
  console.log(`  🏗️  System Design: ${SYSTEM_DESIGN_TESTS.length} tests`);
  console.log();

  const allResults: TestResult[] = [];

  for (const model of modelsToTest) {
    console.log(`\n${"═".repeat(70)}`);
    console.log(`🎯 Testing: ${model}`);
    console.log("═".repeat(70));

    for (const test of ALL_TESTS) {
      process.stdout.write(`  [${test.difficulty.toUpperCase()}] ${test.id} ${test.name.slice(0, 40).padEnd(40)}... `);
      
      const result = await runBenchmark(model, test);
      allResults.push(result);

      if (result.error) {
        console.log(`❌ ERROR`);
        console.log(`      ${result.error}`);
      } else if (result.passed) {
        console.log(`✅ PASS (${result.score.toFixed(0)}% - ${result.responseTime}ms)`);
      } else {
        console.log(`❌ FAIL (${result.score.toFixed(0)}% - ${result.responseTime}ms)`);
      }
    }

    const modelResults = allResults.filter(r => r.modelName === model);
    const passCount = modelResults.filter(r => r.passed).length;
    const avgScore = modelResults.reduce((sum, r) => sum + r.score, 0) / modelResults.length;
    const avgTime = modelResults.reduce((sum, r) => sum + r.responseTime, 0) / modelResults.length;

    console.log(`\n  Summary: ${passCount}/${ALL_TESTS.length} passed | Avg Score: ${avgScore.toFixed(1)}% | Avg Time: ${avgTime.toFixed(0)}ms`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // FINAL RESULTS & WINNERS
  // ═══════════════════════════════════════════════════════════════════

  console.log("\n\n" + "═".repeat(80));
  console.log("🏆 FINAL RESULTS - INDUSTRY BENCHMARK WINNERS");
  console.log("═".repeat(80) + "\n");

  // Overall rankings
  const modelScores = modelsToTest.map(model => {
    const results = allResults.filter(r => r.modelName === model);
    return {
      model,
      passCount: results.filter(r => r.passed).length,
      totalTests: results.length,
      avgScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      avgTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length,
    };
  }).sort((a, b) => b.avgScore - a.avgScore);

  console.log("📊 OVERALL RANKINGS:\n");
  modelScores.forEach((m, i) => {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "  ";
    console.log(`${medal} ${(i + 1).toString().padStart(2)}. ${m.model.padEnd(25)} | Pass: ${m.passCount}/${m.totalTests} | Score: ${m.avgScore.toFixed(1)}% | Time: ${m.avgTime.toFixed(0)}ms`);
  });

  // Category winners
  console.log("\n🏅 CATEGORY CHAMPIONS:\n");

  const categories = ["coding", "reasoning", "debugging", "system-design"];
  
  for (const category of categories) {
    const categoryTests = ALL_TESTS.filter(t => t.category === category);
    const winners = modelsToTest.map(model => {
      const results = allResults.filter(r => r.modelName === model && r.category === category);
      const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length || 0;
      return { model, avgScore, passCount: results.filter(r => r.passed).length };
    }).sort((a, b) => b.avgScore - a.avgScore);

    const champion = winners[0];
    console.log(`  ${category.toUpperCase().padEnd(15)}: 🏆 ${champion.model} (${champion.passCount}/${categoryTests.length} passed, ${champion.avgScore.toFixed(1)}%)`);
  }

  console.log("\n" + "═".repeat(80));
  console.log(`✅ Benchmark complete! Tested ${modelsToTest.length} models on ${ALL_TESTS.length} hard challenges`);
  console.log("═".repeat(80) + "\n");

  // Save results
  await Bun.write(
    "/home/mohit/nexus-ai-v2/benchmark-results.json",
    JSON.stringify({ results: allResults, summary: modelScores }, null, 2)
  );
  console.log("📄 Results saved to: benchmark-results.json\n");
}

main();
