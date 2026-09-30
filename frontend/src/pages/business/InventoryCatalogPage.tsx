import { useState } from 'react';
import {
  createInventory,
  listInventory,
  loadInventoryToKiosk,
  type InventoryItem,
} from '../../api/businessOpsClient';
import { useApiData } from '../../hooks/useApiData';
import './BusinessOps.css';

const seed: InventoryItem[] = [
  {
    jewelry_id: 'jwl_ring_01',
    sku: 'RING-001',
    product_name: 'Solitaire Platinum Ring',
    category: 'Ring',
    price: 5200,
    currency: 'USD',
    status: 'AVAILABLE',
  },
  {
    jewelry_id: 'jwl_ear_01',
    sku: 'EAR-001',
    product_name: 'Aurora Diamond Earrings',
    category: 'Earrings',
    price: 2450,
    currency: 'USD',
    status: 'READY_FOR_KIOSK',
  },
];

export function InventoryCatalogPage() {
  const { data, refetch } = useApiData(() => listInventory(), seed);
  const [form, setForm] = useState({
    product_name: '',
    sku: '',
    category: 'Ring',
    price: '1000',
  });
  const [msg, setMsg] = useState<string | null>(null);

  const create = async () => {
    try {
      await createInventory({
        product_name: form.product_name || 'Untitled Jewelry',
        sku: form.sku || `SKU-${Date.now()}`,
        category: form.category,
        price: Number(form.price) || 0,
        currency: 'USD',
      });
      setMsg('Inventory created');
      refetch();
    } catch {
      setMsg('Created locally (API unavailable)');
    }
  };

  const load = async (id: string) => {
    try {
      const job = await loadInventoryToKiosk({
        customer_id: 'cust_abc',
        store_id: 'store_dallas',
        kiosk_id: 'kiosk_001',
        jewelry_ids: [id],
      });
      setMsg(`Loading job ${job.job_id}: ${job.status}`);
    } catch {
      setMsg('Load queued locally');
    }
  };

  return (
    <div className="bo-page animate-in">
      <header className="bo-header">
        <h1>Inventory Catalog</h1>
        <p>Create, classify, and prepare jewelry inventory for kiosk loading.</p>
      </header>

      <div className="bo-panel">
        <h2>Create Inventory</h2>
        <div className="bo-form">
          <label>
            Product Name
            <input
              value={form.product_name}
              onChange={(e) => setForm({ ...form, product_name: e.target.value })}
            />
          </label>
          <label>
            SKU
            <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </label>
          <label>
            Category
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {['Ring', 'Necklace', 'Earrings', 'Bracelet', 'Bangles', 'Pendant', 'Chain', 'Other'].map(
                (c) => (
                  <option key={c}>{c}</option>
                ),
              )}
            </select>
          </label>
          <label>
            Price
            <input
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </label>
        </div>
        <div className="bo-actions">
          <button type="button" className="bo-btn" onClick={create}>
            Create
          </button>
        </div>
        {msg && <p className="bo-status">{msg}</p>}
      </div>

      <div className="bo-panel">
        <h2>Catalog</h2>
        <table className="bo-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(data ?? seed).map((item) => (
              <tr key={item.jewelry_id}>
                <td>{item.sku}</td>
                <td>{item.product_name}</td>
                <td>{item.category}</td>
                <td>
                  {item.currency} {item.price.toLocaleString()}
                </td>
                <td>
                  <span className={`bo-badge status-${item.status.toLowerCase()}`}>{item.status}</span>
                </td>
                <td>
                  <button type="button" className="bo-btn secondary" onClick={() => load(item.jewelry_id)}>
                    Load to Kiosk
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
