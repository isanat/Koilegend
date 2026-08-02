/**
 * BaseGameScene — shared infrastructure for all Koi Legend gameplay scenes.
 *
 * What lives here (single source of truth, no more duplication):
 *   - Koi container + body + glow + drop shadow (single hitbox definition)
 *   - HUD: hearts, pearl counter, timer, score (with glassmorphism bg)
 *   - Title card (intro overlay)
 *   - Result card (win/lose/quit overlay)
 *   - Input: keyboard (WASD/arrows/ESC/R) + pointer, with proper cleanup
 *   - Damage system: hit counter, invincibility frames, screen shake, flash
 *   - Particle emitters: bubble trail + sparkle on collect
 *   - Camera: dynamic zoom based on speed factor
 *   - Cleanup: shutdown() removes all listeners and destroys all objects
 *
 * Subclasses implement:
 *   - createScene(): build phase-specific backgrounds, obstacles, etc.
 *   - updateScene(dt): phase-specific spawn + movement + win/lose logic
 *   - getKoiStartPosition(): where the koi spawns
 *   - getKoiDisplaySize(): visual size of the koi sprite
 *   - getKoiHitboxSize(): collision box (derived from display size, single truth)
 *   - getSceneTitle(): { title, subtitle, hint } for title card
 *   - getResultText(status): { title, subtitle } for result card
 *   - getWinPearls(): target pearl count for win condition
 *   - canWinByTimeOut(): whether surviving long enough also wins
 */
import Phaser from 'phaser';
import { hitbox, aabbOverlap, type Box } from '@/game/utils/collision';
import { soundEngine } from '@/game/utils/audio';

export type GameStatus = 'win' | 'lose' | 'quit';

export type BaseResult = {
  status: GameStatus;
  pearls: number;
  timeSurvived: number;
  score: number;
  maxHits: number;
  hitsTaken: number;
  maxCombo: number;
};

export type SceneTitle = { title: string; subtitle: string; hint: string };
export type ResultText = { title: string; subtitle: string };

export abstract class BaseGameScene extends Phaser.Scene {
  // === Koi (single source of truth for size/hitbox) ===
  protected koi!: Phaser.GameObjects.Container;
  protected koiBody!: Phaser.GameObjects.Image;
  private koiShadow!: Phaser.GameObjects.Ellipse;
  private koiGlow!: Phaser.GameObjects.Image;
  private shieldGraphic!: Phaser.GameObjects.Graphics;

  // === Particle emitters ===
  protected bubbleEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  protected sparkleEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  protected dashEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  // === HUD ===
  private heartImages: Phaser.GameObjects.Text[] = [];
  private pearlCountText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private dashBarFill!: Phaser.GameObjects.Rectangle;
  private dashBarText!: Phaser.GameObjects.Text;
  private audioBtn!: Phaser.GameObjects.Text;
  private damageFlash!: Phaser.GameObjects.Rectangle;
  private hudObjects: Phaser.GameObjects.GameObject[] = [];

  // === Mobile touch controls ===
  private mobileDashBtn!: Phaser.GameObjects.Container;

  // === Camera ===
  protected currentZoom = 1.0;

  // === Shared state ===
  protected elapsed = 0;
  protected pearlsCollected = 0;
  protected hits = 0;
  protected invincible = false;
  protected finished = false;
  protected score = 0;

  // === Combo & Ability state ===
  protected combo = 0;
  protected maxCombo = 0;
  private comboTimer = 0;
  protected dashEnergy = 100; // 0..100
  protected isDashing = false;
  protected dashCooldown = 0;
  protected hasShield = false;
  protected equippedNft: string | null = null;

  // === Input ===
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;
  private keyR!: Phaser.Input.Keyboard.Key;

  // Bound handlers stored for explicit cleanup
  private boundPointerMove!: (p: Phaser.Input.Pointer) => void;
  private boundPointerDown!: (p: Phaser.Input.Pointer) => void;
  private boundPause!: () => void;
  private boundResume!: () => void;

  // === Win/lose config ===
  protected MAX_HITS = 3;

  constructor(key: string) {
    super(key);
  }

  // ============================================================
  // ABSTRACT METHODS
  // ============================================================

