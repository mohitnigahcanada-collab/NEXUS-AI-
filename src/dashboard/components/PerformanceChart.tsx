import React from "react";

interface PerformanceChartProps {
  data: Array<{ day: string; requests: number; cost: number; avg_latency: number }>;
  activity?: Array<{ timestamp: number; success: boolean; model: string; latency: number }>;
}

export function PerformanceChart({ data, activity = [] }: PerformanceChartProps) {
  const dailySeries = data
    ?.filter((item) => item.requests > 0)
    .map((item) => ({ label: new Date(item.day).toLocaleDateString("en", { weekday: "short" }), value: item.requests })) ?? [];
  const liveSeries = buildLiveSeries(activity);
  const series = dailySeries.length >= 2 ? dailySeries : liveSeries;

  if (series.length === 0) {
    return (
      <div className="chart-card animate-fade-in">
        <div className="chart-header">
          <div>
            <h2>Performance</h2>
            <p>Live request volume from real traffic</p>
          </div>
          <span>Live</span>
        </div>
        <div className="chart-empty">
          No traffic yet. Send a chat request to draw the performance chart.
        </div>
      </div>
    );
  }

  const maxRequests = Math.max(...series.map((item) => item.value), 1);
  const points = series.map((item, i) => {
    const x = (i / Math.max(series.length - 1, 1)) * 100;
    const y = 88 - (item.value / maxRequests) * 72;
    return { x, y };
  });

  const linePath = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ");
  const areaPath = `${linePath} L100,100 L0,100 Z`;

  return (
    <div className="chart-card animate-fade-in">
      <div className="chart-header">
        <div>
          <h2>Performance</h2>
          <p>{dailySeries.length >= 2 ? "Daily request volume" : "Live request volume from recent traffic"}</p>
        </div>
        <div className="chart-ranges">
          <button className={dailySeries.length < 2 ? "active" : ""}>Live</button>
          <button className={dailySeries.length >= 2 ? "active" : ""}>7D</button>
        </div>
      </div>

      <div className="chart-plot">
        <div className="chart-grid">
          <div />
          <div />
          <div />
          <div />
        </div>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0058bc" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#0058bc" stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#blueGradient)" />
          <path className="chart-line" d={linePath} fill="none" stroke="#1e40af" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          {points.map((point, index) => (
            <circle key={`${point.x}-${index}`} cx={point.x} cy={point.y} r="1.4" fill="#1e40af" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>

        <div className="chart-labels">
          {series.map((item) => (
            <span key={item.label}>{item.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function buildLiveSeries(activity: Array<{ timestamp: number; success: boolean }>) {
  const recent = activity
    .filter((item) => item.success)
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-24);

  if (recent.length < 2) return [];

  const bucketCount = Math.min(8, Math.max(4, recent.length));
  const buckets = Array.from({ length: bucketCount }, (_, index) => ({ label: `${index + 1}`, value: 0 }));

  recent.forEach((_, index) => {
    const bucketIndex = Math.min(bucketCount - 1, Math.floor((index / recent.length) * bucketCount));
    const bucket = buckets[bucketIndex];
    if (bucket) bucket.value += 1;
  });

  return buckets.map((bucket, index) => ({ ...bucket, label: index === bucketCount - 1 ? "Now" : `-${bucketCount - index - 1}` }));
}
