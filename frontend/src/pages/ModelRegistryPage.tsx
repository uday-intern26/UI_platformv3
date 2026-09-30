import { useMemo, useState } from 'react';
import { listRegistryEntries } from '../api/modelsClient';
import { mockRegistry } from '../data/mockData';
import { useApiData } from '../hooks/useApiData';
import './StudioPages.css';

const EXTRA = [
  {
    id: 'model-3',
    name: 'llama-3-70b',
    provider: 'Meta',
    version: '3.1',
    status: 'active' as const,
    capabilities: ['chat', 'embeddings'],
    createdAt: '2026-03-01T00:00:00Z',
    registeredAt: '2026-03-01T00:00:00Z',
    owner: 'Platform Team',
    tags: ['open-source', 'verified'],
  },
  {
    id: 'model-4',
    name: 'titan-image-generator',
    provider: 'AWS',
    version: 'v2',
    status: 'draft' as const,
    capabilities: ['image-gen'],
    createdAt: '2026-04-12T00:00:00Z',
    registeredAt: '2026-04-12T00:00:00Z',
    owner: 'Vision Team',
    tags: ['pending-review'],
  },
  {
    id: 'model-5',
    name: 'claude-3-opus',
    provider: 'Anthropic',
    version: '20240229',
    status: 'active' as const,
    capabilities: ['chat', 'vision'],
    createdAt: '2026-02-20T00:00:00Z',
    registeredAt: '2026-02-20T00:00:00Z',
    owner: 'AI Team',
    tags: ['production'],
  },
];

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: '#10a37f',
  Anthropic: '#d97706',
  AWS: '#f59e0b',
  Meta: '#2563eb',
};

function providerInitials(provider: string) {
  return provider.slice(0, 2).toUpperCase();
}

function statusLabel(status: string) {
  if (status === 'active') return 'approved';
  if (status === 'draft') return 'pending';
  return status;
}

export function ModelRegistryPage() {
  const { data: entries, loading } = useApiData(listRegistryEntries, mockRegistry);
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState('all');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');

  const rows = useMemo(() => {
    const base = [...(entries ?? []), ...EXTRA.filter((e) => !(entries ?? []).some((x) => x.id === e.id))];
    return base.filter((e) => {
      const q = search.toLowerCase();
      const matchQ = !q || e.name.toLowerCase().includes(q) || e.provider.toLowerCase().includes(q);
      const matchP = provider === 'all' || e.provider === provider;
      const isImage = e.capabilities.some((c) => c.includes('image'));
      const matchT =
        type === 'all' ||
        (type === 'image' && isImage) ||
        (type === 'text' && !isImage);
      const label = statusLabel(e.status);
      const matchS = status === 'all' || label === status || e.status === status;
      return matchQ && matchP && matchT && matchS;
    });
  }, [entries, search, provider, type, status]);

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">AIJewel Registry</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Governed model catalog with providers, capabilities, and approval status
          </p>
        </div>
        <button type="button" className="btn btn-primary">
          + Register Model
        </button>
      </div>

      <div className="filter-bar">
        <input
          className="form-input filter-search"
          placeholder="Search models..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-input" value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="all">All Providers</option>
          <option>OpenAI</option>
          <option>Anthropic</option>
          <option>AWS</option>
          <option>Meta</option>
        </select>
        <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="text">Text</option>
          <option value="image">Image Gen</option>
        </select>
        <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="table-wrap">
        {loading ? (
          <p style={{ padding: '1.25rem' }}>Loading...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Model Name</th>
                <th>Provider</th>
                <th>Type</th>
                <th>Version</th>
                <th>Status</th>
                <th>Capabilities</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const label = statusLabel(e.status);
                const isImage = e.capabilities.some((c) => c.includes('image'));
                return (
                  <tr key={e.id}>
                    <td>
                      <div className="provider-cell">
                        <span
                          className="provider-logo"
                          style={{ background: PROVIDER_COLORS[e.provider] ?? '#64748b' }}
                        >
                          {providerInitials(e.provider)}
                        </span>
                        <strong>{e.name}</strong>
                      </div>
                    </td>
                    <td>{e.provider}</td>
                    <td>{isImage ? 'Image Gen' : 'Text'}</td>
                    <td>{e.version}</td>
                    <td>
                      <span className={`status-badge status-${label}`}>{label}</span>
                    </td>
                    <td>
                      {e.capabilities.map((c) => (
                        <span key={c} className="chip">
                          {c}
                        </span>
                      ))}
                    </td>
                    <td>
                      <div className="registry-actions">
                        <button type="button" className="btn btn-sm btn-ghost">
                          View
                        </button>
                        <button type="button" className="btn btn-sm btn-ghost">
                          Edit
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
