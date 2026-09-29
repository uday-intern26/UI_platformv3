export type { paths as CustomerOnboardingPaths } from "./generated/customer-onboarding.js";
export type { paths as ModelGatewayPaths } from "./generated/model-gateway.js";
export type { paths as DashboardBffPaths } from "./generated/dashboard-bff.js";

export const SERVICE_BASE_URLS = {
  customerOnboarding: "http://127.0.0.1:5003",
  modelGateway: "http://127.0.0.1:8101",
  dashboardBff: "http://127.0.0.1:3001",
} as const;

export async function apiFetch<T>(
  baseUrl: string,
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
  const res = await fetch(`${baseUrl}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}
