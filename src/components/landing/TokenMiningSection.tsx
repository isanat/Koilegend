'use client';
import { useState } from 'react';
import { useWeb3Game } from '@/context/Web3GameStateContext';
import { Pickaxe, TrendingUp, Lock, Award, Share2, Copy, Check, Sparkles, Zap, Coins } from 'lucide-react';

export function TokenMiningSection() {
  const {
    koiBalance,
    dailyHashRate,
    pendingMiningYield,
    claimMiningYield,
    stakingDeposits,
    stakeTokens,
    unstakeTokens,
    referralCode,
    referredCount,
    referralEarnings,
    claimReferralRewards,
  } = useWeb3Game();

  const [stakeAmount, setStakeAmount] = useState<number>(100);
  const [stakeDays, setStakeDays] = useState<number>(90);
  const [copied, setCopied] = useState(false);
  const [claimedMessage, setClaimedMessage] = useState<string | null>(null);

  const handleClaimMining = () => {
    const yieldAmount = claimMiningYield();
    if (yieldAmount > 0) {
      setClaimedMessage(`Sucesso! Você coletou +${yieldAmount} $KOI do pool de mineração.`);
      setTimeout(() => setClaimedMessage(null), 4000);
    }
  };

  const handleStake = (e: React.FormEvent) => {
    e.preventDefault();
    if (stakeTokens(stakeAmount, stakeDays)) {
      setClaimedMessage(`Sucesso! ${stakeAmount} $KOI bloqueados em Staking por ${stakeDays} dias.`);
      setTimeout(() => setClaimedMessage(null), 4000);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`https://koilegend.io/ref/${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="mineracao" className="relative py-24 px-6 bg-slate-950/80 border-t border-amber-500/20">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel mb-4 border border-amber-500/30">
            <Pickaxe className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-semibold tracking-[0.25em] text-amber-300 uppercase">
              Economia do Token
            </span>
          </div>
          <h2 className="font-mythic text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-gold-gradient">
            Mineração & Staking Diário
          </h2>
          <p className="text-slate-200 max-w-2xl mx-auto text-base sm:text-lg">
            Gere liquidez e lucros diários acumulando conquistas nas 12 etapas e NFTs colecionáveis.
          </p>
        </div>

        {/* Claim Alert Banner */}
        {claimedMessage && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-sm flex items-center gap-3 animate-fade-in">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{claimedMessage}</span>
          </div>
        )}

        {/* Top 3 KPI Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Mining Card */}
          <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 relative overflow-hidden bg-slate-900/90">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> Taxa de Mineração
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Ativo 24/7
              </span>
            </div>
            <div className="text-3xl font-extrabold text-amber-100 mb-1">
              {dailyHashRate.toFixed(1)} <span className="text-base text-amber-400 font-normal">$KOI/dia</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Rendimento acumulado: <strong className="text-amber-300">{pendingMiningYield} $KOI</strong>
            </p>

            <button
              onClick={handleClaimMining}
              disabled={pendingMiningYield <= 0}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                pendingMiningYield > 0
                  ? 'btn-gold shadow-lg hover:scale-102'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              Reclamar Lucro ({pendingMiningYield} $KOI)
            </button>
          </div>

          {/* Staking Card */}
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 relative overflow-hidden bg-slate-900/90">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Pool de Staking
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Até 65% APY
              </span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-100 mb-1">
              {stakingDeposits.reduce((sum, d) => sum + d.amount, 0)} <span className="text-base text-emerald-400 font-normal">$KOI</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Contratos ativos: <strong className="text-emerald-300">{stakingDeposits.length} bloqueios</strong>
            </p>

            <a
              href="#stake-form"
              className="block text-center w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all cursor-pointer"
            >
              Novo Bloqueio de Staking
            </a>
          </div>

          {/* Referral Card */}
          <div className="glass-panel p-6 rounded-2xl border border-sky-500/30 relative overflow-hidden bg-slate-900/90">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-sky-400" /> Sistema de Indicações
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                10% Bônus
              </span>
            </div>
            <div className="text-3xl font-extrabold text-sky-100 mb-1">
              {referredCount} <span className="text-base text-sky-400 font-normal">Amigos</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Ganhos acumulados: <strong className="text-sky-300">{referralEarnings} $KOI</strong>
            </p>

            <button
              onClick={() => {
                if (referralEarnings > 0) claimReferralRewards();
              }}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition-all cursor-pointer"
            >
              Coletar Bônus ({referralEarnings} $KOI)
            </button>
          </div>
        </div>

        {/* Staking Form & Active Contracts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div id="stake-form" className="glass-panel p-6 sm:p-8 rounded-2xl border border-amber-500/30 bg-slate-900/90">
            <h3 className="font-mythic text-2xl font-bold text-amber-200 mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" /> Bloquear $KOI em Staking
            </h3>
            <p className="text-xs text-slate-300 mb-6">
              Aumente sua taxa de mineração diária e garanta rendimentos de até 65% ao ano.
            </p>

            <form onSubmit={handleStake} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                  Quantidade ($KOI)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max={koiBalance}
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-amber-500/30 text-amber-100 font-bold focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setStakeAmount(koiBalance)}
                    className="absolute right-3 top-2.5 px-2.5 py-1 rounded text-xs font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                  >
                    MÁX ({koiBalance})
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                  Período de Trava
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { days: 30, apy: 12 },
                    { days: 90, apy: 28 },
                    { days: 365, apy: 65 },
                  ].map((p) => (
                    <button
                      key={p.days}
                      type="button"
                      onClick={() => setStakeDays(p.days)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        stakeDays === p.days
                          ? 'border-amber-400 bg-amber-500/20 text-amber-100 ring-1 ring-amber-400'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-amber-500/30'
                      }`}
                    >
                      <div className="text-sm font-bold">{p.days} Dias</div>
                      <div className="text-xs text-emerald-400 font-semibold">{p.apy}% APY</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={stakeAmount <= 0 || koiBalance < stakeAmount}
                className="w-full py-4 rounded-xl font-bold text-base btn-gold shadow-xl cursor-pointer hover:scale-102 transition-transform"
              >
                Confirmar Staking de {stakeAmount} $KOI
              </button>
            </form>
          </div>

          {/* Referral & Staking list */}
          <div className="space-y-6">
            {/* Referral link box */}
            <div className="glass-panel p-6 rounded-2xl border border-sky-500/30 bg-slate-900/90">
              <h4 className="font-mythic text-lg font-bold text-sky-200 mb-2 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-sky-400" /> Seu Link de Indicação
              </h4>
              <p className="text-xs text-slate-300 mb-4">
                Ganhe 10% do valor de entrada das partidas dos seus convidados direto na sua carteira.
              </p>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-sky-500/30">
                <input
                  type="text"
                  readOnly
                  value={`https://koilegend.io/ref/${referralCode}`}
                  className="bg-transparent text-xs text-slate-300 font-mono flex-1 focus:outline-none px-2"
                />
                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Active deposits list */}
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-slate-900/90">
              <h4 className="font-mythic text-lg font-bold text-emerald-200 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" /> Contratos de Staking Ativos
              </h4>

              {stakingDeposits.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhum contrato ativo no momento.</p>
              ) : (
                <div className="space-y-3">
                  {stakingDeposits.map((d) => (
                    <div
                      key={d.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/20 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-bold text-emerald-300">{d.amount} $KOI</div>
                        <div className="text-xs text-slate-400">
                          {d.durationDays} dias • APY {d.apy}%
                        </div>
                      </div>
                      <button
                        onClick={() => unstakeTokens(d.id)}
                        className="px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-bold text-xs cursor-pointer"
                      >
                        Resgatar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
