/**
 * RiverScene - Phase 1: "O Nascimento no Rio Turbulento"
 *
 * Side-scrolling survival swim. Koi at 22% from left, sees 78% ahead.
 *
 * GAME DESIGN PRINCIPLES:
 * 1. SCALE: Koi ~7% of screen width (proper side-scroller proportion).
 * 2. FIELD OF VIEW: Koi at 22% from left, 78% of screen shows what's ahead.
 * 3. DYNAMIC CAMERA: Zoom out at high speed (inherited from BaseGameScene).
 * 4. SPEED PERCEPTION: Speed lines when velocity > 30% of max.
 * 5. OBSTACLE LEGIBILITY: Rocks have black outline to pop from background.
 *
 * Inherits HUD, title/result cards, input, damage system, particles from
 * BaseGameScene. Only implements phase-specific logic here.
 */
import Phaser from 'phaser';
import { BaseGameScene, type BaseResult, type GameStatus, type SceneTitle, type ResultText } from './BaseGameScene';

export type RiverResult = BaseResult & {
  // River-specific extra fields can go here if needed
};

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const KOI_X = GAME_WIDTH * 0.22;
const KOI_W = 90;
const KOI_H = 52;
const WIN_PEARLS = 15;
const MAX_TIME = 60; // seconds — surviving 60s with enough pearls wins

export class RiverScene extends BaseGameScene {
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgMid!: Phaser.GameObjects.TileSprite;
  private bgNear!: Phaser.GameObjects.TileSprite;
  private rocks: Phaser.GameObjects.Container[] = [];
  private pearls: Phaser.GameObjects.Container[] = [];
  private speedLines!: Phaser.GameObjects.Graphics;

  private targetY = GAME_HEIGHT / 2;
  private scrollSpeed = 220;
  private readonly baseScrollSpeed = 220;
  private spawnTimer = 0;
  private pearlTimer = 0;

  constructor() {
    super('RiverScene');
  }

  // === Abstract method implementations ===

  protected getKoiStartPosition() {
    return { x: KOI_X, y: GAME_HEIGHT / 2 };
  }

  protected getKoiDisplaySize() {
    return { w: KOI_W, h: KOI_H };
  }

  protected getSceneTitle(): SceneTitle {
    return {
      title: 'Etapa I',
      subtitle: 'O Nascimento no Rio Turbulento',
      hint: 'Mova o mouse ou W/S • Sobreviva e colete pérolas',
    };
  }

  protected getResultText(status: GameStatus): ResultText {
    if (status === 'win') {
      // Distinguish win-by-pearls vs win-by-timeout
      if (this.pearlsCollected >= WIN_PEARLS) {
        return { title: 'VITÓRIA', subtitle: 'Você sobreviveu ao Rio Turbulento!' };
      }
      return { title: 'SOBREVIVEU', subtitle: 'O tempo acabou, mas você resistiu à correnteza.' };
    }
    if (status === 'lose') {
      return { title: 'O KOI CAIU', subtitle: 'A correnteza foi mais forte desta vez...' };
    }
    return { title: 'JOGO INTERROMPIDO', subtitle: '' };
  }

  protected getWinPearls() { return WIN_PEARLS; }
  protected getMaxTime() { return MAX_TIME; }
  protected canWinByTimeOut() { return true; } // surviving 60s also wins (with honest text)

