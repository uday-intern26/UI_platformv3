import { useMemo, useState } from 'react';
import {
  advanceOnboarding,
  listCustomers,
  startOnboarding,
  type Customer,
} from '../../api/businessOpsClient';
import { useApiData } from '../../hooks/useApiData';
import './BusinessOps.css';

const STEPS = [
  'registration',
  'business',
  'store',
  'kiosk',
  'inventory',
  'users',
  'billing',
  'notifications',
  'verification',
  'approve',
] as const;

const seedCustomers: Customer[] = [
  {
    customer_id: 'cust_abc',
    customer_name: 'ABC Jewelry',
    business_name: 'ABC Jewelry LLC',
    status: 'ACTIVE',
    subscription: 'Enterprise',
  },
];

export function CustomerOnboardingPage() {
  const { data: customers, refetch } = useApiData(() => listCustomers(), seedCustomers);
  const [stepIdx, setStepIdx] = useState(0);
  const [draft, setDraft] = useState({
    customer_name: '',
    business_name: '',
    email: '',
    phone: '',
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const step = STEPS[stepIdx];

  const start = async () => {
    try {
      const c = await startOnboarding({
        customer_name: draft.customer_name || 'New Jewelry Co',
        business_name: draft.business_name || 'New Jewelry Co LLC',
        contact_information: { email: draft.email, phone: draft.phone },
      });
      setActiveId(c.customer_id);
      setStatus(`Registered ${c.customer_id} — status ${c.status}`);
      setStepIdx(1);
      refetch();
    } catch {
      setActiveId('local_onboarding');
      setStatus('Onboarding started locally (API unavailable)');
      setStepIdx(1);
    }
  };

  const next = async () => {
    if (!activeId) {
      await start();
      return;
    }
    try {
      if (activeId !== 'local_onboarding') {
        const c = await advanceOnboarding(activeId, step, { ...draft });
        setStatus(`Step ${step} → ${c.status}`);
      } else {
        setStatus(`Completed step: ${step}`);
      }
    } catch {
      setStatus(`Completed step: ${step} (offline)`);
    }
    setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
    refetch();
  };

  const progress = useMemo(() => ((stepIdx + 1) / STEPS.length) * 100, [stepIdx]);

  return (
    <div className="bo-page animate-in">
      <header className="bo-header">
        <h1>Customer Onboarding</h1>
        <p>Onboard jewelry retailers from prospect through active kiosk-ready status.</p>
      </header>

      <div className="bo-progress">
        <div className="bo-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <ol className="bo-steps">
        {STEPS.map((s, i) => (
          <li key={s} className={i === stepIdx ? 'active' : i < stepIdx ? 'done' : ''}>
            {s}
          </li>
        ))}
      </ol>

      <div className="bo-panel">
        <h2>Step: {step}</h2>
        {stepIdx === 0 && (
          <div className="bo-form">
            <label>
              Customer Name
              <input
                value={draft.customer_name}
                onChange={(e) => setDraft({ ...draft, customer_name: e.target.value })}
              />
            </label>
            <label>
              Business Name
              <input
                value={draft.business_name}
                onChange={(e) => setDraft({ ...draft, business_name: e.target.value })}
              />
            </label>
            <label>
              Email
              <input
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </label>
            <label>
              Phone
              <input
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              />
            </label>
          </div>
        )}
        {stepIdx > 0 && (
          <p className="bo-muted">
            Configure {step.replace('_', ' ')} for this customer, then continue. Backend
            persists via Customer Onboarding Service APIs.
          </p>
        )}
        <div className="bo-actions">
          <button type="button" className="bo-btn" onClick={next}>
            {stepIdx === 0 ? 'Start Onboarding' : stepIdx === STEPS.length - 1 ? 'Approve & Activate' : 'Continue'}
          </button>
        </div>
        {status && <p className="bo-status">{status}</p>}
      </div>

      <div className="bo-panel">
        <h2>Customers</h2>
        <table className="bo-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Business</th>
              <th>Status</th>
              <th>Plan</th>
            </tr>
          </thead>
          <tbody>
            {(customers ?? seedCustomers).map((c) => (
              <tr key={c.customer_id}>
                <td>{c.customer_id}</td>
                <td>{c.customer_name}</td>
                <td>{c.business_name}</td>
                <td>
                  <span className={`bo-badge status-${c.status.toLowerCase()}`}>{c.status}</span>
                </td>
                <td>{c.subscription ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
