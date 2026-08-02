'use client';
import React, { useEffect, useState } from 'react';
import Phaser from 'phaser';

type Props = {
  gameRef: React.RefObject<Phaser.Game | null>;
};

export function PhaserDebugOverlay({ gameRef }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16.6);
  const [activeObjects, setActiveObjects] = useState(0);
  const [sceneKey, setSceneKey] = useState<string>('Boot');
  const [renderType, setRenderType] = useState<string>('WebGL');
  const [heapMb, setHeapMb] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const game = gameRef.current;
      if (!game || !game.isBooted) return;

      // Real FPS and delta from Phaser loop
      setFps(Math.round(game.loop.actualFps || 60));
      setFrameTime(parseFloat((game.loop.delta || 16.6).toFixed(1)));
      setRenderType(game.renderType === Phaser.WEBGL ? 'WebGL' : 'Canvas');

      // Real active scene & object count from Phaser scene manager
      const activeScenes = game.scene.getScenes(true);
      if (activeScenes.length > 0) {
        const activeScene = activeScenes[0];
        setSceneKey(activeScene.scene.key);
        setActiveObjects(activeScene.children ? activeScene.children.list.length : 0);
      }

      // Real memory heap if available in browser
      if (typeof window !== 'undefined' && (performance as any).memory) {
        const mem = (performance as any).memory;
        setHeapMb((mem.usedJSHeapSize / (1024 * 1024)).toFixed(1));
      }
    }, 300);

    return () => clearInterval(interval);
  }, [gameRef]);

  return (
    <div className="absolute bottom-3 right-3 z-30 font-mono text-xs select-none">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-emerald-500/40 rounded-lg shadow-lg hover:bg-slate-900 transition text-emerald-400 backdrop-blur-md cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-semibold tracking-wider text-slate-300">PHASER TELEMETRY</span>
          <span className="text-emerald-300 font-bold">{fps} FPS</span>
        </button>
      ) : (
        <div className="w-72 bg-slate-950/95 border border-emerald-500/30 rounded-xl shadow-2xl backdrop-blur-xl p-3.5 text-slate-300 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-white text-[12px] tracking-wide">TELEMETRIA PHASER (REAL)</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-slate-900/80 rounded border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">FPS</div>
              <div className="text-emerald-400 font-bold text-sm">{fps}</div>
            </div>
            <div className="p-2 bg-slate-900/80 rounded border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">FRAME TIME</div>
              <div className="text-amber-300 font-bold text-sm">{frameTime} ms</div>
            </div>
            <div className="p-2 bg-slate-900/80 rounded border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">OBJETOS ATIVOS</div>
              <div className="text-sky-300 font-bold text-sm">{activeObjects}</div>
            </div>
            <div className="p-2 bg-slate-900/80 rounded border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">CENA ATIVA</div>
              <div className="text-purple-300 font-bold text-xs truncate">{sceneKey}</div>
            </div>
            <div className="p-2 bg-slate-900/80 rounded border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">RENDERER</div>
              <div className="text-emerald-300 font-bold text-xs">{renderType}</div>
            </div>
            <div className="p-2 bg-slate-900/80 rounded border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">RAM HEAP</div>
              <div className="text-slate-200 font-bold text-xs">{heapMb ? `${heapMb} MB` : 'N/A'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
