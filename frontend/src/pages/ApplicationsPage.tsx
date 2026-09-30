import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listApplications } from '../api/applicationsClient';
import { mockApplications } from '../data/mockData';
import { useApiData } from '../hooks/useApiData';
import './StudioPages.css';

const EXTRA_APPS = [
  {
    id: 'app-3',
    name: 'Sales Prediction',
    description: 'Forecast jewelry demand by SKU and region',
    businessDomain: 'Analytics',
    owner: 'Data Team',
    environment: 'staging',
    version: '0.9.1',
    status: 'draft' as const,
    updatedAt: '2026-09-08T09:00:00Z',
  },
  {
    id: 'app-4',
    name: 'Background Removal Utility',
    description: 'Batch jewelry image cleanup pipeline',
    businessDomain: 'Utility',
    owner: 'Platform Team',
    environment: 'production',
    version: '1.4.0',
    status: 'published' as const,
    updatedAt: '2026-08-28T16:00:00Z',
  },
  {
    id: 'app-5',
    name: 'Kiosk Orchestrator',
    description: 'In-store try-on kiosk control plane',
    businessDomain: 'Retail',
    owner: 'Ops Team',
    environment: 'production',
    version: '3.0.2',
    status: 'published' as const,
    updatedAt: '2026-09-10T11:20:00Z',
  },
];

export function ApplicationsPage() {
  const { data: applications, loading, error } = useApiData(listApplications, mockApplications);
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('all');
  const [status, setStatus] = useState('all');

  const rows = useMemo(() => {
    const base = [...(applications ?? []), ...EXTRA_APPS.filter((e) => !(applications ?? []).some((a) => a.id === e.id))];
    return base.filter((app) => {
      const q = search.toLowerCase();
      const matchQ =
        !q ||
        app.name.toLowerCase().includes(q) ||
        app.owner.toLowerCase().includes(q) ||
        app.businessDomain.toLowerCase().includes(q);
      const matchD = domain === 'all' || app.businessDomain === domain;
      const matchS =
        status === 'all' ||
        (status === 'production' && app.environment === 'production') ||
        (status === 'staging' && app.environment === 'staging') ||
        (status === 'development' && app.environment === 'development') ||
        app.status === status;
      return matchQ && matchD && matchS;
    });
  }, [applications, search, domain, status]);

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">AIJewel Applications</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Central inventory of AI applications across retail, analytics, and utilities
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/applications/builder" className="btn btn-primary">
            + Build Application
          </Link>
          <Link to="/workflows" className="btn btn-secondary">
            Create Workflow
          </Link>
        </div>
      </div>

      {error && (
        <p className="inline-warn">Using cached data — API unavailable: {error}</p>
      )}

      <div className="filter-bar">
        <input
          className="form-input filter-search"
          placeholder="Search applications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-input" value={domain} onChange={(e) => setDomain(e.target.value)}>
          <option value="all">All Domains</option>
          <option value="Retail">Retail</option>
          <option value="Analytics">Analytics</option>
          <option value="Utility">Utility</option>
        </select>
        <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="development">Development</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="apps-layout">
        <div className="table-wrap">
          {loading ? (
            <p style={{ padding: '1.25rem' }}>Loading applications...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application Name</th>
                  <th>Domain</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <Link to="/applications/builder">{app.name}</Link>
                      <div className="cell-sub">{app.description}</div>
                    </td>
                    <td>
                      <span className="chip">{app.businessDomain}</span>
                    </td>
                    <td>{app.version}</td>
                    <td>
                      <span className={`status-badge status-${app.environment}`}>{app.environment}</span>{' '}
                      <span className={`status-badge status-${app.status}`}>{app.status}</span>
                    </td>
                    <td>{app.owner}</td>
                    <td>
                      <Link to="/applications/builder" className="btn btn-sm btn-ghost">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <aside className="card card-pad apps-side">
          <h3 className="card-title">Quick Actions</h3>
          <div className="quick-stack">
            <Link to="/applications/builder" className="btn btn-primary">
              Build Application
            </Link>
            <Link to="/workflows" className="btn btn-secondary">
              Create Workflow
            </Link>
            <Link to="/prompt-registry" className="btn btn-secondary">
              Browse Prompts
            </Link>
            <Link to="/model-registry" className="btn btn-secondary">
              Browse Models
            </Link>
          </div>
          <h3 className="card-title" style={{ marginTop: '1.5rem' }}>
            Recent Applications
          </h3>
          <ul className="activity-list">
            {rows.slice(0, 4).map((app) => (
              <li key={app.id} className="activity-item">
                <i className="activity-dot" />
                <div>
                  <div>{app.name}</div>
                  <div className="activity-meta">
                    {app.environment} · v{app.version}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
