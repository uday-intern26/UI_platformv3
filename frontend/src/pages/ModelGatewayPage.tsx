import { listGatewayRoutes } from '../api/modelsClient';
import { mockGatewayRoutes } from '../data/mockData';
import { useApiData } from '../hooks/useApiData';

export function ModelGatewayPage() {
  const { data: routes, loading } = useApiData(listGatewayRoutes, mockGatewayRoutes);

  return (
    <div className="animate-in">
      <h1 className="page-title">Model Gateway</h1>
      <p className="page-subtitle">Route and load-balance model requests</p>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Route</th>
              <th>Model ID</th>
              <th>Priority</th>
              <th>RPM Limit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {routes?.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.modelId}</td>
                <td>{r.priority}</td>
                <td>{r.requestsPerMinute.toLocaleString()}</td>
                <td>
                  <span className={`status-badge status-${r.status}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
