import { listModels } from '../api/modelsClient';
import { mockModels } from '../data/mockData';
import { useApiData } from '../hooks/useApiData';

export function ModelsPage() {
  const { data: models, loading, error } = useApiData(listModels, mockModels);

  return (
    <div className="animate-in">
      <h1 className="page-title">Models</h1>
      <p className="page-subtitle">Manage LLM and AI model deployments</p>
      {error && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-warning)', marginBottom: '1rem' }}>
          Using cached data — {error}
        </p>
      )}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Provider</th>
              <th>Version</th>
              <th>Capabilities</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {models?.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.provider}</td>
                <td>{m.version}</td>
                <td>{m.capabilities.join(', ')}</td>
                <td>
                  <span className={`status-badge status-${m.status}`}>{m.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
