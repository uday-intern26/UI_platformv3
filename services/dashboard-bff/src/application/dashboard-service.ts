import { MODULE_CATALOGUE, type DashboardModule } from "../domain/modules.js";

async function probeHealth(url: string): Promise<"healthy" | "unhealthy" | "unknown"> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
    return res.ok ? "healthy" : "unhealthy";
  } catch {
    return "unknown";
  }
}

export class DashboardService {
  constructor(
    private readonly onboardingUrl = process.env.CUSTOMER_ONBOARDING_URL ??
      "http://127.0.0.1:5003",
    private readonly modelGatewayUrl = process.env.MODEL_GATEWAY_URL ??
      "http://127.0.0.1:8101",
  ) {}

  modules(): DashboardModule[] {
    return MODULE_CATALOGUE.filter((m) => m.status !== "excluded");
  }

  async summary(authToken?: string) {
    const modules = this.modules();
    const business = modules.filter((m) => m.category === "business");
    const platform = modules.filter((m) => m.category === "platform");
    const administration = modules.filter((m) => m.category === "administration");
    const active = modules.filter((m) => m.status === "active");

    let activeTenants = 0;
    try {
      const token = authToken ?? process.env.AIJEWEL_SERVICE_TOKEN;
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
      const res = await fetch(`${this.onboardingUrl}/v1/onboarding/applications`, {
        headers,
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          items: Array<{ status: string }>;
        };
        activeTenants = data.items.filter((i) => i.status === "activated").length;
      }
    } catch {
      // Derive from live services when available; otherwise zero — never invent production metrics.
    }

    return {
      platformName: "AIJewel Enterprise Platform",
      environment: process.env.AIJEWEL_ENV ?? "local",
      businessApplicationCount: business.length,
      aiPlatformServiceCount: platform.length,
      enterpriseAdministrationCount: administration.length,
      activeModuleCount: active.length,
      activeTenants,
      systemStatus: "operational",
      systemStatusMessage: "Local development — health from live probes",
    };
  }

  async health() {
    const probes = await Promise.all(
      this.modules()
        .filter((m) => m.healthUrl)
        .map(async (m) => ({
          id: m.id,
          name: m.name,
          status: await probeHealth(m.healthUrl!),
          url: m.healthUrl,
        })),
    );
    const unhealthy = probes.filter((p) => p.status === "unhealthy").length;
    const unknown = probes.filter((p) => p.status === "unknown").length;
    return {
      overall:
        unhealthy > 0 ? "degraded" : unknown === probes.length ? "unknown" : "healthy",
      services: probes,
      checkedAt: new Date().toISOString(),
    };
  }

  async activity() {
    return {
      items: [
        {
          type: "info",
          message: "Milestone 1 services available: Customer Onboarding, Model Gateway, Dashboard BFF",
          at: new Date().toISOString(),
        },
      ],
    };
  }

  quickActions() {
    return {
      items: [
        {
          id: "launch-onboarding",
          label: "Start Customer Onboarding",
          href: "/admin/onboarding",
          serviceId: "customer-onboarding",
        },
        {
          id: "open-model-gateway",
          label: "Open Model Gateway",
          href: "/platform/model-gateway",
          serviceId: "model-gateway",
        },
        {
          id: "view-api-docs",
          label: "API Docs",
          href: "/docs/api",
        },
      ],
    };
  }

  async globalSearch(q: string) {
    const query = q.trim().toLowerCase();
    const modules = this.modules().filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.id.includes(query),
    );
    return {
      query: q,
      results: modules.map((m) => ({
        type: "module",
        id: m.id,
        title: m.name,
        category: m.category,
        description: m.description,
      })),
    };
  }
}
