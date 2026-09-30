import { listPrompts } from '../api/promptsClient';
import { mockPrompts } from '../data/mockData';
import { useApiData } from '../hooks/useApiData';

export function PromptsPage() {
  const { data: prompts, loading } = useApiData(listPrompts, mockPrompts);

  return (
    <div className="animate-in">
      <h1 className="page-title">Prompts</h1>
      <p className="page-subtitle">Manage prompt templates for AI applications</p>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Version</th>
              <th>Tags</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {prompts?.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.description}</td>
                <td>{p.version}</td>
                <td>{p.tags.join(', ')}</td>
                <td>
                  <span className={`status-badge status-${p.status}`}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
