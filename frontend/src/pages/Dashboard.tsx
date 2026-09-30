import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PLATFORM_MODULES,
  modulesByCategory,
  type PlatformModule,
} from '../data/platformModules';
import './Dashboard.css';

export function Dashboard() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('module') ?? 'virtual-tryon';
  const selected =
    PLATFORM_MODULES.find((m) => m.id === selectedId) ??
    PLATFORM_MODULES.find((m) => m.id === 'virtual-tryon')!;
  const [tab, setTab] = useState<'overview' | 'features' | 'usecases' | 'settings'>(
    'overview',
  );

  const business = useMemo(() => modulesByCategory('business'), []);
  const platform = useMemo(() => modulesByCategory('platform'), []);
  const admin = useMemo(() => modulesByCategory('administration'), []);

  const selectModule = (mod: PlatformModule) => {
    setParams({ module: mod.id });
    setTab('overview');
  };

  return (
    <div className="hub">
      <div className="hub-main">
        <header className="hub-hero">
          <div>
            <h1>AIJewel Enterprise Platform</h1>
            <p>End-to-end AI solutions for jewellery retailers</p>
          </div>
          <div className="hub-stats">
            <div className="stat-chip">
              <strong>{business.length}</strong>
              <span>Business Applications</span>
            </div>
            <div className="stat-chip">
              <strong>{platform.length}</strong>
              <span>AI Platform Services</span>
            </div>
            <div className="stat-chip">
              <strong>{admin.length}</strong>
              <span>Enterprise Admin</span>
            </div>
            <div className="stat-chip healthy">
              <strong>●</strong>
              <span>System Healthy</span>
            </div>
          </div>
        </header>

        <section className="hub-section">
          <div className="section-head">
            <h2>Business Applications</h2>
            <span>{business.length} apps</span>
          </div>
          <div className="module-grid">
            {business.map((mod, idx) => (
              <ModuleCard
                key={mod.id}
                mod={mod}
                index={idx + 1}
                active={selected.id === mod.id}
                onSelect={() => selectModule(mod)}
              />
            ))}
          </div>
        </section>

        <section className="hub-section">
          <div className="section-head">
            <h2>AI Platform Services</h2>
            <span>{platform.length} services</span>
          </div>
          <div className="module-grid">
            {platform.map((mod, idx) => (
              <ModuleCard
                key={mod.id}
                mod={mod}
                index={idx + 1}
                active={selected.id === mod.id}
                onSelect={() => selectModule(mod)}
              />
            ))}
          </div>
        </section>

        <section className="hub-section">
          <div className="section-head">
            <h2>Enterprise Administration</h2>
            <span>{admin.length} modules</span>
          </div>
          <div className="admin-row">
            {admin.map((mod) => (
              <button
                key={mod.id}
                type="button"
                className={`admin-chip${selected.id === mod.id ? ' active' : ''}`}
                onClick={() => selectModule(mod)}
              >
                <span>{mod.icon}</span>
                {mod.name}
              </button>
            ))}
          </div>
        </section>
      </div>

      <aside className="hub-detail">
        <div className="detail-crumb">
          {selected.category === 'business'
            ? 'Business Applications'
            : selected.category === 'platform'
              ? 'AI Platform Services'
              : 'Enterprise Administration'}{' '}
          &gt; {selected.name}
        </div>

        <div className="detail-header">
          <div className="detail-icon" style={{ background: `${selected.accent}22`, color: selected.accent }}>
            {selected.icon}
          </div>
          <div>
            <div className="detail-title-row">
              <h2>{selected.name}</h2>
              <span className={`status-pill ${selected.status}`}>
                {selected.status === 'active' ? 'Active' : 'Planned'}
              </span>
            </div>
            <p>{selected.description}</p>
          </div>
        </div>

        <div className="detail-tabs">
          {(['overview', 'features', 'usecases', 'settings'] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={tab === t ? 'active' : ''}
              onClick={() => setTab(t)}
            >
              {t === 'usecases' ? 'Use Cases' : t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <>
            <div className="detail-block">
              <h3>Key Capabilities</h3>
              <ul className="cap-list">
                {(selected.capabilities ?? [
                  {
                    title: selected.name,
                    detail: selected.description,
                    icon: selected.icon,
                  },
                ]).map((c) => (
                  <li key={c.title}>
                    <span className="cap-ico">{c.icon}</span>
                    <div>
                      <strong>{c.title}</strong>
                      <p>{c.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {selected.businessValue && (
              <div className="detail-block">
                <h3>Business Value</h3>
                <ul className="value-list">
                  {selected.businessValue.map((v) => (
                    <li key={v}>
                      <span>✓</span>
                      {v}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selected.related && (
              <div className="detail-block">
                <h3>Related Services</h3>
                <div className="related-row">
                  {selected.related.map((r) => (
                    <span key={r} className="related-pill">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'features' && (
          <div className="detail-block">
            <h3>Features</h3>
            <p className="muted">
              {selected.modulesCount} module · {selected.featuresCount} features configured for this
              application.
            </p>
          </div>
        )}

        {tab === 'usecases' && (
          <div className="detail-block">
            <h3>Use Cases</h3>
            <p className="muted">
              In-store kiosks, web try-on, mobile apps, and branch associate workflows.
            </p>
          </div>
        )}

        {tab === 'settings' && (
          <div className="detail-block">
            <h3>Settings</h3>
            <p className="muted">SDK keys, retention policies, and branch entitlements.</p>
          </div>
        )}

        <div className="detail-actions">
          <Link to={selected.path} className="btn-primary">
            {selected.id === 'virtual-tryon' ? 'Launch Try-On' : `Open ${selected.name}`}
          </Link>
          <button type="button" className="btn-ghost">
            Analytics
          </button>
          <button type="button" className="btn-ghost">
            Assets
          </button>
          <a className="btn-ghost" href="http://127.0.0.1:8101/docs" target="_blank" rel="noreferrer">
            API Docs
          </a>
        </div>

        <div className="detail-foot">
          Last updated Sep 29, 2026 · Priya Sharma
        </div>
      </aside>
    </div>
  );
}

function ModuleCard({
  mod,
  index,
  active,
  onSelect,
}: {
  mod: PlatformModule;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`module-card${active ? ' active' : ''}`}
      onClick={onSelect}
    >
      <div className="module-card-top">
        <div className="module-ico" style={{ background: `${mod.accent}18`, color: mod.accent }}>
          {mod.icon}
        </div>
        <span className="module-meta">
          {mod.modulesCount} module · {mod.featuresCount} features
        </span>
      </div>
      <h3>
        {index}. {mod.name}
      </h3>
      <p>{mod.description}</p>
      <span className="view-link">View →</span>
    </button>
  );
}