  protected createScene() {
    const { width, height } = this.scale;

    // Deep water base
    this.add.rectangle(0, 0, width, height, 0x0a1929).setOrigin(0, 0).setScrollFactor(0).setDepth(-10);

    // Parallax 3 layers
    this.bgFar = this.add.tileSprite(0, 0, width, height, 'river-bg-far')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.65).setDepth(-5);
    this.bgMid = this.add.tileSprite(0, 0, width, height, 'river-bg-mid')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.8).setDepth(-4);
    this.bgNear = this.add.tileSprite(0, 0, width, height, 'river-bg-near')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.9).setDepth(-3);

    // God rays
    const rays = this.add.graphics().setScrollFactor(0).setDepth(-2);
    for (let i = 0; i < 6; i++) {
      const x = 100 + i * 220;
      rays.fillStyle(0xfde68a, 0.05);
      rays.fillTriangle(x, 0, x + 40, 0, x + 80, height);
    }

    // Speed lines graphics
    this.speedLines = this.add.graphics().setScrollFactor(0).setDepth(15);

    this.rocks = [];
    this.pearls = [];
  }

  protected onPointerMove(pointer: Phaser.Input.Pointer): void {
    // Use the camera API instead of manual coordinate conversion
    const worldPoint = this.getWorldPointer(pointer);
    this.targetY = Phaser.Math.Clamp(worldPoint.y, 50, GAME_HEIGHT - 50);
  }

  protected updateScene(dt: number, time: number): number {
    // Ramp difficulty
    this.scrollSpeed = this.baseScrollSpeed + Math.min(180, this.elapsed * 3.5);
    const speedFactor = (this.scrollSpeed - this.baseScrollSpeed) / 180; // 0..1

    // Parallax (3 distinct speeds)
    this.bgFar.tilePositionX += this.scrollSpeed * dt * 0.1;
    this.bgMid.tilePositionX += this.scrollSpeed * dt * 0.35;
    this.bgNear.tilePositionX += this.scrollSpeed * dt * 0.7;

    // Keyboard movement
    const kb = this.keyboard;
    if (kb.cursors) {
      const kbSpeed = 380;
      if (kb.cursors.up.isDown || kb.W.isDown) this.targetY -= kbSpeed * dt;
      if (kb.cursors.down.isDown || kb.S.isDown) this.targetY += kbSpeed * dt;
    }
    this.targetY = Phaser.Math.Clamp(this.targetY, 50, GAME_HEIGHT - 50);

    // Smooth Y interpolation
    const newY = Phaser.Math.Linear(this.koi.y, this.targetY, 1 - Math.pow(0.001, dt));
    const koiVelY = (newY - this.koi.y) / dt;
    this.koi.y = newY;

    // Tilt based on vertical velocity
    const targetAngle = Phaser.Math.Clamp(koiVelY * 0.04, -25, 25);
    this.koi.rotation = Phaser.Math.Linear(this.koi.rotation, Phaser.Math.DegToRad(targetAngle), 1 - Math.pow(0.001, dt));

    // Tail wiggle
    const wiggle = Math.sin(time / 80) * 0.05;
    this.koiBody.setScale(1 + wiggle, 1 - wiggle * 0.5);

    // Speed lines (motion feedback when fast)
    this.speedLines.clear();
    if (speedFactor > 0.3) {
      const intensity = (speedFactor - 0.3) / 0.7;
      this.speedLines.lineStyle(2, 0xffffff, intensity * 0.4);
      const numLines = Math.floor(intensity * 8) + 2;
      for (let i = 0; i < numLines; i++) {
        const y = ((time * 0.8 + i * 90) % GAME_HEIGHT);
        const len = 60 + intensity * 80;
        this.speedLines.lineBetween(GAME_WIDTH - len - (i * 50) % 200, y, GAME_WIDTH - (i * 50) % 200, y);
      }
    }

    // Spawn rocks
    this.spawnTimer -= dt;
    const spawnInterval = Math.max(0.7, 1.6 - this.elapsed * 0.01);
    if (this.spawnTimer <= 0) {
      this.spawnRock();
      this.spawnTimer = spawnInterval + Math.random() * 0.5;
    }

    // Spawn pearls
    this.pearlTimer -= dt;
    if (this.pearlTimer <= 0) {
      this.spawnPearl();
      this.pearlTimer = 1.3 + Math.random() * 1.5;
    }

    // Update rocks — AABB collision via shared helper
    for (let i = this.rocks.length - 1; i >= 0; i--) {
      const r = this.rocks[i];
      r.x -= this.scrollSpeed * dt;
      r.rotation += 0.3 * dt;
      if (r.x < -100) {
        r.destroy();
        this.rocks.splice(i, 1);
        continue;
      }
      if (!this.invincible && this.hitsKoi(r, 50, 40)) {
        this.takeHit(50);
      }
    }

    // Update pearls
    for (let i = this.pearls.length - 1; i >= 0; i--) {
      const p = this.pearls[i];
      p.x -= this.scrollSpeed * dt;
      const bob = Math.sin((time + i * 200) / 200) * 6;
      p.y = (p.getData('baseY') as number) + bob;
      p.rotation += 2 * dt;

      // Magnetism (radial — distance is appropriate here)
      const dx = this.koi.x - p.x;
      const dy = this.koi.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const pull = (1 - dist / 120) * 380 * dt;
        p.x += (dx / dist) * pull;
        p.y += (dy / dist) * pull;
      }

      if (dist < 32) {
        this.collectPearl(p, 100);
        p.destroy();
        this.pearls.splice(i, 1);
        continue;
      }
      if (p.x < -50) {
        p.destroy();
        this.pearls.splice(i, 1);
      }
    }

    // Win by pearls (early win if collected enough)
    if (this.pearlsCollected >= WIN_PEARLS) {
      this.finish('win');
    }

    return speedFactor;
  }

  protected shutdownScene() {
    this.rocks.forEach((r) => r.destroy());
    this.pearls.forEach((p) => p.destroy());
    this.rocks = [];
    this.pearls = [];
    this.speedLines?.destroy();
  }

  protected buildResult(status: GameStatus): BaseResult {
    return {
      status,
      pearls: this.pearlsCollected,
      timeSurvived: Math.floor(this.elapsed),
      score: this.score,
      maxHits: this.MAX_HITS,
      hitsTaken: this.hits,
      maxCombo: this.maxCombo,
    };
  }

  // === Phase-specific spawn helpers ===

  private spawnRock() {
    const y = Phaser.Math.Between(70, GAME_HEIGHT - 70);
    const c = this.add.container(GAME_WIDTH + 60, y);
    const scale = Phaser.Math.FloatBetween(0.7, 1.0);
    const outline = this.add.image(0, 0, 'rock').setDisplaySize(72, 62).setTint(0x000000).setAlpha(0.5);
    const img = this.add.image(0, 0, 'rock').setDisplaySize(68, 58);
    outline.setScale(scale);
    img.setScale(scale);
    c.add([outline, img]);
    c.setSize(55 * scale, 45 * scale);
    c.setDepth(6);
    this.rocks.push(c);
  }

  private spawnPearl() {
    const y = Phaser.Math.Between(80, GAME_HEIGHT - 80);
    const c = this.spawnPearlContainer(GAME_WIDTH + 30, y, 'baseY');
    this.pearls.push(c);
  }
}
