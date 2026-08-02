'use client';
import { useState, useEffect } from 'react';
import { Fish, Menu, X } from 'lucide-react';

const LINKS = [
  { href: '#jornada', label: 'Jornada' },
  { href: '#nfts', label: 'NFTs' },
  { href: '#jogar', label: 'Jogar' },
  { href: '#economia', label: 'Economia' },
  { href: '#arquitetura', label: 'Stack' },
];

export function SiteHeader() {
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
          ? 'py-2.5 bg-ink-900/70 backdrop-blur-xl border-b border-gold-500/10 shadow-lg shadow-ink-900/30'
          : 'py-4 bg-gradient-to-b from-ink-900/60 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo — refined */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 flex items-center justify-center shadow-lg shadow-gold-500/30 group-hover:shadow-gold-500/50 transition-shadow">
            <Fish className="w-5 h-5 text-ink-900" />
            <div className="absolute inset-0 rounded-lg ring-1 ring-gold-300/40" />
          </div>
          <span className="font-mythic text-xl font-bold text-gold-100">
            Koi<span className="text-gold-400">Legend</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-4 py-2 rounded-full text-sm text-slate-300 hover:text-gold-100 hover:bg-gold-500/10 transition-all duration-200"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#jogar"
            onMouseEnter={(e) => e.currentTarget.classList.add('btn-gold-hover')}
            onMouseLeave={(e) => e.currentTarget.classList.remove('btn-gold-hover')}
            className="btn-gold ml-2 px-5 py-2 rounded-full text-sm font-semibold"
          >
            Jogar
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-gold-500/10"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-ink-900/95 backdrop-blur-xl border-b border-gold-500/10">
          <nav className="px-6 py-4 flex flex-col gap-1">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-lg text-slate-300 hover:bg-gold-500/10 hover:text-gold-100 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
