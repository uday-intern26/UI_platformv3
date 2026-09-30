import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { setApiContext } from '../../api/apiClient';
import { useProfile } from '../../context/ProfileContext';
import './TopBar.css';

export function TopBar() {
  const { profile } = useProfile();
  const [tenantId, setTenantId] = useState('all');
  const [environment, setEnvironment] = useState('production');
  const [query, setQuery] = useState('');

  useEffect(() => {
    setApiContext({ tenantId, environment });
  }, [tenantId, environment]);

  return (
    <header className="topbar">
      <div className="topbar-search">
        <span className="search-ico" aria-hidden>
          ⌕
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anything... (products, customers, reports, etc.)"
          aria-label="Global search"
        />
      </div>

      <div className="topbar-right">
        <button type="button" className="icon-btn" aria-label="Notifications">
          <span>🔔</span>
          <i className="badge">3</i>
        </button>

        <select
          className="pill-select"
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
          aria-label="Tenant"
        >
          <option value="all">All Tenants</option>
          <option value="tenant-default">AIJewel Demo</option>
          <option value="tenant-luxury">Luxury Brands Co</option>
        </select>

        <div className="env-pill">
          <i className="env-dot" />
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            aria-label="Environment"
          >
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
          </select>
        </div>

        <Link to="/settings" className="topbar-user">
          <div className="user-avatar" aria-hidden>
            {profile.fullName
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="user-meta">
            <strong>{profile.fullName}</strong>
            <span>{profile.role}</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
