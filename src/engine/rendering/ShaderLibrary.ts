/**
 * KOI LEGEND ENGINE — ShaderLibrary
 * Centralized, modular shader management supporting GLSL (WebGL2) and WGSL (WebGPU readiness).
 */

export interface ShaderSource {
  id: string;
  name: string;
  vertexShader: string;
  fragmentShader: string;
  uniforms: Record<string, { type: string; value: any }>;
  wgslSource?: string;
}

export class ShaderLibrary {
  private static instance: ShaderLibrary;
  private shaders: Map<string, ShaderSource> = new Map();

  private constructor() {
    this.registerCoreShaders();
  }

  public static getInstance(): ShaderLibrary {
    if (!ShaderLibrary.instance) {
      ShaderLibrary.instance = new ShaderLibrary();
    }
    return ShaderLibrary.instance;
  }

  /**
   * Register core engine shaders (Water, Particles, Post-Processing)
   */
  private registerCoreShaders(): void {
    // 1. Water Core Shader (GLSL 300 es)
    this.registerShader({
      id: 'core_water_pbr',
      name: 'PBR Water Shader',
      vertexShader: `#version 300 es
        in vec3 a_position;
        in vec2 a_uv;
        in vec3 a_normal;

        uniform mat4 u_modelMatrix;
        uniform mat4 u_viewMatrix;
        uniform mat4 u_projectionMatrix;
        uniform float u_time;
        uniform vec2 u_windDirection;

        out vec2 v_uv;
        out vec3 v_worldPosition;
        out vec3 v_normal;

        void main() {
          v_uv = a_uv;
          vec3 pos = a_position;
          
          // Wave displacement formula
          float wave = sin(pos.x * 2.0 + u_time * 1.5) * cos(pos.z * 2.0 + u_time * 1.2) * 0.15;
          pos.y += wave;

          vec4 worldPos = u_modelMatrix * vec4(pos, 1.0);
          v_worldPosition = worldPos.xyz;
          v_normal = mat3(u_modelMatrix) * a_normal;

          gl_Position = u_projectionMatrix * u_viewMatrix * worldPos;
        }
      `,
      fragmentShader: `#version 300 es
        precision highp float;

        in vec2 v_uv;
        in vec3 v_worldPosition;
        in vec3 v_normal;

        uniform vec3 u_shallowColor;
        uniform vec3 u_deepColor;
        uniform vec3 u_foamColor;
        uniform vec3 u_cameraPosition;
        uniform float u_time;
        uniform sampler2D u_flowMap;
        uniform sampler2D u_causticsMap;

        out vec4 fragColor;

        void main() {
          vec3 viewDir = normalize(u_cameraPosition - v_worldPosition);
          vec3 normal = normalize(v_normal);

          // Fresnel factor calculation
          float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);

          // Water depth blend
          vec3 waterBase = mix(u_shallowColor, u_deepColor, clamp(v_worldPosition.y * -0.5 + 0.5, 0.0, 1.0));
          vec3 finalColor = mix(waterBase, vec3(1.0), fresnel * 0.4);

          fragColor = vec4(finalColor, 0.88);
        }
      `,
      uniforms: {
        u_time: { type: '1f', value: 0 },
        u_shallowColor: { type: '3fv', value: [0.12, 0.74, 0.9] },
        u_deepColor: { type: '3fv', value: [0.02, 0.12, 0.35] },
        u_foamColor: { type: '3fv', value: [0.95, 0.98, 1.0] },
      },
    });

    // 2. GPU Particles Instanced Compute Shader
    this.registerShader({
      id: 'gpu_particle_instanced',
      name: 'GPU Instanced Particle Shader',
      vertexShader: `#version 300 es
        in vec3 a_quadVertex;
        in vec3 a_instancePos;
        in vec4 a_instanceColor;
        in float a_instanceScale;
        in float a_instanceLife;

        uniform mat4 u_viewProjectionMatrix;

        out vec4 v_color;
        out vec2 v_uv;
        out float v_life;

        void main() {
          v_color = a_instanceColor;
          v_uv = a_quadVertex.xy * 0.5 + 0.5;
          v_life = a_instanceLife;

          vec3 worldPos = a_instancePos + (a_quadVertex * a_instanceScale);
          gl_Position = u_viewProjectionMatrix * vec4(worldPos, 1.0);
        }
      `,
      fragmentShader: `#version 300 es
        precision highp float;

        in vec4 v_color;
        in vec2 v_uv;
        in float v_life;

        out vec4 fragColor;

        void main() {
          float dist = length(v_uv - vec2(0.5));
          if (dist > 0.5) discard;

          float alpha = (1.0 - dist * 2.0) * v_color.a * v_life;
          fragColor = vec4(v_color.rgb, alpha);
        }
      `,
      uniforms: {
        u_viewProjectionMatrix: { type: 'mat4', value: new Float32Array(16) },
      },
    });
  }

  public registerShader(shader: ShaderSource): void {
    this.shaders.set(shader.id, shader);
  }

  public getShader(id: string): ShaderSource | undefined {
    return this.shaders.get(id);
  }

  public hasShader(id: string): boolean {
    return this.shaders.has(id);
  }
}
