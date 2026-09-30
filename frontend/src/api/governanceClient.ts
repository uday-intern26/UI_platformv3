import { apiGet, apiPost, apiPut } from './apiClient';

export interface AiPolicy {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'compliance' | 'guardrail' | 'general';
  status: 'active' | 'draft' | 'disabled';
  rules: PolicyRule[];
  updatedAt: string;
}

export interface PolicyRule {
  id: string;
  condition: string;
  action: 'allow' | 'deny' | 'review' | 'log';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  outcome: 'success' | 'failure';
}

export async function listPolicies(): Promise<AiPolicy[]> {
  return apiGet<AiPolicy[]>('/governance/policies');
}

export async function getPolicy(id: string): Promise<AiPolicy> {
  return apiGet<AiPolicy>(`/governance/policies/${id}`);
}

export async function createPolicy(data: Partial<AiPolicy>): Promise<AiPolicy> {
  return apiPost<AiPolicy>('/governance/policies', data);
}

export async function updatePolicy(id: string, data: Partial<AiPolicy>): Promise<AiPolicy> {
  return apiPut<AiPolicy>(`/governance/policies/${id}`, data);
}

export async function listAuditLog(limit = 50): Promise<AuditEntry[]> {
  return apiGet<AuditEntry[]>(`/governance/audit?limit=${limit}`);
}
