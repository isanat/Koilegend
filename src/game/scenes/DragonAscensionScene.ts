/**
 * DragonAscensionScene - Stage 12: "A Transformação em Dragão"
 * The ultimate climax! Fly as the Golden Celestial Dragon through cosmic skies.
 * Shoot dragonfire at dark storm clouds, collect starlight pearls, and ascend!
 */
import Phaser from 'phaser';
import { BaseGameScene, type BaseResult, type GameStatus, type SceneTitle, type ResultText } from './BaseGameScene';

export class DragonAscensionScene extends BaseGameScene {
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgMid!: Phaser.GameObjects.TileSprite;
  private dragonFireballs: Phaser.GameObjects.Container[] = [];
  private stormClouds: Phaser.GameObjects.Container[] = [];
  private starPearls: Phaser.GameObjects.Container[] = [];

  private targetY = 360;
  private scrollSpeed = 320;
  private fireTimer = 0;
  private cloudTimer = 0;
  private pearlTimer = 0;

  constructor() {
    super('DragonAscensionScene');
  }

  protected getKoiStartPosition() { return { x: 280, y: 360 }; }
  protected getKoiDisplaySize() { return { w: 120, h: 80 }; }

  protected getSceneTitle(): SceneTitle {
    return {
      title: 'Etapa XII',
      subtitle: 'A Transformação em Dragão',
      hint: 'Voe livremente pelos céus! Espaço ou Clique para disparar Chamas Celestiais!',
    };
  }

  protected getResultText(status: GameStatus): ResultText {
    if (status === 'win') {
      return { title: 'ASCENSÃO SUPREMA!', subtitle: 'Você concluiu a lendária jornada e tornou-se o Dragão Celestial!' };
    }
    if (status === 'lose') {
      return { title: 'QUEDA CELESTIAL', subtitle: 'As tempestades dos céus exigem ainda mais controle. Reerga-se!' };
    }
    return { title: 'JOGO INTERROMPIDO', subtitle: '' };
  }

  protected getWinPearls() { return 25; }
  protected getMaxTime() { return 60; }
  protected canWinByTimeOut() { return true; }

