import React, { useEffect, useState } from "react";

interface SettingsPageProps {
  onSave: () => void;
}

export function SettingsPage({ onSave }: SettingsPageProps) {
  const [settings, setSettings] = useState({ dailyBudget: 50, port: 4000, version: "1.0.0", modelOverride: "auto" });
  const [budget, setBudget] = useState("50");
  const [modelOverride, setModelOverride] = useState("auto");
  const [saved, setSaved] = useState(false);
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/settings")
      .then((response) => response.json())
      .then((data: any) => {
        setSettings(data);
        setBudget(data.dailyBudget.toString());
        setModelOverride(data.modelOverride || "auto");
      });

    fetch("/api/benchmark")
      .then((response) => response.json())
      .then((data: any) => setBenchmarks(data.benchmarks || []));
  }, []);

  const saveBudget = async () => {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dailyBudget: parseFloat(budget) }),
    });
    setSaved(true);
    onSave();
    setTimeout(() => setSaved(false), 1600);
  };

  const saveModelOverride = async (value: string) => {
    setModelOverride(value);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelOverride: value }),
    });
    onSave();
  };

  const runBenchmark = async () => {
    setBenchmarking(true);
    try {
      const res = await fetch("/api/benchmark/run", { method: "POST" });
      const data = (await res.json()) as any;
      setBenchmarks(data.benchmarks || []);
    } finally {
      setBenchmarking(false);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="page-header-card">
        <p>Gateway Control</p>
        <h1>Settings</h1>
        <span>Configure routing, budget, benchmarks, and runtime info.</span>
      </header>

      <section className="settings-grid">
        <div className="data-card animate-fade-in">
          <div className="card-heading">
            <div>
              <p>Spend Guard</p>
              <h2>Daily Budget</h2>
            </div>
          </div>
          <p className="helper-text">Set a daily spending cap. When reached, requests are rejected until tomorrow.</p>
          <div className="form-row compact">
            <span className="currency-prefix">$</span>
            <input
              type="number"
              value={budget}
              onChange={(event) => setBudget(event.currentTarget.value)}
              min="0"
              step="1"
              className="field-input short"
            />
            <span className="helper-inline">per day</span>
            <button onClick={saveBudget} className="primary-button">{saved ? "Saved" : "Save"}</button>
          </div>
        </div>

        <div className="data-card animate-fade-in">
          <div className="card-heading">
            <div>
              <p>Routing Priority</p>
              <h2>Auto Router</h2>
            </div>
            <span>{modelOverride === "auto" ? "Smart" : "Forced"}</span>
          </div>
          <p className="helper-text">Keep auto for best model per task, or force a provider while testing.</p>
          <select className="field-input" value={modelOverride} onChange={(event) => saveModelOverride(event.currentTarget.value)}>
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
      </section>

      <section className="data-card animate-fade-in">
        <div className="card-heading">
          <div>
            <p>Provider Test</p>
            <h2>Benchmark</h2>
          </div>
          <button onClick={runBenchmark} disabled={benchmarking} className="primary-button">
            {benchmarking ? "Running..." : "Run Benchmark"}
          </button>
        </div>

        {benchmarks.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>P50 Latency</th>
                  <th>P95 Latency</th>
                  <th>Tokens/s</th>
                  <th>Success</th>
                </tr>
              </thead>
              <tbody>
                {benchmarks.map((benchmark: any) => (
                  <tr key={benchmark.model}>
                    <td>{benchmark.model.replace("nexus-", "Nexus ")}</td>
                    <td className="mono-cell">{benchmark.latencyP50}ms</td>
                    <td className="mono-cell">{benchmark.latencyP95}ms</td>
                    <td className="mono-cell">{benchmark.tokensPerSecond}</td>
                    <td className={benchmark.successRate >= 80 ? "success-text" : "danger-text"}>{benchmark.successRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">No benchmark data. Run a benchmark to test all providers.</p>
        )}
      </section>

      <section className="data-card animate-fade-in">
        <div className="card-heading">
          <div>
            <p>Runtime</p>
            <h2>System Info</h2>
          </div>
        </div>
        <div className="info-grid">
          <div><span>Version</span><strong>{settings.version}</strong></div>
          <div><span>Port</span><strong>{settings.port}</strong></div>
          <div><span>Runtime</span><strong>Bun</strong></div>
          <div><span>Framework</span><strong>Hono</strong></div>
        </div>

        <div className="endpoint-reference">
          <h3>API Endpoints</h3>
          <pre className="code-block">
{`POST /v1/chat/completions   OpenAI-compatible chat
GET  /v1/models             List available models
GET  /api/stats             Dashboard stats
GET  /api/models            Model health & benchmarks
PUT  /api/settings          Budget + router mode
WS   /ws                    Live event stream`}
          </pre>
        </div>
      </section>
    </div>
  );
}
