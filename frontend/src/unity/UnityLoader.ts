import { UnityEventHandler } from './UnityEventHandler';

export interface UnityLoaderConfig {
  buildUrl: string;
  loaderUrl: string;
  companyName?: string;
  productName?: string;
  productVersion?: string;
  memoryLimit?: number;
  loadingTimeout?: number;
}

export interface UnityInstance {
  SendMessage: (objectName: string, methodName: string, value?: string) => void;
  Quit: () => Promise<void>;
  SetFullscreen: (fullscreen: number) => void;
}

declare global {
  interface Window {
    createUnityInstance?: (
      canvas: HTMLCanvasElement,
      config: Record<string, unknown>,
      onProgress?: (progress: number) => void,
    ) => Promise<UnityInstance>;
  }
}

export class UnityLoader {
  private instance: UnityInstance | null = null;
  private scriptEl: HTMLScriptElement | null = null;
  private loading = false;

  constructor(
    private readonly eventHandler: UnityEventHandler,
    private readonly config: UnityLoaderConfig,
  ) {}

  get isLoaded(): boolean {
    return this.instance !== null;
  }

  get isLoading(): boolean {
    return this.loading;
  }

  async load(canvas: HTMLCanvasElement): Promise<UnityInstance> {
    if (this.instance) return this.instance;
    if (this.loading) {
      throw new Error('Unity is already loading');
    }

    this.loading = true;
    this.eventHandler.emit({ type: 'loading', message: 'Loading Unity WebGL build' });

    const timeoutMs = this.config.loadingTimeout ?? 60000;
    const loadPromise = this.loadScript()
      .then(() => this.createInstance(canvas))
      .then((instance) => {
        this.instance = instance;
        this.eventHandler.emit({ type: 'ready', message: 'Unity instance ready' });
        return instance;
      });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Unity loading timeout')), timeoutMs);
    });

    try {
      return await Promise.race([loadPromise, timeoutPromise]);
    } catch (error) {
      this.eventHandler.emit({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unity load failed',
      });
      throw error;
    } finally {
      this.loading = false;
    }
  }

  getInstance(): UnityInstance | null {
    return this.instance;
  }

  sendMessage(objectName: string, methodName: string, value?: string): void {
    if (!this.instance) {
      throw new Error('Unity instance not loaded');
    }
    this.instance.SendMessage(objectName, methodName, value);
  }

  async dispose(): Promise<void> {
    if (this.instance) {
      try {
        await this.instance.Quit();
      } catch {
        // Unity may already be disposed
      }
      this.instance = null;
    }
    if (this.scriptEl?.parentNode) {
      this.scriptEl.parentNode.removeChild(this.scriptEl);
      this.scriptEl = null;
    }
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.createUnityInstance) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = this.config.loaderUrl;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load Unity loader: ${this.config.loaderUrl}`));
      document.body.appendChild(script);
      this.scriptEl = script;
    });
  }

  private async createInstance(canvas: HTMLCanvasElement): Promise<UnityInstance> {
    if (!window.createUnityInstance) {
      throw new Error('Unity loader not available');
    }

    const onProgress = (progress: number) => {
      this.eventHandler.emit({
        type: 'loading',
        data: { progress },
        message: `Loading ${Math.round(progress * 100)}%`,
      });
    };

    return window.createUnityInstance(
      canvas,
      {
        dataUrl: `${this.config.buildUrl}/Build.data`,
        frameworkUrl: `${this.config.buildUrl}/Build.framework.js`,
        codeUrl: `${this.config.buildUrl}/Build.wasm`,
        companyName: this.config.companyName ?? 'AIJewel',
        productName: this.config.productName ?? 'VirtualTryOn',
        productVersion: this.config.productVersion ?? '1.0.0',
      },
      onProgress,
    );
  }
}
