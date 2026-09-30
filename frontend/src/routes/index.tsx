import { Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { PlaceholderPage } from '../components/layout/PlaceholderPage';
import { ApplicationBuilderPage } from '../pages/ApplicationBuilderPage';
import { ApplicationsPage } from '../pages/ApplicationsPage';
import {
  BillingDashboardPage,
  InvoicesPage,
  NotificationCenterPage,
  UsagePage,
} from '../pages/business/BillingNotificationsPages';
import { CustomerOnboardingPage } from '../pages/business/CustomerOnboardingPage';
import { InventoryCatalogPage } from '../pages/business/InventoryCatalogPage';
import { KioskDashboardPage, KioskMonitoringPage } from '../pages/business/KioskDashboardPage';
import { Dashboard } from '../pages/Dashboard';
import { GovernancePoliciesPage } from '../pages/GovernancePoliciesPage';
import { LlmOpsPage } from '../pages/LlmOpsPage';
import { ModelGatewayPage } from '../pages/ModelGatewayPage';
import { ModelRegistryPage } from '../pages/ModelRegistryPage';
import { ModelsPage } from '../pages/ModelsPage';
import { ObservabilityPage } from '../pages/ObservabilityPage';
import { PromptBuilderPage } from '../pages/PromptBuilderPage';
import { PromptRegistryPage } from '../pages/PromptRegistryPage';
import { PromptsPage } from '../pages/PromptsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { TryOnPage } from '../pages/TryOnPage';

function Placeholder({ title }: { title: string }) {
  return <PlaceholderPage title={title} />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />

        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="applications/builder" element={<ApplicationBuilderPage />} />
        <Route path="workflows" element={<PromptBuilderPage />} />
        <Route path="agents" element={<Placeholder title="Agents" />} />

        <Route path="models" element={<ModelsPage />} />
        <Route path="model-gateway" element={<ModelGatewayPage />} />
        <Route path="model-registry" element={<ModelRegistryPage />} />
        <Route path="prompts" element={<PromptsPage />} />
        <Route path="prompt-registry" element={<PromptRegistryPage />} />
        <Route path="rag" element={<Placeholder title="RAG" />} />
        <Route path="vector-stores" element={<Placeholder title="Vector Stores" />} />
        <Route path="tools" element={<Placeholder title="Tools" />} />

        <Route path="data-sources" element={<Placeholder title="Data Sources" />} />
        <Route path="datasets" element={<Placeholder title="Datasets" />} />
        <Route path="feature-store" element={<Placeholder title="Feature Store" />} />
        <Route path="knowledge-bases" element={<Placeholder title="Knowledge Bases" />} />

        <Route path="business/customers/onboarding" element={<CustomerOnboardingPage />} />
        <Route path="business/customers" element={<CustomerOnboardingPage />} />
        <Route path="business/inventory/create" element={<InventoryCatalogPage />} />
        <Route path="business/inventory/catalog" element={<InventoryCatalogPage />} />
        <Route path="business/inventory/loading" element={<InventoryCatalogPage />} />
        <Route path="business/inventory/status" element={<InventoryCatalogPage />} />
        <Route path="business/kiosks" element={<KioskDashboardPage />} />
        <Route path="business/kiosks/inventory" element={<KioskDashboardPage />} />
        <Route
          path="business/kiosks/assets"
          element={<Placeholder title="3D Asset Management" />}
        />
        <Route path="business/kiosks/monitoring" element={<KioskMonitoringPage />} />
        <Route path="business/kiosks/health" element={<KioskMonitoringPage />} />
        <Route path="business/kiosks/sync" element={<KioskMonitoringPage />} />
        <Route path="business/notifications" element={<NotificationCenterPage />} />
        <Route path="business/notifications/customer" element={<NotificationCenterPage />} />
        <Route path="business/notifications/templates" element={<NotificationCenterPage />} />
        <Route path="business/billing" element={<BillingDashboardPage />} />
        <Route path="business/billing/subscriptions" element={<BillingDashboardPage />} />
        <Route path="business/billing/invoices" element={<InvoicesPage />} />
        <Route path="business/billing/transactions" element={<InvoicesPage />} />
        <Route path="business/billing/usage" element={<UsagePage />} />
        <Route path="business/billing/payments" element={<InvoicesPage />} />

        <Route path="governance/policies" element={<GovernancePoliciesPage />} />
        <Route path="governance/security" element={<GovernancePoliciesPage />} />
        <Route path="governance/compliance" element={<Placeholder title="Compliance" />} />
        <Route path="governance/guardrails" element={<Placeholder title="Guardrails" />} />
        <Route path="governance/audit" element={<GovernancePoliciesPage />} />

        <Route path="observability" element={<ObservabilityPage />} />
        <Route path="llm-ops" element={<LlmOpsPage />} />
        <Route path="evaluations" element={<Placeholder title="Evaluations" />} />
        <Route path="cost-management" element={<Placeholder title="Cost Management" />} />
        <Route path="performance" element={<Placeholder title="Performance" />} />

        <Route path="settings" element={<SettingsPage />} />
        <Route path="admin/users" element={<Placeholder title="Users" />} />
        <Route path="admin/roles" element={<Placeholder title="Roles" />} />
        <Route path="admin/api-keys" element={<SettingsPage />} />
        <Route path="admin/environments" element={<Placeholder title="Environments" />} />
        <Route path="admin/tenants" element={<Placeholder title="Tenants" />} />
        <Route path="admin/configuration" element={<Placeholder title="Configuration" />} />

        <Route path="tryon" element={<TryOnPage />} />
      </Route>
    </Routes>
  );
}
