import { getKioskDashboard, listKiosks, type Kiosk } from '../../api/businessOpsClient';
import { useApiData } from '../../hooks/useApiData';
import './BusinessOps.css';

const seedKiosks: Kiosk[] = [
  {
    kiosk_id: 'kiosk_001',
    kiosk_name: 'Kiosk 001',
    store: 'Dallas',
    location: 'Dallas, TX',
    status: 'ONLINE',
    software_version: '2.4.1',
    unity_webgl_version: '1.0.0',
    inventory_version: 'v12',
    asset_3d_version: 'v8',
    last_sync: '2 min ago',
    last_heartbeat: '30s ago',
    cpu: 42,
    memory: 61,
    storage: 55,
    tryon_sessions: 842,
    products: 1245,
    assets_available: 1198,
    assets_missing: 47,
    errors: 0,
    warnings: 1,
  },
  {
    kiosk_id: 'kiosk_002',
    kiosk_name: 'Kiosk 002',
    store: 'Plano',
    location: 'Plano, TX',
    status: 'ONLINE',
    software_version: '2.4.1',
    unity_webgl_version: '1.0.0',
    inventory_version: 'v11',
    asset_3d_version: 'v8',
    last_sync: '5 min ago',
    products: 1102,
    assets_available: 1090,
    assets_missing: 12,
    tryon_sessions: 610,
  },
  {
    kiosk_id: 'kiosk_003',
    kiosk_name: 'Kiosk 003',
    store: 'Austin',
    location: 'Austin, TX',
    status: 'OFFLINE',
    software_version: '2.3.9',
    unity_webgl_version: '0.9.8',
    inventory_version: 'v10',
    asset_3d_version: 'v7',
    last_heartbeat: '45 min ago',
    products: 980,
    assets_available: 940,
    assets_missing: 40,
    errors: 3,
  },
];

export function KioskDashboardPage() {
  const { data: dash } = useApiData(
    () => getKioskDashboard(),
    {
      total: 3,
      online: 2,
      offline: 1,
      degraded: 0,
      errors: 3,
      active_sessions: 12,
      kiosks: seedKiosks,
    },
  );

  const kiosks = dash?.kiosks?.length ? dash.kiosks : seedKiosks;

  return (
    <div className="bo-page animate-in">
      <header className="bo-header">
        <h1>Kiosk Dashboard</h1>
        <p>Customer: ABC Jewelry — production kiosk fleet overview</p>
      </header>

      <div className="bo-stats">
        <div className="bo-stat">
          <div className="val">{dash?.total ?? 3}</div>
          <div className="lbl">Total Kiosks</div>
        </div>
        <div className="bo-stat">
          <div className="val">{dash?.online ?? 2}</div>
          <div className="lbl">Online</div>
        </div>
        <div className="bo-stat">
          <div className="val">{dash?.offline ?? 1}</div>
          <div className="lbl">Offline</div>
        </div>
        <div className="bo-stat">
          <div className="val">{dash?.active_sessions ?? 12}</div>
          <div className="lbl">Active Sessions</div>
        </div>
        <div className="bo-stat">
          <div className="val">{dash?.errors ?? 3}</div>
          <div className="lbl">Errors</div>
        </div>
      </div>

      <div className="bo-kiosk-grid">
        {kiosks.map((k) => (
          <article key={k.kiosk_id} className="bo-kiosk-card">
            <div className="bo-metric-row">
              <h3>{k.kiosk_name}</h3>
              <span className={`bo-badge ${k.status.toLowerCase()}`}>{k.status}</span>
            </div>
            <div className="bo-metric-row">
              <span>Store</span>
              <strong>{k.store}</strong>
            </div>
            <div className="bo-metric-row">
              <span>Inventory</span>
              <strong>{k.inventory_version}</strong>
            </div>
            <div className="bo-metric-row">
              <span>3D Assets</span>
              <strong>{k.asset_3d_version}</strong>
            </div>
            <div className="bo-metric-row">
              <span>Products</span>
              <strong>{k.products?.toLocaleString() ?? '—'}</strong>
            </div>
            <div className="bo-metric-row">
              <span>3D Available / Missing</span>
              <strong>
                {k.assets_available ?? '—'} / {k.assets_missing ?? '—'}
              </strong>
            </div>
            <div className="bo-metric-row">
              <span>Last Sync</span>
              <strong>{k.last_sync ?? k.last_heartbeat ?? '—'}</strong>
            </div>
            <div className="bo-metric-row">
              <span>Unity WebGL</span>
              <strong>{k.unity_webgl_version}</strong>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function KioskMonitoringPage() {
  const { data: kiosks } = useApiData(() => listKiosks(), seedKiosks);
  return (
    <div className="bo-page animate-in">
      <header className="bo-header">
        <h1>Production Monitoring</h1>
        <p>Live health, inventory sync, and Unity runtime status for production kiosks.</p>
      </header>
      <div className="bo-panel">
        <table className="bo-table">
          <thead>
            <tr>
              <th>Kiosk</th>
              <th>Status</th>
              <th>CPU</th>
              <th>Memory</th>
              <th>Inventory</th>
              <th>3D</th>
              <th>Missing Assets</th>
              <th>Try-Ons</th>
              <th>Alerts</th>
            </tr>
          </thead>
          <tbody>
            {(kiosks ?? seedKiosks).map((k) => (
              <tr key={k.kiosk_id}>
                <td>
                  {k.kiosk_name}
                  <div className="bo-muted">{k.store}</div>
                </td>
                <td>
                  <span className={`bo-badge ${k.status.toLowerCase()}`}>{k.status}</span>
                </td>
                <td>{k.cpu != null ? `${k.cpu}%` : '—'}</td>
                <td>{k.memory != null ? `${k.memory}%` : '—'}</td>
                <td>{k.inventory_version}</td>
                <td>{k.asset_3d_version}</td>
                <td>{k.assets_missing ?? 0}</td>
                <td>{k.tryon_sessions ?? 0}</td>
                <td>
                  {(k.errors ?? 0) > 0 ? (
                    <span className="bo-badge critical">{k.errors} critical</span>
                  ) : (k.warnings ?? 0) > 0 ? (
                    <span className="bo-badge warning">{k.warnings} warn</span>
                  ) : (
                    <span className="bo-badge online">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
