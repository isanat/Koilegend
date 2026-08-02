import { Fish, Github, Twitter, Globe } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-slate-950/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                <Fish className="w-5 h-5 text-slate-950" />
              </div>
              <span className="font-mythic text-xl font-bold text-amber-50">
                Koi<span className="text-amber-400">Legend</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-4">
              Um jogo Web3 baseado na lenda milenar do peixe Koi que se transforma
              em dragão. 12 etapas de resiliência, superação e determinação —
              com uma economia de token sustentável e honesta.
            </p>
            <div className="flex gap-3">
              {[Github, Twitter, Globe].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg border border-border/60 bg-card/40 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-mythic text-sm font-semibold text-amber-300 uppercase tracking-wider mb-3">
              Jogo
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#jornada" className="hover:text-amber-200 transition-colors">A Jornada</a></li>
              <li><a href="#nfts" className="hover:text-amber-200 transition-colors">Cartas NFT</a></li>
              <li><a href="#jogar" className="hover:text-amber-200 transition-colors">Jogar Demo</a></li>
              <li><a href="#economia" className="hover:text-amber-200 transition-colors">Tokenomics</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mythic text-sm font-semibold text-amber-300 uppercase tracking-wider mb-3">
              Recursos
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#arquitetura" className="hover:text-amber-200 transition-colors">Arquitetura</a></li>
              <li><a href="#" className="hover:text-amber-200 transition-colors">Whitepaper</a></li>
              <li><a href="#" className="hover:text-amber-200 transition-colors">Contratos</a></li>
              <li><a href="#" className="hover:text-amber-200 transition-colors">Documentação</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2025 Koi Legend · Construído com Phaser 4 + Next.js 16 + Solidity</p>
          <p className="italic">
            "A resiliência transforma peixes em dragões."
          </p>
        </div>
      </div>
    </footer>
  );
}
