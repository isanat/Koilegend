/**
 * NightScene - Stage 6: "A Escuridão da Noite"
 * Dark starless night with night vision mask. Bioluminescent glowing aura around
 * the Koi illuminates hidden jagged rocks and bioluminescent pearls!
 */
import Phaser from 'phaser';
import { BaseGameScene, type BaseResult, type GameStatus, type SceneTitle, type ResultText } from './BaseGameScene';

export class NightScene extends BaseGameScene {
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgMid!: Phaser.GameObjects.TileSprite;
  private nightOverlay!: Phaser.GameObjects.Graphics;
  private rocks: Phaser.GameObjects.Container[] = [];
  private pearls: Phaser.GameObjects.Container[] = [];

  private targetY = 360;
  private scrollSpeed = 240;
  private spawnTimer = 0;
  private pearlTimer = 0;

  constructor() {
    super('NightScene');
  }

  protected getKoiStartPosition() { return { x: 280, y: 360 }; }
  protected getKoiDisplaySize() { return { w: 90, h: 52 }; }

  protected getSceneTitle(): SceneTitle {
    return {
      title: 'Etapa VI',
      subtitle: 'A Escuridão da Noite',
      hint: 'Confie nos seus instintos! Sua aura bioluminescente revela rochas na escuridão.',
    };
  }

  protected getResultText(status: GameStatus): ResultText {
    if (status === 'win') {
      return { title: 'NOITE VENCIDA!', subtitle: 'Sua luz interior guiou seu caminho através da escuridão absoluta.' };
    }
    if (status === 'lose') {
      return { title: 'PERDIDO NA NOITE', subtitle: 'A escuridão ocultou os perigos do rio. Tente novamente!' };
    }
    return { title: 'JOGO INTERROMPIDO', subtitle: '' };
  }

  protected getWinPearls() { return 18; }
  protected getMaxTime() { return 60; }
  protected canWinByTimeOut() { return true; }

  protected createScene() {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x020617).setOrigin(0, 0).setScrollFactor(0).setDepth(-10);

    this.bgFar = this.add.tileSprite(0, 0, width, height, 'river-bg-far')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.3).setTint(0x1e1b4b).setDepth(-5);
    this.bgMid = this.add.tileSprite(0, 0, width, height, 'river-bg-mid')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.4).setTint(0x312e81).setDepth(-4);

    // Dark vision mask graphics layer
    this.nightOverlay = this.add.graphics().setScrollFactor(0).setDepth(20);

    this.rocks = [];
    this.pearls = [];
  }

  protected shutdownScene() {
    this.rocks.forEach(r => r.destroy());
    this.pearls.forEach(p => p.destroy());
    if (this.nightOverlay) this.nightOverlay.destroy();
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

  protected onPointerMove(pointer: Phaser.Input.Pointer): void {
    const worldPoint = this.getWorldPointer(pointer);
    this.targetY = Phaser.Math.Clamp(worldPoint.y, 60, 660);
  }

  protected updateScene(dt: number, time: number): number {
    this.scrollSpeed = 240 + Math.min(150, this.elapsed * 3);
    this.bgFar.tilePositionX += this.scrollSpeed * dt * 0.15;
    this.bgMid.tilePositionX += this.scrollSpeed * dt * 0.4;

    const kb = this.keyboard;
    if (kb.cursors) {
      const kbSpeed = 400;
      if (kb.cursors.up.isDown || kb.W.isDown) this.targetY -= kbSpeed * dt;
      if (kb.cursors.down.isDown || kb.S.isDown) this.targetY += kbSpeed * dt;
    }
    this.targetY = Phaser.Math.Clamp(this.targetY, 60, 660);

    const newY = Phaser.Math.Linear(this.koi.y, this.targetY, 1 - Math.pow(0.001, dt));
    this.koi.y = newY;

    // Render Bioluminescent vision aura around the Koi & pearls!
    const { width, height } = this.scale;
    this.nightOverlay.clear();
    this.nightOverlay.fillStyle(0x020617, 0.88);
    this.nightOverlay.fillRect(0, 0, width, height);

    // Cutout aura around Koi
    const auraRadius = this.equippedNft === 'Visão do Instinto' ? 260 : 180;
    this.nightOverlay.fillStyle(0x38bdf8, 0.0); // Transparent hole visually simulated with soft rings
    for (let r = auraRadius; r > 0; r -= 20) {
      this.nightOverlay.fillStyle(0x020617, Math.max(0, (r / auraRadius) - 0.2));
      this.nightOverlay.fillCircle(this.koi.x, this.koi.y, r);
    }

    // Spawn rocks
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnRock();
      this.spawnTimer = 1.3 + Math.random() * 0.9;
    }

    // Spawn pearls
    this.pearlTimer -= dt;
    if (this.pearlTimer <= 0) {
      this.spawnPearl();
      this.pearlTimer = 1.0 + Math.random() * 1.1;
    }

    // Update rocks
    for (let i = this.rocks.length - 1; i >= 0; i--) {
      const r = this.rocks[i];
      r.x -= this.scrollSpeed * dt;
      if (r.x < -100) {
        r.destroy();
        this.rocks.splice(i, 1);
        continue;
      }

      if (!this.invincible && this.hitsKoi(r, 55, 55)) {
        this.takeHit(60);
      }
    }

    // Update pearls
    for (let i = this.pearls.length - 1; i >= 0; i--) {
      const prl = this.pearls[i];
      prl.x -= this.scrollSpeed * dt;
      if (prl.x < -40) {
        prl.destroy();
        this.pearls.splice(i, 1);
        continue;
      }

      if (this.hitsKoi(prl, 35, 35)) {
        this.collectPearl(prl.x, prl.y);
        prl.destroy();
        this.pearls.splice(i, 1);
      }
    }

    return dt;
  }

  private spawnRock() {
    const y = 80 + Math.random() * 560;
    const container = this.add.container(1380, y).setDepth(10);
    const rockSpr = this.add.image(0, 0, 'rock').setDisplaySize(80, 65).setTint(0x475569);
    container.add([rockSpr]);
    this.rocks.push(container);
  }

  private spawnPearl() {
    const y = 80 + Math.random() * 560;
    const container = this.add.container(1340, y).setDepth(12);
    const glow = this.add.circle(0, 0, 20, 0x38bdf8, 0.8);
    const spr = this.add.image(0, 0, 'pearl').setDisplaySize(30, 30);
    container.add([glow, spr]);
    this.pearls.push(container);
  }
}
