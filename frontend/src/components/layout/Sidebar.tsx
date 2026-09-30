import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { navigation } from '../../config/navigation';
import './Sidebar.css';

export function Sidebar() {
  const [params] = useSearchParams();
  const location = useLocation();
  const selectedModule =
    params.get('module') ?? (location.pathname === '/' ? 'virtual-tryon' : null);
  const onHome = location.pathname === '/';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark" aria-hidden>
          ◆
        </div>
        <div>
          <h1>AIJewel</h1>
          <span>Enterprise AI Platform</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navigation.map((group) =>
          group.path ? (
            <Link
              key={group.path}
              to="/"
              className={`nav-link nav-link-top${onHome && !params.get('module') ? ' active' : ''}`}
            >
              <span className="nav-ico">{group.icon}</span>
              <span>{group.label}</span>
            </Link>
          ) : (
            <div key={group.label} className="nav-group">
              <div className="nav-group-title">
                <span>{group.label}</span>
                <span className="nav-count">{group.children?.length ?? 0}</span>
              </div>
              {group.children?.map((item) => {
                const moduleId = item.id;
                const href = moduleId ? `/?module=${moduleId}` : item.path!;
                const active = Boolean(onHome && moduleId && selectedModule === moduleId);
                return (
                  <Link
                    key={`${item.path}-${item.label}`}
                    to={href}
                    className={`nav-link${active ? ' active' : ''}`}
                  >
                    <span className="nav-ico">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ),
        )}
      </nav>

      <div className="sidebar-foot">
        <Link
          to="/settings"
          className={`nav-link${location.pathname === '/settings' ? ' active' : ''}`}
        >
          <span className="nav-ico">⚙️</span>
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
