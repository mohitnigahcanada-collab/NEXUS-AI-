import React, { useEffect, useState, useCallback } from "react";

interface LogEntry {
  source: "info" | "error" | "system";
  line: string;
}

export function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<"all" | "info" | "error">("all");

  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch("/api/logs?lines=200");
      const data = await response.json();
      setLogs(data.entries);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const filteredLogs = filter === "all" ? logs : logs.filter(l => l.source === filter);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll) {
      const container = document.getElementById("log-container");
      if (container) container.scrollTop = container.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  return (
    <div className="logs-page">
      <div className="page-header">
        <div>
          <p>System Administration</p>
          <h1>Live Logs</h1>
        </div>
        <div className="header-actions">
          <div className="filter-group">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >All</button>
            <button
              className={filter === "info" ? "active" : ""}
              onClick={() => setFilter("info")}
            >Info</button>
            <button
              className={filter === "error" ? "active" : ""}
              onClick={() => setFilter("error")}
            >Errors</button>
          </div>
          <label className="autoscroll-toggle">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Auto-scroll
          </label>
        </div>
      </div>

      <div className="log-viewer" id="log-container">
        {filteredLogs.length === 0 ? (
          <div className="log-empty">No logs to display</div>
        ) : (
          <pre className="log-content">
            {filteredLogs.map((entry, idx) => (
              <div key={idx} className={`log-line log-${entry.source}`}>
                {entry.line}
              </div>
            ))}
          </pre>
        )}
      </div>
    </div>
  );
}
