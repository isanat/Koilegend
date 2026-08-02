/**
 * KOI LEGEND ENGINE — ResourceManager
 * Centralized asset management, async streaming, caching, and VRAM memory tracking.
 */

export interface AssetHandle<T> {
  id: string;
  url: string;
  data?: T;
  isLoaded: boolean;
  byteSize: number;
}

export class ResourceManager {
  private static instance: ResourceManager;
  private assets: Map<string, AssetHandle<any>> = new Map();
  private totalAllocatedMemory: number = 0;
  private readonly vramBudgetBytes: number = 512 * 1024 * 1024; // 512 MB

  private constructor() {}

  public static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  public async loadAsset<T>(id: string, url: string, loader: (url: string) => Promise<{ data: T; byteSize: number }>): Promise<T> {
    if (this.assets.has(id)) {
      const handle = this.assets.get(id)!;
      if (handle.isLoaded) return handle.data;
    }

    const result = await loader(url);

    if (this.totalAllocatedMemory + result.byteSize > this.vramBudgetBytes) {
      console.warn(`[ResourceManager] VRAM Budget warning: ${this.totalAllocatedMemory / (1024 * 1024)}MB used.`);
    }

    const handle: AssetHandle<T> = {
      id,
      url,
      data: result.data,
      isLoaded: true,
      byteSize: result.byteSize,
    };

    this.assets.set(id, handle);
    this.totalAllocatedMemory += result.byteSize;

    return result.data;
  }

  public unloadAsset(id: string): void {
    const handle = this.assets.get(id);
    if (handle) {
      this.totalAllocatedMemory -= handle.byteSize;
      this.assets.delete(id);
    }
  }

  public getAllocatedVRAMMB(): number {
    return parseFloat((this.totalAllocatedMemory / (1024 * 1024)).toFixed(2));
  }

  public clearCache(): void {
    this.assets.clear();
    this.totalAllocatedMemory = 0;
  }
}
