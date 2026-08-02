/**
 * WhirlpoolScene - Phase 5: "O Redemoinho Ancestral"
 *
 * Navigating through swirling vortexes and whirlpool currents.
 * Swirling water physics pulls the Koi toward vortex centers if too close!
 */
import Phaser from 'phaser';
import { BaseGameScene, type BaseResult, type GameStatus, type SceneTitle, type ResultText } from './BaseGameScene';

export type WhirlpoolResult = BaseResult & {};

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const KOI_X = GAME_WIDTH * 0.22;
const KOI_W = 90;
const KOI_H = 52;
const WIN_PEARLS = 18;
const MAX_TIME = 60;

export class WhirlpoolScene extends BaseGameScene {
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgMid!: Phaser.GameObjects.TileSprite;
  private whirlpools: Phaser.GameObjects.Container[] = [];
  private pearls: Phaser.GameObjects.Container[] = [];

  private targetY = GAME_HEIGHT / 2;
  private scrollSpeed = 240;
  private spawnTimer = 0;
  private pearlTimer = 0;

  constructor() {
    super('WhirlpoolScene');
  }

  protected getKoiStartPosition() {
    return { x: KOI_X, y: GAME_HEIGHT / 2 };
  }

  protected getKoiDisplaySize() {
    return { w: KOI_W, h: KOI_H };
  }

  protected getSceneTitle(): SceneTitle {
    return {
      title: 'Etapa V',
      subtitle: 'O Redemoinho Ancestral',
      hint: 'Resista à sucção dos redemoinhos • Colete 18 pérolas',
    };
  }

  protected getResultText(status: GameStatus): ResultText {
    if (status === 'win') {
      return { title: 'REDEMOINHO SUPERADO', subtitle: 'Você dominou as forças do abismo do rio!' };
    }
    if (status === 'lose') {
      return { title: 'PUXADO PARA O ABISMO', subtitle: 'A força da água te engoliu desta vez...' };
    }
    return { title: 'JOGO INTERROMPIDO', subtitle: '' };
  }

  protected getWinPearls() { return WIN_PEARLS; }
  protected getMaxTime() { return MAX_TIME; }
  protected canWinByTimeOut() { return true; }

  protected createScene() {
    const { width, height } = this.scale;

    // Deep swirling vortex background
    this.add.rectangle(0, 0, width, height, 0x051e2e).setOrigin(0, 0).setScrollFactor(0).setDepth(-10);

    this.bgFar = this.add.tileSprite(0, 0, width, height, 'river-bg-far')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.6).setTint(0x0284c7).setDepth(-5);
    this.bgMid = this.add.tileSprite(0, 0, width, height, 'river-bg-mid')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.8).setTint(0x0369a1).setDepth(-4);

    this.whirlpools = [];
    this.pearls = [];
  }

  protected onPointerMove(pointer: Phaser.Input.Pointer): void {
    const worldPoint = this.getWorldPointer(pointer);
    this.targetY = Phaser.Math.Clamp(worldPoint.y, 60, GAME_HEIGHT - 60);
  }

  protected updateScene(dt: number, time: number): number {
    this.scrollSpeed = 240 + Math.min(160, this.elapsed * 4);

    this.bgFar.tilePositionX += this.scrollSpeed * dt * 0.15;
    this.bgMid.tilePositionX += this.scrollSpeed * dt * 0.4;

    // Keyboard controls
    const kb = this.keyboard;
    if (kb.cursors) {
      const kbSpeed = 400;
      if (kb.cursors.up.isDown || kb.W.isDown) this.targetY -= kbSpeed * dt;
      if (kb.cursors.down.isDown || kb.S.isDown) this.targetY += kbSpeed * dt;
    }
    this.targetY = Phaser.Math.Clamp(this.targetY, 60, GAME_HEIGHT - 60);

    // Suction pull from nearby whirlpools!
    let suctionY = 0;
    this.whirlpools.forEach((w) => {
      const dx = this.koi.x - w.x;
      const dy = this.koi.y - w.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        const force = (1 - dist / 180) * 180;
        suctionY += dy > 0 ? -force : force;
      }
    });

    const newY = Phaser.Math.Linear(this.koi.y, this.targetY + suctionY, 1 - Math.pow(0.001, dt));
    const koiVelY = (newY - this.koi.y) / dt;
    this.koi.y = newY;

    // Tilt
    const targetAngle = Phaser.Math.Clamp(koiVelY * 0.04, -30, 30);
    this.koi.rotation = Phaser.Math.Linear(this.koi.rotation, Phaser.Math.DegToRad(targetAngle), 1 - Math.pow(0.001, dt));

    // Spawn whirlpools
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnWhirlpool();
      this.spawnTimer = 1.2 + Math.random() * 0.8;
    }

    // Spawn pearls
    this.pearlTimer -= dt;
    if (this.pearlTimer <= 0) {
      this.spawnPearl();
      this.pearlTimer = 1.1 + Math.random() * 1.3;
    }

    // Update whirlpool obstacles
    for (let i = this.whirlpools.length - 1; i >= 0; i--) {
      const w = this.whirlpools[i];
      w.x -= this.scrollSpeed * dt;
      w.rotation += 2.5 * dt;

      if (w.x < -100) {
        w.destroy();
        this.whirlpools.splice(i, 1);
        continue;
      }

      if (!this.invincible && this.hitsKoi(w, 65, 65)) {
        this.takeHit(60);
      }
    }

    // Update pearls
    for (let i = this.pearls.length - 1; i >= 0; i--) {
      const p = this.pearls[i];
      p.x -= this.scrollSpeed * dt;
      const dx = this.koi.x - p.x;
      const dy = this.koi.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 130) {
        const pull = (1 - dist / 130) * 420 * dt;
        p.x += (dx / dist) * pull;
        p.y += (dy / dist) * pull;
      }

      if (dist < 34) {
        this.collectPearl(p, 120);
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

    return (this.scrollSpeed - 240) / 160;
  }

  protected shutdownScene() {
    this.whirlpools.forEach((w) => w.destroy());
    this.pearls.forEach((p) => p.destroy());
    this.whirlpools = [];
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

  private spawnWhirlpool() {
    const y = Phaser.Math.Between(90, GAME_HEIGHT - 90);
    const c = this.add.container(GAME_WIDTH + 60, y);
    const img = this.add.image(0, 0, 'whirlpool').setDisplaySize(85, 85).setTint(0x38bdf8);
    const glow = this.add.image(0, 0, 'pearl').setDisplaySize(110, 110).setAlpha(0.25).setTint(0x0284c7);
    c.add([glow, img]);
    c.setSize(70, 70);
    c.setDepth(6);
    this.whirlpools.push(c);
  }

  private spawnPearl() {
    const y = Phaser.Math.Between(90, GAME_HEIGHT - 90);
    const c = this.spawnPearlContainer(GAME_WIDTH + 30, y, 'baseY');
    this.pearls.push(c);
  }
}
