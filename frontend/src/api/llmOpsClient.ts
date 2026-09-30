import { apiGet } from './apiClient';

export interface LlmMetric {
  timestamp: string;
  requests: number;
  tokensIn: number;
  tokensOut: number;
  latencyP50: number;
  latencyP99: number;
  errorRate: number;
  costUsd: number;
}

export interface LlmOpsSummary {
  totalRequests: number;
  totalTokens: number;
  totalCostUsd: number;
  avgLatencyMs: number;
  errorRate: number;
  activeModels: number;
}

export interface EvaluationResult {
  id: string;
  name: string;
  modelId: string;
  score: number;
  status: 'passed' | 'failed' | 'running';
  completedAt: string;
}

export interface ObservabilityTrace {
  id: string;
  traceId: string;
  spanName: string;
  durationMs: number;
  status: 'ok' | 'error';
  modelId?: string;
  timestamp: string;
}

export async function getLlmOpsSummary(): Promise<LlmOpsSummary> {
  return apiGet<LlmOpsSummary>('/llm-ops/summary');
}

export async function getLlmMetrics(range = '24h'): Promise<LlmMetric[]> {
  return apiGet<LlmMetric[]>(`/llm-ops/metrics?range=${range}`);
}

export async function listEvaluations(): Promise<EvaluationResult[]> {
  return apiGet<EvaluationResult[]>('/llm-ops/evaluations');
}

export async function listTraces(limit = 100): Promise<ObservabilityTrace[]> {
  return apiGet<ObservabilityTrace[]>(`/observability/traces?limit=${limit}`);
}

export async function getCostBreakdown(): Promise<{ category: string; amount: number }[]> {
  return apiGet<{ category: string; amount: number }[]>('/llm-ops/cost/breakdown');
}
