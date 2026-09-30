export interface ApiContext {
  tenantId: string;
  userId: string;
  applicationId?: string;
  environment: string;
  correlationId?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

let context: ApiContext = {
  tenantId: 'tenant-demo',
  userId: 'user-demo',
  environment: 'DEV',
};

export function setApiContext(partial: Partial<ApiContext>): void {
  context = { ...context, ...partial };
}

export function getApiContext(): ApiContext {
  return { ...context };
}

function generateCorrelationId(): string {
  return crypto.randomUUID();
}

function buildHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set('Content-Type', 'application/json');
  headers.set('X-Tenant-Id', context.tenantId);
  headers.set('X-User-Id', context.userId);
  headers.set('X-Environment', context.environment);
  headers.set('X-Correlation-Id', context.correlationId ?? generateCorrelationId());
  if (context.applicationId) {
    headers.set('X-Application-Id', context.applicationId);
  }
  return headers;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiClientError(
      response.status,
      data?.message ?? response.statusText,
      data,
    );
  }

  return data as T;
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    method: 'GET',
    headers: buildHeaders(init?.headers),
  });
  return parseResponse<T>(response);
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    method: 'POST',
    headers: buildHeaders(init?.headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(response);
}

export async function apiPut<T>(
  path: string,
  body?: unknown,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    method: 'PUT',
    headers: buildHeaders(init?.headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(response);
}

export async function apiDelete<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    method: 'DELETE',
    headers: buildHeaders(init?.headers),
  });
  return parseResponse<T>(response);
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
  init?: RequestInit,
): Promise<T> {
  const headers = buildHeaders(init?.headers);
  headers.delete('Content-Type');

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    method: 'POST',
    headers,
    body: formData,
  });
  return parseResponse<T>(response);
}
