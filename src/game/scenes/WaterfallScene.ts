/**
 * WaterfallScene - Phase 11: "A Cachoeira do Dragão"
 *
 * Vertical ascent. Koi at 72% from bottom, sees 72% of screen above
 * (where water streams fall from). Reaching the top triggers the
 * transformation into a celestial dragon.
 *
 * Inherits HUD, title/result cards, input, damage system, particles from
 * BaseGameScene. Only implements vertical-specific logic here.
 *
 * Uses AABB collision (via hitsKoi) consistently with RiverScene — no more
 * distance-based collision for damage.
 */
import Phaser from 'phaser';
import { BaseGameScene, type BaseResult, type GameStatus, type SceneTitle, type ResultText } from './BaseGameScene';

export type WaterfallResult = BaseResult & {
  ascent: number;
  transformed: boolean;
};

const GAME_WIDTH = 720;
const GAME_HEIGHT = 1280;
const KOI_Y = GAME_HEIGHT * 0.72;
const KOI_W = 48;
const KOI_H = 28;
const WIN_ASCENT = 4200;
const MAX_TIME = 120; // generous; the real win condition is ascent

export class WaterfallScene extends BaseGameScene {
  private bg!: Phaser.GameObjects.TileSprite;
  private streams: Phaser.GameObjects.Container[] = [];
  private pearls: Phaser.GameObjects.Container[] = [];
  private mistEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  // Extra HUD (ascent bar)
  private ascentBarFill!: Phaser.GameObjects.Rectangle;
  private ascentText!: Phaser.GameObjects.Text;

  private targetX = GAME_WIDTH / 2;
  private scrollSpeed = 200;
  private readonly baseScrollSpeed = 200;
  private streamTimer = 0;
  private pearlTimer = 0;
  private ascent = 0;
  private transformed = false;

  constructor() {
    super('WaterfallScene');
  }

  // === Abstract method implementations ===

  protected getKoiStartPosition() {
    return { x: GAME_WIDTH / 2, y: KOI_Y };
  }

  protected getKoiDisplaySize() {
    return { w: KOI_W, h: KOI_H };
  }

  protected getSceneTitle(): SceneTitle {
    return {
      title: 'Etapa XI',
      subtitle: 'A Cachoeira do Dragão',
      hint: 'Mova o mouse ou A/D • Escale até o Portal do Dragão',
    };
  }

  protected getResultText(status: GameStatus): ResultText {
    if (status === 'win') {
      return { title: 'ASCENSÃO COMPLETA', subtitle: 'O koi se transformou em um dragão celestial!' };
    }
    if (status === 'lose') {
      return { title: 'O KOI CAIU', subtitle: 'A cachoeira foi mais forte desta vez...' };
    }
    return { title: 'JOGO INTERROMPIDO', subtitle: '' };
  }

  protected getWinPearls() { return 999; } // pearls don't win the waterfall; ascent does
  protected getMaxTime() { return MAX_TIME; }
  protected canWinByTimeOut() { return false; } // timeout = lose (must reach the top)

