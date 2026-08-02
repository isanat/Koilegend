'use client';
import { useState } from 'react';
import { useWeb3Game } from '@/context/Web3GameStateContext';
import { Sparkles, Shield, Check, Lock, Coins, Trophy, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export function NFTCardsSection() {
  const { nftCards, equippedNft, equipNft, unequipNft, buyNft, koiBalance } = useWeb3Game();
  const [selectedRarity, setSelectedRarity] = useState<string>('Todas');
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);

  const filteredCards = nftCards.filter((card) => {
    if (selectedRarity === 'Todas') return true;
    return card.rarity === selectedRarity;
  });

  const handleBuy = (cardId: number, cardName: string) => {
    if (buyNft(cardId)) {
      setPurchaseMsg(`Parabéns! Você adquiriu a Carta NFT "${cardName}"!`);
      setTimeout(() => setPurchaseMsg(null), 4000);
    } else {
      setPurchaseMsg(`Saldo insuficiente de $KOI para adquirir "${cardName}".`);
      setTimeout(() => setPurchaseMsg(null), 4000);
    }
  };

  return (
    <section id="cartas" className="relative py-24 px-6 bg-slate-950/90">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel mb-4 border border-amber-500/30">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-semibold tracking-[0.25em] text-amber-300 uppercase">
              Coleção de 12 NFTs
            </span>
          </div>
          <h2 className="font-mythic text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-gold-gradient">
            Cartas NFT Colecionáveis
          </h2>
          <p className="text-slate-200 max-w-2xl mx-auto text-base sm:text-lg">
            Cada etapa desbloqueia uma carta mística exclusiva com habilidades passivas e vantagens únicas nas provas.
          </p>
        </div>

        {/* Purchase Notification */}
        {purchaseMsg && (
          <div className="mb-8 p-4 rounded-xl bg-amber-950/90 border border-amber-500/40 text-amber-200 text-sm flex items-center gap-3 animate-fade-in">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{purchaseMsg}</span>
          </div>
        )}

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {['Todas', 'Comum', 'Rara', 'Épica', 'Lendária', 'Mítica'].map((rarity) => (
            <button
              key={rarity}
              onClick={() => setSelectedRarity(rarity)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRarity === rarity
                  ? 'btn-gold shadow-lg'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-amber-500/30'
              }`}
            >
              {rarity}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCards.map((card) => {
            const isEquipped = equippedNft?.id === card.id;

            return (
              <div
                key={card.id}
                className={`group relative rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                  isEquipped
                    ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/50 shadow-xl shadow-amber-500/20'
                    : card.owned
                    ? 'border-slate-800 bg-slate-900/90 hover:border-amber-500/40 hover:bg-slate-800/90'
                    : 'border-slate-900 bg-slate-950/60 opacity-85 hover:opacity-100'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{card.icon}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        card.rarity === 'Mítica'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : card.rarity === 'Lendária'
                          ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40'
                          : card.rarity === 'Épica'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : card.rarity === 'Rara'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {card.rarity}
                    </span>
                  </div>

                  {/* Card Image preview */}
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-4 border border-amber-500/20 bg-slate-950">
                    <Image
                      src={card.art}
                      alt={card.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 text-xs font-mythic font-bold text-amber-100 truncate">
                      # {String(card.id).padStart(2, '0')} • {card.name}
                    </div>
                  </div>

                  {/* Card Title & Ability */}
                  <h4 className="font-mythic font-bold text-lg text-amber-100 mb-1">
                    {card.name}
                  </h4>
                  <p className="text-xs text-slate-300 mb-4 line-clamp-2 leading-relaxed">
                    {card.ability}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800/80">
                  {card.owned ? (
                    isEquipped ? (
                      <button
                        onClick={unequipNft}
                        className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Check className="w-4 h-4" /> Equipado na Arena
                      </button>
                    ) : (
                      <button
                        onClick={() => equipNft(card.id)}
                        className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 text-amber-300 border border-amber-500/30 hover:bg-slate-700 cursor-pointer transition-all"
                      >
                        Equipar Carta
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleBuy(card.id, card.name)}
                      className="w-full py-2.5 rounded-xl font-bold text-xs btn-gold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Coins className="w-4 h-4 text-slate-950" /> Comprar ({card.price} $KOI)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
