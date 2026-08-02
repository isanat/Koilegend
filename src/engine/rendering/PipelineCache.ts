/**
 * KOI LEGEND ENGINE — PipelineCache & ShaderReflection
 * Prevents redundant program linking, uniform location lookups, and state toggling.
 */

export interface ProgramReflectionData {
  programId: string;
  uniformLocations: Map<string, WebGLUniformLocation | number>;
  attributeLocations: Map<string, number>;
  uniformCount: number;
  attributeCount: number;
  estimatedGpuCost: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';
}

export class PipelineCache {
  private static instance: PipelineCache;
  private programCache: Map<string, ProgramReflectionData> = new Map();
  private activeProgramId: string | null = null;

  private constructor() {}

  public static getInstance(): PipelineCache {
    if (!PipelineCache.instance) {
      PipelineCache.instance = new PipelineCache();
    }
    return PipelineCache.instance;
  }

  public registerProgram(
    id: string,
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    uniforms: string[],
    attributes: string[],
    estimatedCost: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA' = 'MEDIUM'
  ): ProgramReflectionData {
    if (this.programCache.has(id)) {
      return this.programCache.get(id)!;
    }

    const uniformLocs = new Map<string, WebGLUniformLocation>();
    for (const name of uniforms) {
      const loc = gl.getUniformLocation(program, name);
      if (loc) uniformLocs.set(name, loc);
    }

    const attrLocs = new Map<string, number>();
    for (const name of attributes) {
      const loc = gl.getAttribLocation(program, name);
      if (loc !== -1) attrLocs.set(name, loc);
    }

    const reflection: ProgramReflectionData = {
      programId: id,
      uniformLocations: uniformLocs,
      attributeLocations: attrLocs,
      uniformCount: uniforms.length,
      attributeCount: attributes.length,
      estimatedGpuCost: estimatedCost,
    };

    this.programCache.set(id, reflection);
    return reflection;
  }

  public bindProgram(id: string, gl: WebGL2RenderingContext, program: WebGLProgram): boolean {
    if (this.activeProgramId === id) {
      return false; // State change avoided!
    }

    gl.useProgram(program);
    this.activeProgramId = id;
    return true;
  }

  public getReflection(id: string): ProgramReflectionData | undefined {
    return this.programCache.get(id);
  }

  public clear(): void {
    this.programCache.clear();
    this.activeProgramId = null;
  }
}
