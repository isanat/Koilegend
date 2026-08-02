/**
 * CurrentsScene - Stage 3: "As Correntes Enganosas"
 * River branches into multiple channels. Gold stream currents provide speed & pearls;
 * dark trap streams pull koi into rocks or whirlpools!
 */
import Phaser from 'phaser';
import { BaseGameScene, type BaseResult, type GameStatus, type SceneTitle, type ResultText } from './BaseGameScene';

export class CurrentsScene extends BaseGameScene {
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgMid!: Phaser.GameObjects.TileSprite;
  private streams: Phaser.GameObjects.Graphics[] = [];
  private obstacles: Phaser.GameObjects.Container[] = [];
  private pearls: Phaser.GameObjects.Container[] = [];

  private targetY = 360;
  private scrollSpeed = 250;
  private spawnTimer = 0;
  private pearlTimer = 0;

  constructor() {
    super('CurrentsScene');
  }

  protected getKoiStartPosition() { return { x: 280, y: 360 }; }
  protected getKoiDisplaySize() { return { w: 90, h: 52 }; }

  protected getSceneTitle(): SceneTitle {
    return {
      title: 'Etapa III',
      subtitle: 'As Correntes Enganosas',
      hint: 'Escolha a corrente dourada iluminada! Evite as ramificações escuras.',
    };
  }

  protected getResultText(status: GameStatus): ResultText {
    if (status === 'win') {
      return { title: 'SABEDORIA DAS ÁGUAS!', subtitle: 'Você encontrou o caminho perfeito pelas correntes do rio.' };
    }
    if (status === 'lose') {
      return { title: 'PERDIDO NAS ARMADILHAS', subtitle: 'A corrente enganosas levou você às rochas...' };
    }
    return { title: 'JOGO INTERROMPIDO', subtitle: '' };
  }

  protected getWinPearls() { return 16; }
  protected getMaxTime() { return 60; }
  protected canWinByTimeOut() { return true; }

  protected createScene() {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x082f49).setOrigin(0, 0).setScrollFactor(0).setDepth(-10);

    this.bgFar = this.add.tileSprite(0, 0, width, height, 'river-bg-far')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.6).setTint(0x0284c7).setDepth(-5);
    this.bgMid = this.add.tileSprite(0, 0, width, height, 'river-bg-mid')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.8).setTint(0x0369a1).setDepth(-4);

    this.obstacles = [];
    this.pearls = [];
  }

  protected shutdownScene() {
    this.obstacles.forEach(o => o.destroy());
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
    this.scrollSpeed = 250 + Math.min(150, this.elapsed * 3);
    this.bgFar.tilePositionX += this.scrollSpeed * dt * 0.18;
    this.bgMid.tilePositionX += this.scrollSpeed * dt * 0.45;

    const kb = this.keyboard;
    if (kb.cursors) {
      const kbSpeed = 400;
      if (kb.cursors.up.isDown || kb.W.isDown) this.targetY -= kbSpeed * dt;
      if (kb.cursors.down.isDown || kb.S.isDown) this.targetY += kbSpeed * dt;
    }
    this.targetY = Phaser.Math.Clamp(this.targetY, 60, 660);

    const newY = Phaser.Math.Linear(this.koi.y, this.targetY, 1 - Math.pow(0.001, dt));
    this.koi.y = newY;

    // Spawning branching channels
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnBranchingPattern();
      this.spawnTimer = 1.4 + Math.random() * 0.8;
    }

    // Spawn pearls
    this.pearlTimer -= dt;
    if (this.pearlTimer <= 0) {
      this.spawnPearl();
      this.pearlTimer = 1.0 + Math.random() * 1.1;
    }

    // Update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.scrollSpeed * dt;
      if (obs.x < -100) {
        obs.destroy();
        this.obstacles.splice(i, 1);
        continue;
      }

      if (!this.invincible && this.hitsKoi(obs, 55, 55)) {
        this.takeHit(55);
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

  private spawnBranchingPattern() {
    const isTopGolden = Math.random() > 0.5;
    const goldY = isTopGolden ? 180 : 540;
    const trapY = isTopGolden ? 540 : 180;

    // Golden stream visual trail
    const goldGlow = this.add.container(1380, goldY).setDepth(2);
    const ring = this.add.circle(0, 0, 45, 0x38bdf8, 0.4);
    goldGlow.add([ring]);
    this.tweens.add({
      targets: goldGlow,
      alpha: 0.2,
      yoyo: true,
      repeat: -1,
      duration: 600,
    });

    // Trap rock in dark channel
    const trapContainer = this.add.container(1380, trapY).setDepth(10);
    const rockSpr = this.add.image(0, 0, 'rock').setDisplaySize(85, 70);
    const darkAura = this.add.circle(0, 0, 45, 0x0284c7, 0.3);
    trapContainer.add([darkAura, rockSpr]);
    this.obstacles.push(trapContainer);
  }

  private spawnPearl() {
    const y = 120 + Math.random() * 480;
    const container = this.add.container(1340, y).setDepth(8);
    const glow = this.add.circle(0, 0, 16, 0x38bdf8, 0.6);
    const spr = this.add.image(0, 0, 'pearl').setDisplaySize(28, 28);
    container.add([glow, spr]);
    this.pearls.push(container);
  }
}
