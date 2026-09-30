import { apiGet, apiPost, apiUpload } from './apiClient';

export type JewelryCategory =
  | 'earrings'
  | 'necklace'
  | 'ring'
  | 'bracelet'
  | 'bangles';

export interface JewelryProduct {
  id: string;
  name: string;
  category: JewelryCategory;
  price: number;
  currency: string;
  available: boolean;
  thumbnailUrl: string;
  assetUrl: string;
  sku: string;
}

export interface TryOnSession {
  id: string;
  status: 'idle' | 'loading' | 'active' | 'completed' | 'error';
  userImageUrl?: string;
  selectedProductId?: string;
  resultImageUrl?: string;
  job_id?: string;
}

export interface AiRecommendation {
  productId: string;
  score: number;
  reason: string;
  product?: JewelryProduct;
}

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
}

function unwrap<T>(payload: T | ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    const env = payload as ApiEnvelope<T>;
    if (env.data !== undefined) return env.data;
  }
  return payload as T;
}

export async function listProducts(category?: JewelryCategory): Promise<JewelryProduct[]> {
  const query = category ? `?category=${category}` : '';
  const res = await apiGet<ApiEnvelope<JewelryProduct[]> | JewelryProduct[]>(`/tryon/products${query}`);
  return unwrap(res);
}

export async function createSession(): Promise<TryOnSession> {
  const res = await apiPost<ApiEnvelope<TryOnSession> | TryOnSession>('/tryon/sessions');
  return unwrap(res);
}

export async function uploadUserImage(sessionId: string, file: File): Promise<TryOnSession> {
  const formData = new FormData();
  formData.append('image', file);
  try {
    const res = await apiUpload<ApiEnvelope<TryOnSession> | TryOnSession>(
      `/tryon/sessions/${sessionId}/image`,
      formData,
    );
    return unwrap(res);
  } catch {
    // JSON fallback when multipart is not required by MVP backend
    const res = await apiPost<ApiEnvelope<TryOnSession> | TryOnSession>(
      `/tryon/sessions/${sessionId}/image`,
      { filename: file.name },
    );
    return unwrap(res);
  }
}

export async function startTryOn(
  sessionId: string,
  productId: string,
): Promise<TryOnSession> {
  const res = await apiPost<ApiEnvelope<TryOnSession> | TryOnSession>(
    `/tryon/sessions/${sessionId}/start`,
    { productId },
  );
  return unwrap(res);
}

/** Canonical async try-on job API (same backend orchestration). */
export async function submitTryOnJob(input: {
  jewelry_id: string;
  jewelry_category: string;
  user_image_url?: string;
  session_id?: string;
}): Promise<{ job_id: string; status: string }> {
  const res = await apiPost<ApiEnvelope<{ job_id: string; status: string }> | { job_id: string; status: string }>(
    '/tryon',
    input,
  );
  return unwrap(res);
}

export async function getTryOnJob(jobId: string): Promise<unknown> {
  const res = await apiGet<ApiEnvelope<unknown> | unknown>(`/tryon/${jobId}`);
  return unwrap(res);
}

export async function captureResult(sessionId: string): Promise<{ imageUrl: string }> {
  const res = await apiPost<ApiEnvelope<{ imageUrl: string }> | { imageUrl: string }>(
    `/tryon/sessions/${sessionId}/capture`,
  );
  return unwrap(res);
}

export async function getRecommendations(sessionId: string): Promise<AiRecommendation[]> {
  const res = await apiGet<ApiEnvelope<AiRecommendation[]> | AiRecommendation[]>(
    `/tryon/sessions/${sessionId}/recommendations`,
  );
  return unwrap(res);
}

export async function addToCart(sessionId: string, productId: string): Promise<void> {
  await apiPost(`/tryon/sessions/${sessionId}/cart`, { productId });
}
