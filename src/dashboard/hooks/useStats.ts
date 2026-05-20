import { useState, useEffect, useCallback } from "react";

interface Stats {
  today: {
    requests: number;
    successful: number;
    tokens: number;
    cost: number;
    avgLatency: number;
    savings: number;
    budgetUsed: number;
    budgetTotal: number;
    budgetPercent: number;
    uptime: number;
  };
  week: {
    requests: number;
    tokens: number;
    cost: number;
    savings: number;
  };
  providers: Record<string, { healthy: boolean; failures: number }>;
  models?: Array<{
    id: string;
    category: string;
    tier: number;
    costPer1kTokens: number;
    healthy: boolean;
    failures: number;
    hasKey: boolean;
    benchmark: any;
  }>;
  history?: Array<{ day: string; requests: number; tokens: number; cost: number; avg_latency: number }>;
  activity?: Array<{
    model: string;
    tokens: number;
    cost: number;
    latency: number;
    timestamp: number;
    success: boolean;
  }>;
}

const DEFAULT_STATS: Stats = {
  today: { requests: 0, successful: 0, tokens: 0, cost: 0, avgLatency: 0, savings: 0, budgetUsed: 0, budgetTotal: 50, budgetPercent: 0, uptime: 100 },
  week: { requests: 0, tokens: 0, cost: 0, savings: 0 },
  providers: {},
};

async function fetchJSON(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [statsData, modelsData, historyData, activityData] = await Promise.all([
        fetchJSON("/api/stats"),
        fetchJSON("/api/models"),
        fetchJSON("/api/stats/history?days=7"),
        fetchJSON("/api/activity?limit=30"),
      ]);

      setStats({
        ...(statsData as any),
        models: (modelsData as any).models,
        history: (historyData as any).daily,
        activity: (activityData as any).logs,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [refresh]);

  return { stats, loading, refresh };
}
