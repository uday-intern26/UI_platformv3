export interface JewelryAssetDescriptor {
  id: string;
  url: string;
  category: string;
  format: 'glb' | 'gltf' | 'fbx' | 'unity_assetbundle';
  metadata?: Record<string, unknown>;
}

export interface UserImageDescriptor {
  url: string;
  width?: number;
  height?: number;
}

export class UnityAssetManager {
  private loadedAssets = new Map<string, JewelryAssetDescriptor>();
  private currentUserImage: UserImageDescriptor | null = null;

  registerAsset(descriptor: JewelryAssetDescriptor): void {
    this.loadedAssets.set(descriptor.id, descriptor);
  }

  getAsset(id: string): JewelryAssetDescriptor | undefined {
    return this.loadedAssets.get(id);
  }

  setUserImage(image: UserImageDescriptor): void {
    this.currentUserImage = image;
  }

  getUserImage(): UserImageDescriptor | null {
    return this.currentUserImage;
  }

  clear(): void {
    this.loadedAssets.clear();
    this.currentUserImage = null;
  }

  serializeAssetForUnity(id: string): string {
    const asset = this.loadedAssets.get(id);
    if (!asset) {
      throw new Error(`Asset not found: ${id}`);
    }
    return JSON.stringify(asset);
  }

  serializeUserImageForUnity(): string {
    if (!this.currentUserImage) {
      throw new Error('No user image loaded');
    }
    return JSON.stringify(this.currentUserImage);
  }
}
