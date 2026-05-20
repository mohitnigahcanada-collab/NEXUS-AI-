import React from "react";

interface ModelCardProps {
  name: string;
  description: string;
  icon: string;
  healthy: boolean;
  latency?: number;
  category: string;
}

const ICONS: Record<string, string> = {
  "nexus-flash": "M13 10V3L4 14h7v7l9-11h-7z",
  "nexus-air": "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
  "nexus-deep": "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  "nexus-pro": "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  "nexus-code": "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  "nexus-core": "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z",
  "nexus-lite": "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
};

const DESCRIPTIONS: Record<string, string> = {
  "nexus-flash": "Ultra-fast inference optimized for low-latency responses.",
  "nexus-air": "Balanced performance and quality for everyday tasks.",
  "nexus-deep": "Deep reasoning and analysis for complex problems.",
  "nexus-pro": "Premium quality model for critical reasoning tasks.",
  "nexus-code": "Specialized in code generation, review, and debugging.",
  "nexus-core": "Reliable general-purpose backup model.",
  "nexus-lite": "Zero-cost model for simple, fast tasks.",
};

export function ModelCard({ name, description, icon, healthy, latency, category }: ModelCardProps) {
  const iconPath = ICONS[name] || ICONS["nexus-core"];
  const desc = DESCRIPTIONS[name] || description;

  return (
    <div className="model-card animate-fade-in">
      <div className="model-icon">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </div>

      <h3>
        {name.replace("nexus-", "Nexus ")}
      </h3>

      <p>{desc}</p>

      <div className="model-footer">
        <div className="model-status">
          <span className={healthy ? "status-dot status-ok" : "status-dot status-down"}></span>
          <span>{healthy ? "Healthy" : "Down"}</span>
        </div>
        {latency !== undefined && latency > 0 && (
          <span className="model-latency">{latency}ms</span>
        )}
      </div>
    </div>
  );
}
