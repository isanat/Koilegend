/**
 * FallenTreeScene - Stage 8: "A Árvore Caída"
 * Massive fallen tree trunks block river passages.
 * Choose Over (jump high), Under (dive deep), or Around (side dodge) to navigate.
 */
import Phaser from 'phaser';
import { BaseGameScene, type BaseResult, type GameStatus, type SceneTitle, type ResultText } from './BaseGameScene';

export class FallenTreeScene extends BaseGameScene {
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgMid!: Phaser.GameObjects.TileSprite;
  private treeTrunks: Phaser.GameObjects.Container[] = [];
  private pearls: Phaser.GameObjects.Container[] = [];

  private targetY = 360;
  private scrollSpeed = 270;
  private spawnTimer = 0;
  private pearlTimer = 0;

  constructor() {
    super('FallenTreeScene');
  }

  protected getKoiStartPosition() { return { x: 280, y: 360 }; }
  protected getKoiDisplaySize() { return { w: 90, h: 52 }; }

  protected getSceneTitle(): SceneTitle {
    return {
      title: 'Etapa VIII',
      subtitle: 'A Árvore Caída',
      hint: 'Mude de altitude para passar por cima, por baixo ou contornar os troncos!',
    };
  }

  protected getResultText(status: GameStatus): ResultText {
    if (status === 'win') {
      return { title: 'OBSTÁCULO SUPERADO!', subtitle: 'Sua flexibilidade permitiu contornar o tronco secular com maestria.' };
    }
    if (status === 'lose') {
      return { title: 'BLOQUEADO PELO TRONCO', subtitle: 'A colisão com a madeira interrompeu seu progresso.' };
    }
    return { title: 'JOGO INTERROMPIDO', subtitle: '' };
  }

  protected getWinPearls() { return 18; }
  protected getMaxTime() { return 60; }
  protected canWinByTimeOut() { return true; }

  protected createScene() {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x14532d).setOrigin(0, 0).setScrollFactor(0).setDepth(-10);

    this.bgFar = this.add.tileSprite(0, 0, width, height, 'river-bg-far')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.6).setTint(0x166534).setDepth(-5);
    this.bgMid = this.add.tileSprite(0, 0, width, height, 'river-bg-mid')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.85).setTint(0x15803d).setDepth(-4);

    this.treeTrunks = [];
    this.pearls = [];
  }

  protected shutdownScene() {
    this.treeTrunks.forEach(t => t.destroy());
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
    this.scrollSpeed = 270 + Math.min(150, this.elapsed * 3.5);
    this.bgFar.tilePositionX += this.scrollSpeed * dt * 0.2;
    this.bgMid.tilePositionX += this.scrollSpeed * dt * 0.5;

    const kb = this.keyboard;
    if (kb.cursors) {
      const kbSpeed = 420;
      if (kb.cursors.up.isDown || kb.W.isDown) this.targetY -= kbSpeed * dt;
      if (kb.cursors.down.isDown || kb.S.isDown) this.targetY += kbSpeed * dt;
    }
    this.targetY = Phaser.Math.Clamp(this.targetY, 60, 660);

    const newY = Phaser.Math.Linear(this.koi.y, this.targetY, 1 - Math.pow(0.001, dt));
    this.koi.y = newY;

    // Spawn massive tree trunk obstacles
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTreeTrunk();
      this.spawnTimer = 1.6 + Math.random() * 0.8;
    }

    // Spawn pearls
    this.pearlTimer -= dt;
    if (this.pearlTimer <= 0) {
      this.spawnPearl();
      this.pearlTimer = 1.0 + Math.random() * 1.1;
    }

    // Update trunks
    for (let i = this.treeTrunks.length - 1; i >= 0; i--) {
      const trunk = this.treeTrunks[i];
      trunk.x -= this.scrollSpeed * dt;
      if (trunk.x < -140) {
        trunk.destroy();
        this.treeTrunks.splice(i, 1);
        continue;
      }

      if (!this.invincible && this.hitsKoi(trunk, 60, 160)) {
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

  private spawnTreeTrunk() {
    // Gap can be at top (requires swimming high), middle, or bottom (requires swimming low)
    const gapPosition = Math.floor(Math.random() * 3); // 0 = top open, 1 = middle open, 2 = bottom open

    let trunkY = 360;
    let trunkH = 340;

    if (gapPosition === 0) {
      // Trunk covers lower 2/3 of screen (leave top open)
      trunkY = 520;
    } else if (gapPosition === 1) {
      // Trunk covers top 2/3 of screen (leave bottom open)
      trunkY = 200;
    } else {
      // Trunk in exact middle (leave top & bottom open)
      trunkY = 360;
      trunkH = 260;
    }

    const container = this.add.container(1380, trunkY).setDepth(10);
    const trunkGlow = this.add.rectangle(0, 0, 75, trunkH, 0x15803d, 0.4);
    const woodRect = this.add.rectangle(0, 0, 65, trunkH, 0x78350f).setStrokeStyle(3, 0x451a03);
    const moss = this.add.rectangle(0, -trunkH / 4, 60, 20, 0x16a34a, 0.7);
    container.add([trunkGlow, woodRect, moss]);
    this.treeTrunks.push(container);
  }

  private spawnPearl() {
    const y = 80 + Math.random() * 560;
    const container = this.add.container(1340, y).setDepth(8);
    const glow = this.add.circle(0, 0, 16, 0x22c55e, 0.7);
    const spr = this.add.image(0, 0, 'pearl').setDisplaySize(28, 28);
    container.add([glow, spr]);
    this.pearls.push(container);
  }
}
