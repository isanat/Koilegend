/**
 * ThornsScene - Stage 9: "Os Espinhos do Fundo do Rio"
 * Narrow riverbed canyon lined with razor-sharp thorn vines & sea urchins.
 * Requires precision elevation control to stay in the narrow center corridor!
 */
import Phaser from 'phaser';
import { BaseGameScene, type BaseResult, type GameStatus, type SceneTitle, type ResultText } from './BaseGameScene';

export class ThornsScene extends BaseGameScene {
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgMid!: Phaser.GameObjects.TileSprite;
  private thornsTop!: Phaser.GameObjects.Graphics;
  private thornsBottom!: Phaser.GameObjects.Graphics;
  private movingSpikes: Phaser.GameObjects.Container[] = [];
  private pearls: Phaser.GameObjects.Container[] = [];

  private targetY = 360;
  private scrollSpeed = 280;
  private pearlTimer = 0;
  private spikeTimer = 0;

  constructor() {
    super('ThornsScene');
  }

  protected getKoiStartPosition() { return { x: 280, y: 360 }; }
  protected getKoiDisplaySize() { return { w: 90, h: 52 }; }

  protected getSceneTitle(): SceneTitle {
    return {
      title: 'Etapa IX',
      subtitle: 'Os Espinhos do Fundo do Rio',
      hint: 'Mantenha-se rigorosamente no centro do túnel! Evite encostar nos espinhos.',
    };
  }

  protected getResultText(status: GameStatus): ResultText {
    if (status === 'win') {
      return { title: 'CÂNON ATRAVESSADO!', subtitle: 'Sua precisão cirúrgica superou o túnel mortal de espinhos.' };
    }
    if (status === 'lose') {
      return { title: 'PERFURADO PELOS ESPINHOS', subtitle: 'As pontas afiadas feriram o koi. Mantenha o equilíbrio!' };
    }
    return { title: 'JOGO INTERROMPIDO', subtitle: '' };
  }

  protected getWinPearls() { return 20; }
  protected getMaxTime() { return 60; }
  protected canWinByTimeOut() { return true; }

  protected createScene() {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x450a0a).setOrigin(0, 0).setScrollFactor(0).setDepth(-10);

    this.bgFar = this.add.tileSprite(0, 0, width, height, 'river-bg-far')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.6).setTint(0x991b1b).setDepth(-5);
    this.bgMid = this.add.tileSprite(0, 0, width, height, 'river-bg-mid')
      .setOrigin(0, 0).setScrollFactor(0).setAlpha(0.85).setTint(0x7f1d1d).setDepth(-4);

    // Draw static thorn borders on top (0..120px) and bottom (600..720px)
    this.thornsTop = this.add.graphics().setScrollFactor(0).setDepth(10);
    this.thornsBottom = this.add.graphics().setScrollFactor(0).setDepth(10);

    this.drawThornBorders(width);

    this.movingSpikes = [];
    this.pearls = [];
  }

  private drawThornBorders(w: number) {
    this.thornsTop.clear();
    this.thornsTop.fillStyle(0xdc2626, 0.7);
    this.thornsTop.fillRect(0, 0, w, 110);
    for (let x = 0; x < w; x += 30) {
      this.thornsTop.fillStyle(0xef4444, 1);
      this.thornsTop.fillTriangle(x, 110, x + 15, 150, x + 30, 110);
    }

    this.thornsBottom.clear();
    this.thornsBottom.fillStyle(0xdc2626, 0.7);
    this.thornsBottom.fillRect(0, 610, w, 110);
    for (let x = 0; x < w; x += 30) {
      this.thornsBottom.fillStyle(0xef4444, 1);
      this.thornsBottom.fillTriangle(x, 610, x + 15, 570, x + 30, 610);
    }
  }

  protected shutdownScene() {
    this.movingSpikes.forEach(s => s.destroy());
    this.pearls.forEach(p => p.destroy());
    if (this.thornsTop) this.thornsTop.destroy();
    if (this.thornsBottom) this.thornsBottom.destroy();
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
    this.targetY = Phaser.Math.Clamp(worldPoint.y, 160, 560);
  }

  protected updateScene(dt: number, time: number): number {
    this.scrollSpeed = 280 + Math.min(140, this.elapsed * 3);
    this.bgFar.tilePositionX += this.scrollSpeed * dt * 0.2;
    this.bgMid.tilePositionX += this.scrollSpeed * dt * 0.5;

    const kb = this.keyboard;
    if (kb.cursors) {
      const kbSpeed = 420;
      if (kb.cursors.up.isDown || kb.W.isDown) this.targetY -= kbSpeed * dt;
      if (kb.cursors.down.isDown || kb.S.isDown) this.targetY += kbSpeed * dt;
    }
    this.targetY = Phaser.Math.Clamp(this.targetY, 160, 560);

    const newY = Phaser.Math.Linear(this.koi.y, this.targetY, 1 - Math.pow(0.001, dt));
    this.koi.y = newY;

    // Check collision with top/bottom thorn walls
    if (!this.invincible && (this.koi.y <= 160 || this.koi.y >= 560)) {
      const hitDamage = this.equippedNft === 'Pele Resistente' ? 20 : 50;
      this.takeHit(hitDamage);
    }

    // Spawn floating sea urchin spikes
    this.spikeTimer -= dt;
    if (this.spikeTimer <= 0) {
      this.spawnUrchin();
      this.spikeTimer = 1.2 + Math.random() * 0.8;
    }

    // Spawn pearls
    this.pearlTimer -= dt;
    if (this.pearlTimer <= 0) {
      this.spawnPearl();
      this.pearlTimer = 1.0 + Math.random() * 1.1;
    }

    // Update moving urchins
    for (let i = this.movingSpikes.length - 1; i >= 0; i--) {
      const spk = this.movingSpikes[i];
      spk.x -= this.scrollSpeed * dt;
      spk.rotation += 3.0 * dt;

      if (spk.x < -60) {
        spk.destroy();
        this.movingSpikes.splice(i, 1);
        continue;
      }

      if (!this.invincible && this.hitsKoi(spk, 45, 45)) {
        this.takeHit(this.equippedNft === 'Pele Resistente' ? 25 : 60);
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

  private spawnUrchin() {
    const y = 180 + Math.random() * 360;
    const container = this.add.container(1380, y).setDepth(11);
    const glow = this.add.circle(0, 0, 24, 0xdc2626, 0.6);
    const core = this.add.circle(0, 0, 14, 0xef4444, 1.0);
    container.add([glow, core]);
    this.movingSpikes.push(container);
  }

  private spawnPearl() {
    const y = 180 + Math.random() * 360;
    const container = this.add.container(1340, y).setDepth(8);
    const glow = this.add.circle(0, 0, 16, 0xef4444, 0.7);
    const spr = this.add.image(0, 0, 'pearl').setDisplaySize(28, 28);
    container.add([glow, spr]);
    this.pearls.push(container);
  }
}