  protected createScene() {
    const { width, height } = this.scale;
    // Replace Koi sprite visual with Golden Celestial Dragon!
    this.koiBody.setTexture('dragon-final').setDisplaySize(120, 80);

    this.add.rectangle(0, 0, width, height, 0x451a03).setOrigin(0, 0).setScrollFactor(0).setDepth(-10);

    // Sky realm parallax
    this.bgFar = this.add.tileSprite(0, 0, width, height, 'sky-realm')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.7).setTint(0xfbbf24).setDepth(-5);
    this.bgMid = this.add.tileSprite(0, 0, width, height, 'river-bg-mid')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.8).setTint(0xd97706).setDepth(-4);

    this.dragonFireballs = [];
    this.stormClouds = [];
    this.starPearls = [];
  }

  protected shutdownScene() {
    this.dragonFireballs.forEach(f => f.destroy());
    this.stormClouds.forEach(c => c.destroy());
    this.starPearls.forEach(p => p.destroy());
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
    this.scrollSpeed = 320 + Math.min(180, this.elapsed * 4);
    this.bgFar.tilePositionX += this.scrollSpeed * dt * 0.25;
    this.bgMid.tilePositionX += this.scrollSpeed * dt * 0.6;

    const kb = this.keyboard;
    if (kb.cursors) {
      const kbSpeed = 450;
      if (kb.cursors.up.isDown || kb.W.isDown) this.targetY -= kbSpeed * dt;
      if (kb.cursors.down.isDown || kb.S.isDown) this.targetY += kbSpeed * dt;
    }
    this.targetY = Phaser.Math.Clamp(this.targetY, 60, 660);

    const newY = Phaser.Math.Linear(this.koi.y, this.targetY, 1 - Math.pow(0.001, dt));
    this.koi.y = newY;

    // Fire celestial dragonfire on spacebar or click!
    this.fireTimer -= dt;
    if ((kb.spaceKey?.isDown || this.input.activePointer.isDown) && this.fireTimer <= 0) {
      this.shootDragonfire();
      this.fireTimer = 0.22;
    }

    // Spawn cosmic storm clouds
    this.cloudTimer -= dt;
    if (this.cloudTimer <= 0) {
      this.spawnStormCloud();
      this.cloudTimer = 1.0 + Math.random() * 0.7;
    }

    // Spawn starlight pearls
    this.pearlTimer -= dt;
    if (this.pearlTimer <= 0) {
      this.spawnStarPearl();
      this.pearlTimer = 0.8 + Math.random() * 0.9;
    }

    // Update dragon fireballs
    for (let i = this.dragonFireballs.length - 1; i >= 0; i--) {
      const fire = this.dragonFireballs[i];
      fire.x += 800 * dt;

      if (fire.x > 1350) {
        fire.destroy();
        this.dragonFireballs.splice(i, 1);
        continue;
      }

      // Check collision between fireballs and storm clouds!
      for (let j = this.stormClouds.length - 1; j >= 0; j--) {
        const cloud = this.stormClouds[j];
        const dx = fire.x - cloud.x;
        const dy = fire.y - cloud.y;
        if (Math.sqrt(dx * dx + dy * dy) < 60) {
          // Destroy cloud & fireball!
          this.collectPearl(cloud.x, cloud.y); // Score boost
          cloud.destroy();
          this.stormClouds.splice(j, 1);

          fire.destroy();
          this.dragonFireballs.splice(i, 1);
          break;
        }
      }
    }

    // Update storm clouds
    for (let i = this.stormClouds.length - 1; i >= 0; i--) {
      const cloud = this.stormClouds[i];
      cloud.x -= this.scrollSpeed * dt;
      if (cloud.x < -100) {
        cloud.destroy();
        this.stormClouds.splice(i, 1);
        continue;
      }

      if (!this.invincible && this.hitsKoi(cloud, 60, 60)) {
        this.takeHit(50);
      }
    }

    // Update starlight pearls
    for (let i = this.starPearls.length - 1; i >= 0; i--) {
      const prl = this.starPearls[i];
      prl.x -= this.scrollSpeed * dt;

      // Magnetic dragon attraction
      const dx = this.koi.x - prl.x;
      const dy = this.koi.y - prl.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 260) {
        prl.x += (dx / dist) * 350 * dt;
        prl.y += (dy / dist) * 350 * dt;
      }

      if (prl.x < -40) {
        prl.destroy();
        this.starPearls.splice(i, 1);
        continue;
      }

      if (this.hitsKoi(prl, 40, 40)) {
        this.collectPearl(prl.x, prl.y);
        prl.destroy();
        this.starPearls.splice(i, 1);
      }
    }

    return dt;
  }

  private shootDragonfire() {
    const container = this.add.container(this.koi.x + 50, this.koi.y).setDepth(15);
    const glow = this.add.circle(0, 0, 20, 0xfbbf24, 0.9);
    const core = this.add.circle(0, 0, 10, 0xffffff, 1.0);
    container.add([glow, core]);
    this.dragonFireballs.push(container);
  }

  private spawnStormCloud() {
    const y = 80 + Math.random() * 560;
    const container = this.add.container(1380, y).setDepth(10);
    const bgGlow = this.add.circle(0, 0, 45, 0xd97706, 0.4);
    const cloud1 = this.add.circle(-15, 0, 25, 0x1e293b, 0.9);
    const cloud2 = this.add.circle(15, 0, 25, 0x334155, 0.9);
    container.add([bgGlow, cloud1, cloud2]);
    this.stormClouds.push(container);
  }

  private spawnStarPearl() {
    const y = 80 + Math.random() * 560;
    const container = this.add.container(1340, y).setDepth(12);
    const glow = this.add.circle(0, 0, 20, 0xfbbf24, 0.9);
    const spr = this.add.image(0, 0, 'pearl').setDisplaySize(32, 32);
    container.add([glow, spr]);
    this.starPearls.push(container);
  }
}
