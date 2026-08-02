/**
 * RiverSpiritScene - Stage 10: "O Encontro com o Espírito do Rio"
 * The mystical River Guardian Spirit summons elemental spirit trial orbs.
 * Collect sacred spirit blessing pearls & maintain noble harmony!
 */
import Phaser from 'phaser';
import { BaseGameScene, type BaseResult, type GameStatus, type SceneTitle, type ResultText } from './BaseGameScene';

export class RiverSpiritScene extends BaseGameScene {
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgMid!: Phaser.GameObjects.TileSprite;
  private spiritAvatar!: Phaser.GameObjects.Container;
  private spiritOrbs: Phaser.GameObjects.Container[] = [];
  private pearls: Phaser.GameObjects.Container[] = [];

  private targetY = 360;
  private scrollSpeed = 260;
  private spawnTimer = 0;
  private pearlTimer = 0;

  constructor() {
    super('RiverSpiritScene');
  }

  protected getKoiStartPosition() { return { x: 280, y: 360 }; }
  protected getKoiDisplaySize() { return { w: 90, h: 52 }; }

  protected getSceneTitle(): SceneTitle {
    return {
      title: 'Etapa X',
      subtitle: 'O Encontro com o Espírito do Rio',
      hint: 'Mantenha a sintonia com as orbes sagradas do Espírito do Rio!',
    };
  }

  protected getResultText(status: GameStatus): ResultText {
    if (status === 'win') {
      return { title: 'BÊNÇÃO RECEBIDA!', subtitle: 'O Guardião Sagrado reconheceu sua nobreza e concedeu a passagem.' };
    }
    if (status === 'lose') {
      return { title: 'PROVA FALHADA', subtitle: 'Você perdeu a sintonia espiritual. Respire fundo e tente novamente!' };
    }
    return { title: 'JOGO INTERROMPIDO', subtitle: '' };
  }

  protected getWinPearls() { return 20; }
  protected getMaxTime() { return 60; }
  protected canWinByTimeOut() { return true; }

  protected createScene() {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x3b0764).setOrigin(0, 0).setScrollFactor(0).setDepth(-10);

    this.bgFar = this.add.tileSprite(0, 0, width, height, 'river-bg-far')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.65).setTint(0x7e22ce).setDepth(-5);
    this.bgMid = this.add.tileSprite(0, 0, width, height, 'river-bg-mid')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.85).setTint(0xa855f7).setDepth(-4);

    // River Guardian Spirit Avatar floating on right side
    this.spiritAvatar = this.add.container(1100, 360).setDepth(15);
    const aura = this.add.circle(0, 0, 90, 0xc084fc, 0.4);
    const core = this.add.circle(0, 0, 50, 0xf3e8ff, 0.9);
    const ring = this.add.circle(0, 0, 70, 0xa855f7, 0.5);
    this.spiritAvatar.add([aura, ring, core]);

    this.tweens.add({
      targets: this.spiritAvatar,
      y: 320,
      yoyo: true,
      repeat: -1,
      duration: 1800,
      ease: 'Sine.easeInOut',
    });

    this.spiritOrbs = [];
    this.pearls = [];
  }

  protected shutdownScene() {
    this.spiritOrbs.forEach(o => o.destroy());
    this.pearls.forEach(p => p.destroy());
    if (this.spiritAvatar) this.spiritAvatar.destroy();
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
    this.scrollSpeed = 260 + Math.min(140, this.elapsed * 3);
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

    // Spirit releases trial orbs
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnSpiritOrb();
      this.spawnTimer = 1.1 + Math.random() * 0.8;
    }

    // Spawn blessing pearls
    this.pearlTimer -= dt;
    if (this.pearlTimer <= 0) {
      this.spawnPearl();
      this.pearlTimer = 0.9 + Math.random() * 1.0;
    }

    // Update spirit orbs
    for (let i = this.spiritOrbs.length - 1; i >= 0; i--) {
      const orb = this.spiritOrbs[i];
      orb.x -= 380 * dt;
      orb.y += Math.sin((time + orb.x) / 120) * 120 * dt;

      if (orb.x < -60) {
        orb.destroy();
        this.spiritOrbs.splice(i, 1);
        continue;
      }

      if (!this.invincible && this.hitsKoi(orb, 42, 42)) {
        this.takeHit(this.equippedNft === 'Bênção do Espírito' ? 25 : 55);
      }
    }

    // Update pearls
    for (let i = this.pearls.length - 1; i >= 0; i--) {
      const prl = this.pearls[i];
      prl.x -= this.scrollSpeed * dt;

      // Magnet pull if spirit blessing equipped
      if (this.equippedNft === 'Bênção do Espírito') {
        const dx = this.koi.x - prl.x;
        const dy = this.koi.y - prl.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220) {
          prl.x += (dx / dist) * 300 * dt;
          prl.y += (dy / dist) * 300 * dt;
        }
      }

      if (prl.x < -40) {
        prl.destroy();
        this.pearls.splice(i, 1);
        continue;
      }

      if (this.hitsKoi(prl, 38, 38)) {
        this.collectPearl(prl.x, prl.y);
        prl.destroy();
        this.pearls.splice(i, 1);
      }
    }

    return dt;
  }

  private spawnSpiritOrb() {
    const y = 100 + Math.random() * 520;
    const container = this.add.container(1100, y).setDepth(12);
    const glow = this.add.circle(0, 0, 22, 0xc084fc, 0.7);
    const core = this.add.circle(0, 0, 12, 0xf3e8ff, 1.0);
    container.add([glow, core]);
    this.spiritOrbs.push(container);
  }

  private spawnPearl() {
    const y = 80 + Math.random() * 560;
    const container = this.add.container(1340, y).setDepth(10);
    const glow = this.add.circle(0, 0, 18, 0xa855f7, 0.8);
    const spr = this.add.image(0, 0, 'pearl').setDisplaySize(30, 30);
    container.add([glow, spr]);
    this.pearls.push(container);
  }
}
