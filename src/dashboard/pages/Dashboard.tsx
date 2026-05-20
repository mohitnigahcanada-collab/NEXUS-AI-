import React, { useEffect, useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { ModelCard } from "../components/ModelCard";
import { PerformanceChart } from "../components/PerformanceChart";

interface DashboardPageProps {
  stats: any;
  liveData: any[];
}

export function DashboardPage({ stats, liveData }: DashboardPageProps) {
  const today = stats.today;
  const week = stats.week;
  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [modelOverride, setModelOverride] = useState("auto");
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [restartStatus, setRestartStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const baseUrl = `${window.location.origin}/v1`;

  useEffect(() => {
    const storedKey = window.localStorage.getItem("nexus_dashboard_api_key");
    if (storedKey) setApiKey(storedKey);

    fetch("/api/settings")
      .then((response) => response.json())
      .then((data: any) => setModelOverride(data.modelOverride || "auto"))
      .catch(() => {});
  }, []);

  const copyValue = async (label: string, value: string) => {
    await navigator.clipboard?.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1400);
  };

  const ensureApiKey = async () => {
    if (apiKey) {
      await copyValue("apiKey", apiKey);
      return;
    }

    const response = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Dashboard Quickstart" }),
    });
    const data = await response.json() as { key: string };
    window.localStorage.setItem("nexus_dashboard_api_key", data.key);
    setApiKey(data.key);
    await copyValue("apiKey", data.key);
  };

  const updateModelOverride = async (value: string) => {
    setModelOverride(value);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelOverride: value }),
    });
  };

  const handleRestart = async () => {
    setRestartStatus("loading");
    try {
      const response = await fetch("/api/restart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": localStorage.getItem("nexus_admin_token") || "",
        },
      });

      if (response.ok) {
        setRestartStatus("success");
        setTimeout(() => setRestartStatus("idle"), 3000);
        // Page will reload automatically after restart completes
        setTimeout(() => window.location.reload(), 5000);
      } else {
        setRestartStatus("error");
        setTimeout(() => setRestartStatus("idle"), 3000);
      }
    } catch (err) {
      setRestartStatus("error");
      setTimeout(() => setRestartStatus("idle"), 3000);
    }
    setShowRestartConfirm(false);
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-hero">
        <div className="hero-orb hero-orb-primary" />
        <div className="hero-orb hero-orb-secondary" />
        <div className="hero-layout">
          <div className="hero-content">
            <p className="hero-eyebrow">Live Gateway</p>
            <h1>Intelligence Core</h1>
            <p className="hero-copy">
              System performance, provider health, costs, and routing status in one place.
            </p>
            <div className="hero-badges">
              <span>{liveData.length} live events</span>
              <span>Gateway online</span>
              <span>Router: {modelOverride === "auto" ? "Auto" : modelOverride.replace("nexus-", "Nexus ")}</span>
            </div>
          </div>

          <div className="quick-connect-card">
            <div className="quick-connect-header">
              <div>
                <p>OpenAI-compatible endpoint</p>
                <h2>Quick Connect</h2>
              </div>
              <span>{copied ? "Copied" : "Ready"}</span>
            </div>

            <div className="copy-row">
              <label>Base URL</label>
              <code>{baseUrl}</code>
              <button onClick={() => copyValue("baseUrl", baseUrl)}>Copy</button>
            </div>

            <div className="copy-row">
              <label>API Key</label>
              <code>{apiKey || "Click copy to create a local key"}</code>
              <button onClick={ensureApiKey}>{apiKey ? "Copy" : "Create"}</button>
            </div>

            <div className="router-row">
              <label>Router Mode</label>
              <select value={modelOverride} onChange={(event) => updateModelOverride(event.target.value)}>
                <option value="auto">Auto - best per task</option>
                <option value="nexus-flash">1 - Nexus Flash</option>
                <option value="nexus-air">2 - Nexus Air</option>
                <option value="nexus-deep">3 - Nexus Deep</option>
                <option value="nexus-code">4 - Nexus Code</option>
                <option value="nexus-core">5 - Nexus Core</option>
                <option value="nexus-lite">6 - Nexus Lite</option>
                <option value="nexus-pro">7 - Nexus Pro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Restart Button */}
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          {showRestartConfirm ? (
            <div className="restart-confirm">
              <p>Restart Nexus backend? This will briefly interrupt service.</p>
              <div className="restart-actions">
                <button onClick={() => setShowRestartConfirm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button onClick={handleRestart} className="restart-btn" disabled={restartStatus === "loading"}>
                  {restartStatus === "loading" ? "Restarting..." : "Yes, Restart"}
                </button>
              </div>
            </div>
          ) : (
            <button
              className="restart-button-main"
              onClick={() => setShowRestartConfirm(true)}
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                padding: "0.5rem 1.5rem",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Restart Service
            </button>
          )}
          {restartStatus === "success" && (
            <p style={{ color: "#10b981", marginTop: "0.5rem", fontSize: "0.875rem" }}>
              Restart initiated! Service will be back in 5-10 seconds.
            </p>
          )}
          {restartStatus === "error" && (
            <p style={{ color: "#ef4444", marginTop: "0.5rem", fontSize: "0.875rem" }}>
              Failed to restart. Check auth token or try again.
            </p>
          )}
        </div>
      </header>

      <section className="metrics-grid">
        <MetricCard
          label="Total Savings"
          value={`$${week.savings?.toFixed(2) || "0.00"}`}
          trend={`vs GPT-4o pricing this week`}
          trendUp={week.savings > 0}
        />
        <MetricCard
          label="System Uptime"
          value={`${today.uptime}%`}
          subtitle="All systems operational"
        />
        <MetricCard
          label="Requests Today"
          value={formatNumber(today.requests)}
          subtitle={`${today.avgLatency}ms avg latency`}
        />
      </section>

      <section className="dashboard-section">
        <PerformanceChart data={stats.history || []} activity={stats.activity || []} />
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p>Provider Fleet</p>
            <h2>Active Models</h2>
          </div>
          <span>{(stats.models || []).length} configured</span>
        </div>
        <div className="models-grid">
          {(stats.models || []).map((model: any) => (
            <ModelCard
              key={model.id}
              name={model.id}
              description=""
              icon=""
              healthy={model.healthy}
              latency={model.benchmark?.latencyP50}
              category={model.category}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}
