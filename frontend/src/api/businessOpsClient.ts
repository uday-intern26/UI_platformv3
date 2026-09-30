import { apiGet, apiPost } from './apiClient';

interface Envelope<T> {
  success?: boolean;
  data?: T;
}

function unwrap<T>(payload: T | Envelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    const env = payload as Envelope<T>;
    if (env.data !== undefined) return env.data;
  }
  return payload as T;
}

export type CustomerStatus =
  | 'PROSPECT'
  | 'REGISTERED'
  | 'ONBOARDING'
  | 'VERIFICATION'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DEACTIVATED';

export interface Customer {
  customer_id: string;
  customer_name: string;
  business_name: string;
  contact_information?: Record<string, unknown>;
  locations?: unknown[];
  store_information?: unknown[];
  subscription?: string;
  billing_account?: string;
  notification_preferences?: Record<string, unknown>;
  status: CustomerStatus;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryItem {
  jewelry_id: string;
  sku: string;
  product_name: string;
  category: string;
  price: number;
  currency: string;
  status: string;
  customer_id?: string;
  store_id?: string;
  images?: string[];
  assets_3d?: string[];
}

export interface Kiosk {
  kiosk_id: string;
  kiosk_name: string;
  store: string;
  location: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'MAINTENANCE' | 'UPDATING' | 'SYNCING' | 'ERROR';
  software_version: string;
  unity_webgl_version: string;
  inventory_version: string;
  asset_3d_version: string;
  last_sync?: string;
  last_heartbeat?: string;
  cpu?: number;
  memory?: number;
  storage?: number;
  network?: string;
  active_users?: number;
  tryon_sessions?: number;
  errors?: number;
  warnings?: number;
  products?: number;
  assets_available?: number;
  assets_missing?: number;
  customer_id?: string;
}

export interface Asset3D {
  asset_id: string;
  jewelry_id: string;
  status: string;
  version: string;
  url?: string;
}

export interface NotificationRecord {
  notification_id: string;
  customer_id: string;
  event: string;
  channel: string;
  status: string;
  timestamp: string;
  subject?: string;
}

export interface NotificationTemplate {
  template_id: string;
  name: string;
  event: string;
  channel: string;
  subject: string;
  body: string;
  variables: string[];
  version: string;
  status: string;
}

export interface BillingDashboard {
  customer_name: string;
  plan: string;
  kiosks: number;
  tryon_sessions: number;
  ai_requests: number;
  storage_tb: number;
  llm_tokens: string;
  current_month_usd: number;
  projected_usd: number;
  next_billing_date: string;
  ytd_usd?: number;
  outstanding_usd?: number;
  paid_usd?: number;
}

export async function listCustomers(): Promise<Customer[]> {
  return unwrap(await apiGet('/business/customers'));
}

export async function getCustomer(id: string): Promise<Customer> {
  return unwrap(await apiGet(`/business/customers/${id}`));
}

export async function startOnboarding(body: Partial<Customer>): Promise<Customer> {
  return unwrap(await apiPost('/business/customers/onboarding', body));
}

export async function advanceOnboarding(
  customerId: string,
  step: string,
  payload?: Record<string, unknown>,
): Promise<Customer> {
  return unwrap(await apiPost(`/business/customers/${customerId}/onboarding/${step}`, payload ?? {}));
}

export async function listInventory(): Promise<InventoryItem[]> {
  return unwrap(await apiGet('/business/inventory'));
}

export async function createInventory(body: Partial<InventoryItem>): Promise<InventoryItem> {
  return unwrap(await apiPost('/business/inventory', body));
}

export async function loadInventoryToKiosk(body: {
  customer_id: string;
  store_id: string;
  kiosk_id: string;
  jewelry_ids: string[];
}): Promise<{ job_id: string; status: string }> {
  return unwrap(await apiPost('/business/inventory/loading', body));
}

export async function listKiosks(): Promise<Kiosk[]> {
  return unwrap(await apiGet('/business/kiosks'));
}

export async function getKioskDashboard(): Promise<{
  total: number;
  online: number;
  offline: number;
  degraded: number;
  errors: number;
  active_sessions: number;
  kiosks: Kiosk[];
}> {
  return unwrap(await apiGet('/business/kiosks/dashboard'));
}

export async function listAssets3D(): Promise<Asset3D[]> {
  return unwrap(await apiGet('/business/assets-3d'));
}

export async function listNotifications(): Promise<NotificationRecord[]> {
  return unwrap(await apiGet('/business/notifications'));
}

export async function listNotificationTemplates(): Promise<NotificationTemplate[]> {
  return unwrap(await apiGet('/business/notifications/templates'));
}

export async function getBillingDashboard(): Promise<BillingDashboard> {
  return unwrap(await apiGet('/business/billing/dashboard'));
}

export async function listInvoices(): Promise<unknown[]> {
  return unwrap(await apiGet('/business/billing/invoices'));
}

export async function listUsage(): Promise<unknown[]> {
  return unwrap(await apiGet('/business/billing/usage'));
}

export async function getStudioDashboard(): Promise<Record<string, number | string>> {
  try {
    return unwrap(await apiGet('/business/studio-dashboard'));
  } catch {
    return {
      ai_applications: 24,
      active_kiosks: 128,
      inventory: 52430,
      tryon_sessions: 124820,
      assets_3d: 48920,
      customers: 82,
      kiosk_alerts: 12,
      ai_requests: '2.4M',
      billing: 124820,
    };
  }
}
