/**
 * KOI LEGEND ENGINE — RenderGraph & Pass Architecture
 * Decoupled graph pipeline orchestrating geometry, water, particle, and post-processing passes.
 */

export interface RenderContext {
  gl?: WebGL2RenderingContext;
  device?: GPUDevice;
  deltaTime: number;
  totalTime: number;
  viewportWidth: number;
  viewportHeight: number;
  cameraMatrix: Float32Array;
  projectionMatrix: Float32Array;
}

export abstract class RenderPass {
  public name: string;
  public enabled: boolean = true;
  public priority: number = 0;

  constructor(name: string, priority: number = 0) {
    this.name = name;
    this.priority = priority;
  }

  public abstract initialize(ctx: RenderContext): void;
  public abstract execute(ctx: RenderContext): void;
  public abstract resize(width: number, height: number): void;
  public abstract dispose(): void;
}

export class RenderGraph {
  private passes: RenderPass[] = [];
  private isInitialized: boolean = false;

  public addPass(pass: RenderPass): void {
    this.passes.push(pass);
    this.passes.sort((a, b) => a.priority - b.priority);
  }

  public removePass(name: string): void {
    const idx = this.passes.findIndex((p) => p.name === name);
    if (idx >= 0) {
      this.passes[idx].dispose();
      this.passes.splice(idx, 1);
    }
  }

  public initialize(ctx: RenderContext): void {
    for (const pass of this.passes) {
      pass.initialize(ctx);
    }
    this.isInitialized = true;
  }

  public execute(ctx: RenderContext): void {
    if (!this.isInitialized) {
      this.initialize(ctx);
    }

    for (const pass of this.passes) {
      if (pass.enabled) {
        pass.execute(ctx);
      }
    }
  }

  public resize(width: number, height: number): void {
    for (const pass of this.passes) {
      pass.resize(width, height);
    }
  }

  public dispose(): void {
    for (const pass of this.passes) {
      pass.dispose();
    }
    this.passes = [];
    this.isInitialized = false;
  }
}
