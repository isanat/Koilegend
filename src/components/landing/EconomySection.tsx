'use client';
import { motion } from 'framer-motion';
import { Coins, Layers, Shield, TrendingDown, Users, AlertTriangle, Check } from 'lucide-react';

export function EconomySection() {
  return (
    <section id="economia" className="relative py-24 px-6 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 mb-4">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium tracking-widest text-amber-200 uppercase">Tokenomics</span>
          </div>
          <h2 className="font-mythic text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-300 to-emerald-400 bg-clip-text text-transparent">
              Economia Sustentável
            </span>
          </h2>
          <p className="text-slate-300/90 max-w-2xl mx-auto">
            Um modelo de token desenhado para durar anos, não semanas.
            Sustentabilidade econômica real, não promessas de retorno impossível.
          </p>
        </motion.div>

        {/* Honest warning banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 p-5 rounded-xl border border-red-500/30 bg-red-500/5 flex items-start gap-4"
        >
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-300 mb-1">Por que não fizemos "2,5% ao dia"?</h4>
            <p className="text-sm text-slate-300/80 leading-relaxed">
              Modelos que prometem 2,5%–5% de retorno diário (8.700%–5,4 bilhões % ao ano)
              são matematicamente insustentáveis e estruturalmente idênticos a esquemas Ponzi/HYIP
              — ilegais na maioria dos países. Eles colapsam inevitavelmente, prejudicando a maioria
              dos participantes. Em vez disso, redesenhamos uma economia de token que gera valor
              real através de gameplay, utility e fees de marketplace.
            </p>
          </div>
        </motion.div>

        {/* Two tokens */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <TokenCard
            symbol="$KOI"
            name="Koi Token"
            standard="ERC-20"
            supply="100,000,000 (fixo)"
            color="amber"
            purpose="Governança + acesso"
            description="Token de governança. Necessário para acessar fases avançadas, votar em atualizações do jogo e participar do treasury."
            utilities={[
              'Acesso a fases 4–12 (gate por saldo)',
              'Voto em propostas de governança',
              'Staking para yield de fees de marketplace',
              'Descontos em taxas do marketplace',
            ]}
          />
          <TokenCard
            symbol="$PEARL"
            name="Pearl Token"
            standard="ERC-20"
            supply="Inflacionário (com burn)"
            color="sky"
            purpose="Utility + recompensa"
            description="Token de gameplay. Ganho jogando, gasto em fases e upgrades. Supply controlado por burn ativo para manter o valor."
            utilities={[
              'Recompensa por concluir fases',
              'Custo de entrada das fases',
              'Upgrade de cartas NFT',
              'Mint de novas cartas (com burn)',
            ]}
          />
        </div>

        {/* Sustainable yield model */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm mb-12"
        >
          <h3 className="font-mythic text-2xl font-bold text-amber-100 mb-2">
            Modelo de Staking Realista
          </h3>
          <p className="text-slate-400 mb-6 text-sm">
            Staking de $KOI compartilha <strong className="text-amber-300">50% das taxas de marketplace</strong>,
            não promete retorno fixo impossível. O yield varia conforme a atividade real do ecossistema.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { tier: 'Básico', lock: '30 dias', boost: '1.0×', apr: '~8–18% a.a.' },
              { tier: 'Comprometido', lock: '90 dias', boost: '1.4×', apr: '~12–25% a.a.' },
              { tier: 'Lendário', lock: '180 dias', boost: '1.8×', apr: '~15–32% a.a.' },
              { tier: 'Dragão', lock: '365 dias', boost: '2.5×', apr: '~20–45% a.a.' },
            ].map((s) => (
              <div key={s.tier} className="p-4 rounded-lg border border-border/60 bg-slate-900/40">
                <div className="text-xs uppercase tracking-widest text-amber-400 mb-1">{s.tier}</div>
                <div className="font-mythic text-lg font-semibold text-amber-100 mb-2">{s.boost}</div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Trava: {s.lock}</div>
                  <div className="text-emerald-400">{s.apr}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-4 italic">
            * APR variável baseado em volume real do marketplace. Estimativas, não promessas.
          </p>
        </motion.div>

        {/* Referral (sustainable version) */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <FeatureCard
            icon={<Users className="w-5 h-5" />}
            title="Indicações Honestas"
            desc="Bônus de 5–10% sobre as taxas pagas por indicados diretos (um nível apenas, não MLM). Sem bônus sobre lucros — apenas sobre receita real."
          />
          <FeatureCard
            icon={<TrendingDown className="w-5 h-5" />}
            title="Burn Permanente"
            desc="20% de todo $PEARL gasto em fases é queimado. 5% de toda venda no marketplace é queimado. Supply diminui conforme o jogo cresce."
          />
          <FeatureCard
            icon={<Shield className="w-5 h-5" />}
            title="Sem 'Mineração Diária'"
            desc="Não há mineração passiva com retorno fixo. Recompensas vêm de jogar de verdade. Quem contribui para o ecossistema é recompensado."
          />
        </div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-border/60 overflow-hidden"
        >
          <div className="bg-card/60 px-6 py-4 border-b border-border/60">
            <h3 className="font-mythic text-xl font-semibold text-amber-100">
              Comparação: Modelo Tóxico vs. Modelo Sustentável
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left">
                  <th className="px-6 py-3 text-slate-400 font-medium">Aspecto</th>
                  <th className="px-6 py-3 text-red-300 font-medium">Modelo Tóxico (comum)</th>
                  <th className="px-6 py-3 text-emerald-300 font-medium">Koi Legend (proposto)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {[
                  ['Retorno diário', '2,5%–5% ao dia', '0% fixo · yield real de staking'],
                  ['Sustentabilidade', 'Colapsa em semanas', 'Projetado para anos'],
                  ['Origem do valor', 'Entrada de novos jogadores', 'Fees de marketplace + gameplay'],
                  ['MLM', '3 níveis sobre lucros', '1 nível sobre taxas pagas'],
                  ['Status legal', 'Ilegal (Ponzi/HYIP)', 'Conforme com utility token'],
                  ['Burn mechanism', 'Nenhum', '20% PEARL + 5% marketplace'],
                ].map((row) => (
                  <tr key={row[0]} className="hover:bg-card/30">
                    <td className="px-6 py-3 text-slate-300 font-medium">{row[0]}</td>
                    <td className="px-6 py-3 text-red-300/80">{row[1]}</td>
                    <td className="px-6 py-3 text-emerald-300/90 flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      {row[2]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TokenCard({
  symbol,
  name,
  standard,
  supply,
  color,
  purpose,
  description,
  utilities,
}: {
  symbol: string;
  name: string;
  standard: string;
  supply: string;
  color: 'amber' | 'sky';
  purpose: string;
  description: string;
  utilities: string[];
}) {
  const colorClasses =
    color === 'amber'
      ? 'border-amber-500/30 bg-amber-500/5 text-amber-300'
      : 'border-sky-500/30 bg-sky-500/5 text-sky-300';
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="p-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className={`inline-block px-2 py-0.5 rounded text-xs font-mono mb-2 ${colorClasses}`}>
            {symbol}
          </div>
          <h3 className="font-mythic text-2xl font-bold text-amber-50">{name}</h3>
          <p className="text-xs text-slate-400 mt-1">{purpose}</p>
        </div>
        <Layers className={`w-8 h-8 ${color === 'amber' ? 'text-amber-500/60' : 'text-sky-500/60'}`} />
      </div>
      <p className="text-sm text-slate-400 mb-4 leading-relaxed">{description}</p>
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="p-2 rounded bg-slate-900/40">
          <div className="text-slate-500">Padrão</div>
          <div className="text-amber-100">{standard}</div>
        </div>
        <div className="p-2 rounded bg-slate-900/40">
          <div className="text-slate-500">Supply</div>
          <div className="text-amber-100 text-[11px]">{supply}</div>
        </div>
      </div>
      <ul className="space-y-1.5">
        {utilities.map((u) => (
          <li key={u} className="flex items-start gap-2 text-xs text-slate-300">
            <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${color === 'amber' ? 'text-amber-400' : 'text-sky-400'}`} />
            {u}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-5 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm hover:border-amber-500/30 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
        {icon}
      </div>
      <h4 className="font-mythic text-lg font-semibold text-amber-100 mb-2">{title}</h4>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}
