/**
 * PeerPressureScene - Stage 4: "O Encontro com os Outros Peixes"
 * Rival mocking fish swim alongside, shooting doubt/mockery orbs.
 * Collect golden courage pearls & maintain high confidence meter!
 */
import Phaser from 'phaser';
import { BaseGameScene, type BaseResult, type GameStatus, type SceneTitle, type ResultText } from './BaseGameScene';

export class PeerPressureScene extends BaseGameScene {
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgMid!: Phaser.GameObjects.TileSprite;
  private rivalFish: Phaser.GameObjects.Container[] = [];
  private doubtOrbs: Phaser.GameObjects.Container[] = [];
  private pearls: Phaser.GameObjects.Container[] = [];

  private targetY = 360;
  private scrollSpeed = 260;
  private spawnTimer = 0;
  private pearlTimer = 0;

  constructor() {
    super('PeerPressureScene');
  }

  protected getKoiStartPosition() { return { x: 280, y: 360 }; }
  protected getKoiDisplaySize() { return { w: 90, h: 52 }; }

  protected getSceneTitle(): SceneTitle {
    return {
      title: 'Etapa IV',
      subtitle: 'O Encontro com os Outros Peixes',
      hint: 'Ignore a zombaria dos rivais! Colete pérolas de coragem inabalável.',
    };
  }

  protected getResultText(status: GameStatus): ResultText {
    if (status === 'win') {
      return { title: 'CONFIANÇA INABALÁVEL!', subtitle: 'Você provou a nobreza de sua determinação e calou os céticos.' };
    }
    if (status === 'lose') {
      return { title: 'DÚVIDA VENCEU', subtitle: 'A zombaria abalou sua determinação. Tente novamente com mais fé!' };
    }
    return { title: 'JOGO INTERROMPIDO', subtitle: '' };
  }

  protected getWinPearls() { return 18; }
  protected getMaxTime() { return 60; }
  protected canWinByTimeOut() { return true; }

  protected createScene() {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x451a03).setOrigin(0, 0).setScrollFactor(0).setDepth(-10);

    this.bgFar = this.add.tileSprite(0, 0, width, height, 'river-bg-far')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.65).setTint(0xb45309).setDepth(-5);
    this.bgMid = this.add.tileSprite(0, 0, width, height, 'river-bg-mid')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.85).setTint(0xd97706).setDepth(-4);

    this.rivalFish = [];
    this.doubtOrbs = [];
    this.pearls = [];
  }

  protected shutdownScene() {
    this.rivalFish.forEach(f => f.destroy());
    this.doubtOrbs.forEach(o => o.destroy());
    this.pearls.forEach(p => p.destroy());
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
    this.scrollSpeed = 260 + Math.min(160, this.elapsed * 3.2);
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

    // Spawn rival mocking fish
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnRival();
      this.spawnTimer = 1.2 + Math.random() * 0.8;
    }

    // Spawn pearls
    this.pearlTimer -= dt;
    if (this.pearlTimer <= 0) {
      this.spawnPearl();
      this.pearlTimer = 1.0 + Math.random() * 1.1;
    }

    // Update doubt orbs
    for (let i = this.doubtOrbs.length - 1; i >= 0; i--) {
      const orb = this.doubtOrbs[i];
      orb.x -= 420 * dt;
      if (orb.x < -60) {
        orb.destroy();
        this.doubtOrbs.splice(i, 1);
        continue;
      }

      if (!this.invincible && this.hitsKoi(orb, 40, 40)) {
        this.takeHit(45);
      }
    }

    // Update rival fish
    for (let i = this.rivalFish.length - 1; i >= 0; i--) {
      const rival = this.rivalFish[i];
      rival.x -= this.scrollSpeed * dt * 0.9;

      // Periodically fire doubt orbs
      const fireTimer = (rival.getData('fireTimer') || 0) - dt;
      if (fireTimer <= 0) {
        this.fireDoubtOrb(rival.x, rival.y);
        rival.setData('fireTimer', 1.5 + Math.random() * 1.0);
      } else {
        rival.setData('fireTimer', fireTimer);
      }

      if (rival.x < -120) {
        rival.destroy();
        this.rivalFish.splice(i, 1);
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

  private spawnRival() {
    const y = 100 + Math.random() * 520;
    const container = this.add.container(1380, y).setDepth(9);
    const bgGlow = this.add.ellipse(0, 0, 70, 40, 0xf59e0b, 0.4);
    const spr = this.add.image(0, 0, 'koi').setDisplaySize(80, 45).setTint(0x92400e);
    container.add([bgGlow, spr]);
    container.setData('fireTimer', 0.5);
    this.rivalFish.push(container);
  }

  private fireDoubtOrb(x: number, y: number) {
    const orbContainer = this.add.container(x - 20, y).setDepth(10);
    const glow = this.add.circle(0, 0, 18, 0xf59e0b, 0.7);
    const inner = this.add.circle(0, 0, 10, 0xef4444, 0.9);
    orbContainer.add([glow, inner]);
    this.doubtOrbs.push(orbContainer);
  }

  private spawnPearl() {
    const y = 80 + Math.random() * 560;
    const container = this.add.container(1340, y).setDepth(8);
    const glow = this.add.circle(0, 0, 16, 0xf59e0b, 0.7);
    const spr = this.add.image(0, 0, 'pearl').setDisplaySize(28, 28);
    container.add([glow, spr]);
    this.pearls.push(container);
  }
}
