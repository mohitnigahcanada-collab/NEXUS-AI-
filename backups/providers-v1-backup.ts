// Nexus AI - Provider Configuration
// Maps branded model names to real providers (NEVER exposed to users)

export interface ProviderConfig {
  name: string;
  baseUrl: string;
  model: string;
  keyEnv: string;
  tier: number; // 1=fastest, 2=balanced, 3=premium, 4=free
  category: "fast" | "general" | "reasoning" | "code" | "free";
  costPer1kTokens: number; // approximate, for savings calculation
}

export const PROVIDERS: Record<string, ProviderConfig> = {
  "nexus-flash": {
    name: "nexus-flash",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile",
    keyEnv: "GROQ_API_KEY",
    tier: 1,
    category: "fast",
    costPer1kTokens: 0.0003,
  },
  "nexus-air": {
    name: "nexus-air",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-2.5-flash",
    keyEnv: "GEMINI_API_KEY",
    tier: 2,
    category: "general",
    costPer1kTokens: 0.0001,
  },
  "nexus-deep": {
    name: "nexus-deep",
    baseUrl: "https://api.siliconflow.com/v1",
    model: "deepseek-ai/DeepSeek-V3",
    keyEnv: "SILICONFLOW_API_KEY",
    tier: 2,
    category: "reasoning",
    costPer1kTokens: 0.0002,
  },
  "nexus-pro": {
    name: "nexus-pro",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-2.5-pro",
    keyEnv: "GEMINI_API_KEY",
    tier: 3,
    category: "reasoning",
    costPer1kTokens: 0.001,
  },
  "nexus-code": {
    name: "nexus-code",
    baseUrl: "https://inference.poolside.ai/v1",
    model: "poolside/laguna-m.1",
    keyEnv: "POOLSIDE_API_KEY",
    tier: 2,
    category: "code",
    costPer1kTokens: 0.0005,
  },
  "nexus-core": {
    name: "nexus-core",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    model: "meta/llama-3.3-70b-instruct",
    keyEnv: "NVIDIA_API_KEY",
    tier: 3,
    category: "general",
    costPer1kTokens: 0.0003,
  },
  "nexus-lite": {
    name: "nexus-lite",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.1-8b-instant",
    keyEnv: "GROQ_API_KEY",
    tier: 4,
    category: "free",
    costPer1kTokens: 0.0,
  },
};

// OpenAI GPT-4o pricing for "savings" comparison
export const OPENAI_COST_PER_1K = 0.005;

export function getProvider(model: string): ProviderConfig | undefined {
  return PROVIDERS[model];
}

export function getAllProviders(): ProviderConfig[] {
  return Object.values(PROVIDERS);
}

export function getProvidersByTier(tier: number): ProviderConfig[] {
  return Object.values(PROVIDERS).filter((p) => p.tier === tier);
}
