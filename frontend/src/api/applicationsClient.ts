import { apiGet, apiPost, apiPut } from './apiClient';

export interface Application {
  id: string;
  name: string;
  description: string;
  businessDomain: string;
  owner: string;
  environment: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  updatedAt: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ApplicationWorkflow {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface ApplicationDetail extends Application {
  workflow: ApplicationWorkflow;
}

export async function listApplications(): Promise<Application[]> {
  return apiGet<Application[]>('/applications');
}

export async function getApplication(id: string): Promise<ApplicationDetail> {
  return apiGet<ApplicationDetail>(`/applications/${id}`);
}

export async function createApplication(data: Partial<Application>): Promise<Application> {
  return apiPost<Application>('/applications', data);
}

export async function updateApplication(
  id: string,
  data: Partial<Application>,
): Promise<Application> {
  return apiPut<Application>(`/applications/${id}`, data);
}

export async function saveWorkflow(
  id: string,
  workflow: ApplicationWorkflow,
): Promise<ApplicationDetail> {
  return apiPut<ApplicationDetail>(`/applications/${id}/workflow`, workflow);
}