  protected abstract getKoiStartPosition(): { x: number; y: number };
  protected abstract getKoiDisplaySize(): { w: number; h: number };
  protected abstract getSceneTitle(): SceneTitle;
  protected abstract getResultText(status: GameStatus): ResultText;
  protected abstract getWinPearls(): number;
  protected abstract getMaxTime(): number;
  protected canWinByTimeOut(): boolean { return false; }
  protected buildExtraHUD(): Phaser.GameObjects.GameObject[] { return []; }
  protected updateExtraHUD(): void {}
  protected abstract createScene(): void;
  protected abstract updateScene(dt: number, time: number): number;
  protected abstract shutdownScene(): void;
  protected abstract buildResult(status: GameStatus): BaseResult;
  protected playWinAnimation(onDone: () => void): void { onDone(); }

  // ============================================================
  // LIFECYCLE
  // ============================================================

  create(data?: { onResult?: (r: BaseResult) => void }) {
    this.finished = false;
    this.elapsed = 0;
    this.pearlsCollected = 0;
    this.hits = 0;
    this.invincible = false;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.comboTimer = 0;
    this.dashEnergy = 100;
    this.isDashing = false;
    this.dashCooldown = 0;
    this.hasShield = false;
    this.currentZoom = 1.0;
    this.hudObjects = [];

    // Check equipped NFT benefits
    this.equippedNft = (this.registry.get('equippedNft') as string) || null;
    if (this.equippedNft === 'Predador') {
      this.MAX_HITS = 4; // +1 Heart
    } else {
      this.MAX_HITS = 3;
    }
    if (this.equippedNft === 'Calmaria na Tempestade') {
      this.hasShield = true;
    }

    const { width, height } = this.scale;
    const start = this.getKoiStartPosition();
    const koiSize = this.getKoiDisplaySize();

    // === Koi drop shadow ===
    this.koiShadow = this.add.ellipse(start.x, start.y + 28, koiSize.w * 0.75, 14, 0x000000, 0.3)
      .setScrollFactor(0).setDepth(8);

    // === Koi (container with glow + body + shield) ===
    this.koi = this.add.container(start.x, start.y);
    this.koiGlow = this.add.image(0, 0, 'pearl').setDisplaySize(koiSize.w * 1.4, koiSize.h * 1.4)
      .setTint(0xfbbf24).setAlpha(0.15).setBlendMode('ADD');
    this.koiBody = this.add.image(0, 0, 'koi').setDisplaySize(koiSize.w, koiSize.h);

    this.shieldGraphic = this.add.graphics();
    this.shieldGraphic.lineStyle(3, 0x38bdf8, 0.9);
    this.shieldGraphic.strokeCircle(0, 0, koiSize.w * 0.6);
    this.shieldGraphic.fillStyle(0x38bdf8, 0.15);
    this.shieldGraphic.fillCircle(0, 0, koiSize.w * 0.6);
    this.shieldGraphic.setVisible(this.hasShield);

    this.koi.add([this.koiGlow, this.koiBody, this.shieldGraphic]);
    this.koi.setSize(koiSize.w * 0.7, koiSize.h * 0.7);
    this.koi.setDepth(10);

    // === Particle emitters ===
    this.bubbleEmitter = this.add.particles(0, 0, 'pearl', {
      x: { min: -35, max: -8 },
      y: { min: -6, max: 6 },
      scale: { start: 0.12, end: 0.02 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 500,
      frequency: 80,
      tint: 0x7dd3fc,
      blendMode: 'ADD',
      follow: this.koi,
    });
    this.bubbleEmitter.setDepth(9);

    this.sparkleEmitter = this.add.particles(0, 0, 'pearl', {
      speed: { min: 80, max: 220 },
      scale: { start: 0.35, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      tint: [0xfbbf24, 0xfde68a, 0xffffff],
      blendMode: 'ADD',
      emitting: false,
    });
    this.sparkleEmitter.setDepth(20);

    this.dashEmitter = this.add.particles(0, 0, 'pearl', {
      speed: { min: 150, max: 350 },
      scale: { start: 0.45, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 400,
      tint: [0x38bdf8, 0xfbbf24, 0xffffff],
      blendMode: 'ADD',
      emitting: false,
    });
    this.dashEmitter.setDepth(15);

    // === Damage flash ===
    this.damageFlash = this.add.rectangle(0, 0, width, height, 0xff0000, 0)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(100);

    // === Camera ===
    this.cameras.main.setZoom(this.currentZoom);

    // === Subclass create ===
    this.createScene();

    // === HUD ===
    this.buildHUD(width, height);

    // === Input setup ===
    if (this.input.keyboard) {
      this.input.keyboard.addCapture([
        Phaser.Input.Keyboard.KeyCodes.UP,
        Phaser.Input.Keyboard.KeyCodes.DOWN,
        Phaser.Input.Keyboard.KeyCodes.LEFT,
        Phaser.Input.Keyboard.KeyCodes.RIGHT,
        Phaser.Input.Keyboard.KeyCodes.SPACE,
        Phaser.Input.Keyboard.KeyCodes.W,
        Phaser.Input.Keyboard.KeyCodes.S,
        Phaser.Input.Keyboard.KeyCodes.A,
        Phaser.Input.Keyboard.KeyCodes.D,
      ]);
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
      this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    }

    this.boundPointerMove = (p: Phaser.Input.Pointer) => this.onPointerMove(p);
    this.boundPointerDown = (p: Phaser.Input.Pointer) => {
      try {
        this.game.canvas?.focus();
      } catch {}
      this.onPointerMove(p);
      // Tap bottom-right triggers dash
      if (p.isDown && p.x > width * 0.7 && p.y > height * 0.7) {
        this.triggerDash();
      }
    };
    this.boundPause = () => this.bubbleEmitter.pause();
    this.boundResume = () => this.bubbleEmitter.resume();

    this.input.on('pointermove', this.boundPointerMove);
    this.input.on('pointerdown', this.boundPointerDown);
    this.events.on('pause', this.boundPause);
    this.events.on('resume', this.boundResume);

    this.registry.set('sceneOnResult', data?.onResult);

    soundEngine.startAmbientMusic();
    this.showTitleCard();
  }

  protected onPointerMove(pointer: Phaser.Input.Pointer): void {}

  protected getWorldPointer(pointer: Phaser.Input.Pointer): { x: number; y: number } {
    return this.cameras.main.getWorldPoint(pointer.x, pointer.y);
  }

  update(time: number, delta: number) {
    if (this.finished) return;
    const dt = delta / 1000;
    this.elapsed += dt;

    // ESC to quit
    if (this.keyEsc && Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
      this.finish('quit');
      return;
    }

    // Spacebar to Dash
    if (this.keySpace && Phaser.Input.Keyboard.JustDown(this.keySpace)) {
      this.triggerDash();
    }

    // Recharge Dash energy
    const cdModifier = this.equippedNft === 'Força do Koi' ? 1.8 : 1.0;
    if (!this.isDashing && this.dashEnergy < 100) {
      this.dashEnergy = Math.min(100, this.dashEnergy + 30 * cdModifier * dt);
    }

    // Combo decay timer
    if (this.combo > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.comboText.setVisible(false);
      }
    }

    // Shield graphic status
    this.shieldGraphic.setVisible(this.hasShield);
    if (this.hasShield) {
      this.shieldGraphic.rotation += 1.5 * dt;
    }

    // Let subclass update
    const speedFactor = this.updateScene(dt, time);

    // Dynamic camera zoom
    const dashFactor = this.isDashing ? 0.08 : 0;
    const targetZoom = 1.0 - (speedFactor * 0.12 + dashFactor);
    this.currentZoom = Phaser.Math.Linear(this.currentZoom, targetZoom, 1 - Math.pow(0.005, dt));
    this.cameras.main.setZoom(this.currentZoom);

    // Shadow follow
    this.koiShadow.x = this.koi.x;
    this.koiShadow.y = this.koi.y + 28;
    this.koiShadow.alpha = 0.3 - Math.abs(this.koi.rotation) * 0.2;

    // HUD Update
    this.pearlCountText.setText(`Pérolas: ${this.pearlsCollected} / ${this.getWinPearls()}`);
    this.timerText.setText(`${Math.floor(this.elapsed)}s`);
    this.scoreText.setText(`${this.score} pts`);
    this.dashBarFill.width = (116 * this.dashEnergy) / 100;
    this.updateExtraHUD();

    // Timeout victory or lose
    if (this.elapsed >= this.getMaxTime()) {
      this.finish(this.canWinByTimeOut() ? 'win' : 'lose');
    }
  }

  // ============================================================
  // DASH & ABILITY SYSTEM
  // ============================================================

  public triggerDash() {
    if (this.isDashing || this.dashEnergy < 35 || this.finished) return;

    this.dashEnergy -= 35;
    this.isDashing = true;
    this.invincible = true;
    soundEngine.playDash();

    // Emit golden burst particles
    this.dashEmitter.emitParticleAt(this.koi.x, this.koi.y, 20);

    // Scale up Koi temporarily
    this.tweens.add({
      targets: this.koiGlow,
      alpha: 0.6,
      scaleX: 1.8,
      scaleY: 1.8,
      duration: 150,
      yoyo: true,
    });

    this.time.delayedCall(600, () => {
      this.isDashing = false;
      this.invincible = false;
    });
  }

  // ============================================================
  // SHARED HELPERS
  // ============================================================

  protected getKoiHitbox(): Box {
    return hitbox(this.koi, this.koi.width, this.koi.height);
  }

  protected hitsKoi(obstacle: Phaser.GameObjects.Container, obstacleW: number, obstacleH: number): boolean {
    return aabbOverlap(hitbox(obstacle, obstacleW, obstacleH), this.getKoiHitbox());
  }

  protected collectPearl(p: Phaser.GameObjects.Container, basePoints: number = 100) {
    this.pearlsCollected++;
    this.combo++;
    this.comboTimer = 2.8; // 2.8 seconds to chain next pearl
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    // Audio chime with rising pitch
    soundEngine.playPearlCollect(this.combo);

    const comboMult = Math.min(5, 1 + Math.floor((this.combo - 1) / 2));
    const finalPoints = basePoints * comboMult;
    this.score += finalPoints;

    // Trigger Shield every 8 combo chain
    if (this.combo >= 8 && !this.hasShield) {
      this.hasShield = true;
      soundEngine.playShield();
    }

    // Sparkle particles
    this.sparkleEmitter.emitParticleAt(p.x, p.y, 14);

    // Floating text popup
    const popupText = comboMult > 1 ? `+${finalPoints} (${comboMult}x!)` : `+${finalPoints}`;
    const popup = this.add.text(p.x, p.y - 20, popupText, {
      fontFamily: 'sans-serif',
      fontSize: comboMult > 2 ? '18px' : '15px',
      color: comboMult > 2 ? '#38bdf8' : '#fbbf24',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(30);

    this.tweens.add({
      targets: popup,
      y: popup.y - 45,
      alpha: 0,
      duration: 750,
      onComplete: () => popup.destroy(),
    });

    // Combo UI text
    if (this.combo >= 2) {
      this.comboText.setText(`COMBO x${this.combo}!`).setVisible(true);
      this.tweens.add({
        targets: this.comboText,
        scale: { from: 1.3, to: 1.0 },
        duration: 150,
      });
    }

    this.tweens.add({
      targets: this.koiBody,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 100,
      yoyo: true,
    });
  }

  protected takeHit(scorePenalty: number = 50) {
    // If shield is active, absorb hit completely!
    if (this.hasShield) {
      this.hasShield = false;
      this.invincible = true;
      soundEngine.playShield();

      const popup = this.add.text(this.koi.x, this.koi.y - 30, 'ESCUDO ABSORVEU!', {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#38bdf8',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(30);

      this.tweens.add({
        targets: popup,
        y: popup.y - 40,
        alpha: 0,
        duration: 800,
        onComplete: () => popup.destroy(),
      });

      this.time.delayedCall(800, () => {
        this.invincible = false;
      });
      return;
    }

    this.hits++;
    this.invincible = true;
    this.combo = 0; // Reset combo on hit
    this.comboText.setVisible(false);
    this.score = Math.max(0, this.score - scorePenalty);
    soundEngine.playHit();

    if (this.heartImages[this.hits - 1]) {
      const h = this.heartImages[this.hits - 1];
      this.tweens.add({
        targets: h,
        scale: 1.5,
        alpha: 0,
        duration: 300,
        onComplete: () => h.setText('🖤').setStyle({ color: '#475569' }).setAlpha(1).setScale(1),
      });
    }

    this.cameras.main.shake(260, 0.012);
    this.tweens.add({
      targets: this.damageFlash,
      alpha: { from: 0.55, to: 0 },
      duration: 350,
    });
    this.tweens.add({
      targets: this.koiBody,
      alpha: { from: 0.3, to: 1 },
      duration: 120,
      repeat: 5,
      onComplete: () => {
        this.koiBody.setAlpha(1);
        this.invincible = false;
      },
    });

    if (this.hits >= this.MAX_HITS) {
      this.finish('lose');
    }
  }

  protected spawnPearlContainer(x: number, y: number, baseKey: 'baseY' | 'baseX' = 'baseY'): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const glow = this.add.image(0, 0, 'pearl').setDisplaySize(44, 44).setAlpha(0.35).setTint(0xfbbf24);
    const core = this.add.image(0, 0, 'pearl').setDisplaySize(22, 22);
    c.add([glow, core]);
    c.setData(baseKey, baseKey === 'baseY' ? y : x);
    c.setDepth(7);
    return c;
  }

  protected get keyboard() {
    return {
      cursors: this.cursors,
      W: this.keyW,
      S: this.keyS,
      A: this.keyA,
      D: this.keyD,
      Space: this.keySpace,
    };
  }

  // ============================================================
  // HUD BUILDER
  // ============================================================

  private buildHUD(width: number, height: number) {
    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x0a1929, 0.85);
    hudBg.fillRoundedRect(0, 0, width, 68, 0);
    hudBg.fillStyle(0xfbbf24, 0.3);
    hudBg.fillRect(0, 67, width, 1);
    hudBg.setScrollFactor(0).setDepth(48);
    this.hudObjects.push(hudBg);

    // Heart lives
    this.heartImages = [];
    for (let i = 0; i < this.MAX_HITS; i++) {
      const h = this.add.text(20 + i * 32, 18, '♥', {
        fontFamily: 'serif',
        fontSize: '26px',
        color: '#ef4444',
        stroke: '#000000',
        strokeThickness: 4,
      }).setScrollFactor(0).setDepth(50);
      this.heartImages.push(h);
      this.hudObjects.push(h);
    }

    // Pearls counter
    this.pearlCountText = this.add.text(width / 2 - 80, 18, `Pérolas: 0 / ${this.getWinPearls()}`, {
      fontFamily: 'serif',
      fontSize: '18px',
      color: '#fbbf24',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(50);
    this.hudObjects.push(this.pearlCountText);

    // Combo indicator
    this.comboText = this.add.text(width / 2 - 80, 42, 'COMBO x2!', {
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: '#38bdf8',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(50).setVisible(false);
    this.hudObjects.push(this.comboText);

    // Dash Energy Bar
    const dashBarX = width / 2 + 60;
    const dashBarBg = this.add.rectangle(dashBarX, 22, 120, 14, 0x1e293b, 0.9)
      .setOrigin(0, 0).setStrokeStyle(1, 0x38bdf8, 0.6).setScrollFactor(0).setDepth(50);
    this.dashBarFill = this.add.rectangle(dashBarX + 2, 24, 116, 10, 0x38bdf8)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(51);
    this.dashBarText = this.add.text(dashBarX, 40, 'DASH [ESPAÇO]', {
      fontFamily: 'sans-serif',
      fontSize: '10px',
      color: '#38bdf8',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setScrollFactor(0).setDepth(50);
    this.hudObjects.push(dashBarBg, this.dashBarFill, this.dashBarText);

    // Timer & Score
    this.timerText = this.add.text(width - 60, 16, '0s', {
      fontFamily: 'serif',
      fontSize: '20px',
      color: '#f1f5f9',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(50);

    this.scoreText = this.add.text(width - 60, 42, '0 pts', {
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: '#cbd5e1',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(50);
    this.hudObjects.push(this.timerText, this.scoreText);

    // Audio Mute Toggle Button
    const muted = soundEngine.getMuted();
    this.audioBtn = this.add.text(width - 24, 18, muted ? '🔇' : '🔊', {
      fontSize: '22px',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(55).setInteractive({ useHandCursor: true });

    this.audioBtn.on('pointerdown', () => {
      const isMuted = soundEngine.toggleMute();
      this.audioBtn.setText(isMuted ? '🔇' : '🔊');
    });
    this.hudObjects.push(this.audioBtn);

    // Mobile Dash button overlay
    this.mobileDashBtn = this.add.container(width - 80, height - 80);
    const btnBg = this.add.circle(0, 0, 36, 0x38bdf8, 0.45).setStrokeStyle(2, 0x38bdf8, 0.9);
    const btnTxt = this.add.text(0, 0, 'DASH', {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.mobileDashBtn.add([btnBg, btnTxt]);
    this.mobileDashBtn.setScrollFactor(0).setDepth(60).setInteractive(new Phaser.Geom.Circle(0, 0, 36), Phaser.Geom.Circle.Contains);
    this.mobileDashBtn.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event.stopPropagation();
      this.triggerDash();
    });
    this.hudObjects.push(this.mobileDashBtn);

    // Extra HUD from subclass
    const extra = this.buildExtraHUD();
    this.hudObjects.push(...extra);
  }

  private showTitleCard() {
    const { width, height } = this.scale;
    const t = this.getSceneTitle();
    const overlay = this.add.rectangle(0, 0, width, height, 0x0a0e1a, 0.8).setOrigin(0, 0).setScrollFactor(0).setDepth(200);
    const title = this.add.text(width / 2, height / 2 - 40, t.title, {
      fontFamily: 'serif',
      fontSize: '44px',
      color: '#fbbf24',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    const subtitle = this.add.text(width / 2, height / 2 + 10, t.subtitle, {
      fontFamily: 'serif',
      fontSize: '22px',
      color: '#e2e8f0',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    const hint = this.add.text(width / 2, height / 2 + 60, `${t.hint} • ESPAÇO para Dash`, {
      fontFamily: 'sans-serif',
      fontSize: '15px',
      color: '#38bdf8',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    const titleObjects = [overlay, title, subtitle, hint];
    this.hudObjects.push(...titleObjects);
    this.tweens.add({
      targets: titleObjects,
      alpha: 0,
      delay: 2000,
      duration: 600,
      onComplete: () => titleObjects.forEach((o) => o.destroy()),
    });
  }

  protected finish(status: GameStatus) {
    if (this.finished) return;
    this.finished = true;
    this.bubbleEmitter.stop();

    if (status === 'win') {
      soundEngine.playWinFanfare();
    }

    const result = this.buildResult(status);
    const cb = this.registry.get('sceneOnResult') as ((r: BaseResult) => void) | undefined;
    if (cb) cb(result);

    if (status === 'win') {
      this.playWinAnimation(() => this.showResultCard(status, result));
    } else {
      this.showResultCard(status, result);
    }
  }

  private showResultCard(status: GameStatus, result: BaseResult) {
    const { width, height } = this.scale;
    const rt = this.getResultText(status);
    const overlay = this.add.rectangle(0, 0, width, height, 0x0a0e1a, 0.88).setOrigin(0, 0).setScrollFactor(0).setDepth(200);
    const titleColor = status === 'win' ? '#fbbf24' : status === 'lose' ? '#ef4444' : '#94a3b8';

    const title = this.add.text(width / 2, height / 2 - 80, rt.title, {
      fontFamily: 'serif',
      fontSize: '52px',
      color: titleColor,
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0);

    const sub = this.add.text(width / 2, height / 2 - 20, rt.subtitle, {
      fontFamily: 'serif',
      fontSize: '20px',
      color: '#e2e8f0',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0);

    const stats = this.add.text(
      width / 2,
      height / 2 + 30,
      `Pérolas: ${result.pearls}  |  Combo Máx: ${result.maxCombo}x  |  Tempo: ${result.timeSurvived}s  |  Pontos: ${result.score}`,
      {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#cbd5e1',
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0);

    const hint = this.add.text(width / 2, height / 2 + 90, 'R para jogar novamente • ESC para sair', {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#94a3b8',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0);

    const resultObjects = [overlay, title, sub, stats, hint];
    this.hudObjects.push(...resultObjects);
    this.tweens.add({
      targets: [title, sub, stats, hint],
      alpha: 1,
      duration: 400,
      delay: 200,
    });

    this.keyR?.once('down', () => this.scene.restart({ onResult: this.registry.get('sceneOnResult') }));
    this.keyEsc?.once('down', () => {
      this.scene.stop();
      this.registry.set('koiQuitToMenu', true);
    });
  }

  shutdown() {
    soundEngine.stopAmbientMusic();
    this.input.off('pointermove', this.boundPointerMove);
    this.input.off('pointerdown', this.boundPointerDown);
    this.events.off('pause', this.boundPause);
    this.events.off('resume', this.boundResume);

    this.bubbleEmitter?.destroy();
    this.sparkleEmitter?.destroy();
    this.dashEmitter?.destroy();

    this.shutdownScene();

    this.hudObjects = [];
    this.heartImages = [];
  }
}

