'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { PHASES, type GamePhase } from '@/lib/game-data';
import { useWeb3Game } from '@/context/Web3GameStateContext';
import { Gamepad2, Trophy, Coins, Play, ChevronRight, Sparkles, Move, Lock, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { BaseResult } from '@/game/scenes/BaseGameScene';

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

export function GameSection() {
  const {
    koiBalance,
    payEntryFee,
    stagesProgress,
    completeStage,
    nftCards,
    equippedNft,
    equipNft,
    addTokens,
  } = useWeb3Game();

  const [playing, setPlaying] = useState(false);
  const [activePhase, setActivePhase] = useState<GamePhase>(PHASES[0]);
  const [lastResult, setLastResult] = useState<BaseResult | null>(null);
  const [history, setHistory] = useState<BaseResult[]>([]);
  const [balanceError, setBalanceError] = useState(false);

  const handleStartStage = () => {
    setBalanceError(false);
    const progress = stagesProgress[activePhase.id];
    if (progress && !progress.unlocked) {
      return; // Locked stage
    }

    // Pay entry fee in $KOI tokens
    const success = payEntryFee(activePhase.entryCost);
    if (!success) {
      setBalanceError(true);
      return;
    }

    setPlaying(true);
    setLastResult(null);
  };

  const handleResult = (r: BaseResult) => {
    setLastResult(r);
    setHistory((h) => [r, ...h].slice(0, 5));
    setPlaying(false);

    if (r.status === 'win') {
      const stars = r.hitsTaken === 0 ? 3 : r.hitsTaken <= 2 ? 2 : 1;
      completeStage(activePhase.id, r.score, stars, activePhase.reward);
    }
  };

  const currentStageProgress = stagesProgress[activePhase.id] || { unlocked: false, completed: false, stars: 0 };
  const ownedNfts = nftCards.filter((c) => c.owned);

  return (
    <section id="jogar" className="relative py-24 px-6 scroll-mt-20 bg-slate-950/60">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-25 blur-3xl transition-all duration-700"
          style={{ background: `radial-gradient(circle, ${activePhase.color}, transparent 70%)` }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel mb-4 border border-emerald-500/30">
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-semibold tracking-[0.25em] text-emerald-300 uppercase">
              12 Etapas da Lenda
            </span>
          </div>
          <h2 className="font-mythic text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-gold-gradient">
            Arena das 12 Provas
          </h2>
          <p className="text-slate-200 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg">
            Navegue por todas as 12 etapas da lenda, do Rio Turbulento até a Ascensão Celestial como Dragão Dourado!
          </p>
        </div>

        {/* Phase selector tabs (All 12 stages!) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 mb-8">
          {PHASES.map((p) => {
            const prog = stagesProgress[p.id] || { unlocked: false, completed: false };
            const isSelected = activePhase.id === p.id;

            return (
              <button
                key={p.id}
                onClick={() => {
                  setActivePhase(p);
                  setPlaying(false);
                  setLastResult(null);
                  setBalanceError(false);
                }}
                className={`relative flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/20 text-amber-100 ring-1 ring-amber-400/50'
                    : prog.unlocked
                    ? 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-amber-500/40 hover:bg-slate-800'
                    : 'border-slate-900 bg-slate-950/60 text-slate-600 opacity-75'
                }`}
              >
                <span className="text-2xl">{p.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mythic text-[11px] font-bold text-amber-300 uppercase">
                      Etapa {p.id}
                    </span>
                    {!prog.unlocked ? (
                      <Lock className="w-3 h-3 text-slate-500" />
                    ) : prog.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : null}
                  </div>
                  <div className="text-xs text-slate-200 truncate font-medium">
                    {p.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main game area */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-4">
            {!playing ? (
              /* === Intro Screen Card === */
              <div className="relative min-h-[440px] aspect-video rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl bg-slate-900 flex flex-col justify-end p-6 sm:p-10">
                {/* Background gradient art */}
                <div
                  className="absolute inset-0 transition-colors duration-700"
                  style={{
                    background: `radial-gradient(circle at 60% 40%, ${activePhase.color}33 0%, #0f172a 70%, #020617 100%)`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />

                {/* Card Content */}
                <div className="relative z-10 max-w-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-5xl drop-shadow-lg">{activePhase.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">
                          Etapa {String(activePhase.id).padStart(2, '0')} de 12
                        </span>
                        {currentStageProgress.completed && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Concluída ({currentStageProgress.stars} ★)
                          </span>
                        )}
                      </div>
                      <h3 className="font-mythic text-3xl sm:text-4xl font-bold text-amber-100 drop-shadow-md">
                        {activePhase.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-amber-200/90 italic text-base mb-3 font-mythic">
                    {activePhase.subtitle}
                  </p>
                  <p className="text-sm sm:text-base text-slate-100 mb-5 leading-relaxed max-w-lg">
                    {activePhase.challenge}
                  </p>

                  {/* Economy stats & Costs */}
                  <div className="flex flex-wrap items-center gap-3 mb-5">
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-950/80 border border-amber-500/30">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-slate-300">Entrada:</span>
                      <span className="text-sm font-bold text-amber-300">{activePhase.entryCost} $KOI</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 hidden sm:block" />
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-950/80 border border-emerald-500/30">
                      <Trophy className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-slate-300">Recompensa:</span>
                      <span className="text-sm font-bold text-emerald-300">{activePhase.reward} $PEARL</span>
                    </div>
                  </div>

                  {/* Balance Error alert */}
                  {balanceError && (
                    <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                        <span>Saldo insuficiente de $KOI ({koiBalance} $KOI). Colete no Faucet ou Mineração!</span>
                      </div>
                      <button
                        onClick={() => addTokens(50, 0)}
                        className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold hover:bg-amber-500/30"
                      >
                        +50 $KOI Faucet
                      </button>
                    </div>
                  )}

                  {/* Start Button & Equipment */}
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={handleStartStage}
                      disabled={!currentStageProgress.unlocked}
                      className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg shadow-xl cursor-pointer transition-all ${
                        currentStageProgress.unlocked
                          ? 'btn-gold hover:scale-105'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      {currentStageProgress.unlocked ? (
                        <>
                          <Play className="w-5 h-5 fill-current text-slate-950" />
                          Entrar na Etapa ({activePhase.entryCost} $KOI)
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 text-slate-500" />
                          Complete Etapa {activePhase.id - 1} Primeiro
                        </>
                      )}
                    </button>

                    {/* NFT Equipment Selector */}
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950/90 border border-amber-500/40 backdrop-blur-md">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span className="text-xs text-slate-200 font-medium">Equipar NFT:</span>
                      <select
                        value={equippedNft?.id ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) equipNft(0);
                          else equipNft(Number(val));
                        }}
                        className="bg-transparent text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="" className="bg-slate-900 text-slate-300">
                          Nenhum (Padrão)
                        </option>
                        {ownedNfts.map((nft) => (
                          <option key={nft.id} value={nft.id} className="bg-slate-900 text-amber-300">
                            {nft.name} ({nft.rarity})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Watermark */}
                <div className="absolute top-6 right-6 font-mythic text-7xl sm:text-8xl font-black text-amber-500/10 select-none pointer-events-none">
                  {String(activePhase.id).padStart(2, '0')}
                </div>
              </div>
            ) : (
              /* === Active Game Canvas === */
              <div className="w-full relative rounded-2xl overflow-hidden border border-amber-500/40 bg-slate-950 shadow-2xl">
                <KoiGame
                  key={`${activePhase.id}-${equippedNft?.name ?? 'default'}`}
                  scene={(activePhase.sceneKey as any) || 'RiverScene'}
                  equippedNft={equippedNft?.name ?? null}
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

          {/* Right sidebar — Results & Token balances */}
          <div className="space-y-4">
            {/* Wallet Balances Card */}
            <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-slate-900/80">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-mythic font-bold text-amber-200 text-xs tracking-wider uppercase">
                  Saldo da Carteira
                </h4>
                <button
                  onClick={() => addTokens(50, 20)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                >
                  + Faucet Free
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/20">
                  <div className="text-[10px] text-slate-400">Token $KOI</div>
                  <div className="text-lg font-bold text-amber-300">{koiBalance}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/20">
                  <div className="text-[10px] text-slate-400">Token $PEARL</div>
                  <div className="text-lg font-bold text-emerald-300">{useWeb3Game().pearlBalance}</div>
                </div>
              </div>
            </div>

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
                  Jogue uma partida para ganhar $KOI e $PEARL em tempo real.
                </p>
              )}
            </div>

            {/* Match history */}
            {history.length > 0 && (
              <div className="glass-panel p-5 rounded-2xl border border-amber-500/20">
                <h4 className="font-mythic font-bold text-amber-200 text-xs tracking-wider uppercase mb-3">
                  Histórico da Sessão
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
          </div>
        </div>
      </div>
    </section>
  );
}
