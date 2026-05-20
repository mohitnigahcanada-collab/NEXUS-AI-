// Nexus AI - Advanced Circuit Breaker with Exponential Backoff & Health Checks
// Industry-grade implementation: Netflix Hystrix + AWS patterns

interface CircuitState {
  failures: number;
  consecutiveFailures: number;
  lastFailure: number;
  lastSuccess: number;
  open: boolean;
  halfOpen: boolean;
  totalRequests: number;
  successfulRequests: number;
  failureHistory: Array<{ timestamp: number; error: string }>;
  backoffUntil: number; // Exponential backoff timestamp
}

interface HealthCheckResult {
  healthy: boolean;
  latency: number;
  error?: string;
}

const circuits: Map<string, CircuitState> = new Map();

// Configuration
const FAILURE_THRESHOLD = 5; // Open circuit after 5 consecutive failures
const SUCCESS_THRESHOLD = 2; // Close circuit after 2 consecutive successes in half-open state
const BASE_RECOVERY_TIME = 30 * 1000; // 30 seconds base
const MAX_RECOVERY_TIME = 10 * 60 * 1000; // 10 minutes max
const HEALTH_CHECK_INTERVAL = 60 * 1000; // Check every 60 seconds
const FAILURE_RATE_THRESHOLD = 0.5; // Open if >50% requests fail
const MIN_REQUEST_THRESHOLD = 10; // Need 10 requests before calculating failure rate

// Health check cache
const healthCheckCache = new Map<string, { result: HealthCheckResult; timestamp: number }>();

/**
 * Calculate exponential backoff time based on consecutive failures
 */
function calculateBackoffTime(consecutiveFailures: number): number {
  const backoff = Math.min(
    BASE_RECOVERY_TIME * Math.pow(2, consecutiveFailures - 1),
    MAX_RECOVERY_TIME
  );
  return Date.now() + backoff;
}

/**
 * Get or initialize circuit state
 */
function getCircuitState(providerName: string): CircuitState {
  if (!circuits.has(providerName)) {
    circuits.set(providerName, {
      failures: 0,
      consecutiveFailures: 0,
      lastFailure: 0,
      lastSuccess: Date.now(),
      open: false,
      halfOpen: false,
      totalRequests: 0,
      successfulRequests: 0,
      failureHistory: [],
      backoffUntil: 0,
    });
  }
  return circuits.get(providerName)!;
}

/**
 * Check if provider is healthy (with circuit breaker logic)
 */
export function isProviderHealthy(providerName: string): boolean {
  const state = getCircuitState(providerName);
  const now = Date.now();

  // If circuit is open, check if backoff period has passed
  if (state.open) {
    if (now >= state.backoffUntil) {
      // Enter half-open state (allow test request)
      state.halfOpen = true;
      state.open = false;
      console.log(`[CircuitBreaker] ${providerName} entering half-open state (testing recovery)`);
      return true;
    }
    return false;
  }

  // Check failure rate (statistical circuit breaker)
  if (state.totalRequests >= MIN_REQUEST_THRESHOLD) {
    const failureRate = (state.totalRequests - state.successfulRequests) / state.totalRequests;
    if (failureRate > FAILURE_RATE_THRESHOLD) {
      state.open = true;
      state.backoffUntil = calculateBackoffTime(state.consecutiveFailures);
      console.warn(`[CircuitBreaker] ${providerName} opened due to high failure rate: ${(failureRate * 100).toFixed(1)}%`);
      return false;
    }
  }

  return true;
}

/**
 * Record a failure with exponential backoff
 */
