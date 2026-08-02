'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { PHASES } from '@/lib/game-data';
import { Sparkles, TrendingUp, Shield } from 'lucide-react';

const RARITY = ['Comum', 'Incomum', 'Rara', 'Épica', 'Lendária', 'Mítica'] as const;

export function NFTGallery() {
  const [active, setActive] = useState(0);
  const cards = PHASES.filter((p) => p.cardArt.includes('card-'));
  // Assign rarity tiers based on phase difficulty
  const featured = cards.slice(0, 7);

  return (
    <section id="nfts" className="relative py-24 px-6 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
            <span className="text-xs font-medium tracking-widest text-fuchsia-200 uppercase">Coleção NFT</span>
          </div>
          <h2 className="font-mythic text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-fuchsia-300 via-amber-300 to-orange-400 bg-clip-text text-transparent">
              Cartas da Lenda
            </span>
          </h2>
          <p className="text-slate-300/90 max-w-2xl mx-auto">
            Cada etapa concede uma carta NFT única (ERC-721) com poderes especiais.
            Troque no marketplace, combine para evoluir, ou guarde as mais raras.
          </p>
        </motion.div>

        {/* Featured card display */}
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-center mb-12">
          {/* Big featured card */}
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-[3/4] max-w-sm mx-auto w-full"
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl shadow-amber-500/20 animate-dragon-pulse">
              <img
                src={featured[active].cardArt}
                alt={featured[active].nftName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const t = e.currentTarget as HTMLImageElement;
                  t.style.display = 'none';
                  t.parentElement!.style.background = `linear-gradient(135deg, ${featured[active].color}, #0a0e1a)`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute top-3 left-3 right-3 flex justify-between">
                <span className="text-[10px] px-2 py-1 rounded-full bg-slate-950/70 backdrop-blur-sm border border-amber-500/30 text-amber-300 uppercase tracking-widest">
                  {RARITY[Math.min(active, RARITY.length - 1)]}
                </span>
                <span className="text-[10px] px-2 py-1 rounded-full bg-slate-950/70 backdrop-blur-sm border border-slate-600 text-slate-300">
                  #{String(featured[active].id).padStart(3, '0')}/012
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="text-3xl mb-1">{featured[active].icon}</div>
                <h3 className="font-mythic text-xl font-bold text-amber-100 mb-1">
                  {featured[active].nftName}
                </h3>
                <p className="text-xs text-slate-300/80 mb-3">{featured[active].nftAbility}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Etapa {featured[active].id}</span>
                  <span className="text-sm font-semibold text-amber-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {featured[active].reward} $PEARL
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Description + stats */}
          <div>
            <motion.div
              key={`desc-${active}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="font-mythic text-3xl font-bold text-amber-100 mb-2">
                {featured[active].nftName}
              </h3>
              <p className="text-slate-400 mb-6 leading-relaxed">{featured[active].story}</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <StatCard label="Raridade" value={RARITY[Math.min(active, RARITY.length - 1)]} />
                <StatCard label="Fase" value={`Etapa ${featured[active].id}/12`} />
                <StatCard label="Poder" value={featured[active].nftAbility.split(' ').slice(0, 3).join(' ')} />
                <StatCard label="Recompensa" value={`${featured[active].reward} PEARL`} />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Padrão ERC-721 · On-chain · Comerciável no marketplace</span>
              </div>
            </motion.div>

            {/* Thumbnail selector */}
            <div className="grid grid-cols-7 gap-2">
              {featured.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setActive(i)}
                  className={`relative aspect-[3/4] rounded-md overflow-hidden border-2 transition-all ${
                    active === i
                      ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/30'
                      : 'border-transparent opacity-50 hover:opacity-90'
                  }`}
                >
                  <img
                    src={p.cardArt}
                    alt={p.nftName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const t = e.currentTarget as HTMLImageElement;
                      t.style.display = 'none';
                      t.parentElement!.style.background = p.color;
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* NFT features strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid sm:grid-cols-3 gap-4"
        >
          {[
            { icon: '🔄', title: 'Marketplace', desc: 'Compre, venda e leiloe cartas diretamente on-chain com taxas mínimas.' },
            { icon: '⚔️', title: 'Combate', desc: 'Cartas concedem vantagens reais nas fases — não são só cosméticas.' },
            { icon: '🧬', title: 'Evolução', desc: 'Funda cartas duplicadas para desbloquear versões superiores e mais raras.' },
          ].map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-amber-500/30 transition-colors"
            >
              <div className="text-3xl mb-2">{f.icon}</div>
              <h4 className="font-mythic text-lg font-semibold text-amber-100 mb-1">{f.title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg border border-border/60 bg-card/40">
      <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{label}</div>
      <div className="text-sm font-medium text-amber-100">{value}</div>
    </div>
  );
}
