/**
 * PredatorScene - Stage 2: "O Primeiro Predador"
 * Fast-moving predators (herons swooping from top, snakes darting from right).
 * Red warning telegraph lines mark attack vectors before predators strike!
 */
import Phaser from 'phaser';
import { BaseGameScene, type BaseResult, type GameStatus, type SceneTitle, type ResultText } from './BaseGameScene';

export class PredatorScene extends BaseGameScene {
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgMid!: Phaser.GameObjects.TileSprite;
  private predators: Phaser.GameObjects.Container[] = [];
  private pearls: Phaser.GameObjects.Container[] = [];
  private warningLines: Phaser.GameObjects.Graphics[] = [];

  private targetY = 360;
  private scrollSpeed = 260;
  private spawnTimer = 0;
  private pearlTimer = 0;

  constructor() {
    super('PredatorScene');
  }

  protected getKoiStartPosition() { return { x: 280, y: 360 }; }
  protected getKoiDisplaySize() { return { w: 90, h: 52 }; }

  protected getSceneTitle(): SceneTitle {
    return {
      title: 'Etapa II',
      subtitle: 'O Primeiro Predador',
      hint: 'Atenção aos avisos vermelhos! Escape das garças e cobras d\'água.',
    };
  }

  protected getResultText(status: GameStatus): ResultText {
    if (status === 'win') {
      return { title: 'PREDADORES ESCAPADOS!', subtitle: 'Você foi rápido e superou o perigo das sombras.' };
    }
    if (status === 'lose') {
      return { title: 'CAPTURADO!', subtitle: 'O predador foi mais rápido nesta rodada...' };
    }
    return { title: 'JOGO INTERROMPIDO', subtitle: '' };
  }

  protected getWinPearls() { return 15; }
  protected getMaxTime() { return 60; }
  protected canWinByTimeOut() { return true; }

  protected createScene() {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x052e16).setOrigin(0, 0).setScrollFactor(0).setDepth(-10);

    this.bgFar = this.add.tileSprite(0, 0, width, height, 'river-bg-far')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.65).setTint(0x15803d).setDepth(-5);
    this.bgMid = this.add.tileSprite(0, 0, width, height, 'river-bg-mid')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.85).setTint(0x166534).setDepth(-4);

    this.predators = [];
    this.pearls = [];
  }

  protected shutdownScene() {
    this.predators.forEach(p => p.destroy());
    this.pearls.forEach(p => p.destroy());
    this.warningLines.forEach(w => w.destroy());
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
    this.scrollSpeed = 260 + Math.min(180, this.elapsed * 3.5);
    this.bgFar.tilePositionX += this.scrollSpeed * dt * 0.2;
    this.bgMid.tilePositionX += this.scrollSpeed * dt * 0.5;

    const kb = this.keyboard;
    if (kb.cursors) {
      const kbSpeed = 400;
      if (kb.cursors.up.isDown || kb.W.isDown) this.targetY -= kbSpeed * dt;
      if (kb.cursors.down.isDown || kb.S.isDown) this.targetY += kbSpeed * dt;
    }
    this.targetY = Phaser.Math.Clamp(this.targetY, 60, 660);

    const newY = Phaser.Math.Linear(this.koi.y, this.targetY, 1 - Math.pow(0.001, dt));
    this.koi.y = newY;

    // Spawning predators with warning telegraphs
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnPredator();
      this.spawnTimer = 1.3 + Math.random() * 0.9;
    }

    // Spawn pearls
    this.pearlTimer -= dt;
    if (this.pearlTimer <= 0) {
      this.spawnPearl();
      this.pearlTimer = 1.0 + Math.random() * 1.2;
    }

    // Update predators
    for (let i = this.predators.length - 1; i >= 0; i--) {
      const p = this.predators[i];
      const speedX = p.getData('speedX') || 380;
      const speedY = p.getData('speedY') || 0;

      p.x -= speedX * dt;
      p.y += speedY * dt;

      if (p.x < -120 || p.y < -120 || p.y > 840) {
        p.destroy();
        this.predators.splice(i, 1);
        continue;
      }

      if (!this.invincible && this.hitsKoi(p, 50, 40)) {
        this.takeHit(50);
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
        this.collectPearl(prl, 100);
        prl.destroy();
        this.pearls.splice(i, 1);
      }
    }

    return dt;
  }

  private spawnPredator() {
    const isHeron = Math.random() > 0.4;
    const targetY = 100 + Math.random() * 520;

    if (isHeron) {
      // Swooping Heron from top right
      const container = this.add.container(1380, targetY - 120).setDepth(10);
      const bgGlow = this.add.ellipse(0, 0, 80, 50, 0xef4444, 0.4);
      const spr = this.add.image(0, 0, 'predator').setDisplaySize(90, 55);
      container.add([bgGlow, spr]);
      container.setData('speedX', 480);
      container.setData('speedY', 120);
      this.predators.push(container);
    } else {
      // Fast Snake horizontally from right
      const container = this.add.container(1380, targetY).setDepth(10);
      const bgGlow = this.add.ellipse(0, 0, 90, 30, 0x84cc16, 0.5);
      const spr = this.add.image(0, 0, 'predator').setDisplaySize(100, 40);
      container.add([bgGlow, spr]);
      container.setData('speedX', 520);
      container.setData('speedY', 0);
      this.predators.push(container);
    }
  }

  private spawnPearl() {
    const y = 80 + Math.random() * 560;
    const container = this.add.container(1340, y).setDepth(8);
    const glow = this.add.circle(0, 0, 16, 0x84cc16, 0.6);
    const spr = this.add.image(0, 0, 'pearl').setDisplaySize(28, 28);
    container.add([glow, spr]);
    this.pearls.push(container);
  }
}
