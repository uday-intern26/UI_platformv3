export type UnityEventType =
  | 'ready'
  | 'loading'
  | 'loaded'
  | 'error'
  | 'tryon_started'
  | 'tryon_complete'
  | 'capture_complete'
  | 'asset_loaded';

export interface UnityEventPayload {
  type: UnityEventType;
  message?: string;
  data?: Record<string, unknown>;
}

type UnityEventListener = (payload: UnityEventPayload) => void;

export class UnityEventHandler {
  private listeners = new Map<UnityEventType | '*', Set<UnityEventListener>>();

  on(event: UnityEventType | '*', listener: UnityEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.listeners.get(event)?.delete(listener);
  }

  emit(payload: UnityEventPayload): void {
    const specific = this.listeners.get(payload.type);
    specific?.forEach((fn) => fn(payload));

    const wildcard = this.listeners.get('*');
    wildcard?.forEach((fn) => fn(payload));
  }

  handleUnityMessage(message: string): void {
    try {
      const parsed = JSON.parse(message) as UnityEventPayload;
      this.emit(parsed);
    } catch {
      this.emit({ type: 'error', message: `Invalid Unity message: ${message}` });
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
