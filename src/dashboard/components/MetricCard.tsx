import React from "react";

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
}

export function MetricCard({ label, value, subtitle, trend, trendUp }: MetricCardProps) {
  return (
    <div className="metric-card animate-fade-in">
      <div className="metric-main">
        <h3>{label}</h3>
        <p>{value}</p>
      </div>
      {(trend || subtitle) && (
        <div className={`metric-footnote ${trendUp ? "metric-positive" : ""}`}>
          {trendUp && (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          )}
          <span>{trend || subtitle}</span>
        </div>
      )}
    </div>
  );
}
