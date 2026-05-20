import React from "react";
import { ActivityLog } from "../components/ActivityLog";

interface AnalyticsPageProps {
  stats: any;
}

export function AnalyticsPage({ stats }: AnalyticsPageProps) {
  const today = stats.today;
  const modelStats = stats.models || [];

  return (
    <div className="dashboard-page">
      <header className="page-header-card">
        <p>Gateway Intelligence</p>
        <h1>Analytics</h1>
        <span>Request traffic, costs, and model performance breakdown.</span>
      </header>

      <section className="summary-grid four-columns">
        <SummaryCard label="Total Tokens" value={formatNumber(today.tokens)} />
        <SummaryCard label="Total Cost" value={`$${today.cost?.toFixed(4)}`} />
        <SummaryCard label="Avg Latency" value={`${today.avgLatency}ms`} />
        <div className="summary-card animate-fade-in">
          <p>Budget Used</p>
          <strong>{today.budgetPercent}%</strong>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(today.budgetPercent, 100)}%`,
                backgroundColor: today.budgetPercent > 80 ? "var(--danger)" : "var(--primary)",
              }}
            />
          </div>
        </div>
      </section>

      <section className="data-card animate-fade-in">
        <div className="card-heading">
          <div>
            <p>Live Fleet</p>
            <h2>Model Performance</h2>
          </div>
          <span>{modelStats.length} models</span>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Status</th>
                <th>Category</th>
                <th>Cost/1k</th>
                <th>Latency</th>
              </tr>
            </thead>
            <tbody>
              {modelStats.map((model: any) => (
                <tr key={model.id}>
                  <td>{model.id.replace("nexus-", "Nexus ")}</td>
                  <td>
                    <div className="model-status">
                      <span className={model.healthy ? "status-dot status-ok" : "status-dot status-down"} />
                      <span>{model.healthy ? "Healthy" : "Down"}</span>
                    </div>
                  </td>
                  <td><span className="pill">{model.category}</span></td>
                  <td className="mono-cell">${model.costPer1kTokens.toFixed(4)}</td>
                  <td className="mono-cell">{model.benchmark?.latencyP50 ? `${model.benchmark.latencyP50}ms` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ActivityLog logs={stats.activity || []} />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-card animate-fade-in">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}
