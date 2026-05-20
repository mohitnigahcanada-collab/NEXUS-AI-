// Nexus AI V2 - Intelligent Router with Task Detection & Context Escalation

import { ALL_PROVIDERS, getProvidersByTier, type ProviderConfig } from "./providers-v2";

// ═══════════════════════════════════════════════════════════════════
// TASK DETECTION KEYWORDS
// ═══════════════════════════════════════════════════════════════════

const TASK_KEYWORDS = {
  // Complex Coding + Debug (24% workload)
  complex: [
    "debug", "error", "trace", "stack", "exception", "fix bug",
    "complex algorithm", "optimize", "refactor complex", "system design",
    "performance issue", "memory leak", "race condition", "deadlock",
    "investigate", "research code", "code review", "security audit",
  ],

  // Planning/Reasoning (40% workload)
  reasoning: [
    "plan", "design", "architecture", "strategy", "approach",
    "analyze", "compare", "evaluate", "reason", "logic",
    "calculate", "math", "proof", "theorem", "explain why",
    "trade-offs", "pros and cons", "consider", "think through",
  ],

  // Heavy Lifting Coding (36% workload)
  heavy: [
    "implement", "create", "build", "write code", "add feature",
    "develop", "code", "function", "class", "module",
    "update", "modify", "change", "refactor", "rewrite",
    "integrate", "connect", "setup", "configure",
  ],

  // Simple Chat (frequent)
  chat: [
    "what", "how", "why", "when", "where", "who",
    "explain", "tell me", "show", "list", "describe",
    "summarize", "quick question", "help me understand",
  ],
};

// ═══════════════════════════════════════════════════════════════════
// TASK DETECTION LOGIC
// ═══════════════════════════════════════════════════════════════════

export interface TaskAnalysis {
  tier: "complex" | "reasoning" | "heavy" | "chat";
  confidence: number; // 0-100
  estimatedTokens: number;
  suggestedProvider: string;
  fallbackChain: string[];
  contextWarning?: string;
}

export function analyzeTask(messages: Array<{role: string; content: string}>): TaskAnalysis {
  // Combine all user messages
  const userContent = messages
    .filter(m => m.role === "user")
    .map(m => m.content.toLowerCase())
    .join(" ");

  // Count tokens (rough estimate: 1 token ≈ 4 chars)
  const estimatedTokens = messages
    .map(m => m.content.length / 4)
    .reduce((a, b) => a + b, 0);

  // Score each tier
  const scores = {
    complex: countKeywordMatches(userContent, TASK_KEYWORDS.complex),
    reasoning: countKeywordMatches(userContent, TASK_KEYWORDS.reasoning),
    heavy: countKeywordMatches(userContent, TASK_KEYWORDS.heavy),
    chat: countKeywordMatches(userContent, TASK_KEYWORDS.chat),
  };

  // Determine tier (highest score wins)
  const tier = Object.entries(scores).reduce((max, [key, value]) => 
    value > scores[max] ? key as any : max, 
    "chat" as TaskAnalysis["tier"]
  );

  const confidence = Math.min(100, scores[tier] * 20); // Cap at 100

  // Get provider chain for this tier
  const providers = getProvidersByTier(tier);
  const suggestedProvider = providers[0]?.name || "nexus-chat-instant";
  const fallbackChain = providers.slice(1).map(p => p.name);

  // Context warning if approaching limits
  let contextWarning: string | undefined;
  if (estimatedTokens > 800000) {
    contextWarning = "⚠️ Context very large (800k+ tokens). Consider restarting session for better performance.";
  } else if (estimatedTokens > 180000) {
    contextWarning = "💡 Context growing large (180k+ tokens). May want to restart soon.";
  }

  return {
    tier,
    confidence,
    estimatedTokens: Math.round(estimatedTokens),
    suggestedProvider,
    fallbackChain,
    contextWarning,
  };
}

function countKeywordMatches(text: string, keywords: string[]): number {
  return keywords.filter(keyword => text.includes(keyword)).length;
}

// ═══════════════════════════════════════════════════════════════════
// CONTEXT ESCALATION LOGIC
// ═══════════════════════════════════════════════════════════════════

export interface ContextEscalation {
  currentLevel: "32k" | "64k" | "128k" | "200k" | "1M";
  shouldEscalate: boolean;
  suggestedProvider: string;
  reason: string;
  warning?: string;
}

