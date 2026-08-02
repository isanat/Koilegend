/**
 * BootScene - loads all game assets with graceful fallbacks.
 * Generates vector fallbacks for any missing textures so the game
 * is ALWAYS playable, even before art generation completes.
 */
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  private _missingKeys = new Set<string>();

  constructor() {
    super('BootScene');
  }

  init() {
    this._missingKeys.clear();
    // Pre-generate procedural textures so Phaser TextureManager has valid keys for every asset immediately
    this.generateFallbacks();
  }

  preload() {
    this.load.on('loaderror', (fileObj: any) => {
      if (fileObj && fileObj.key) {
        this._missingKeys.add(fileObj.key);
      }
    });

    // Sprites with absolute paths
    this.loadImage('koi', '/game/sprites/koi.png');
    this.loadImage('koi-dragon', '/game/sprites/koi-dragon.png');
    this.loadImage('rock', '/game/sprites/rock.png');
    this.loadImage('pearl', '/game/sprites/pearl.png');
    this.loadImage('predator', '/game/sprites/predator.png');
    this.loadImage('whirlpool', '/game/sprites/whirlpool.png');
    this.loadImage('dragon-final', '/game/sprites/dragon-final.png');

    // Scenes with absolute paths
    this.loadImage('river-bg-far', '/game/scenes/river-bg-far.jpg');
    this.loadImage('river-bg-mid', '/game/scenes/river-bg-mid.jpg');
    this.loadImage('river-bg-near', '/game/scenes/river-bg-near.jpg');
    this.loadImage('waterfall-bg', '/game/scenes/waterfall-bg.jpg');
    this.loadImage('hero-legend', '/game/scenes/hero-legend.jpg');
    this.loadImage('sky-realm', '/game/scenes/sky-realm.png');

    // Loading bar
    const { width, height } = this.scale;
    const bg = this.add.rectangle(0, 0, width, height, 0x0a0e1a).setOrigin(0, 0);
    const barBg = this.add.rectangle(width / 2, height / 2, 420, 28, 0x1e293b).setStrokeStyle(1, 0xfbbf24, 0.4);
    const bar = this.add.rectangle(width / 2 - 208, height / 2, 0, 20, 0xfbbf24).setOrigin(0, 0.5);
    const txt = this.add.text(width / 2, height / 2 - 40, 'Invocando a lenda...', {
      fontFamily: 'serif', fontSize: '20px', color: '#fbbf24',
    }).setOrigin(0.5);

    this.load.on('progress', (v: number) => {
      bar.width = 416 * v;
    });
    this.load.on('complete', () => {
      bg.destroy(); barBg.destroy(); bar.destroy(); txt.destroy();
      this.generateFallbacks();
    });
  }

  private loadImage(key: string, url: string) {
    this.load.image(key, url);
  }

  create() {
    this.processLoadedImageTextures();
    this.generateFallbacks();

    // Read target scene from registry (set by KoiGame before game starts)
    const target = (this.registry.get('targetScene') as string) || 'RiverScene';
    const launchData = this.registry.get('bootLaunchData') || {};
    // Start target scene
    this.time.delayedCall(50, () => {
      this.scene.start(target, launchData);
    });
  }

  /**
   * Process loaded artwork textures: removes dark background chromakey and generates
   * undulating swim animation frames from the realistic AI artwork image.
   */
  private processLoadedImageTextures() {
    // 1. Process Koi image to create 8 undulating swim frames
    if (this.textures.exists('koi') && !this._missingKeys.has('koi')) {
      const tex = this.textures.get('koi');
      const img = tex.getSourceImage() as HTMLImageElement;
      if (img && img.width > 0) {
        // Create base clean canvas with chromakey removed
        const baseCanvas = document.createElement('canvas');
        baseCanvas.width = img.width;
        baseCanvas.height = img.height;
        const bCtx = baseCanvas.getContext('2d');
        if (bCtx) {
          bCtx.drawImage(img, 0, 0);
          const imgData = bCtx.getImageData(0, 0, img.width, img.height);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            // Remove dark black background corners (threshold < 20)
            if (data[i] < 22 && data[i + 1] < 22 && data[i + 2] < 22) {
              data[i + 3] = 0;
            }
          }
          bCtx.putImageData(imgData, 0, 0);

          // Generate 8 swim frames with organic tail wave deformation
          for (let f = 0; f < 8; f++) {
            const frameKey = `koi-swim-${f}`;
            if (this.textures.exists(frameKey)) {
              try { this.textures.remove(frameKey); } catch {}
            }
            const fCanvas = document.createElement('canvas');
            fCanvas.width = img.width;
            fCanvas.height = img.height;
            const fCtx = fCanvas.getContext('2d');
            if (fCtx) {
              const sliceW = 4;
              const numSlices = Math.floor(img.width / sliceW);
              const phase = (f / 8) * Math.PI * 2;
              for (let s = 0; s < numSlices; s++) {
                const sx = s * sliceW;
                // Deform y progressively towards the tail (right side)
                const tailFactor = Math.max(0, (sx - img.width * 0.35) / (img.width * 0.65));
                const offsetY = Math.sin(phase + (sx / img.width) * Math.PI * 2) * 12 * tailFactor;
                fCtx.drawImage(
                  baseCanvas,
                  sx, 0, sliceW, img.height,
                  sx, offsetY, sliceW, img.height
                );
              }
              this.textures.addCanvas(frameKey, fCanvas);
            }
          }

          // Generate dash frames
          for (let df = 0; df < 3; df++) {
            const dKey = `koi-dash-${df}`;
            if (this.textures.exists(dKey)) {
              try { this.textures.remove(dKey); } catch {}
            }
            const dCanvas = document.createElement('canvas');
            dCanvas.width = img.width * 1.1;
            dCanvas.height = img.height;
            const dCtx = dCanvas.getContext('2d');
            if (dCtx) {
              dCtx.shadowColor = '#fbbf24';
              dCtx.shadowBlur = 15;
              dCtx.drawImage(baseCanvas, 0, 0, dCanvas.width, dCanvas.height);
              this.textures.addCanvas(dKey, dCanvas);
            }
          }

          // Generate hurt frame
          const hKey = 'koi-hurt';
          if (this.textures.exists(hKey)) {
            try { this.textures.remove(hKey); } catch {}
          }
          const hCanvas = document.createElement('canvas');
          hCanvas.width = img.width;
          hCanvas.height = img.height;
          const hCtx = hCanvas.getContext('2d');
          if (hCtx) {
            hCtx.drawImage(baseCanvas, 0, 0);
            hCtx.globalCompositeOperation = 'source-atop';
            hCtx.fillStyle = 'rgba(239, 68, 68, 0.45)';
            hCtx.fillRect(0, 0, img.width, img.height);
            this.textures.addCanvas(hKey, hCanvas);
          }
        }
      }
    }

    // 2. Process background & obstacle chromakeys (rock, predator, pearl)
    const keysToClean = ['rock', 'predator', 'pearl'];
    keysToClean.forEach((k) => {
      if (this.textures.exists(k) && !this._missingKeys.has(k)) {
        const tex = this.textures.get(k);
        const img = tex.getSourceImage() as HTMLImageElement;
        if (img && img.width > 0) {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, img.width, img.height);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
              if (data[i] < 22 && data[i + 1] < 22 && data[i + 2] < 22) {
                data[i + 3] = 0;
              }
            }
            ctx.putImageData(imgData, 0, 0);
            this.textures.remove(k);
            this.textures.addCanvas(k, canvas);
          }
        }
      }
    });
  }

  /**
   * Generate procedural fallback textures for any missing assets.
   */
  private generateFallbacks() {
    const make = (key: string, w: number, h: number, draw: (g: Phaser.GameObjects.Graphics) => void) => {
      const exists = this.textures.exists(key);
      let isInvalid = false;

      if (exists) {
        const tex = this.textures.get(key);
        const img = tex.getSourceImage() as HTMLImageElement;
        // If it failed loading, key was recorded in _missingKeys, or image is missing/empty
        if (this._missingKeys.has(key) || !img || img.width <= 0 || (tex as any).key === '__MISSING') {
          isInvalid = true;
        }
      }

      if (!exists || isInvalid) {
        if (exists) {
          try { this.textures.remove(key); } catch {}
        }
        const g = this.add.graphics();
        draw(g);
        g.generateTexture(key, w, h);
        g.destroy();
      }
    };

    // 1. KOI SWIM CYCLE (8 frames with organic tail undulation and scale textures)
    for (let f = 0; f < 8; f++) {
      const frameKey = `koi-swim-${f}`;
      const tailAngle = Math.sin((f / 8) * Math.PI * 2) * 14;
      make(frameKey, 110, 60, (g) => {
        g.clear();
        const cx = 40;
        const cy = 30;

        // Tail fin (undulating)
        const rad = Phaser.Math.DegToRad(tailAngle);
        const tx = cx + 32 + Math.cos(rad) * 18;
        const ty = cy + Math.sin(rad) * 18;
        g.fillStyle(0xea580c, 1);
        g.fillTriangle(cx + 20, cy, tx + 12, ty - 16, tx + 12, ty + 16);
        g.fillStyle(0xfb923c, 0.85);
        g.fillTriangle(cx + 22, cy, tx + 10, ty - 10, tx + 10, ty + 10);

        // Pectoral fins
        g.fillStyle(0xf97316, 0.9);
        g.fillTriangle(cx - 5, cy - 12, cx - 22, cy - 26, cx + 5, cy - 14);
        g.fillTriangle(cx - 5, cy + 12, cx - 22, cy + 26, cx + 5, cy + 14);

        // Main Koi Body (Shaded & Curved)
        g.fillStyle(0xf97316, 1);
        g.fillEllipse(cx, cy, 64, 34);

        // Traditional Kohaku White & Black Calico Patches
        g.fillStyle(0xffffff, 0.95);
        g.fillEllipse(cx - 10, cy - 6, 20, 12);
        g.fillEllipse(cx + 10, cy + 5, 16, 10);
        g.fillStyle(0x0f172a, 0.9);
        g.fillEllipse(cx - 2, cy + 4, 10, 6);
        g.fillEllipse(cx + 16, cy - 4, 8, 5);

        // Head highlight & Whisker (Barbel)
        g.fillStyle(0xfb923c, 1);
        g.fillEllipse(cx - 20, cy, 18, 16);
        g.lineStyle(2, 0xfde68a, 0.9);
        g.lineBetween(cx - 28, cy - 4, cx - 36, cy - 8);
        g.lineBetween(cx - 28, cy + 4, cx - 36, cy + 8);

        // Eye
        g.fillStyle(0xffffff, 1);
        g.fillCircle(cx - 20, cy - 6, 4);
        g.fillStyle(0x020617, 1);
        g.fillCircle(cx - 21, cy - 6, 2.2);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(cx - 22, cy - 7, 0.8);
      });
    }

    // Default 'koi' fallback points to swim frame 0
    if (!this.textures.exists('koi') || this._missingKeys.has('koi')) {
      make('koi', 110, 60, (g) => {
        g.clear();
        g.fillStyle(0xf97316, 1);
        g.fillEllipse(50, 30, 64, 34);
        g.fillStyle(0xffffff, 1);
        g.fillEllipse(40, 24, 20, 12);
        g.fillStyle(0x0f172a, 0.9);
        g.fillCircle(48, 24, 2.5);
      });
    }

    // 2. KOI DASH FRAMES (3 boost frames with golden trails)
    for (let df = 0; df < 3; df++) {
      make(`koi-dash-${df}`, 120, 60, (g) => {
        g.clear();
        g.fillStyle(0xfbbf24, 0.4 - df * 0.1);
        g.fillEllipse(60, 30, 110, 48);
        g.fillStyle(0x38bdf8, 0.8);
        g.fillEllipse(55, 30, 75, 36);
        g.fillStyle(0xffffff, 1);
        g.fillEllipse(40, 24, 22, 12);
        g.fillStyle(0x0f172a, 1);
        g.fillCircle(38, 24, 3);
      });
    }

    // 3. KOI HURT FRAME
    make('koi-hurt', 110, 60, (g) => {
      g.clear();
      g.fillStyle(0xef4444, 0.9);
      g.fillEllipse(50, 30, 68, 38);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(32, 24, 5);
      g.fillStyle(0x000000, 1);
      g.fillCircle(32, 24, 2);
    });

    // 4. TEXTURED MOSSY ROCK
    make('rock', 90, 80, (g) => {
      g.clear();
      // Outer dark outline
      g.fillStyle(0x0f172a, 0.95);
      g.fillEllipse(45, 42, 88, 76);
      // Main rock stone texture
      g.fillStyle(0x334155, 1);
      g.fillEllipse(45, 40, 82, 70);
      g.fillStyle(0x475569, 1);
      g.fillEllipse(38, 32, 50, 42);
      g.fillStyle(0x64748b, 0.8);
      g.fillEllipse(32, 28, 28, 20);
      // Aquatic Moss highlights
      g.fillStyle(0x15803d, 0.9);
      g.fillEllipse(55, 50, 34, 20);
      g.fillStyle(0x22c55e, 0.8);
      g.fillEllipse(50, 48, 22, 12);
    });

    // 5. ANIMATED SEAWEED
    make('seaweed', 50, 120, (g) => {
      g.clear();
      g.fillStyle(0x047857, 0.9);
      g.fillTriangle(25, 120, 10, 0, 40, 120);
      g.fillStyle(0x10b981, 0.85);
      g.fillTriangle(20, 120, 30, 15, 38, 120);
    });

    // 6. PREDATOR & TELEGRAPH WARNING
    make('predator', 100, 70, (g) => {
      g.clear();
      // Dark menacing predatory pike
      g.fillStyle(0x0f172a, 1);
      g.fillEllipse(50, 35, 90, 48);
      g.fillStyle(0x334155, 1);
      g.fillEllipse(52, 35, 82, 40);
      // Sharp teeth
      g.fillStyle(0xffffff, 1);
      g.fillTriangle(15, 30, 22, 35, 15, 40);
      g.fillTriangle(22, 28, 28, 35, 22, 42);
      // Red glowing eyes
      g.fillStyle(0xef4444, 1);
      g.fillCircle(25, 25, 4);
      g.fillStyle(0xfde68a, 1);
      g.fillCircle(24, 25, 1.8);
    });

    make('predator-telegraph', 100, 70, (g) => {
      g.clear();
      // Red aura warning telegraph frame
      g.fillStyle(0xef4444, 0.4);
      g.fillEllipse(50, 35, 104, 62);
      g.lineStyle(3, 0xef4444, 0.9);
      g.strokeEllipse(50, 35, 100, 58);
      // Inner predator
      g.fillStyle(0x0f172a, 1);
      g.fillEllipse(50, 35, 86, 44);
      g.fillStyle(0xd97706, 1);
      g.fillCircle(25, 25, 5);
    });

    // 7. GLOWING PEARL ORB
    make('pearl', 40, 40, (g) => {
      g.clear();
      // Radial glow rings
      g.fillStyle(0xfbbf24, 0.25);
      g.fillCircle(20, 20, 19);
      g.fillStyle(0xfbbf24, 0.5);
      g.fillCircle(20, 20, 14);
      g.fillStyle(0xfef08a, 0.95);
      g.fillCircle(20, 20, 9);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(17, 17, 4);
    });

    // Dragon & Backgrounds
    make('dragon-final', 110, 110, (g) => {
      g.clear();
      g.fillStyle(0xfbbf24, 1);
      g.fillEllipse(55, 55, 75, 48);
      g.fillStyle(0xd97706, 1);
      g.fillTriangle(25, 55, 5, 40, 5, 70);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(70, 45, 6);
      g.fillStyle(0x020617, 1);
      g.fillCircle(72, 45, 3);
    });

    // Background fallbacks - rich gradients
    make('river-bg-far', 1344, 768, (g) => {
      g.fillGradientStyle(0x1e3a8a, 0x1e3a8a, 0xfbbf24, 0xf59e0b, 1);
      g.fillRect(0, 0, 1344, 768);
    });
    make('river-bg-mid', 1344, 768, (g) => {
      g.fillGradientStyle(0x0c4a6e, 0x0c4a6e, 0x075985, 0x075985, 1);
      g.fillRect(0, 0, 1344, 768);
      // Tree silhouettes
      g.fillStyle(0x052e3d, 0.6);
      for (let i = 0; i < 8; i++) {
        g.fillEllipse(100 + i * 180, 600, 120, 80);
      }
    });
    make('river-bg-near', 1344, 768, (g) => {
      g.fillGradientStyle(0x082f49, 0x082f49, 0x0c4a6e, 0x0c4a6e, 1);
      g.fillRect(0, 0, 1344, 768);
      // Bubbles
      g.fillStyle(0x7dd3fc, 0.3);
      for (let i = 0; i < 15; i++) {
        g.fillCircle((i * 97) % 1344, (i * 53) % 768, 4 + (i % 4));
      }
    });
    make('waterfall-bg', 768, 1344, (g) => {
      g.fillGradientStyle(0x0c4a6e, 0x0e7490, 0x075985, 0xfbbf24, 1);
      g.fillRect(0, 0, 768, 1344);
    });
    make('hero-legend', 1344, 768, (g) => {
      g.fillGradientStyle(0x0a0e1a, 0x0a0e1a, 0xfbbf24, 0xf59e0b, 1);
      g.fillRect(0, 0, 1344, 768);
    });
    make('sky-realm', 1344, 768, (g) => {
      g.fillGradientStyle(0xfbbf24, 0xfde68a, 0xfef3c7, 0xffffff, 1);
      g.fillRect(0, 0, 1344, 768);
    });
    make('koi-dragon', 96, 56, (g) => {
      g.fillStyle(0xfbbf24, 1);
      g.fillEllipse(40, 28, 60, 32);
      g.fillTriangle(70, 28, 92, 12, 92, 44);
    });
    make('predator', 80, 80, (g) => {
      g.fillStyle(0x475569, 1);
      g.fillEllipse(40, 40, 60, 40);
      g.fillStyle(0x1e293b, 1);
      g.fillTriangle(20, 40, 5, 35, 5, 45);
    });
    make('whirlpool', 80, 80, (g) => {
      g.fillStyle(0x0e7490, 0.8);
      for (let i = 0; i < 5; i++) {
        g.fillEllipse(40, 40, 70 - i * 12, 70 - i * 12);
      }
    });
  }
}
