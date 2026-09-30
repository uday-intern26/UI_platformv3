interface MetricCardProps {
  label: string;
  value: string;
  trend?: string;
  trendDir?: 'up' | 'down' | 'flat';
}

export function MetricCard({ label, value, trend, trendDir = 'up' }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {trend && <div className={`metric-trend ${trendDir}`}>{trend}</div>}
    </div>
  );
}
