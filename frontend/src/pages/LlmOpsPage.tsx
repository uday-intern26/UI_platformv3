import { MetricCard } from '../components/ui/MetricCard';
import { BarChart, DonutChart, LineChart } from '../components/ui/Charts';
import { getLlmMetrics, getLlmOpsSummary } from '../api/llmOpsClient';
import { mockLlmMetrics, mockLlmSummary } from '../data/mockData';
import { useApiData } from '../hooks/useApiData';
import './LlmOpsPage.css';
import './StudioPages.css';

const REQUEST_SERIES = [
  {
    name: 'Requests',
    color: '#2563eb',
    values: [2100, 2400, 2800, 2600, 3100, 3400, 3200, 3800, 4100, 3900, 4300, 4500],
  },
  {
    name: 'Errors',
    color: '#dc2626',
    values: [40, 35, 48, 42, 55, 50, 38, 60, 52, 45, 40, 36],
  },
];

const TOKEN_GROUPS = [
  { label: '00', a: 420, b: 210 },
  { label: '04', a: 310, b: 160 },
  { label: '08', a: 680, b: 340 },
  { label: '12', a: 920, b: 460 },
  { label: '16', a: 860, b: 430 },
  { label: '20', a: 740, b: 370 },
];

const COST_SLICES = [
  { label: 'GPT-4o', value: 420, color: '#2563eb' },
  { label: 'Claude 3.5', value: 248, color: '#16a34a' },
  { label: 'Llama 3', value: 110, color: '#d97706' },
  { label: 'Other', value: 64, color: '#94a3b8' },
];

export function LlmOpsPage() {
  const { data: summary } = useApiData(getLlmOpsSummary, mockLlmSummary);
  const { data: metrics } = useApiData(() => getLlmMetrics('24h'), mockLlmMetrics);

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">LLM Operations</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Deep-dive analytics for requests, tokens, latency, errors, and cost
          </p>
        </div>
        <div className="page-header-actions">
          <select className="form-input" defaultValue="24h">
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      <div className="metrics-grid">
        <MetricCard
          label="Total Requests"
          value={(summary?.totalRequests ?? 48732).toLocaleString()}
          trend="+12% vs prior"
          trendDir="up"
        />
        <MetricCard
          label="Input Tokens"
          value={`${(((summary?.totalTokens ?? 12400000) * 0.62) / 1e6).toFixed(1)}M`}
        />
        <MetricCard
          label="Output Tokens"
          value={`${(((summary?.totalTokens ?? 12400000) * 0.38) / 1e6).toFixed(1)}M`}
        />
        <MetricCard
          label="Avg Latency"
          value={summary?.avgLatencyMs ? `${(summary.avgLatencyMs / 1000).toFixed(1)}s` : '1.2s'}
          trend="−80ms"
          trendDir="down"
        />
        <MetricCard
          label="Error Rate"
          value={`${((summary?.errorRate ?? 0.008) * 100).toFixed(1)}%`}
          trend="Within SLO"
          trendDir="flat"
        />
        <MetricCard
          label="Total Cost"
          value={`$${(summary?.totalCostUsd ?? 842).toFixed(0)}`}
          trend="−4% vs prior"
          trendDir="down"
        />
      </div>

      <div className="llm-ops-charts">
        <div className="card card-pad">
          <h3 className="card-title">Requests Over Time</h3>
          <LineChart series={REQUEST_SERIES} />
        </div>
        <div className="card card-pad">
          <h3 className="card-title">Token Usage</h3>
          <BarChart groups={TOKEN_GROUPS} />
        </div>
        <div className="card card-pad">
          <h3 className="card-title">Cost by Model</h3>
          <DonutChart slices={COST_SLICES} />
        </div>
      </div>

      <div className="card card-pad">
        <h3 className="card-title">Hourly Latency & Cost</h3>
        <div className="table-wrap" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Hour</th>
                <th>Requests</th>
                <th>P50</th>
                <th>P99</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {(metrics ?? mockLlmMetrics).slice(-8).map((m) => (
                <tr key={m.timestamp}>
                  <td>{new Date(m.timestamp).toLocaleTimeString()}</td>
                  <td>{m.requests.toLocaleString()}</td>
                  <td>{m.latencyP50}ms</td>
                  <td>{m.latencyP99}ms</td>
                  <td>${m.costUsd.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
