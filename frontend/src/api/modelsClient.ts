import { apiGet, apiPost, apiPut } from './apiClient';

export interface Model {
  id: string;
  name: string;
  provider: string;
  version: string;
  status: 'active' | 'deprecated' | 'draft';
  capabilities: string[];
  createdAt: string;
}

export interface ModelRegistryEntry extends Model {
  registeredAt: string;
  owner: string;
  tags: string[];
}

export interface GatewayRoute {
  id: string;
  name: string;
  modelId: string;
  priority: number;
  status: 'enabled' | 'disabled';
  requestsPerMinute: number;
}

export async function listModels(): Promise<Model[]> {
  return apiGet<Model[]>('/models');
}

export async function getModel(id: string): Promise<Model> {
  return apiGet<Model>(`/models/${id}`);
}

export async function listRegistryEntries(): Promise<ModelRegistryEntry[]> {
  return apiGet<ModelRegistryEntry[]>('/models/registry');
}

export async function registerModel(entry: Partial<ModelRegistryEntry>): Promise<ModelRegistryEntry> {
  return apiPost<ModelRegistryEntry>('/models/registry', entry);
}

export async function listGatewayRoutes(): Promise<GatewayRoute[]> {
  return apiGet<GatewayRoute[]>('/models/gateway/routes');
}

export async function updateGatewayRoute(
  id: string,
  data: Partial<GatewayRoute>,
): Promise<GatewayRoute> {
  return apiPut<GatewayRoute>(`/models/gateway/routes/${id}`, data);
}
