import React from "react";

interface ActivityLogProps {
  logs: Array<{
    model: string;
    tokens: number;
    cost: number;
    latency: number;
    timestamp: number;
    success: boolean;
  }>;
}

export function ActivityLog({ logs }: ActivityLogProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="data-card animate-fade-in">
        <div className="card-heading">
          <div>
            <p>Live Feed</p>
            <h2>Recent Activity</h2>
          </div>
        </div>
        <p className="empty-state">No requests yet.</p>
      </div>
    );
  }

  return (
    <div className="data-card animate-fade-in">
      <div className="card-heading">
        <div>
          <p>Live Feed</p>
          <h2>Recent Activity</h2>
        </div>
        <span>{logs.length} events</span>
      </div>
      <div className="activity-list">
        {logs.map((log, i) => (
          <div
            key={`${log.timestamp}-${i}`}
            className="activity-row"
          >
            <div className="activity-model">
              <span className={log.success ? "status-dot status-ok" : "status-dot status-down"}></span>
              <span>
                {log.model.replace("nexus-", "")}
              </span>
            </div>
            <div className="activity-meta">
              <span>{log.tokens} tok</span>
              <span>{log.latency}ms</span>
              <span>${log.cost.toFixed(4)}</span>
              <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
