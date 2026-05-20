// Nexus AI - Health Monitoring & Self-Healing System
// Proactive health checks, automatic recovery, alerting

import { getAllProviders, getProvider } from "./providers";
import { performHealthCheck, getCircuitStatus, resetCircuit } from "./circuit-breaker";

interface HealthReport {
  timestamp: number;
  overallHealth: "healthy" | "degraded" | "critical";
  totalProviders: number;
  healthyProviders: number;
  unhealthyProviders: number;
  providers: Record<string, {
    healthy: boolean;
    lastCheck: number;
    latency?: number;
    error?: string;
    circuitState?: string;
  }>;
}

class HealthMonitor {
  private healthCache: Map<string, { healthy: boolean; lastCheck: number; latency?: number; error?: string }> = new Map();
  private checkInterval: Timer | null = null;
  private HEALTH_CHECK_INTERVAL = 10 * 60 * 1000; // ⚡ Increased from 60s to 10 min - reduces CPU spam
  private DEGRADED_THRESHOLD = 0.7; // <70% healthy = degraded
  private CRITICAL_THRESHOLD = 0.5; // <50% healthy = critical

  start() {
    console.log("[HealthMonitor] Starting background health checks...");
    
    // Run initial check immediately
    this.runHealthChecks();

    // Schedule periodic checks
    this.checkInterval = setInterval(() => {
      this.runHealthChecks();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log("[HealthMonitor] Stopped");
    }
  }

  private async runHealthChecks() {
    const providers = getAllProviders();
    console.log(`[HealthMonitor] Running health checks on ${providers.length} providers...`);

    const checks = providers.map(async (providerConfig) => {
      // ⚡ Skip providers without API keys (don't count as failures)
      if (!process.env[providerConfig.keyEnv]) {
        this.healthCache.set(providerConfig.name, {
          healthy: true, // Treat as healthy but not tested
          lastCheck: Date.now(),
          error: "No API key configured",
        });
        return { healthy: true, latency: 0, error: "No API key" };
      }

      try {
        const result = await performHealthCheck(providerConfig.name, providerConfig);
        
        this.healthCache.set(providerConfig.name, {
          healthy: result.healthy,
          lastCheck: Date.now(),
          latency: result.latency,
          error: result.error,
        });

        if (!result.healthy) {
          console.warn(`[HealthMonitor] ⚠️  ${providerConfig.name} is unhealthy: ${result.error}`);
        }

        return result;
      } catch (err: any) {
        console.error(`[HealthMonitor] Health check failed for ${providerConfig.name}:`, err.message);
        
        this.healthCache.set(providerConfig.name, {
          healthy: false,
          lastCheck: Date.now(),
          error: err.message,
        });

        return { healthy: false, latency: 0, error: err.message };
      }
    });

    await Promise.allSettled(checks);

    // Analyze overall health
    const report = this.getHealthReport();
    this.analyzeHealth(report);
  }

  private analyzeHealth(report: HealthReport) {
    const healthPercentage = report.healthyProviders / report.totalProviders;

    if (report.overallHealth === "critical") {
      console.error(`[HealthMonitor] 🚨 CRITICAL: Only ${report.healthyProviders}/${report.totalProviders} providers healthy!`);
      this.attemptSelfHealing();
    } else if (report.overallHealth === "degraded") {
      console.warn(`[HealthMonitor] ⚠️  DEGRADED: ${report.healthyProviders}/${report.totalProviders} providers healthy`);
    } else {
      console.log(`[HealthMonitor] ✅ HEALTHY: ${report.healthyProviders}/${report.totalProviders} providers operational`);
    }
  }

  private attemptSelfHealing() {
    console.log("[HealthMonitor] 🔧 Attempting self-healing...");

    // Get circuit breaker states
    const circuits = getCircuitStatus();

    // Reset circuits for providers that have been down for >10 minutes
    const now = Date.now();
    const TEN_MINUTES = 10 * 60 * 1000;

    for (const [providerName, circuitState] of Object.entries(circuits)) {
      if (circuitState.state === "open") {
        const healthInfo = this.healthCache.get(providerName);
        
        if (healthInfo && healthInfo.lastCheck && (now - healthInfo.lastCheck > TEN_MINUTES)) {
          console.log(`[HealthMonitor] Resetting circuit for ${providerName} (been down >10min, giving it another chance)`);
          resetCircuit(providerName);
        }
      }
    }
  }

  getHealthReport(): HealthReport {
    const circuits = getCircuitStatus();
    const providers = getAllProviders();
    
    const report: HealthReport = {
      timestamp: Date.now(),
      overallHealth: "healthy",
      totalProviders: providers.length,
      healthyProviders: 0,
      unhealthyProviders: 0,
      providers: {},
    };

    for (const provider of providers) {
      const health = this.healthCache.get(provider.name);
      const circuit = circuits[provider.name];
      
      const isHealthy = health?.healthy !== false && circuit?.state !== "open";
      
      if (isHealthy) {
        report.healthyProviders++;
      } else {
        report.unhealthyProviders++;
      }

      report.providers[provider.name] = {
        healthy: isHealthy,
        lastCheck: health?.lastCheck || 0,
        latency: health?.latency,
        error: health?.error,
        circuitState: circuit?.state,
      };
    }

    // Determine overall health
    const healthPercentage = report.healthyProviders / report.totalProviders;
    
    if (healthPercentage < this.CRITICAL_THRESHOLD) {
      report.overallHealth = "critical";
    } else if (healthPercentage < this.DEGRADED_THRESHOLD) {
      report.overallHealth = "degraded";
    } else {
      report.overallHealth = "healthy";
    }

    return report;
  }

  getProviderHealth(providerName: string): { healthy: boolean; latency?: number; error?: string } | null {
    return this.healthCache.get(providerName) || null;
  }
}

// Singleton instance
export const healthMonitor = new HealthMonitor();
