// Nexus AI V2 - Provider Configuration with G4F Integration
// 16 Models across 5 providers + g4f (50+ sub-providers)

export interface ProviderConfig {
  name: string;
  baseUrl: string;
  model: string;
  keyEnv: string;
  tier: "complex" | "reasoning" | "heavy" | "chat";
  priority: 1 | 2 | 3 | 4; // 1=primary, 4=last resort
  category: string;
  costPer1kTokens: number;
  contextLimit: number;
  benchmarks?: {
    sweBench?: number;
    mmlu?: number;
    humanEval?: number;
    latency?: number;
  };
  requiresG4F?: boolean; // If true, route through g4f proxy
}

// ═══════════════════════════════════════════════════════════════════
// TIER 1: COMPLEX CODING + DEBUG/RESEARCH (24% workload)
// Goal: Best SWE-bench scores, NO COMPROMISE
// ═══════════════════════════════════════════════════════════════════

export const TIER_COMPLEX_CODING: Record<string, ProviderConfig> = {
  "nexus-code-ultra": {
    name: "nexus-code-ultra",
    baseUrl: "http://localhost:4001/v1", // g4f proxy
    model: "gpt-4o",
    keyEnv: "G4F_INTERNAL", // No key needed, g4f handles it
    tier: "complex",
    priority: 1,
    category: "coding-best",
    costPer1kTokens: 0.0, // FREE via g4f
    contextLimit: 128000,
    benchmarks: {
      sweBench: 50,
      humanEval: 87,
      mmlu: 88,
      latency: 300, // g4f adds overhead
    },
    requiresG4F: true,
  },

  "nexus-code-pro": {
    name: "nexus-code-pro",
    baseUrl: "http://localhost:4001/v1", // g4f proxy
    model: "claude-3.5-sonnet",
    keyEnv: "G4F_INTERNAL",
    tier: "complex",
    priority: 2,
    category: "coding-excellent",
    costPer1kTokens: 0.0, // FREE via g4f
    contextLimit: 200000,
    benchmarks: {
      sweBench: 49,
      humanEval: 85,
      mmlu: 89,
      latency: 350,
    },
    requiresG4F: true,
  },

  "nexus-code-deep": {
    name: "nexus-code-deep",
    baseUrl: "https://api.siliconflow.com/v1",
    model: "deepseek-ai/DeepSeek-V4-Pro",
    keyEnv: "SILICONFLOW_API_KEY",
    tier: "complex",
    priority: 3,
    category: "coding-strong",
    costPer1kTokens: 0.00014,
    contextLimit: 128000,
    benchmarks: {
      sweBench: 42,
      humanEval: 85,
      mmlu: 89,
      latency: 250,
    },
  },

  "nexus-code-stable": {
    name: "nexus-code-stable",
    baseUrl: "https://api.siliconflow.com/v1",
    model: "deepseek-ai/DeepSeek-V3",
    keyEnv: "SILICONFLOW_API_KEY",
    tier: "complex",
    priority: 4,
    category: "coding-reliable",
    costPer1kTokens: 0.00014,
    contextLimit: 64000,
    benchmarks: {
      sweBench: 40.5,
      humanEval: 82,
      mmlu: 87,
      latency: 235,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════
// TIER 2: PLANNING/REASONING (40% workload)
// Goal: High MMLU/GPQA, 64k+ context only
// ═══════════════════════════════════════════════════════════════════

export const TIER_REASONING: Record<string, ProviderConfig> = {
  "nexus-brain-max": {
    name: "nexus-brain-max",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-3.1-pro-preview",
    keyEnv: "GEMINI_API_KEY",
    tier: "reasoning",
    priority: 1,
    category: "reasoning-best",
    costPer1kTokens: 0.0, // FREE preview
    contextLimit: 1048576, // 1M!
    benchmarks: {
      mmlu: 92,
      sweBench: 32,
      latency: 200,
    },
  },

  "nexus-brain-ultra": {
    name: "nexus-brain-ultra",
    baseUrl: "http://localhost:4001/v1", // g4f
    model: "gpt-4o",
    keyEnv: "G4F_INTERNAL",
    tier: "reasoning",
    priority: 2,
    category: "reasoning-strong",
    costPer1kTokens: 0.0,
    contextLimit: 128000,
    benchmarks: {
      mmlu: 88,
      sweBench: 50,
      latency: 300,
    },
    requiresG4F: true,
  },

  "nexus-brain-pro": {
    name: "nexus-brain-pro",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-2.5-pro",
    keyEnv: "GEMINI_API_KEY",
    tier: "reasoning",
    priority: 3,
    category: "reasoning-proven",
    costPer1kTokens: 0.00125,
    contextLimit: 1048576,
    benchmarks: {
      mmlu: 90,
      sweBench: 32,
      latency: 95,
    },
  },

  "nexus-brain-deep": {
    name: "nexus-brain-deep",
    baseUrl: "https://api.siliconflow.com/v1",
    model: "deepseek-ai/DeepSeek-V4-Pro",
    keyEnv: "SILICONFLOW_API_KEY",
    tier: "reasoning",
    priority: 4,
    category: "reasoning-backup",
    costPer1kTokens: 0.00014,
    contextLimit: 128000,
    benchmarks: {
      mmlu: 89,
      sweBench: 42,
      latency: 250,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════
// TIER 3: HEAVY LIFTING CODING (36% workload)
// Goal: Balanced speed + quality, workhorse
// ═══════════════════════════════════════════════════════════════════

export const TIER_HEAVY_LIFTING: Record<string, ProviderConfig> = {
  "nexus-work-fast": {
    name: "nexus-work-fast",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile",
    keyEnv: "GROQ_API_KEY",
    tier: "heavy",
    priority: 1,
    category: "workhorse-fast",
    costPer1kTokens: 0.0, // FREE tier
    contextLimit: 128000,
    benchmarks: {
      sweBench: 28,
      humanEval: 76,
      mmlu: 82,
      latency: 134,
    },
  },

  "nexus-work-smart": {
    name: "nexus-work-smart",
    baseUrl: "http://localhost:4001/v1", // g4f
    model: "gpt-3.5-turbo",
    keyEnv: "G4F_INTERNAL",
    tier: "heavy",
    priority: 2,
    category: "workhorse-quick",
    costPer1kTokens: 0.0,
    contextLimit: 16000,
    benchmarks: {
      sweBench: 24,
      humanEval: 70,
      latency: 200,
    },
    requiresG4F: true,
  },

  "nexus-work-balanced": {
    name: "nexus-work-balanced",
    baseUrl: "https://api.siliconflow.com/v1",
    model: "deepseek-ai/DeepSeek-V4-Flash",
    keyEnv: "SILICONFLOW_API_KEY",
    tier: "heavy",
    priority: 3,
    category: "workhorse-capable",
    costPer1kTokens: 0.00007,
    contextLimit: 64000,
    benchmarks: {
      sweBench: 38,
      humanEval: 80,
      latency: 200,
    },
  },

  "nexus-work-flex": {
    name: "nexus-work-flex",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-2.5-flash",
    keyEnv: "GEMINI_API_KEY",
    tier: "heavy",
    priority: 4,
    category: "workhorse-context",
    costPer1kTokens: 0.000075,
    contextLimit: 1048576, // Large context fallback
    benchmarks: {
      sweBench: 27,
      humanEval: 78,
      latency: 157,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════
// TIER 4: SIMPLE CHAT (Speed priority, most frequent)
// Goal: Ultra-fast responses, lightweight
// ═══════════════════════════════════════════════════════════════════

export const TIER_SIMPLE_CHAT: Record<string, ProviderConfig> = {
  "nexus-chat-instant": {
    name: "nexus-chat-instant",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.1-8b-instant",
    keyEnv: "GROQ_API_KEY",
    tier: "chat",
    priority: 1,
    category: "chat-ultrafast",
    costPer1kTokens: 0.0,
    contextLimit: 128000,
    benchmarks: {
      sweBench: 18,
      humanEval: 65,
      latency: 86, // Ultra-fast!
    },
  },

  "nexus-chat-quick": {
    name: "nexus-chat-quick",
    baseUrl: "http://localhost:4001/v1", // g4f
    model: "gpt-3.5-turbo",
    keyEnv: "G4F_INTERNAL",
    tier: "chat",
    priority: 2,
    category: "chat-fast",
    costPer1kTokens: 0.0,
    contextLimit: 16000,
    benchmarks: {
      sweBench: 24,
      humanEval: 70,
      latency: 150,
    },
    requiresG4F: true,
  },

  "nexus-chat-smart": {
    name: "nexus-chat-smart",
    baseUrl: "https://api.siliconflow.com/v1",
    model: "Qwen/Qwen3.5-Coder-32B",
    keyEnv: "SILICONFLOW_API_KEY",
    tier: "chat",
    priority: 3,
    category: "chat-capable",
    costPer1kTokens: 0.00001,
    contextLimit: 32768,
    benchmarks: {
      sweBench: 35,
      humanEval: 87,
      latency: 150,
    },
  },

  "nexus-chat-flex": {
    name: "nexus-chat-flex",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-2.5-flash",
    keyEnv: "GEMINI_API_KEY",
    tier: "chat",
    priority: 4,
    category: "chat-fallback",
    costPer1kTokens: 0.000075,
    contextLimit: 1048576,
    benchmarks: {
      sweBench: 27,
      humanEval: 78,
      latency: 157,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════
// UNIFIED PROVIDER MAP (All 16 models)
// ═══════════════════════════════════════════════════════════════════

export const ALL_PROVIDERS: Record<string, ProviderConfig> = {
  ...TIER_COMPLEX_CODING,
  ...TIER_REASONING,
  ...TIER_HEAVY_LIFTING,
  ...TIER_SIMPLE_CHAT,
};

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export function getProvider(name: string): ProviderConfig | undefined {
  return ALL_PROVIDERS[name];
}

export function getProvidersByTier(tier: ProviderConfig["tier"]): ProviderConfig[] {
  return Object.values(ALL_PROVIDERS).filter((p) => p.tier === tier)
    .sort((a, b) => a.priority - b.priority);
}

export function getAllProviders(): ProviderConfig[] {
  return Object.values(ALL_PROVIDERS);
}

export function getProviderStats() {
  const tiers = {
    complex: getProvidersByTier("complex"),
    reasoning: getProvidersByTier("reasoning"),
    heavy: getProvidersByTier("heavy"),
    chat: getProvidersByTier("chat"),
  };

  return {
    total: Object.keys(ALL_PROVIDERS).length,
    byTier: {
      complex: tiers.complex.length,
      reasoning: tiers.reasoning.length,
      heavy: tiers.heavy.length,
      chat: tiers.chat.length,
    },
    providers: {
      g4f: Object.values(ALL_PROVIDERS).filter(p => p.requiresG4F).length,
      gemini: Object.values(ALL_PROVIDERS).filter(p => p.keyEnv === "GEMINI_API_KEY").length,
      siliconflow: Object.values(ALL_PROVIDERS).filter(p => p.keyEnv === "SILICONFLOW_API_KEY").length,
      groq: Object.values(ALL_PROVIDERS).filter(p => p.keyEnv === "GROQ_API_KEY").length,
    },
    bestScores: {
      sweBench: Math.max(...Object.values(ALL_PROVIDERS).map(p => p.benchmarks?.sweBench || 0)),
      mmlu: Math.max(...Object.values(ALL_PROVIDERS).map(p => p.benchmarks?.mmlu || 0)),
      latency: Math.min(...Object.values(ALL_PROVIDERS).map(p => p.benchmarks?.latency || 9999)),
    },
  };
}
