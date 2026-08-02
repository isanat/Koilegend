/**
 * KoiGame - React component that mounts Phaser into a div.
 * Use a `key` prop to force fresh mount when the scene changes.
 */
'use client';
import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { BootScene } from '@/game/scenes/BootScene';
import { RiverScene, type RiverResult } from '@/game/scenes/RiverScene';
import { WaterfallScene, type WaterfallResult } from '@/game/scenes/WaterfallScene';
import { WhirlpoolScene, type WhirlpoolResult } from '@/game/scenes/WhirlpoolScene';
import { StormScene, type StormResult } from '@/game/scenes/StormScene';
import { EngineDebugOverlayPanel } from '@/engine/debug/EngineDebugOverlay';

export type GameSceneKey = 'RiverScene' | 'WhirlpoolScene' | 'StormScene' | 'WaterfallScene';
export type GameResult = RiverResult | WhirlpoolResult | StormResult | WaterfallResult;

type Props = {
  scene: GameSceneKey;
  equippedNft?: string | null;
  onResult?: (r: GameResult) => void;
  onQuit?: () => void;
  className?: string;
};

export function KoiGame({ scene, equippedNft, onResult, onQuit, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable refs
  const onResultRef = useRef(onResult);
  const onQuitRef = useRef(onQuit);
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onQuitRef.current = onQuit; }, [onQuit]);

  useEffect(() => {
    if (!containerRef.current) return;

    const isWaterfall = scene === 'WaterfallScene';
    const launchData = { onResult: (r: GameResult) => onResultRef.current?.(r) };

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      backgroundColor: '#0a0e1a',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: isWaterfall ? 720 : 1280,
        height: isWaterfall ? 1280 : 720,
      },
      render: { antialias: true, pixelArt: false, powerPreference: 'high-performance' },
      scene: [BootScene, RiverScene, WhirlpoolScene, StormScene, WaterfallScene],
    };

    let game: Phaser.Game | null = null;
    try {
      game = new Phaser.Game(config);
      gameRef.current = game;
      game.registry.set('targetScene', scene);
      game.registry.set('bootLaunchData', launchData);
      game.registry.set('equippedNft', equippedNft ?? null);

      game.events.once('ready', () => {
        setReady(true);
      });
      if (game.isBooted) {
        setReady(true);
      } else {
        // Fallback timer to ensure ready is set
        setTimeout(() => setReady(true), 200);
      }
    } catch (e: any) {
      console.error('Phaser init error:', e);
      Promise.resolve().then(() => setError(e.message || 'Falha ao iniciar o jogo'));
    }

    return () => {
      if (game) {
        game.destroy(true);
      }
      gameRef.current = null;
    };
  }, [scene, equippedNft]);

  return (
    <div className={`relative w-full ${className ?? ''}`}>
      <div
        id="game-stage-container"
        ref={containerRef}
        className="w-full mx-auto rounded-xl overflow-hidden shadow-2xl ring-1 ring-amber-500/20 [&>canvas]:w-full [&>canvas]:h-full [&>canvas]:block [&>canvas]:mx-auto"
        style={{ aspectRatio: scene === 'WaterfallScene' ? '720 / 1280' : '1280 / 720', maxHeight: '80vh' }}
      />
      {!ready && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950 rounded-xl">
          <div className="text-amber-400 font-serif text-lg animate-pulse">Invocando a lenda...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950 rounded-xl">
          <div className="text-red-400 font-sans text-sm">Erro: {error}</div>
        </div>
      )}
      <EngineDebugOverlayPanel />
    </div>
  );
}
