'use client';
import { motion } from 'framer-motion';
import { Boxes, Gamepad2, Database, Wallet, Cpu, FileCode, Network } from 'lucide-react';

const STACK = [
  {
    layer: 'Game Engine',
    tech: 'Phaser 4.2',
    desc: 'Motor 2D WebGL. Física arcade, partículas, tweens, áudio. Equivalente web ao que Unity faz em 2D.',
    icon: Gamepad2,
    color: 'emerald',
  },
  {
    layer: 'Frontend',
    tech: 'Next.js 16 + React 19',
    desc: 'App Router, Server Components, TypeScript 5, Tailwind CSS 4, shadcn/ui, Framer Motion.',
    icon: Boxes,
    color: 'amber',
  },
  {
    layer: 'Web3',
    tech: 'wagmi + viem + RainbowKit',
    desc: 'Conexão MetaMask/Ronin Wallet, leitura/escrita on-chain, assinatura de transações.',
    icon: Wallet,
    color: 'sky',
  },
  {
    layer: 'Smart Contracts',
    tech: 'Solidity + Hardhat',
    desc: 'ERC-20 ($KOI, $PEARL), ERC-721 (cartas NFT), Marketplace, Staking. Deploy em Ronin/Polygon/Arbitrum.',
    icon: FileCode,
    color: 'fuchsia',
  },
  {
    layer: 'Indexer',
    tech: 'The Graph (subgraph)',
    desc: 'Indexa eventos on-chain para leaderboard, histórico de cartas, volume de marketplace.',
    icon: Network,
    color: 'violet',
  },
  {
    layer: 'Backend Off-chain',
    tech: 'Next.js API Routes + Prisma',
    desc: 'Anti-cheat, matchmaking, leaderboard, sync de progresso. SQLite para dev, Postgres para prod.',
    icon: Database,
    color: 'cyan',
  },
  {
    layer: 'Real-time',
    tech: 'Socket.io (mini-service)',
    desc: 'Leaderboard ao vivo, duelos PvP, notificações de marketplace. WebSocket isolado em serviço próprio.',
    icon: Cpu,
    color: 'orange',
  },
  {
    layer: 'Infra / Deploy',
    tech: 'Vercel + IPFS + Ronin',
    desc: 'Frontend na Vercel, assets NFT no IPFS, contratos na Ronin (sidechain EVM de baixo gas).',
    icon: Boxes,
    color: 'rose',
  },
];

const COLOR_MAP: Record<string, string> = {
  emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
  amber: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
  sky: 'border-sky-500/30 bg-sky-500/5 text-sky-400',
  fuchsia: 'border-fuchsia-500/30 bg-fuchsia-500/5 text-fuchsia-400',
  violet: 'border-violet-500/30 bg-violet-500/5 text-violet-400',
  cyan: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400',
  orange: 'border-orange-500/30 bg-orange-500/5 text-orange-400',
  rose: 'border-rose-500/30 bg-rose-500/5 text-rose-400',
};

export function ArchitectureSection() {
  return (
    <section id="arquitetura" className="relative py-24 px-6 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 mb-4">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-xs font-medium tracking-widest text-sky-200 uppercase">Stack Técnico</span>
          </div>
          <h2 className="font-mythic text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-sky-300 via-emerald-300 to-amber-300 bg-clip-text text-transparent">
              Arquitetura Profissional
            </span>
          </h2>
          <p className="text-slate-300/90 max-w-2xl mx-auto">
            As mesmas tecnologias usadas por jogos Web3 de produção.
            Cada camada escolhida por motivo concreto, não por hype.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STACK.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.layer}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
                className="p-5 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm hover:scale-[1.02] transition-transform"
              >
                <div className={`w-11 h-11 rounded-lg border flex items-center justify-center mb-3 ${COLOR_MAP[s.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{s.layer}</div>
                <h3 className="font-mythic text-lg font-semibold text-amber-50 mb-2">{s.tech}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Why this stack */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 p-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm"
        >
          <h3 className="font-mythic text-xl font-semibold text-amber-100 mb-4">
            Por que não Unity (como a Axie)?
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="text-emerald-400 font-medium mb-2">✓ Vantagens desta stack</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li>• Zero fricção: joga direto no navegador, sem download</li>
                <li>• SEO e shareabilidade: a landing page é indexável</li>
                <li>• Build/deploy instantâneo na Vercel</li>
                <li>• Mesmos contratos Solidity — migração futura para Unity é trivial</li>
                <li>• Onboarding massivo: qualquer dispositivo com browser</li>
              </ul>
            </div>
            <div>
              <h4 className="text-amber-400 font-medium mb-2">↑ Caminho de evolução</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li>• Fase 1 (este demo): Phaser 2D browser-based</li>
                <li>• Fase 2: Phaser 3D ou migração para Unity WebGL</li>
                <li>• Fase 3: cliente nativo Unity mantendo os mesmos contratos</li>
                <li>• Os NFTs e tokens sobrevivem a qualquer migração de cliente</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Smart contracts preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-8"
        >
          <div className="rounded-2xl border border-border/60 bg-slate-950/60 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-card/40">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-sm text-slate-300">contracts/KoiToken.sol</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Solidity 0.8.24
              </span>
            </div>
            <pre className="p-5 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title $KOI - Governance token for Koi Legend
/// @notice Fixed supply (100M). Used for phase access + governance.
contract KoiToken is ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 1e18;

    constructor() ERC20("Koi Legend", "KOI") Ownable(msg.sender) {
        _mint(msg.sender, MAX_SUPPLY);
    }

    /// @notice Stake KOI to receive share of marketplace fees
    function stake(uint256 amount) external {
        require(amount > 0, "Zero amount");
        _burn(msg.sender, amount);
        staking.stake(msg.sender, amount);
    }
}`}
            </pre>
          </div>
          <p className="text-center text-xs text-slate-500 mt-3">
            Contratos completos ($KOI, $PEARL, KoiNFT, Marketplace, Staking) entregues como arquivos prontos para deploy.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
