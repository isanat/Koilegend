'use client';
import { useState, useEffect } from 'react';
import { useWeb3Game } from '@/context/Web3GameStateContext';
import { Fish, Menu, X, Wallet, Coins, Trophy } from 'lucide-react';

const LINKS = [
  { href: '#jornada', label: 'Jornada' },
  { href: '#jogar', label: '12 Provas' },
  { href: '#cartas', label: 'Cartas NFT' },
  { href: '#mineracao', label: 'Mineração & Staking' },
  { href: '#arquitetura', label: 'Arquitetura' },
];

export function SiteHeader() {
  const { walletConnected, walletAddress, connectWallet, koiBalance, pearlBalance } = useWeb3Game();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'py-2.5 bg-slate-950/80 backdrop-blur-xl border-b border-amber-500/20 shadow-lg shadow-black/40'
          : 'py-4 bg-gradient-to-b from-slate-950/80 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-shadow">
            <Fish className="w-5 h-5 text-slate-950" />
            <div className="absolute inset-0 rounded-lg ring-1 ring-amber-300/40" />
          </div>
          <span className="font-mythic text-xl font-bold text-amber-100">
            Koi<span className="text-amber-400">Legend</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3.5 py-2 rounded-full text-xs font-medium text-slate-300 hover:text-amber-100 hover:bg-amber-500/10 transition-all duration-200"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Web3 Balance & Wallet Pill */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-xs">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-amber-300">{koiBalance}</span>
            <span className="text-[10px] text-slate-400">$KOI</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-xs">
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-emerald-300">{pearlBalance}</span>
            <span className="text-[10px] text-slate-400">$PEARL</span>
          </div>

          <button
            onClick={connectWallet}
            className="btn-gold px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5 text-slate-950" />
            {walletConnected ? walletAddress : 'Conectar Carteira'}
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-amber-500/10"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-b border-amber-500/20 p-6 flex flex-col gap-3">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 rounded-lg text-slate-300 hover:bg-amber-500/10 hover:text-amber-100 transition-colors text-sm"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-amber-300 font-bold">{koiBalance} $KOI</div>
            <button
              onClick={connectWallet}
              className="btn-gold px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5 text-slate-950" />
              {walletConnected ? walletAddress : 'Conectar Carteira'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
