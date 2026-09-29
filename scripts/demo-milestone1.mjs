import { signLocalJwt } from "@aijewel/shared-node";

const secret = process.env.AIJEWEL_JWT_SECRET ?? "local-dev-jwt-secret-change-me";
const token = await signLocalJwt(
  {
    sub: "user_priya_sharma",
    tenantId: "ten_platform",
    organizationId: "org_platform",
    roles: ["system_admin"],
    permissions: ["*"],
  },
  secret,
  "12h",
);

async function api(base, path, { method = "GET", body } = {}) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Correlation-ID": "demo-milestone-1",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${text}`);
  }
  return data;
}

const ONB = "http://127.0.0.1:5003";
const GW = "http://127.0.0.1:8101";
const BFF = "http://127.0.0.1:3001";

const summary = await api(BFF, "/v1/dashboard/summary");
console.log("Dashboard:", summary);

const app = await api(ONB, "/v1/onboarding/applications", { method: "POST", body: {} });
const id = app.applicationId;
console.log("Created application:", id);

const unique = Date.now();
const email = `admin+${unique}@sharma.example`;

await api(ONB, `/v1/onboarding/applications/${id}/business`, {
  method: "PATCH",
  body: {
    legalName: "Sharma Jewellers Pvt Ltd",
    country: "IN",
    contactEmail: email,
    region: "KA",
  },
});
await api(ONB, `/v1/onboarding/applications/${id}/plan`, {
  method: "POST",
  body: { planId: "plan_growth" },
});
await api(ONB, `/v1/onboarding/applications/${id}/branches`, {
  method: "POST",
  body: { name: "MG Road", city: "Bengaluru" },
});
await api(ONB, `/v1/onboarding/applications/${id}/admin-invitation`, {
  method: "POST",
  body: { email },
});
await api(ONB, `/v1/onboarding/applications/${id}/kiosks`, {
  method: "POST",
  body: { label: "Kiosk-01" },
});
await api(ONB, `/v1/onboarding/applications/${id}/validate`, {
  method: "POST",
  body: {},
});
const activated = await api(ONB, `/v1/onboarding/applications/${id}/activate`, {
  method: "POST",
  body: {},
});
console.log("Activated tenant:", activated.tenantId, activated.status);

const chat = await api(GW, "/v1/inference/chat", {
  method: "POST",
  body: {
    messages: [{ role: "user", content: "Suggest bridal necklace styles" }],
    model: "jewellery-assistant",
  },
});
console.log("Model Gateway (mocked):", chat.mocked, chat.output.content);

const after = await api(BFF, "/v1/dashboard/summary");
console.log("Active tenants after activation:", after.activeTenants);

const modules = await api(BFF, "/v1/dashboard/modules");
console.log("Module counts:", modules.counts);

console.log("\nMilestone 1 demo OK");
