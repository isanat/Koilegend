/**
 * StormScene - Phase 7: "A Tempestade Elétrica"
 *
 * High-intensity storm with electric lightning bolts and storm surges!
 */
import Phaser from 'phaser';
import { BaseGameScene, type BaseResult, type GameStatus, type SceneTitle, type ResultText } from './BaseGameScene';

export type StormResult = BaseResult & {};

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const KOI_X = GAME_WIDTH * 0.22;
const KOI_W = 90;
const KOI_H = 52;
const WIN_PEARLS = 20;
const MAX_TIME = 60;

export class StormScene extends BaseGameScene {
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgMid!: Phaser.GameObjects.TileSprite;
  private lightningWarnings: { x: number; y: number; timer: number; graphic: Phaser.GameObjects.Graphics }[] = [];
  private pearls: Phaser.GameObjects.Container[] = [];
  private stormGfx!: Phaser.GameObjects.Graphics;

  private targetY = GAME_HEIGHT / 2;
  private scrollSpeed = 260;
  private strikeTimer = 0;
  private pearlTimer = 0;

  constructor() {
    super('StormScene');
  }

  protected getKoiStartPosition() {
    return { x: KOI_X, y: GAME_HEIGHT / 2 };
  }

  protected getKoiDisplaySize() {
    return { w: KOI_W, h: KOI_H };
  }

  protected getSceneTitle(): SceneTitle {
    return {
      title: 'Etapa VII',
      subtitle: 'A Tempestade Elétrica',
      hint: 'Evite os raios telegrafados em vermelho • Colete 20 pérolas',
    };
  }

  protected getResultText(status: GameStatus): ResultText {
    if (status === 'win') {
      return { title: 'TEMPESTADE DOMADA', subtitle: 'Sua determinação cortou os raios do céu!' };
    }
    if (status === 'lose') {
      return { title: 'ATINGIDO PELA TEMPESTADE', subtitle: 'A fúria elétrica dos céus te derrubou...' };
    }
    return { title: 'JOGO INTERROMPIDO', subtitle: '' };
  }

  protected getWinPearls() { return WIN_PEARLS; }
  protected getMaxTime() { return MAX_TIME; }
  protected canWinByTimeOut() { return true; }

