// Nexus AI - Variant System
// Simplifies model selection: fast, balance, pro, xmax, auto

import { getProvidersByTier, getProvider, type ProviderConfig } from "./providers";

export interface VariantConfig {
  name: string;
  tier: ProviderConfig["tier"] | null;
  description: string;
  icon: string;
  speed: "fastest" | "fast" | "balanced" | "powerful" | "optimal";
  escalationTier?: ProviderConfig["tier"]; // Fallback tier if all models in primary tier fail
}

export const VARIANTS: Record<string, VariantConfig> = {
  auto: {
    name: "auto",
    tier: null,
    description: "Smart routing based on task analysis",
    icon: "🚀",
    speed: "optimal",
  },

  fast: {
    name: "fast",
    tier: "chat",
    description: "Fastest models for quick tasks (8B-9B params)",
    icon: "⚡",
    speed: "fastest",
    escalationTier: "heavy", // If chat fails, try heavy
  },

  balance: {
    name: "balance",
    tier: "heavy",
    description: "Balanced speed/quality for general coding (32B-70B params)",
    icon: "🔥",
    speed: "fast",
    escalationTier: "complex", // If heavy fails, try complex
  },

  pro: {
    name: "pro",
    tier: "complex",
    description: "Best coding models for complex tasks (Priority #1 winners)",
    icon: "🎯",
    speed: "balanced",
    escalationTier: "reasoning", // If complex fails, try reasoning
  },

  xmax: {
    name: "xmax",
    tier: "reasoning",
    description: "Deepest reasoning for hard problems (Priority #1 champions)",
    icon: "🧠",
    speed: "powerful",
    escalationTier: "complex", // If reasoning fails, try complex
  },
};

/**
 * Resolve a variant name to the best available model
 * Returns the actual model name to use
 */
export function resolveVariant(
  variantName: string,
  messages?: Array<{ role: string; content: string | any[] }>
): string | null {
  const variant = VARIANTS[variantName];
  
  if (!variant) {
    // Not a variant, might be actual model name
    return null;
  }

  // If auto, return "auto" to trigger smart routing in gateway
  if (variantName === "auto") {
    return "auto";
  }

  // Get best model from primary tier (priority #1)
  const primaryProviders = getProvidersByTier(variant.tier!);
  if (primaryProviders.length > 0) {
    return primaryProviders[0].name; // First provider = highest priority
  }

  // Primary tier failed, try escalation tier
  if (variant.escalationTier) {
    const escalationProviders = getProvidersByTier(variant.escalationTier);
    if (escalationProviders.length > 0) {
      console.warn(`[Variants] Primary tier '${variant.tier}' empty, escalating to '${variant.escalationTier}'`);
      return escalationProviders[0].name;
    }
  }

  // No models available
  console.error(`[Variants] No models available for variant '${variantName}'`);
  return null;
}

/**
 * Get variant metadata (for API responses)
 */
export function getVariantInfo(variantName: string): VariantConfig | null {
  return VARIANTS[variantName] || null;
}

/**
 * Get all available variants with their current models
 */
export function getAllVariants(): Array<VariantConfig & { currentModel: string | null }> {
  return Object.values(VARIANTS).map(variant => {
    let currentModel: string | null = null;

    if (variant.name === "auto") {
      currentModel = "varies"; // Dynamic routing
    } else if (variant.tier) {
      const providers = getProvidersByTier(variant.tier);
      currentModel = providers[0]?.name || null;
    }

    return {
      ...variant,
      currentModel,
    };
  });
}

/**
 * Check if a string is a valid variant name
 */
export function isVariant(name: string): boolean {
  return name in VARIANTS;
}

/**
 * Get the tier for a variant
 */
export function getVariantTier(variantName: string): ProviderConfig["tier"] | null {
  return VARIANTS[variantName]?.tier || null;
}

/**
 * Get fallback chain for a variant (for error messages)
 */
export function getVariantFallbackChain(variantName: string): string[] {
  const variant = VARIANTS[variantName];
  if (!variant) return [];

  const chain: string[] = [];

  // Add primary tier models
  if (variant.tier) {
    const primaryProviders = getProvidersByTier(variant.tier);
    chain.push(...primaryProviders.map(p => p.name));
  }

  // Add escalation tier models
  if (variant.escalationTier) {
    const escalationProviders = getProvidersByTier(variant.escalationTier);
    chain.push(...escalationProviders.map(p => p.name));
  }

  return chain;
}
