// Nexus AI - Circuit Breaker + Failover
// If a provider fails 3x in 5 min, skip it and failover

interface CircuitState {
  failures: number;
  lastFailure: number;
  open: boolean; // true = broken, skip this provider
}

const circuits: Map<string, CircuitState> = new Map();
const FAILURE_THRESHOLD = 3;
const RECOVERY_TIME = 5 * 60 * 1000; // 5 minutes

export function isProviderHealthy(providerName: string): boolean {
  const state = circuits.get(providerName);
  if (!state) return true;

  if (state.open) {
    // Check if recovery time has passed
    if (Date.now() - state.lastFailure > RECOVERY_TIME) {
      state.open = false;
      state.failures = 0;
      return true;
    }
    return false;
  }

  return true;
}

export function recordFailure(providerName: string): void {
  const state = circuits.get(providerName) || { failures: 0, lastFailure: 0, open: false };
  state.failures++;
  state.lastFailure = Date.now();

  if (state.failures >= FAILURE_THRESHOLD) {
    state.open = true;
  }

  circuits.set(providerName, state);
}

export function recordSuccess(providerName: string): void {
  circuits.set(providerName, { failures: 0, lastFailure: 0, open: false });
}

export function getCircuitStatus(): Record<string, { healthy: boolean; failures: number }> {
  const status: Record<string, { healthy: boolean; failures: number }> = {};
  for (const [name, state] of circuits.entries()) {
    status[name] = { healthy: !state.open, failures: state.failures };
  }
  return status;
}
