import { useState } from 'react';
import { listPolicies } from '../api/governanceClient';
import { mockPolicies } from '../data/mockData';
import { useApiData } from '../hooks/useApiData';
import './StudioPages.css';

const SECURITY = [
  { name: 'RBAC', status: 'Enabled' },
  { name: 'Encryption', status: 'Enabled' },
  { name: 'PII Detection', status: 'Enabled' },
  { name: 'Audit Logging', status: 'Enabled' },
];

const AUDIT = [
  { actor: 'Shalini Hariharan', action: 'Activated Production Model Policy', time: '10:42 AM' },
  { actor: 'Platform Bot', action: 'Rotated API key · model-gateway', time: '09:15 AM' },
  { actor: 'Ops Team', action: 'Updated Data Privacy Policy rules', time: 'Yesterday' },
  { actor: 'AI Team', action: 'Approved gpt-4o for production', time: 'Yesterday' },
];

const ACCESS = [
  { role: 'Administrator', users: 4, perms: 'Full platform access' },
  { role: 'AI Engineer', users: 12, perms: 'Models, prompts, builders' },
  { role: 'Retail Ops', users: 28, perms: 'Try-on, inventory, kiosks' },
  { role: 'Viewer', users: 16, perms: 'Read-only dashboards' },
];

export function GovernancePoliciesPage() {
  const { data: policies, loading } = useApiData(listPolicies, mockPolicies);
  const [tab, setTab] = useState<'policies' | 'access' | 'audit'>('policies');

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Governance & Security</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Policies, access control, and audit for enterprise AI operations
          </p>
        </div>
        <button type="button" className="btn btn-primary">
          + New Policy
        </button>
      </div>

      <div className="tabs">
        {(
          [
            ['policies', 'Policies'],
            ['access', 'Access Control'],
            ['audit', 'Audit Logs'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tab ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'policies' && (
        <>
          <div className="table-wrap">
            {loading ? (
              <p style={{ padding: '1.25rem' }}>Loading...</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Policy Name</th>
                    <th>Type</th>
                    <th>Rules</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {policies?.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.name}</strong>
                      </td>
                      <td>
                        <span className="chip">{p.category}</span>
                      </td>
                      <td>{p.rules.length}</td>
                      <td>
                        <span className={`status-badge status-${p.status}`}>
                          {p.status === 'active' ? 'Active' : p.status}
                        </span>
                      </td>
                      <td>{new Date(p.updatedAt).toLocaleDateString()}</td>
                      <td>
                        <button type="button" className="btn btn-sm btn-ghost">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <h3 className="card-title" style={{ marginTop: '1.5rem' }}>
            Security Overview
          </h3>
          <div className="security-grid">
            {SECURITY.map((s) => (
              <div key={s.name} className="card security-card">
                <strong>{s.name}</strong>
                <span className="status-badge status-enabled">{s.status}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'access' && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Users</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ACCESS.map((r) => (
                <tr key={r.role}>
                  <td>
                    <strong>{r.role}</strong>
                  </td>
                  <td>{r.users}</td>
                  <td>{r.perms}</td>
                  <td>
                    <button type="button" className="btn btn-sm btn-ghost">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'audit' && (
        <div className="card card-pad">
          <ul className="activity-list">
            {AUDIT.map((a) => (
              <li key={a.action} className="activity-item">
                <i className="activity-dot" />
                <div>
                  <div>
                    <strong>{a.actor}</strong> — {a.action}
                  </div>
                  <div className="activity-meta">{a.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
