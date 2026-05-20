// Nexus AI - Stats Tracker (in-memory + SQLite persistence + event emission)

import { recordRequest, queries, getSetting, setSetting } from "./db";
import { events } from "./events";
import { OPENAI_COST_PER_1K } from "./providers";

interface RequestLog {
  model: string;
  tokens: number;
  cost: number;
  latency: number;
  timestamp: number;
  success: boolean;
  routedFrom?: string;
}

class StatsTracker {
  private recentLogs: RequestLog[] = [];
  private dailySpend = 0;
  private dailyBudget = 50;
  private startOfDay = this.getStartOfDay();

  constructor() {
    // Load budget from DB
    const saved = getSetting("daily_budget", "50");
    this.dailyBudget = parseFloat(saved);

    // Calculate today's spend from DB
    const todayStart = this.getStartOfDay();
    const rows = queries.getRequestsSince.all(todayStart) as any[];
    this.dailySpend = rows.reduce((sum: number, r: any) => sum + (r.success ? r.cost : 0), 0);
  }

  private getStartOfDay(): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  }

  setBudget(daily: number) {
    this.dailyBudget = daily;
    setSetting("daily_budget", daily.toString());
  }

  getBudget(): number {
    return this.dailyBudget;
  }

  canSpend(): boolean {
    this.resetIfNewDay();
    return this.dailySpend < this.dailyBudget;
  }

  budgetRemaining(): number {
    this.resetIfNewDay();
    return this.dailyBudget - this.dailySpend;
  }

  budgetPercent(): number {
    return Math.round((this.dailySpend / this.dailyBudget) * 100);
  }

  private resetIfNewDay() {
    const today = this.getStartOfDay();
    if (today > this.startOfDay) {
      this.dailySpend = 0;
      this.startOfDay = today;
    }
  }

  record(log: RequestLog) {
    // In-memory for fast access
    this.recentLogs.push(log);
    if (this.recentLogs.length > 500) {
      this.recentLogs = this.recentLogs.slice(-250);
    }

    if (log.success) {
      this.dailySpend += log.cost;
    }

    // Persist to SQLite
    recordRequest({
      model: log.model,
      tokens: log.tokens,
      cost: log.cost,
      latency: log.latency,
      success: log.success,
      timestamp: log.timestamp,
      routedFrom: log.routedFrom,
    });

    // Emit event for WebSocket subscribers
    events.emit({
      type: log.success ? "request" : "error",
      timestamp: log.timestamp,
      data: {
        model: log.model,
        tokens: log.tokens,
        cost: log.cost,
        latency: log.latency,
        success: log.success,
      },
    });

    // Budget warning at 80%
    if (this.budgetPercent() >= 80 && this.budgetPercent() < 82) {
      events.emit({
        type: "budget_warning",
        timestamp: Date.now(),
        data: { percent: this.budgetPercent(), remaining: this.budgetRemaining() },
      });
    }
  }

  getTodayStats() {
    this.resetIfNewDay();
    const todayStart = this.startOfDay;
    const rows = queries.getRequestsSince.all(todayStart) as any[];

    const totalRequests = rows.length;
    const successfulRequests = rows.filter((r: any) => r.success).length;
    const totalTokens = rows.reduce((sum: number, r: any) => sum + r.tokens, 0);
    const totalCost = rows.reduce((sum: number, r: any) => sum + r.cost, 0);
    const avgLatency =
      totalRequests > 0
        ? Math.round(rows.reduce((sum: number, r: any) => sum + r.latency, 0) / totalRequests)
        : 0;

    const openaiEquivalentCost = (totalTokens / 1000) * OPENAI_COST_PER_1K;
    const savings = openaiEquivalentCost - totalCost;

    return {
      requests: totalRequests,
      successful: successfulRequests,
      tokens: totalTokens,
      cost: totalCost,
      avgLatency,
      savings: Math.max(0, savings),
      budgetUsed: this.dailySpend,
      budgetTotal: this.dailyBudget,
      budgetPercent: this.budgetPercent(),
      uptime: totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 100,
    };
  }

  getWeekStats() {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const rows = queries.getRequestsSince.all(weekAgo) as any[];
    const totalTokens = rows.reduce((sum: number, r: any) => sum + r.tokens, 0);
    const totalCost = rows.reduce((sum: number, r: any) => sum + r.cost, 0);
    const openaiEquivalentCost = (totalTokens / 1000) * OPENAI_COST_PER_1K;
    return {
      requests: rows.length,
      tokens: totalTokens,
      cost: totalCost,
      savings: Math.max(0, openaiEquivalentCost - totalCost),
    };
  }

  getModelStats(since: number) {
    return queries.getRequestStats.all(since) as any[];
  }

  getDailyStats(since: number) {
    return queries.getDailyStats.all(since) as any[];
  }

  getRecentLogs(n = 20): RequestLog[] {
    return this.recentLogs.slice(-n);
  }
}

export const stats = new StatsTracker();
