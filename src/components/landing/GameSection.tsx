'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { PHASES, type GamePhase } from '@/lib/game-data';
import { Gamepad2, Trophy, Coins, Play, ChevronRight, Sparkles, Maximize2, Move } from 'lucide-react';

const KoiGame = dynamic(() => import('@/game/KoiGame').then((m) => m.KoiGame), {
  ssr: false,
  loading: () => (
    <div className="aspect-video min-h-[400px] rounded-2xl bg-slate-950 flex items-center justify-center border border-amber-500/30">
      <div className="text-amber-300 font-mythic animate-pulse flex items-center gap-2 text-lg">
        <Sparkles className="w-5 h-5 text-amber-400" />
        Invocando o Motor Phaser...
      </div>
    </div>
  ),
});

type Result = {
  status: string;
  pearls: number;
  timeSurvived: number;
  score: number;
};

export function GameSection() {
  const [playing, setPlaying] = useState(false);
  const [activePhase, setActivePhase] = useState<GamePhase>(PHASES[0]);
  const [equippedNft, setEquippedNft] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Result[]>([]);

  const playablePhases = PHASES.filter((p) => p.playable);

  const handleResult = (r: Result) => {
    setLastResult(r);
    setHistory((h) => [r, ...h].slice(0, 5));
    setPlaying(false);
  };

  return (
    <section id="jogar" className="relative py-24 px-6 scroll-mt-20 bg-slate-950/60">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-25 blur-3xl"
          style={{ background: `radial-gradient(circle, ${activePhase.color}, transparent 70%)` }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel mb-4 border border-emerald-500/30">
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-semibold tracking-[0.25em] text-emerald-300 uppercase">
              Demo Jogável
            </span>
          </div>
          <h2 className="font-mythic text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-gold-gradient">
            Experimente a Lenda
          </h2>
          <p className="text-slate-200 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg">
            Duas etapas jogáveis de verdade, com física, partículas e polimento.
            Mova com o mouse, WASD ou toque.
          </p>
        </div>

        {/* Phase selector tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {playablePhases.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActivePhase(p);
                setPlaying(false);
                setLastResult(null);
              }}
              className={`group relative flex items-center gap-3 px-6 py-3.5 rounded-xl border transition-all cursor-pointer ${
                activePhase.id === p.id
                  ? 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/20 text-amber-100'
                  : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-amber-500/40 hover:bg-slate-800'
              }`}
            >
              <span className="text-2xl">{p.icon}</span>
              <div className="text-left">
                <div className="font-mythic text-sm font-semibold text-amber-200">
                  Etapa {p.id}
                </div>
                <div className="text-xs text-slate-300 max-w-[180px] truncate">
                  {p.title}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Main game area */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-4">
            {!playing ? (
              /* === Intro Screen Card === */
              <div className="relative min-h-[420px] aspect-video rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl bg-slate-900 flex flex-col justify-end p-6 sm:p-10">
                {/* Background gradient art */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      activePhase.id === 1
                        ? 'radial-gradient(circle at 70% 30%, #1e3a8a 0%, #0f172a 70%, #020617 100%)'
                        : activePhase.id === 5
                        ? 'radial-gradient(circle at 60% 40%, #2e1065 0%, #0f172a 70%, #020617 100%)'
                        : activePhase.id === 7
                        ? 'radial-gradient(circle at 50% 30%, #1d4ed8 0%, #0f172a 70%, #020617 100%)'
                        : 'radial-gradient(circle at 50% 20%, #78350f 0%, #0f172a 70%, #020617 100%)',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />

                {/* Card Content */}
                <div className="relative z-10 max-w-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-5xl drop-shadow-lg">{activePhase.icon}</span>
                    <div>
                      <div className="text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold mb-0.5">
                        Etapa {String(activePhase.id).padStart(2, '0')} de 12
                      </div>
                      <h3 className="font-mythic text-3xl sm:text-4xl font-bold text-amber-100 drop-shadow-md">
                        {activePhase.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-amber-200/90 italic text-base mb-3 font-mythic">
                    {activePhase.subtitle}
                  </p>
                  <p className="text-sm sm:text-base text-slate-100 mb-6 leading-relaxed max-w-lg">
                    {activePhase.challenge}
                  </p>

                  {/* Economy stats */}
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-950/80 border border-amber-500/30">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-slate-300">Entrada:</span>
                      <span className="text-sm font-bold text-amber-300">{activePhase.entryCost}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 hidden sm:block" />
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-950/80 border border-emerald-500/30">
                      <Trophy className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-slate-300">Recompensa:</span>
                      <span className="text-sm font-bold text-emerald-300">{activePhase.reward}</span>
                    </div>
                  </div>

                  {/* Start Button & Equipment */}
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => setPlaying(true)}
                      className="btn-gold inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg shadow-xl cursor-pointer hover:scale-105 transition-transform"
                    >
                      <Play className="w-5 h-5 fill-current text-slate-950" />
                      Iniciar Etapa
                    </button>

                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950/90 border border-amber-500/40 backdrop-blur-md">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span className="text-xs text-slate-200 font-medium">NFT:</span>
                      <select
                        value={equippedNft ?? ''}
                        onChange={(e) => setEquippedNft(e.target.value || null)}
                        className="bg-transparent text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="" className="bg-slate-900 text-slate-300">Nenhum (Padrão)</option>
                        <option value="Predador" className="bg-slate-900 text-amber-300">Predador (+1 Coração)</option>
                        <option value="Força do Koi" className="bg-slate-900 text-amber-300">Força do Koi (Dash +80%)</option>
                        <option value="Calmaria na Tempestade" className="bg-slate-900 text-amber-300">Calmaria na Tempestade (Escudo)</option>
                        <option value="Salto Lendário" className="bg-slate-900 text-amber-300">Salto Lendário (Ímã)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Corner watermark */}
                <div className="absolute top-6 right-6 font-mythic text-7xl sm:text-8xl font-black text-amber-500/10 select-none pointer-events-none">
                  {String(activePhase.id).padStart(2, '0')}
                </div>
              </div>
            ) : (
              /* === Active Game Canvas === */
              <div className="w-full relative rounded-2xl overflow-hidden border border-amber-500/40 bg-slate-950 shadow-2xl">
                <KoiGame
                  key={`${activePhase.id}-${equippedNft}`}
                  scene={(activePhase.sceneKey as any) || 'RiverScene'}
                  equippedNft={equippedNft}
                  onResult={handleResult}
                  onQuit={() => setPlaying(false)}
                />
              </div>
            )}

            {/* Controls bar */}
            {playing && (
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-200 px-5 py-3.5 rounded-xl glass-panel border border-amber-500/30">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                    <Move className="w-4 h-4 text-amber-400" /> Mouse / W-S / Setas
                  </span>
                  <span className="text-slate-400">•</span>
                  <span>Colete pérolas e desvie dos obstáculos</span>
                </div>
                <button
                  onClick={() => setPlaying(false)}
                  className="px-3 py-1 rounded bg-red-950/80 border border-red-500/40 text-red-300 hover:bg-red-900 font-medium cursor-pointer"
                >
                  Sair da Partida
                </button>
              </div>
            )}
          </div>

          {/* Right sidebar — Results & Demo note */}
          <div className="space-y-4">
            {/* Last result */}
            <div className="glass-panel p-5 rounded-2xl border border-amber-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h4 className="font-mythic font-bold text-amber-200 text-sm tracking-wider uppercase">
                  Última Partida
                </h4>
              </div>

              {lastResult ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                    <span className="text-xs text-slate-400">Resultado</span>
                    <span
                      className={`font-mythic text-xs font-bold uppercase ${
                        lastResult.status === 'win' ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {lastResult.status === 'win' ? 'Vitória' : 'Derrota'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Pérolas</span>
                    <span className="text-sm font-bold text-amber-300">{lastResult.pearls}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Tempo</span>
                    <span className="text-sm font-bold text-slate-200">{lastResult.timeSurvived}s</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
                    <span className="text-xs text-slate-400">Pontuação</span>
                    <span className="text-base font-extrabold text-amber-300">{lastResult.score} pts</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">
                  Jogue uma partida para ver seus resultados detalhados aqui.
                </p>
              )}
            </div>

            {/* Match history */}
            {history.length > 0 && (
              <div className="glass-panel p-5 rounded-2xl border border-amber-500/20">
                <h4 className="font-mythic font-bold text-amber-200 text-xs tracking-wider uppercase mb-3">
                  Histórico de Sessões
                </h4>
                <div className="space-y-2">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-slate-900/60 border border-amber-500/10"
                    >
                      <span className={h.status === 'win' ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                        {h.status === 'win' ? 'Vitória' : 'Derrota'}
                      </span>
                      <span className="text-slate-300">{h.score} pts</span>
                      <span className="text-amber-400 font-medium">{h.pearls} 🟡</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Simulation card */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h5 className="font-mythic text-xs font-bold text-amber-200 uppercase tracking-wider">
                  Demonstração
                </h5>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Versão offline com economia simulada. Na versão Web3 completa, o acesso às fases é
                liberado por tokens e NFTs na carteira.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

