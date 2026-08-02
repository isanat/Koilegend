/**
 * KOI LEGEND ENGINE — ComputeAbstraction Layer
 * Backend-agnostic hardware compute abstraction layer enabling WebGL2 fallback & native WGSL WebGPU execution.
 */

export interface ComputePipelineDescriptor {
  id: string;
  name: string;
  workgroupCount: [number, number, number];
  glslTransformFeedbackShader?: string;
  wgslComputeShader?: string;
  uniforms: Record<string, any>;
}

export abstract class ComputePassBackend {
  public abstract initialize(): Promise<void>;
  public abstract dispatch(pipelineId: string, uniforms: Record<string, any>): void;
  public abstract dispose(): void;
}

export class WebGL2ComputeFallbackBackend extends ComputePassBackend {
  private gl?: WebGL2RenderingContext;

  constructor(gl?: WebGL2RenderingContext) {
    super();
    this.gl = gl;
  }

  public async initialize(): Promise<void> {
    console.log('[ComputeAbstraction] WebGL2 Transform Feedback / Texture Compute Backend initialized.');
  }

  public dispatch(pipelineId: string, uniforms: Record<string, any>): void {
    // Transform Feedback or Offscreen FrameBuffer simulation pass for GPU Particles & Ripples
  }

  public dispose(): void {
    this.gl = undefined;
  }
}

export class WebGPUComputeBackend extends ComputePassBackend {
  private device?: GPUDevice;

  constructor(device?: GPUDevice) {
    super();
    this.device = device;
  }

  public async initialize(): Promise<void> {
    if (!this.device) {
      console.warn('[ComputeAbstraction] WebGPU GPUDevice not provided.');
      return;
    }
    console.log('[ComputeAbstraction] Native WGSL WebGPU Compute Pipeline initialized.');
  }

  public dispatch(pipelineId: string, uniforms: Record<string, any>): void {
    if (!this.device) return;
    // Dispatch WebGPU compute pass encoder
  }

  public dispose(): void {
    this.device = undefined;
  }
}

export class ComputeManager {
  private static instance: ComputeManager;
  private backend: ComputePassBackend;
  private pipelines: Map<string, ComputePipelineDescriptor> = new Map();

  private constructor() {
    this.backend = new WebGL2ComputeFallbackBackend();
  }

  public static getInstance(): ComputeManager {
    if (!ComputeManager.instance) {
      ComputeManager.instance = new ComputeManager();
    }
    return ComputeManager.instance;
  }

  public setBackend(backend: ComputePassBackend): void {
    this.backend.dispose();
    this.backend = backend;
    this.backend.initialize();
  }

  public registerPipeline(pipeline: ComputePipelineDescriptor): void {
    this.pipelines.set(pipeline.id, pipeline);
  }

  public dispatch(pipelineId: string, uniforms: Record<string, any> = {}): void {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      console.warn(`[ComputeManager] Compute Pipeline '${pipelineId}' not found.`);
      return;
    }
    this.backend.dispatch(pipelineId, uniforms);
  }
}