  protected createScene() {
    const { width, height } = this.scale;

    // Dark tempest background
    this.add.rectangle(0, 0, width, height, 0x030712).setOrigin(0, 0).setScrollFactor(0).setDepth(-10);

    this.bgFar = this.add.tileSprite(0, 0, width, height, 'river-bg-far')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.7).setTint(0x3b82f6).setDepth(-5);
    this.bgMid = this.add.tileSprite(0, 0, width, height, 'river-bg-mid')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.85).setTint(0x1d4ed8).setDepth(-4);

    this.stormGfx = this.add.graphics().setDepth(25);
    this.lightningWarnings = [];
    this.pearls = [];
  }

  protected onPointerMove(pointer: Phaser.Input.Pointer): void {
    const worldPoint = this.getWorldPointer(pointer);
    this.targetY = Phaser.Math.Clamp(worldPoint.y, 60, GAME_HEIGHT - 60);
  }

  protected updateScene(dt: number, time: number): number {
    this.scrollSpeed = 260 + Math.min(180, this.elapsed * 4.5);

    this.bgFar.tilePositionX += this.scrollSpeed * dt * 0.2;
    this.bgMid.tilePositionX += this.scrollSpeed * dt * 0.5;

    // Keyboard
    const kb = this.keyboard;
    if (kb.cursors) {
      const kbSpeed = 420;
      if (kb.cursors.up.isDown || kb.W.isDown) this.targetY -= kbSpeed * dt;
      if (kb.cursors.down.isDown || kb.S.isDown) this.targetY += kbSpeed * dt;
    }
    this.targetY = Phaser.Math.Clamp(this.targetY, 60, GAME_HEIGHT - 60);

    const newY = Phaser.Math.Linear(this.koi.y, this.targetY, 1 - Math.pow(0.001, dt));
    const koiVelY = (newY - this.koi.y) / dt;
    this.koi.y = newY;

    // Tilt
    const targetAngle = Phaser.Math.Clamp(koiVelY * 0.04, -30, 30);
    this.koi.rotation = Phaser.Math.Linear(this.koi.rotation, Phaser.Math.DegToRad(targetAngle), 1 - Math.pow(0.001, dt));

    // Spawn lightning strike telegraphed warning
    this.strikeTimer -= dt;
    if (this.strikeTimer <= 0) {
      this.spawnLightningWarning();
      this.strikeTimer = 0.9 + Math.random() * 0.6;
    }

    // Update lightning strike warnings
    this.stormGfx.clear();
    for (let i = this.lightningWarnings.length - 1; i >= 0; i--) {
      const lw = this.lightningWarnings[i];
      lw.timer -= dt;

      // Draw red warning beam
      if (lw.timer > 0) {
        const pulse = Math.sin(time / 50) * 0.3 + 0.7;
        lw.graphic.clear();
        lw.graphic.fillStyle(0xef4444, 0.25 * pulse);
        lw.graphic.fillRect(lw.x - 30, 0, 60, GAME_HEIGHT);
        lw.graphic.lineStyle(2, 0xef4444, 0.8 * pulse);
        lw.graphic.strokeRect(lw.x - 30, 0, 60, GAME_HEIGHT);
      } else {
        // LIGHTNING STRIKES!
        lw.graphic.clear();
        lw.graphic.fillStyle(0xffffff, 0.9);
        lw.graphic.fillRect(lw.x - 20, 0, 40, GAME_HEIGHT);
        lw.graphic.lineStyle(4, 0x60a5fa, 1);
        lw.graphic.lineBetween(lw.x, 0, lw.x, GAME_HEIGHT);

        // Check hit if Koi is in strike column
        if (!this.invincible && Math.abs(this.koi.x - lw.x) < 45) {
          this.takeHit(70);
        }

        // Cleanup after strike flash
        this.time.delayedCall(120, () => {
          lw.graphic.destroy();
        });
        this.lightningWarnings.splice(i, 1);
      }
    }

    // Spawn pearls
    this.pearlTimer -= dt;
    if (this.pearlTimer <= 0) {
      this.spawnPearl();
      this.pearlTimer = 1.0 + Math.random() * 1.2;
    }

    // Update pearls
    for (let i = this.pearls.length - 1; i >= 0; i--) {
      const p = this.pearls[i];
      p.x -= this.scrollSpeed * dt;
      const dx = this.koi.x - p.x;
      const dy = this.koi.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 140) {
        const pull = (1 - dist / 140) * 440 * dt;
        p.x += (dx / dist) * pull;
        p.y += (dy / dist) * pull;
      }

      if (dist < 34) {
        this.collectPearl(p, 150);
        p.destroy();
        this.pearls.splice(i, 1);
        continue;
      }
      if (p.x < -50) {
        p.destroy();
        this.pearls.splice(i, 1);
      }
    }

    if (this.pearlsCollected >= WIN_PEARLS) {
      this.finish('win');
    }

    return (this.scrollSpeed - 260) / 180;
  }

  protected shutdownScene() {
    this.lightningWarnings.forEach((lw) => lw.graphic.destroy());
    this.pearls.forEach((p) => p.destroy());
    this.lightningWarnings = [];
    this.pearls = [];
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

  private spawnLightningWarning() {
    const x = Phaser.Math.Between(250, GAME_WIDTH - 100);
    const g = this.add.graphics().setDepth(20);
    this.lightningWarnings.push({
      x,
      y: GAME_HEIGHT / 2,
      timer: 0.8, // 0.8 seconds warning before bolt strikes!
      graphic: g,
    });
  }

  private spawnPearl() {
    const y = Phaser.Math.Between(90, GAME_HEIGHT - 90);
    const c = this.spawnPearlContainer(GAME_WIDTH + 30, y, 'baseY');
    this.pearls.push(c);
  }
}