export function recordFailure(providerName: string, error?: string, isHealthCheck: boolean = false): void {
  const state = getCircuitState(providerName);
  const now = Date.now();

  // ⚡ Don't count health check failures in circuit metrics
  if (isHealthCheck) {
    console.log(`[CircuitBreaker] Health check failed for ${providerName}: ${error} (not counting as failure)`);
    return;
  }

  state.failures++;
  state.consecutiveFailures++;
  state.lastFailure = now;
  state.totalRequests++;

  // Add to failure history (keep last 100)
  state.failureHistory.push({ timestamp: now, error: error || "unknown" });
  if (state.failureHistory.length > 100) {
    state.failureHistory.shift();
  }

  // If in half-open state, immediately re-open circuit
  if (state.halfOpen) {
    state.halfOpen = false;
    state.open = true;
    state.backoffUntil = calculateBackoffTime(state.consecutiveFailures);
    console.warn(`[CircuitBreaker] ${providerName} re-opened after failed test (backoff: ${Math.round((state.backoffUntil - now) / 1000)}s)`);
    return;
  }

  // Open circuit if threshold exceeded
  if (state.consecutiveFailures >= FAILURE_THRESHOLD) {
    state.open = true;
    state.backoffUntil = calculateBackoffTime(state.consecutiveFailures);
    console.warn(`[CircuitBreaker] ${providerName} circuit opened (${state.consecutiveFailures} consecutive failures, backoff: ${Math.round((state.backoffUntil - now) / 1000)}s)`);
  }
}

/**
 * Record a success and potentially close circuit
 */
export function recordSuccess(providerName: string, latency: number): void {
  const state = getCircuitState(providerName);
  
  state.successfulRequests++;
  state.totalRequests++;
  state.lastSuccess = Date.now();

  // If in half-open state, track consecutive successes
  if (state.halfOpen) {
    state.consecutiveFailures = 0; // Reset on first success
    
    // After SUCCESS_THRESHOLD successes in half-open, fully close circuit
    if (state.successfulRequests >= SUCCESS_THRESHOLD) {
      state.halfOpen = false;
      state.open = false;
      state.failures = 0;
      state.consecutiveFailures = 0;
      console.log(`[CircuitBreaker] ${providerName} circuit fully closed (recovery successful)`);
    }
  } else {
    // Normal operation - reset consecutive failures
    state.consecutiveFailures = 0;
  }

  // Reset failure rate window every 100 requests
  if (state.totalRequests >= 100) {
    state.totalRequests = Math.floor(state.totalRequests / 2);
    state.successfulRequests = Math.floor(state.successfulRequests / 2);
  }
}

/**
 * Perform health check on provider (lightweight test)
 */
export async function performHealthCheck(providerName: string, provider: any): Promise<HealthCheckResult> {
  try {
    const key = process.env[provider.keyEnv];
    if (!key) {
      return { healthy: false, latency: 0, error: "No API key" };
    }

    const start = Date.now();
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1,
      }),
      signal: AbortSignal.timeout(10000), // 10s timeout for health checks
    });

    const latency = Date.now() - start;

    if (response.ok) {
      return { healthy: true, latency };
    } else {
      return { healthy: false, latency, error: `HTTP ${response.status}` };
    }
  } catch (err: any) {
    return { healthy: false, latency: 0, error: err.message };
  }
}

/**
 * Get circuit status for all providers
 */
export function getCircuitStatus(): Record<string, { 
  healthy: boolean; 
  failures: number;
  consecutiveFailures: number;
  state: "closed" | "open" | "half-open";
  backoffSeconds?: number;
  failureRate?: number;
}> {
  const status: Record<string, any> = {};
  const now = Date.now();

  for (const [name, state] of circuits.entries()) {
    const failureRate = state.totalRequests > 0 
      ? (state.totalRequests - state.successfulRequests) / state.totalRequests 
      : 0;

    status[name] = {
      healthy: !state.open,
      failures: state.failures,
      consecutiveFailures: state.consecutiveFailures,
      state: state.open ? "open" : state.halfOpen ? "half-open" : "closed",
      failureRate: Math.round(failureRate * 100) / 100,
    };

    if (state.open && state.backoffUntil > now) {
      status[name].backoffSeconds = Math.round((state.backoffUntil - now) / 1000);
    }
  }

  return status;
}

/**
 * Get recent failure history for debugging
 */
export function getFailureHistory(providerName: string): Array<{ timestamp: number; error: string }> {
  const state = circuits.get(providerName);
  return state?.failureHistory || [];
}

/**
 * Manually reset circuit (for admin overrides)
 */
export function resetCircuit(providerName: string): void {
  circuits.delete(providerName);
  console.log(`[CircuitBreaker] ${providerName} circuit manually reset`);
}
