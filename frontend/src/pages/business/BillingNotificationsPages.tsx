import {
  getBillingDashboard,
  listInvoices,
  listNotificationTemplates,
  listNotifications,
  listUsage,
  type BillingDashboard,
} from '../../api/businessOpsClient';
import { useApiData } from '../../hooks/useApiData';
import './BusinessOps.css';

const seedBilling: BillingDashboard = {
  customer_name: 'ABC Jewelry',
  plan: 'Enterprise',
  kiosks: 12,
  tryon_sessions: 24820,
  ai_requests: 52430,
  storage_tb: 1.8,
  llm_tokens: '12.4M',
  current_month_usd: 4832,
  projected_usd: 5120,
  next_billing_date: 'October 1',
  ytd_usd: 41200,
  outstanding_usd: 0,
  paid_usd: 41200,
};

export function BillingDashboardPage() {
  const { data } = useApiData(() => getBillingDashboard(), seedBilling);
  const b = data ?? seedBilling;

  return (
    <div className="bo-page animate-in">
      <header className="bo-header">
        <h1>Billing Dashboard</h1>
        <p>
          Customer: {b.customer_name} — subscription, usage metering, and projected spend.
        </p>
      </header>
      <div className="bo-stats">
        <div className="bo-stat">
          <div className="val">{b.plan}</div>
          <div className="lbl">Current Plan</div>
        </div>
        <div className="bo-stat">
          <div className="val">${b.current_month_usd.toLocaleString()}</div>
          <div className="lbl">Current Month</div>
        </div>
        <div className="bo-stat">
          <div className="val">${b.projected_usd.toLocaleString()}</div>
          <div className="lbl">Projected</div>
        </div>
        <div className="bo-stat">
          <div className="val">{b.next_billing_date}</div>
          <div className="lbl">Next Billing</div>
        </div>
      </div>
      <div className="bo-panel">
        <h2>Usage</h2>
        <div className="bo-metric-row">
          <span>Kiosks</span>
          <strong>{b.kiosks}</strong>
        </div>
        <div className="bo-metric-row">
          <span>Try-On Sessions</span>
          <strong>{b.tryon_sessions.toLocaleString()}</strong>
        </div>
        <div className="bo-metric-row">
          <span>AI Requests</span>
          <strong>{b.ai_requests.toLocaleString()}</strong>
        </div>
        <div className="bo-metric-row">
          <span>Storage</span>
          <strong>{b.storage_tb} TB</strong>
        </div>
        <div className="bo-metric-row">
          <span>LLM Tokens</span>
          <strong>{b.llm_tokens}</strong>
        </div>
      </div>
    </div>
  );
}

export function NotificationCenterPage() {
  const { data: notes } = useApiData(() => listNotifications(), [
    {
      notification_id: 'ntf_1',
      customer_id: 'cust_abc',
      event: 'KIOSK_OFFLINE',
      channel: 'email',
      status: 'DELIVERED',
      timestamp: new Date().toISOString(),
      subject: 'Kiosk Offline Alert',
    },
  ]);
  const { data: templates } = useApiData(() => listNotificationTemplates(), [
    {
      template_id: 'tpl_kiosk_offline',
      name: 'KIOSK_OFFLINE',
      event: 'KIOSK_OFFLINE',
      channel: 'email',
      subject: 'Kiosk Offline Alert',
      body: 'Your kiosk at {{store_name}} has been offline since {{timestamp}}.',
      variables: ['store_name', 'timestamp'],
      version: '1.0.0',
      status: 'PUBLISHED',
    },
  ]);

  return (
    <div className="bo-page animate-in">
      <header className="bo-header">
        <h1>Notification Center</h1>
        <p>Customer and operational notifications across email, SMS, push, and in-app.</p>
      </header>
      <div className="bo-panel">
        <h2>Recent Notifications</h2>
        <table className="bo-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Event</th>
              <th>Channel</th>
              <th>Status</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {(notes ?? []).map((n) => (
              <tr key={n.notification_id}>
                <td>{n.notification_id}</td>
                <td>{n.customer_id}</td>
                <td>{n.event}</td>
                <td>{n.channel}</td>
                <td>
                  <span className="bo-badge">{n.status}</span>
                </td>
                <td>{n.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bo-panel">
        <h2>Templates</h2>
        <table className="bo-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Event</th>
              <th>Channel</th>
              <th>Subject</th>
              <th>Version</th>
            </tr>
          </thead>
          <tbody>
            {(templates ?? []).map((t) => (
              <tr key={t.template_id}>
                <td>{t.name}</td>
                <td>{t.event}</td>
                <td>{t.channel}</td>
                <td>{t.subject}</td>
                <td>{t.version}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function InvoicesPage() {
  const { data } = useApiData(() => listInvoices(), [
    { invoice_id: 'inv_1001', amount: 4832, status: 'PAID', period: '2026-09' },
  ]);
  return (
    <div className="bo-page animate-in">
      <header className="bo-header">
        <h1>Invoices</h1>
        <p>Billing invoices generated from subscription and metered usage.</p>
      </header>
      <div className="bo-panel">
        <table className="bo-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Period</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(data as Array<Record<string, unknown>>).map((inv) => (
              <tr key={String(inv.invoice_id)}>
                <td>{String(inv.invoice_id)}</td>
                <td>{String(inv.period)}</td>
                <td>${Number(inv.amount).toLocaleString()}</td>
                <td>
                  <span className="bo-badge online">{String(inv.status)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function UsagePage() {
  const { data } = useApiData(() => listUsage(), [
    {
      usage_id: 'u1',
      usage_type: 'tryon_session',
      quantity: 24820,
      unit: 'sessions',
      service: 'tryon-service',
    },
    {
      usage_id: 'u2',
      usage_type: 'llm_tokens',
      quantity: 12400000,
      unit: 'tokens',
      service: 'model-gateway',
    },
  ]);
  return (
    <div className="bo-page animate-in">
      <header className="bo-header">
        <h1>Usage</h1>
        <p>Metered usage from AI platform and jewelry business operations.</p>
      </header>
      <div className="bo-panel">
        <table className="bo-table">
          <thead>
            <tr>
              <th>Usage ID</th>
              <th>Type</th>
              <th>Service</th>
              <th>Quantity</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {(data as Array<Record<string, unknown>>).map((u) => (
              <tr key={String(u.usage_id)}>
                <td>{String(u.usage_id)}</td>
                <td>{String(u.usage_type)}</td>
                <td>{String(u.service)}</td>
                <td>{Number(u.quantity).toLocaleString()}</td>
                <td>{String(u.unit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
