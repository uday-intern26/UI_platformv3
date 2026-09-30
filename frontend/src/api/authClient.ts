import { apiGet, apiPost } from './apiClient';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  roles: string[];
  tenantId: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
}

export interface Environment {
  id: string;
  name: string;
  slug: string;
}

export async function getCurrentUser(): Promise<UserProfile> {
  return apiGet<UserProfile>('/auth/me');
}

export async function listTenants(): Promise<Tenant[]> {
  return apiGet<Tenant[]>('/auth/tenants');
}

export async function listEnvironments(): Promise<Environment[]> {
  return apiGet<Environment[]>('/auth/environments');
}

export async function login(email: string, password: string): Promise<{ token: string }> {
  return apiPost<{ token: string }>('/auth/login', { email, password });
}

export async function logout(): Promise<void> {
  await apiPost<void>('/auth/logout');
}
