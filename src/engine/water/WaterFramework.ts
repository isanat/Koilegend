/**
 * KOI LEGEND ENGINE — WaterFramework
 * Fully Data-Driven Water System supporting Reflection, Refraction, Flow Maps, Depth Color, Caustics & LOD.
 */

export interface WaterQualityConfig {
  reflectionResolution: number; // 256, 512, 1080
  refractionEnabled: boolean;
  causticsEnabled: boolean;
  foamQuality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';
  maxWaves: number;
}

export interface WaterParameters {
  shallowColor: string; // Hex color e.g. '#1eb8e6'
  deepColor: string;    // Hex color e.g. '#051d54'
  foamColor: string;    // Hex color e.g. '#f0f9ff'
  waveSpeed: number;
  waveScale: number;
  flowDirection: [number, number];
  currentSpeed: number;
  clarity: number;      // 0..1
  causticsIntensity: number;
  ripplesIntensity: number;
  rainIntensity: number;
  windSpeed: number;
  windAngleRad: number;
  fishDisturbanceRadius: number;
  isUnderwater: boolean;
  lodDistance: number;
}

export class WaterFramework {
  private config: WaterParameters;
  private quality: WaterQualityConfig;
  private rippleSources: Array<{ x: number; z: number; intensity: number; time: number }> = [];

  constructor(config?: Partial<WaterParameters>, quality?: Partial<WaterQualityConfig>) {
    this.config = {
      shallowColor: '#1eb8e6',
      deepColor: '#051d54',
      foamColor: '#f0f9ff',
      waveSpeed: 1.2,
      waveScale: 2.5,
      flowDirection: [1.0, 0.2],
      currentSpeed: 0.8,
      clarity: 0.85,
      causticsIntensity: 0.7,
      ripplesIntensity: 0.5,
      rainIntensity: 0.0,
      windSpeed: 3.5,
      windAngleRad: 0.78,
      fishDisturbanceRadius: 1.5,
      isUnderwater: false,
      lodDistance: 100,
      ...config,
    };

    this.quality = {
      reflectionResolution: 512,
      refractionEnabled: true,
      causticsEnabled: true,
      foamQuality: 'HIGH',
      maxWaves: 8,
      ...quality,
    };
  }

  public updateParameters(newParams: Partial<WaterParameters>): void {
    this.config = { ...this.config, ...newParams };
  }

  public setQualityProfile(profile: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA'): void {
    switch (profile) {
      case 'LOW':
        this.quality = {
          reflectionResolution: 128,
          refractionEnabled: false,
          causticsEnabled: false,
          foamQuality: 'LOW',
          maxWaves: 2,
        };
        break;
      case 'MEDIUM':
        this.quality = {
          reflectionResolution: 256,
          refractionEnabled: true,
          causticsEnabled: false,
          foamQuality: 'MEDIUM',
          maxWaves: 4,
        };
        break;
      case 'HIGH':
        this.quality = {
          reflectionResolution: 512,
          refractionEnabled: true,
          causticsEnabled: true,
          foamQuality: 'HIGH',
          maxWaves: 8,
        };
        break;
      case 'ULTRA':
        this.quality = {
          reflectionResolution: 1024,
          refractionEnabled: true,
          causticsEnabled: true,
          foamQuality: 'ULTRA',
          maxWaves: 16,
        };
        break;
    }
  }

  public addRipple(x: number, z: number, intensity: number = 1.0): void {
    this.rippleSources.push({ x, z, intensity, time: 0 });
    if (this.rippleSources.length > 16) {
      this.rippleSources.shift();
    }
  }

  public update(dt: number): void {
    for (let i = this.rippleSources.length - 1; i >= 0; i--) {
      this.rippleSources[i].time += dt;
      if (this.rippleSources[i].time > 3.0) {
        this.rippleSources.splice(i, 1);
      }
    }
  }

  public getUniforms(): Record<string, any> {
    return {
      u_shallowColor: this.hexToRgb(this.config.shallowColor),
      u_deepColor: this.hexToRgb(this.config.deepColor),
      u_foamColor: this.hexToRgb(this.config.foamColor),
      u_waveSpeed: this.config.waveSpeed,
      u_waveScale: this.config.waveScale,
      u_flowDirection: this.config.flowDirection,
      u_currentSpeed: this.config.currentSpeed,
      u_causticsIntensity: this.quality.causticsEnabled ? this.config.causticsIntensity : 0.0,
      u_ripplesIntensity: this.config.ripplesIntensity,
      u_rainIntensity: this.config.rainIntensity,
      u_windParams: [this.config.windSpeed, this.config.windAngleRad],
      u_isUnderwater: this.config.isUnderwater ? 1.0 : 0.0,
      u_activeRipplesCount: this.rippleSources.length,
      u_maxWaves: this.quality.maxWaves,
    };
  }

  private hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return [
      ((num >> 16) & 255) / 255,
      ((num >> 8) & 255) / 255,
      (num & 255) / 255,
    ];
  }

  public getQuality(): WaterQualityConfig {
    return this.quality;
  }

  public getConfig(): WaterParameters {
    return this.config;
  }
}