export function evaluateContextEscalation(
  currentTokens: number,
  currentProvider: string
): ContextEscalation {
  const provider = ALL_PROVIDERS[currentProvider];
  const contextLimit = provider?.contextLimit || 32000;

  // Calculate context usage percentage
  const usagePercent = (currentTokens / contextLimit) * 100;

  // Escalation thresholds
  if (currentTokens < 20000) {
    return {
      currentLevel: "32k",
      shouldEscalate: false,
      suggestedProvider: currentProvider,
      reason: "Context within 32k range",
    };
  }

  if (currentTokens < 60000) {
    // Need 64k+ model
    if (contextLimit < 64000) {
      const escalated = findProviderWithContext(64000, provider.tier);
      return {
        currentLevel: "64k",
        shouldEscalate: true,
        suggestedProvider: escalated,
        reason: "Context requires 64k model",
      };
    }
    return {
      currentLevel: "64k",
      shouldEscalate: false,
      suggestedProvider: currentProvider,
      reason: "Current model handles 64k",
    };
  }

  if (currentTokens < 120000) {
    // Need 128k+ model
    if (contextLimit < 128000) {
      const escalated = findProviderWithContext(128000, provider.tier);
      return {
        currentLevel: "128k",
        shouldEscalate: true,
        suggestedProvider: escalated,
        reason: "Context requires 128k model",
      };
    }
    return {
      currentLevel: "128k",
      shouldEscalate: false,
      suggestedProvider: currentProvider,
      reason: "Current model handles 128k",
    };
  }

  if (currentTokens < 180000) {
    // Need 200k+ model
    if (contextLimit < 200000) {
      const escalated = findProviderWithContext(200000, provider.tier);
      return {
        currentLevel: "200k",
        shouldEscalate: true,
        suggestedProvider: escalated,
        reason: "Context requires 200k+ model",
        warning: "💡 Context growing large. Consider restarting session soon for optimal performance.",
      };
    }
    return {
      currentLevel: "200k",
      shouldEscalate: false,
      suggestedProvider: currentProvider,
      reason: "Current model handles 200k+",
      warning: "💡 Context growing large. Consider restarting session soon.",
    };
  }

  // Need 1M model
  if (contextLimit < 1000000) {
    const escalated = findProviderWithContext(1000000, provider.tier);
    return {
      currentLevel: "1M",
      shouldEscalate: true,
      suggestedProvider: escalated,
      reason: "Context requires 1M model",
      warning: "⚠️ Context very large (180k+). Please restart session when convenient for better results.",
    };
  }

  return {
    currentLevel: "1M",
    shouldEscalate: false,
    suggestedProvider: currentProvider,
    reason: "Using maximum context model",
    warning: currentTokens > 800000 
      ? "🚨 Context extremely large (800k+)! Strongly recommend restarting session from dashboard." 
      : "⚠️ Context very large. Consider restarting session for better performance.",
  };
}

function findProviderWithContext(minContext: number, tier: string): string {
  const providers = Object.values(ALL_PROVIDERS)
    .filter(p => p.tier === tier && p.contextLimit >= minContext)
    .sort((a, b) => a.priority - b.priority);

  return providers[0]?.name || "nexus-brain-max"; // Fallback to largest context
}

// ═══════════════════════════════════════════════════════════════════
// SMART ROUTING ENGINE
// ═══════════════════════════════════════════════════════════════════

export interface RouteDecision {
  provider: string;
  tier: string;
  reason: string;
  fallbackChain: string[];
  contextWarning?: string;
  escalated: boolean;
}

export function smartRoute(
  messages: Array<{role: string; content: string}>,
  currentProvider?: string,
  forceModel?: string
): RouteDecision {
  // If user forced a specific model, use it
  if (forceModel && ALL_PROVIDERS[forceModel]) {
    return {
      provider: forceModel,
      tier: ALL_PROVIDERS[forceModel].tier,
      reason: "User-specified model",
      fallbackChain: [],
      escalated: false,
    };
  }

  // Analyze task
  const taskAnalysis = analyzeTask(messages);

  // Check if context escalation needed
  let escalation: ContextEscalation | null = null;
  if (currentProvider) {
    escalation = evaluateContextEscalation(taskAnalysis.estimatedTokens, currentProvider);
  }

  // If escalation needed, use escalated provider
  if (escalation?.shouldEscalate) {
    return {
      provider: escalation.suggestedProvider,
      tier: ALL_PROVIDERS[escalation.suggestedProvider].tier,
      reason: escalation.reason,
      fallbackChain: taskAnalysis.fallbackChain,
      contextWarning: escalation.warning || taskAnalysis.contextWarning,
      escalated: true,
    };
  }

  // Otherwise use task-based routing
  return {
    provider: taskAnalysis.suggestedProvider,
    tier: taskAnalysis.tier,
    reason: `Task detected as ${taskAnalysis.tier} (${taskAnalysis.confidence}% confidence)`,
    fallbackChain: taskAnalysis.fallbackChain,
    contextWarning: taskAnalysis.contextWarning,
    escalated: false,
  };
}

// ═══════════════════════════════════════════════════════════════════
// FALLBACK HANDLING
// ═══════════════════════════════════════════════════════════════════

export interface FallbackResult {
  nextProvider: string | null;
  shouldRetry: boolean;
  maxRetriesReached: boolean;
}

const MAX_FALLBACKS_PER_REQUEST = 4; // Try up to 4 models before giving up

export function handleFallback(
  failedProvider: string,
  attemptNumber: number,
  tier: string
): FallbackResult {
  // Max retries reached?
  if (attemptNumber >= MAX_FALLBACKS_PER_REQUEST) {
    return {
      nextProvider: null,
      shouldRetry: false,
      maxRetriesReached: true,
    };
  }

  // Get next provider in tier
  const providers = getProvidersByTier(tier as any);
  const failedIndex = providers.findIndex(p => p.name === failedProvider);
  
  if (failedIndex === -1 || failedIndex >= providers.length - 1) {
    // No more providers in tier
    return {
      nextProvider: null,
      shouldRetry: false,
      maxRetriesReached: true,
    };
  }

  // Return next provider
  return {
    nextProvider: providers[failedIndex + 1].name,
    shouldRetry: true,
    maxRetriesReached: false,
  };
}

// ═══════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════

export default smartRoute;
