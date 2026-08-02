'use client';
import { motion } from 'framer-motion';
import { ChevronDown, Play, Compass, Sparkles } from 'lucide-react';

export function HeroSection({ onPlay, onExplore }: { onPlay: () => void; onExplore: () => void }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      {/* === Full-bleed background image === */}
      <div className="absolute inset-0 z-0">
        <img
          src="/game/scenes/hero-legend.png"
          alt="Koi ascendendo à cachoeira do dragão"
          className="w-full h-full object-cover opacity-75"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Multi-layer gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-transparent to-slate-950/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#020617_100%)]" />
      </div>

      {/* === Floating golden dust particles === */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-amber-300/60 animate-pulse"
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 29) % 100}%`,
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              boxShadow: '0 0 8px rgba(250, 204, 21, 0.8)',
            }}
          />
        ))}
      </div>

      {/* === Content === */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 text-center pt-28 pb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-panel mb-8 border border-amber-500/30 shadow-lg shadow-amber-500/10"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[11px] font-semibold tracking-[0.25em] text-amber-300 uppercase flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" /> Web3 Game · Lenda Milenar
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="font-mythic font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-none mb-4 tracking-tight drop-shadow-2xl"
        >
          <span className="text-gold-gradient text-glow-gold">
            KOI LEGEND
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="font-mythic text-xl sm:text-2xl md:text-3xl text-amber-200/90 mb-8 tracking-wide text-glow-soft"
        >
          Da Água à Ascensão do Dragão
        </motion.p>

        {/* Narrative Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="glass-panel rounded-2xl px-6 py-5 max-w-2xl mx-auto mb-10 border border-amber-500/30 shadow-2xl"
        >
          <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-light">
            Há milênios, um peixe Koi decidiu nadar contra a correnteza de um rio impossível.
            Após <span className="text-amber-300 font-semibold">12 provações</span> — pedras, predadores,
            tempestades e a própria cachoeira do dragão — ele se transformou em um ser celestial.
          </p>
        </motion.div>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onPlay}
            className="btn-gold group inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg cursor-pointer hover:scale-105 transition-all shadow-xl"
          >
            <Play className="w-5 h-5 fill-current text-slate-950" />
            Jogar Agora
            <span className="text-xs font-semibold text-slate-950 bg-slate-950/15 px-2.5 py-0.5 rounded-full">Grátis</span>
          </button>
          <button
            onClick={onExplore}
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full border border-amber-500/40 bg-slate-900/80 backdrop-blur-md text-amber-100 font-semibold text-base hover:bg-slate-800 hover:border-amber-400 hover:scale-105 transition-all cursor-pointer shadow-lg"
          >
            <Compass className="w-5 h-5 text-amber-300" />
            Explorar a Jornada
          </button>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.0 }}
          className="mt-16 flex items-center justify-center gap-8 md:gap-14"
        >
          {[
            { v: '12', l: 'Etapas' },
            { v: '7+', l: 'NFTs' },
            { v: '2', l: 'Tokens' },
            { v: '100%', l: 'Web3' },
          ].map((s, i) => (
            <div key={s.l} className="flex items-center gap-8 md:gap-14">
              <div className="text-center">
                <div className="font-mythic text-3xl md:text-4xl font-bold text-amber-300">
                  {s.v}
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-1 font-medium">
                  {s.l}
                </div>
              </div>
              {i < 3 && <div className="w-px h-10 bg-gradient-to-b from-transparent via-amber-500/40 to-transparent" />}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="flex flex-col items-center gap-1 text-amber-400/60 animate-bounce">
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium">Descer</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </section>
  );
}


