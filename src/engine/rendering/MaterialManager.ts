/**
 * KOI LEGEND ENGINE — MaterialManager
 * Centralized material and pipeline state manager for high performance and low state switching.
 */

import { ShaderLibrary, ShaderSource } from './ShaderLibrary';

export interface MaterialConfig {
  shaderId: string;
  name: string;
  transparent?: boolean;
  blendMode?: 'ADD' | 'ALPHA' | 'MULTIPLY' | 'OPAQUE';
  depthTest?: boolean;
  depthWrite?: boolean;
  uniforms?: Record<string, any>;
}

export class Material {
  public readonly id: string;
  public readonly shader: ShaderSource;
  public transparent: boolean;
  public blendMode: 'ADD' | 'ALPHA' | 'MULTIPLY' | 'OPAQUE';
  public depthTest: boolean;
  public depthWrite: boolean;
  public uniforms: Map<string, any> = new Map();

  constructor(id: string, config: MaterialConfig, shader: ShaderSource) {
    this.id = id;
    this.shader = shader;
    this.transparent = config.transparent ?? false;
    this.blendMode = config.blendMode ?? 'ALPHA';
    this.depthTest = config.depthTest ?? true;
    this.depthWrite = config.depthWrite ?? true;

    // Load default uniforms from shader
    for (const [key, prop] of Object.entries(shader.uniforms)) {
      this.uniforms.set(key, prop.value);
    }

    // Override with custom material uniforms
    if (config.uniforms) {
      for (const [key, val] of Object.entries(config.uniforms)) {
        this.uniforms.set(key, val);
      }
    }
  }

  public setUniform(name: string, value: any): void {
    this.uniforms.set(name, value);
  }

  public getUniform(name: string): any {
    return this.uniforms.get(name);
  }
}

export class MaterialManager {
  private static instance: MaterialManager;
  private materials: Map<string, Material> = new Map();

  private constructor() {}

  public static getInstance(): MaterialManager {
    if (!MaterialManager.instance) {
      MaterialManager.instance = new MaterialManager();
    }
    return MaterialManager.instance;
  }

  public createMaterial(id: string, config: MaterialConfig): Material {
    const shaderLib = ShaderLibrary.getInstance();
    const shader = shaderLib.getShader(config.shaderId);
    if (!shader) {
      throw new Error(`[MaterialManager] Shader ID '${config.shaderId}' not found in ShaderLibrary.`);
    }

    const material = new Material(id, config, shader);
    this.materials.set(id, material);
    return material;
  }

  public getMaterial(id: string): Material | undefined {
    return this.materials.get(id);
  }

  public updateGlobalUniforms(name: string, value: any): void {
    for (const mat of this.materials.values()) {
      if (mat.uniforms.has(name)) {
        mat.setUniform(name, value);
      }
    }
  }
}