  protected createScene() {
    this.cameras.main.setBackgroundColor('#0a0e1a');

    // Vertical waterfall background
    this.bg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'waterfall-bg')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.9);

    // Dragon gate at top (visual goal)
    const gate = this.add.image(GAME_WIDTH / 2, 80, 'pearl').setDisplaySize(180, 180)
      .setAlpha(0.25).setScrollFactor(0).setTint(0xfbbf24);
    this.tweens.add({ targets: gate, alpha: 0.4, duration: 1200, yoyo: true, repeat: -1 });

    // Mist at top
    this.mistEmitter = this.add.particles(0, 0, 'pearl', {
      x: { min: 0, max: GAME_WIDTH },
      y: -10,
      speedY: { min: 30, max: 80 },
      scale: { start: 0.5, end: 0.1 },
      alpha: { start: 0.15, end: 0 },
      lifespan: 2000,
      frequency: 200,
      tint: 0xe0f2fe,
      blendMode: 'ADD',
    });
    this.mistEmitter.setScrollFactor(0).setDepth(8);

    // Streams and pearls lists
    this.streams = [];
    this.pearls = [];
  }

  protected buildExtraHUD(): Phaser.GameObjects.GameObject[] {
    const extras: Phaser.GameObjects.GameObject[] = [];
    const barX = GAME_WIDTH - 200;
    const barY = 30;
    const barBg = this.add.rectangle(barX, barY, 170, 14, 0x1e293b, 0.95)
      .setOrigin(0, 0).setStrokeStyle(1, 0xfbbf24, 0.6).setScrollFactor(0).setDepth(50);
    this.ascentBarFill = this.add.rectangle(barX + 2, barY + 2, 0, 10, 0xfbbf24)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(51);
    this.ascentText = this.add.text(barX, barY + 18, 'Ascensão 0%', {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#fbbf24',
      stroke: '#000000', strokeThickness: 3,
    }).setScrollFactor(0).setDepth(50);
    extras.push(barBg, this.ascentBarFill, this.ascentText);
    return extras;
  }

  protected updateExtraHUD() {
    const pct = Math.min(100, Math.floor((this.ascent / WIN_ASCENT) * 100));
    this.ascentText.setText(`Ascensão ${pct}%`);
    this.ascentBarFill.width = Math.max(0, Math.min(166, 166 * (this.ascent / WIN_ASCENT)));
  }

  protected onPointerMove(pointer: Phaser.Input.Pointer): void {
    // Use camera API (no manual coordinate conversion)
    const worldPoint = this.getWorldPointer(pointer);
    this.targetX = Phaser.Math.Clamp(worldPoint.x, 50, GAME_WIDTH - 50);
  }

  protected updateScene(dt: number, time: number): number {
    // Difficulty ramps with ascent
    const ascentFactor = Math.min(1.5, this.ascent / WIN_ASCENT + 0.3);
    this.scrollSpeed = this.baseScrollSpeed * ascentFactor;
    this.ascent += this.scrollSpeed * dt * 0.5;
    const speedFactor = Math.min(1, (this.scrollSpeed - this.baseScrollSpeed) / (this.baseScrollSpeed * 0.5));

    // Parallax bg scrolls downward (koi ascends)
    this.bg.tilePositionY -= this.scrollSpeed * dt;

    // Keyboard movement (horizontal)
    const kb = this.keyboard;
    if (kb.cursors) {
      const kbSpeed = 420;
      if (kb.cursors.left.isDown || kb.A.isDown) this.targetX -= kbSpeed * dt;
      if (kb.cursors.right.isDown || kb.D.isDown) this.targetX += kbSpeed * dt;
    }
    this.targetX = Phaser.Math.Clamp(this.targetX, 50, GAME_WIDTH - 50);
    const newX = Phaser.Math.Linear(this.koi.x, this.targetX, 1 - Math.pow(0.0001, dt));
    const vx = newX - this.koi.x;
    this.koi.x = newX;

    // Tilt based on horizontal velocity
    const targetAngle = Phaser.Math.Clamp(vx * 0.3, -35, 35);
    const currentAngle = Phaser.Math.RadToDeg(this.koi.rotation);
    this.koi.rotation = Phaser.Math.DegToRad(
      Phaser.Math.Linear(currentAngle, targetAngle, 1 - Math.pow(0.001, dt)) - 90
    );

    // Tail wiggle
    const wiggle = Math.sin(time / 80) * 0.06;
    this.koiBody.setScale(1 + wiggle, 1 - wiggle * 0.5);

    // Spawn water streams
    this.streamTimer -= dt;
    const streamInterval = Math.max(0.45, 1.1 - this.elapsed * 0.008);
    if (this.streamTimer <= 0) {
      this.spawnStream();
      this.streamTimer = streamInterval + Math.random() * 0.35;
    }

    // Spawn pearls
    this.pearlTimer -= dt;
    if (this.pearlTimer <= 0) {
      this.spawnPearl();
      this.pearlTimer = 1.0 + Math.random() * 1.2;
    }

    // Update streams — AABB collision via shared helper (consistent with RiverScene)
    for (let i = this.streams.length - 1; i >= 0; i--) {
      const s = this.streams[i];
      s.y += this.scrollSpeed * dt * 1.3;
      if (s.y > GAME_HEIGHT + 120) {
        s.destroy();
        this.streams.splice(i, 1);
        continue;
      }
      if (!this.invincible && this.hitsKoi(s, 44, 110)) {
        this.takeHit(75);
        this.ascent = Math.max(0, this.ascent - 150); // knockback on ascent
      }
    }

    // Update pearls
    for (let i = this.pearls.length - 1; i >= 0; i--) {
      const p = this.pearls[i];
      p.y += this.scrollSpeed * dt * 0.7;
      const bob = Math.sin((time + i * 200) / 200) * 6;
      p.x = (p.getData('baseX') as number) + bob;
      p.rotation += 2 * dt;

      const dx = this.koi.x - p.x;
      const dy = this.koi.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const pull = (1 - dist / 150) * 400 * dt;
        p.x += (dx / dist) * pull;
        p.y += (dy / dist) * pull;
      }
      if (dist < 40) {
        this.collectPearl(p, 150);
        p.destroy();
        this.pearls.splice(i, 1);
        continue;
      }
      if (p.y > GAME_HEIGHT + 50) {
        p.destroy();
        this.pearls.splice(i, 1);
      }
    }

    // Win by ascent
    if (this.ascent >= WIN_ASCENT) {
      this.transformed = true;
      this.finish('win');
    }

    return speedFactor;
  }

  protected shutdownScene() {
    this.streams.forEach((s) => s.destroy());
    this.pearls.forEach((p) => p.destroy());
    this.streams = [];
    this.pearls = [];
    this.mistEmitter?.destroy();
  }

  protected buildResult(status: GameStatus): WaterfallResult {
    return {
      status,
      pearls: this.pearlsCollected,
      timeSurvived: Math.floor(this.elapsed),
      score: this.score,
      maxHits: this.MAX_HITS,
      hitsTaken: this.hits,
      maxCombo: this.maxCombo,
      ascent: Math.floor(this.ascent),
      transformed: this.transformed,
    };
  }

  /** Override to play the dragon transformation before the result card. */
  protected playWinAnimation(onDone: () => void) {
    const { width, height } = this.scale;
    this.tweens.killAll();
    // White flash
    const flash = this.add.rectangle(0, 0, width, height, 0xffffff, 0)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(150);
    this.tweens.add({ targets: flash, alpha: 1, duration: 200, yoyo: true });
    // Swap koi for dragon
    const dragon = this.add.image(this.koi.x, this.koi.y, 'dragon-final')
      .setDisplaySize(140, 140).setAlpha(0).setDepth(20);
    this.koiBody.setVisible(false);
    this.tweens.add({ targets: dragon, alpha: 1, duration: 500 });
    // Golden particle bursts
    for (let i = 0; i < 30; i++) {
      this.time.delayedCall(i * 30, () => {
        this.sparkleEmitter.emitParticleAt(this.koi.x, this.koi.y, 8);
      });
    }
    // Dragon ascends
    this.tweens.add({
      targets: dragon, y: dragon.y - 200, duration: 1800, ease: 'Cubic.easeOut',
    });
    this.tweens.add({
      targets: dragon, scaleX: 1.4, scaleY: 1.4, duration: 1800,
    });
    // Radiating light
    const light = this.add.image(this.koi.x, this.koi.y, 'pearl').setDisplaySize(600, 600)
      .setAlpha(0).setTint(0xfbbf24).setBlendMode('ADD').setDepth(19);
    this.tweens.add({ targets: light, alpha: 0.6, duration: 800, yoyo: true, repeat: 1 });
    // "ASCENSÃO" text
    const ascText = this.add.text(width / 2, height / 2, 'ASCENSÃO', {
      fontFamily: 'serif', fontSize: '64px', color: '#fbbf24', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0).setScrollFactor(0).setDepth(201);
    this.tweens.add({ targets: ascText, alpha: 1, duration: 600, delay: 400 });
    this.time.delayedCall(2600, onDone);
  }

  // === Phase-specific spawn helpers ===

  private spawnStream() {
    const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
    const c = this.add.container(x, -120);
    const streamGfx = this.add.graphics();
    streamGfx.fillGradientStyle(0x38bdf8, 0x0ea5e9, 0x0ea5e9, 0x0ea5e9, 0.75);
    streamGfx.fillRoundedRect(-22, -60, 44, 120, 8);
    const foam = this.add.graphics();
    foam.fillStyle(0xe0f2fe, 0.9);
    foam.fillEllipse(0, -60, 44, 14);
    c.add([streamGfx, foam]);
    c.setSize(44, 110);
    c.setDepth(6);
    this.streams.push(c);
  }

  private spawnPearl() {
    const x = Phaser.Math.Between(60, GAME_WIDTH - 60);
    const c = this.spawnPearlContainer(x, -30, 'baseX');
    this.pearls.push(c);
  }
}
