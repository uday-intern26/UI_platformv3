import { UnityAssetManager, JewelryAssetDescriptor, UserImageDescriptor } from './UnityAssetManager';
import { UnityEventHandler, UnityEventPayload } from './UnityEventHandler';
import { UnityLoader, UnityLoaderConfig } from './UnityLoader';

const UNITY_ENTRY_OBJECT = 'TryOnController';

export interface TryOnBridgeConfig extends UnityLoaderConfig {
  entryPoint?: string;
}

export class UnityTryOnBridge {
  private loader: UnityLoader;
  private assetManager = new UnityAssetManager();
  private canvas: HTMLCanvasElement | null = null;
  private entryPoint: string;

  constructor(
    private readonly eventHandler: UnityEventHandler,
    config: TryOnBridgeConfig,
  ) {
    this.entryPoint = config.entryPoint ?? UNITY_ENTRY_OBJECT;
    this.loader = new UnityLoader(eventHandler, config);

    if (typeof window !== 'undefined') {
      (window as unknown as Record<string, unknown>).onUnityMessage = (msg: string) => {
        this.eventHandler.handleUnityMessage(msg);
      };
    }
  }

  get events(): UnityEventHandler {
    return this.eventHandler;
  }

  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    await this.loader.load(canvas);
  }

  loadJewelryAsset(descriptor: JewelryAssetDescriptor): void {
    this.assetManager.registerAsset(descriptor);
    this.send('LoadJewelryAsset', this.assetManager.serializeAssetForUnity(descriptor.id));
    this.eventHandler.emit({ type: 'asset_loaded', data: { assetId: descriptor.id } });
  }

  loadUserImage(image: UserImageDescriptor): void {
    this.assetManager.setUserImage(image);
    this.send('LoadUserImage', this.assetManager.serializeUserImageForUnity());
  }

  startTryOn(productId: string, config?: Record<string, unknown>): void {
    this.send('StartTryOn', JSON.stringify({ productId, ...config }));
    this.eventHandler.emit({ type: 'tryon_started', data: { productId } });
  }

  updateJewelry(params: Record<string, unknown>): void {
    this.send('UpdateJewelry', JSON.stringify(params));
  }

  removeJewelry(): void {
    this.send('RemoveJewelry');
  }

  captureResult(): void {
    this.send('CaptureResult');
  }

  reset(): void {
    this.send('Reset');
    this.assetManager.clear();
  }

  async dispose(): Promise<void> {
    this.reset();
    this.eventHandler.clear();
    await this.loader.dispose();
    this.canvas = null;
  }

  on(event: UnityEventPayload['type'] | '*', listener: (payload: UnityEventPayload) => void) {
    return this.eventHandler.on(event, listener);
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  isReady(): boolean {
    return this.loader.isLoaded;
  }

  private send(method: string, value?: string): void {
    if (!this.loader.isLoaded) {
      throw new Error('Unity bridge not initialized. Call initialize() first.');
    }
    this.loader.sendMessage(this.entryPoint, method, value);
  }
}

export function createUnityTryOnBridge(config: TryOnBridgeConfig): UnityTryOnBridge {
  const eventHandler = new UnityEventHandler();
  return new UnityTryOnBridge(eventHandler, config);
}
