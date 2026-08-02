'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { PHASES, DIFFICULTY_LABEL, DIFFICULTY_COLOR, type GamePhase } from '@/lib/game-data';
import { Lock, Play, Coins, Gift, X } from 'lucide-react';

export function JourneyMap({ onPlay }: { onPlay: (phase: GamePhase) => void }) {
  const [selected, setSelected] = useState<GamePhase | null>(null);

  return (
    <section id="jornada" className="relative py-24 px-6 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-4">
            <span className="text-[11px] font-medium tracking-[0.25em] text-gold-200 uppercase">A Jornada</span>
          </div>
          <h2 className="font-mythic text-4xl md:text-6xl font-bold mb-4 text-gold-gradient">
            12 Etapas até a Ascensão
          </h2>
          <p className="text-slate-200/95 max-w-2xl mx-auto leading-relaxed">
            Cada etapa representa uma provação da lenda. Quanto maior a dificuldade,
            maior a recompensa em tokens. Apenas os mais resilientes chegarão ao topo da cachoeira.
          </p>
        </motion.div>

        {/* Phase grid — clean, no broken SVG */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {PHASES.map((phase, i) => (
            <motion.button
              key={phase.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
              onClick={() => setSelected(phase)}
              className="group relative text-left p-4 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/70 hover:scale-[1.03] transition-all duration-300 overflow-hidden"
              style={{ ['--phase-color' as string]: phase.color }}
            >
              {/* Subtle phase-color glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${phase.color}20, transparent 70%)` }}
              />

              <div className="relative z-10">
                {/* Number + icon */}
                <div className="flex items-start justify-between mb-3">
                  <span
                    className="font-mythic text-3xl font-black leading-none"
                    style={{ color: phase.color }}
                  >
                    {String(phase.id).padStart(2, '0')}
                  </span>
                  <span className="text-2xl opacity-90">{phase.icon}</span>
                </div>

                <h3 className="font-mythic text-sm font-semibold text-gold-50/90 mb-2 line-clamp-2 min-h-[2.5rem]">
                  {phase.title}
                </h3>

                <div className="flex items-center gap-1.5 mb-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${DIFFICULTY_COLOR[phase.difficulty]}`}>
                    {DIFFICULTY_LABEL[phase.difficulty]}
                  </span>
                  {phase.playable && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 flex items-center gap-1">
                      <Play className="w-2.5 h-2.5" /> Jogável
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Coins className="w-3 h-3 text-gold-500" />
                    {phase.entryCost}
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Gift className="w-3 h-3 text-emerald-400" />
                    {phase.reward}
                  </span>
                </div>
              </div>

              {!phase.playable && (
                <div className="absolute top-3 right-3 z-20 text-slate-600/60">
                  <Lock className="w-3 h-3" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {selected && (
        <PhaseModal phase={selected} onClose={() => setSelected(null)} onPlay={onPlay} />
      )}
    </section>
  );
}

function PhaseModal({
  phase,
  onClose,
  onPlay,
}: {
  phase: GamePhase;
  onClose: () => void;
  onPlay: (p: GamePhase) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/85 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="relative max-w-2xl w-full bg-card border border-gold-500/30 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: `0 20px 80px ${phase.color}30, 0 0 60px ${phase.color}20` }}
      >
        {/* Header art */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={phase.cardArt}
            alt={phase.nftName}
            className="w-full h-full object-cover"
            onError={(e) => {
              const t = e.currentTarget as HTMLImageElement;
              t.style.display = 'none';
              t.parentElement!.style.background = `linear-gradient(135deg, ${phase.color}, oklch(0.10 0.03 260))`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-ink-900/70 backdrop-blur-sm hover:bg-ink-900/90 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-5 right-5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${DIFFICULTY_COLOR[phase.difficulty]}`}>
                {DIFFICULTY_LABEL[phase.difficulty]}
              </span>
              <span className="text-2xl">{phase.icon}</span>
            </div>
            <h3 className="font-mythic text-2xl font-bold text-gold-50 drop-shadow-lg">
              Etapa {phase.id} — {phase.title}
            </h3>
            <p className="text-gold-200/80 text-sm italic">{phase.subtitle}</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h4 className="font-mythic text-xs font-semibold text-gold-400 uppercase tracking-[0.2em] mb-2">
              A História
            </h4>
            <p className="text-sm text-slate-200/90 leading-relaxed">{phase.story}</p>
          </div>

          <div>
            <h4 className="font-mythic text-xs font-semibold text-gold-400 uppercase tracking-[0.2em] mb-2">
              O Desafio
            </h4>
            <p className="text-sm text-slate-200/90 leading-relaxed">{phase.challenge}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-gold-500/20 bg-gold-500/5">
              <div className="text-[10px] text-gold-200/60 uppercase tracking-[0.15em] mb-1">Carta NFT</div>
              <div className="font-mythic text-sm font-semibold text-gold-100">{phase.nftName}</div>
              <div className="text-xs text-slate-400 mt-1">{phase.nftAbility}</div>
            </div>
            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <div className="text-[10px] text-emerald-200/60 uppercase tracking-[0.15em] mb-1">Economia</div>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-gold-400">
                  <Coins className="w-3.5 h-3.5" /> {phase.entryCost}
                </span>
                <span className="text-slate-500">→</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Gift className="w-3.5 h-3.5" /> {phase.reward}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">Custo · Recompensa</div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {phase.playable ? (
              <button
                onClick={() => {
                  onPlay(phase);
                  onClose();
                }}
                onMouseEnter={(e) => e.currentTarget.classList.add('btn-gold-hover')}
                onMouseLeave={(e) => e.currentTarget.classList.remove('btn-gold-hover')}
                className="btn-gold flex-1 px-5 py-3 rounded-full font-semibold flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                Jogar Esta Etapa
              </button>
            ) : (
              <div className="flex-1 px-5 py-3 rounded-full border border-border/40 bg-ink-800/40 text-slate-500 text-sm text-center flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Em breve
              </div>
            )}
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-full border border-border/40 bg-card/40 text-slate-300 hover:bg-card/70 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
