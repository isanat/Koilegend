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

    // Sprites with relative paths
    this.loadImage('koi', 'game/sprites/koi.png');
    this.loadImage('koi-dragon', 'game/sprites/koi-dragon.png');
    this.loadImage('rock', 'game/sprites/rock.png');
    this.loadImage('pearl', 'game/sprites/pearl.png');
    this.loadImage('predator', 'game/sprites/predator.png');
    this.loadImage('whirlpool', 'game/sprites/whirlpool.png');
    this.loadImage('dragon-final', 'game/sprites/dragon-final.png');

    // Scenes with relative paths
    this.loadImage('river-bg-far', 'game/scenes/river-bg-far.jpg');
    this.loadImage('river-bg-mid', 'game/scenes/river-bg-mid.jpg');
    this.loadImage('river-bg-near', 'game/scenes/river-bg-near.jpg');
    this.loadImage('waterfall-bg', 'game/scenes/waterfall-bg.jpg');
    this.loadImage('hero-legend', 'game/scenes/hero-legend.jpg');
    this.loadImage('sky-realm', 'game/scenes/sky-realm.png');

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
    // Read target scene from registry (set by KoiGame before game starts)
    const target = (this.registry.get('targetScene') as string) || 'RiverScene';
    const launchData = this.registry.get('bootLaunchData') || {};
    // Start target scene
    this.time.delayedCall(50, () => {
      this.generateFallbacks();
      this.scene.start(target, launchData);
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

    // Koi fallback - vibrant orange fish
    make('koi', 96, 56, (g) => {
      g.clear();
      g.fillStyle(0xf97316, 1);
      g.fillEllipse(40, 28, 60, 32);
      g.fillStyle(0xffffff, 1);
      g.fillEllipse(28, 22, 16, 10);
      g.fillStyle(0xea580c, 1);
      g.fillEllipse(35, 30, 12, 8);
      g.fillStyle(0xf97316, 1);
      g.fillTriangle(70, 28, 92, 12, 92, 44);
      g.fillStyle(0xfb923c, 0.8);
      g.fillTriangle(75, 28, 88, 18, 88, 38);
      g.fillStyle(0x1e293b, 1);
      g.fillCircle(22, 22, 3);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(23, 21, 1);
    });

    // Rock fallback
    make('rock', 80, 70, (g) => {
      g.clear();
      g.fillStyle(0x475569, 1);
      g.fillEllipse(40, 45, 70, 50);
      g.fillStyle(0x334155, 1);
      g.fillEllipse(30, 35, 20, 16);
      g.fillStyle(0x16a34a, 0.6);
      g.fillEllipse(50, 50, 18, 10);
      g.fillStyle(0x64748b, 0.8);
      g.fillEllipse(45, 40, 10, 6);
    });

    // Pearl fallback - glowing orb
    make('pearl', 32, 32, (g) => {
      g.clear();
      g.fillStyle(0xfbbf24, 1);
      g.fillCircle(16, 16, 12);
      g.fillStyle(0xfde68a, 0.9);
      g.fillCircle(13, 13, 6);
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(11, 11, 3);
    });

    // Dragon fallback
    make('dragon-final', 96, 96, (g) => {
      g.clear();
      g.fillStyle(0xfbbf24, 1);
      g.fillEllipse(48, 48, 60, 40);
      g.fillStyle(0xf59e0b, 1);
      g.fillTriangle(20, 48, 5, 35, 5, 60);
      g.fillStyle(0xfde68a, 1);
      g.fillCircle(60, 40, 5);
      g.fillStyle(0x1e293b, 1);
      g.fillCircle(62, 40, 2);
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
