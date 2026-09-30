import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfile, type UserProfile } from '../context/ProfileContext';
import './StudioPages.css';

type Section = 'profile' | 'general' | 'security' | 'api' | 'notifications';

export function SettingsPage() {
  const { profile, saveProfile, initials } = useProfile();
  const [section, setSection] = useState<Section>('profile');
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [environment, setEnvironment] = useState('production');
  const [tenant, setTenant] = useState('AIJewel');
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const handleSaveProfile = () => {
    if (!draft.fullName.trim()) {
      setSavedMsg('Full name is required');
      return;
    }
    saveProfile({
      ...draft,
      fullName: draft.fullName.trim(),
      role: draft.role.trim() || 'Administrator',
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      title: draft.title.trim(),
      department: draft.department.trim(),
    });
    setSavedMsg('Profile details saved');
    window.setTimeout(() => setSavedMsg(null), 2500);
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Profile & Settings</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Edit your profile details, tenant context, theme, and preferences
          </p>
        </div>
      </div>

      <div className="settings-layout">
        <aside className="card card-pad profile-card">
          <div className="profile-avatar">{initials}</div>
          <h2 style={{ fontSize: '1.125rem', marginBottom: 0.15 }}>{profile.fullName}</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', marginBottom: 0.35 }}>
            {profile.role}
          </p>
          <span className="status-badge status-active">Active</span>
          <nav className="profile-nav">
            {(
              [
                ['profile', 'Profile'],
                ['general', 'General'],
                ['security', 'Security'],
                ['api', 'API Keys'],
                ['notifications', 'Notifications'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={section === id ? 'active' : ''}
                onClick={() => setSection(id)}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="card card-pad">
          {section === 'profile' && (
            <>
              <h3 className="card-title">Edit Profile Details</h3>
              {savedMsg && (
                <p
                  className="inline-warn"
                  style={{
                    color: savedMsg.includes('required')
                      ? 'var(--color-error)'
                      : 'var(--color-success)',
                  }}
                >
                  {savedMsg}
                </p>
              )}
              <div className="form-group">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  className="form-input"
                  value={draft.fullName}
                  onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  className="form-input"
                  value={draft.role}
                  onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                >
                  <option>Administrator</option>
                  <option>AI Engineer</option>
                  <option>Retail Ops</option>
                  <option>Viewer</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  className="form-input"
                  value={draft.phone}
                  onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="title">Job title</label>
                <input
                  id="title"
                  className="form-input"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input
                  id="department"
                  className="form-input"
                  value={draft.department}
                  onChange={(e) => setDraft({ ...draft, department: e.target.value })}
                />
              </div>
              <div className="page-header-actions">
                <button type="button" className="btn btn-primary" onClick={handleSaveProfile}>
                  Save Profile
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDraft(profile)}
                >
                  Reset
                </button>
              </div>
            </>
          )}

          {section === 'general' && (
            <>
              <h3 className="card-title">General Settings</h3>
              <div className="form-group">
                <label htmlFor="env">Environment</label>
                <select
                  id="env"
                  className="form-input"
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="tenant">Tenant</label>
                <select
                  id="tenant"
                  className="form-input"
                  value={tenant}
                  onChange={(e) => setTenant(e.target.value)}
                >
                  <option>AIJewel</option>
                  <option>Luxury Brands Co</option>
                </select>
              </div>
              <div className="form-group">
                <label>Theme</label>
                <div className="theme-toggle">
                  <button
                    type="button"
                    className={theme === 'light' ? 'active' : ''}
                    onClick={() => setTheme('light')}
                  >
                    Light
                  </button>
                  <button
                    type="button"
                    className={theme === 'dark' ? 'active' : ''}
                    onClick={() => setTheme('dark')}
                  >
                    Dark
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="lang">Language</label>
                <select
                  id="lang"
                  className="form-input"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>French</option>
                </select>
              </div>

              <h3 className="card-title" style={{ marginTop: '1.5rem' }}>
                Quick Actions
              </h3>
              <div className="page-header-actions">
                <Link to="/applications/builder" className="btn btn-primary">
                  Build Application
                </Link>
                <Link to="/workflows" className="btn btn-secondary">
                  Create Workflow
                </Link>
                <Link to="/tryon" className="btn btn-secondary">
                  Open Try-On
                </Link>
              </div>
            </>
          )}

          {section === 'security' && (
            <>
              <h3 className="card-title">Security</h3>
              <div className="form-group">
                <label>Password</label>
                <button type="button" className="btn btn-secondary">
                  Change Password
                </button>
              </div>
              <div className="form-group">
                <label>Two-factor authentication</label>
                <span className="status-badge status-enabled">Enabled</span>
              </div>
              <div className="form-group">
                <label>Last login</label>
                <p style={{ fontSize: '0.875rem' }}>Sep 13, 2026 · 5:02 PM · Mumbai</p>
              </div>
            </>
          )}

          {section === 'api' && (
            <>
              <h3 className="card-title">API Keys</h3>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Prefix</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Studio CI</td>
                      <td>aj_live_••••4f2a</td>
                      <td>Aug 12, 2026</td>
                      <td>
                        <button type="button" className="btn btn-sm btn-ghost">
                          Revoke
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>Try-On Service</td>
                      <td>aj_live_••••91bc</td>
                      <td>Sep 1, 2026</td>
                      <td>
                        <button type="button" className="btn btn-sm btn-ghost">
                          Revoke
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Generate Key
              </button>
            </>
          )}

          {section === 'notifications' && (
            <>
              <h3 className="card-title">Notifications</h3>
              {[
                'Deployment failures',
                'Cost budget alerts',
                'Policy violations',
                'Weekly usage digest',
              ].map((item) => (
                <label
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    marginBottom: '0.75rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <input type="checkbox" defaultChecked />
                  {item}
                </label>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
