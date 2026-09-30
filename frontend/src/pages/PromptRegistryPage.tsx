import { useMemo, useState } from 'react';
import { listPromptRegistry } from '../api/promptsClient';
import { mockPromptRegistry } from '../data/mockData';
import { useApiData } from '../hooks/useApiData';
import { Link } from 'react-router-dom';
import './StudioPages.css';

const EXTRA = [
  {
    id: 'prompt-2',
    name: 'Try-On System Prompt',
    description: 'System instructions for virtual try-on agent',
    template: 'You are a jewelry try-on assistant...',
    version: '2.0.1',
    status: 'published' as const,
    tags: ['tryon', 'system'],
    updatedAt: '2026-09-01T00:00:00Z',
    registeredAt: '2026-05-01T00:00:00Z',
    owner: 'Product Team',
    usageCount: 8920,
    type: 'System',
    application: 'AI Try-On',
  },
  {
    id: 'prompt-3',
    name: 'Gemstone Q&A',
    description: 'Answer customer questions about gemstones',
    template: 'Answer questions about {{gemstone}}...',
    version: '0.8.0',
    status: 'draft' as const,
    tags: ['support'],
    updatedAt: '2026-09-09T00:00:00Z',
    registeredAt: '2026-09-01T00:00:00Z',
    owner: 'Support Team',
    usageCount: 124,
    type: 'User',
    application: 'Style Advisor',
  },
  {
    id: 'prompt-4',
    name: 'Inventory Classification',
    description: 'Classify jewelry SKUs from images',
    template: 'Classify the jewelry item...',
    version: '1.1.0',
    status: 'published' as const,
    tags: ['inventory'],
    updatedAt: '2026-08-15T00:00:00Z',
    registeredAt: '2026-07-01T00:00:00Z',
    owner: 'Ops Team',
    usageCount: 3401,
    type: 'System',
    application: 'Inventory Insight',
  },
];

export function PromptRegistryPage() {
  const { data: entries, loading } = useApiData(listPromptRegistry, mockPromptRegistry);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [application, setApplication] = useState('all');

  const rows = useMemo(() => {
    const mapped = (entries ?? []).map((e) => ({
      ...e,
      type: e.tags.includes('system') ? 'System' : 'User',
      application: 'AI Try-On',
    }));
    const base = [...mapped, ...EXTRA.filter((e) => !mapped.some((x) => x.id === e.id))];
    return base.filter((e) => {
      const q = search.toLowerCase();
      const matchQ = !q || e.name.toLowerCase().includes(q);
      const matchT = type === 'all' || e.type === type;
      const st = e.status === 'published' ? 'approved' : e.status;
      const matchS = status === 'all' || st === status || e.status === status;
      const matchA = application === 'all' || e.application === application;
      return matchQ && matchT && matchS && matchA;
    });
  }, [entries, search, type, status, application]);

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Prompt Registry</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Catalog of system and user prompts linked to applications
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/workflows" className="btn btn-secondary">
            Open Prompt Builder
          </Link>
          <button type="button" className="btn btn-primary">
            + Register Prompt
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <input
          className="form-input filter-search"
          placeholder="Search prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="System">System</option>
          <option value="User">User</option>
        </select>
        <select className="form-input" value={application} onChange={(e) => setApplication(e.target.value)}>
          <option value="all">All Applications</option>
          <option>AI Try-On</option>
          <option>Style Advisor</option>
          <option>Inventory Insight</option>
        </select>
        <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="table-wrap">
        {loading ? (
          <p style={{ padding: '1.25rem' }}>Loading...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Prompt Name</th>
                <th>Type</th>
                <th>Version</th>
                <th>Application</th>
                <th>Status</th>
                <th>Usage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const st = e.status === 'published' ? 'approved' : e.status;
                return (
                  <tr key={e.id}>
                    <td>
                      <strong>{e.name}</strong>
                      <div className="cell-sub">{e.description}</div>
                    </td>
                    <td>
                      <span className="chip">{e.type}</span>
                    </td>
                    <td>{e.version}</td>
                    <td>{e.application}</td>
                    <td>
                      <span className={`status-badge status-${st}`}>{st}</span>
                    </td>
                    <td>{e.usageCount.toLocaleString()}</td>
                    <td>
                      <div className="registry-actions">
                        <Link to="/workflows" className="btn btn-sm btn-ghost">
                          Edit
                        </Link>
                        <button type="button" className="btn btn-sm btn-ghost">
                          Versions
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
