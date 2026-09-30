import { apiGet, apiPost, apiPut } from './apiClient';

export interface Prompt {
  id: string;
  name: string;
  description: string;
  template: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  updatedAt: string;
}

export interface PromptRegistryEntry extends Prompt {
  registeredAt: string;
  owner: string;
  usageCount: number;
}

export async function listPrompts(): Promise<Prompt[]> {
  return apiGet<Prompt[]>('/prompts');
}

export async function getPrompt(id: string): Promise<Prompt> {
  return apiGet<Prompt>(`/prompts/${id}`);
}

export async function createPrompt(data: Partial<Prompt>): Promise<Prompt> {
  return apiPost<Prompt>('/prompts', data);
}

export async function updatePrompt(id: string, data: Partial<Prompt>): Promise<Prompt> {
  return apiPut<Prompt>(`/prompts/${id}`, data);
}

export async function listPromptRegistry(): Promise<PromptRegistryEntry[]> {
  return apiGet<PromptRegistryEntry[]>('/prompts/registry');
}

export async function registerPrompt(
  data: Partial<PromptRegistryEntry>,
): Promise<PromptRegistryEntry> {
  return apiPost<PromptRegistryEntry>('/prompts/registry', data);
}
