import { listTraces } from '../api/llmOpsClient';
import { mockTraces } from '../data/mockData';
import { useApiData } from '../hooks/useApiData';

export function ObservabilityPage() {
  const { data: traces, loading } = useApiData(() => listTraces(50), mockTraces);

  return (
    <div className="animate-in">
      <h1 className="page-title">AI Observability</h1>
      <p className="page-subtitle">Distributed traces and span analysis</p>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Trace ID</th>
              <th>Span</th>
              <th>Duration</th>
              <th>Model</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {traces?.map((t) => (
              <tr key={t.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {t.traceId.slice(0, 12)}...
                </td>
                <td>{t.spanName}</td>
                <td>{t.durationMs}ms</td>
                <td>{t.modelId ?? '—'}</td>
                <td>
                  <span className={`status-badge status-${t.status}`}>{t.status}</span>
                </td>
                <td>{new Date(t.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
