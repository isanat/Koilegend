'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PHASES, type GamePhase } from '@/lib/game-data';

export type NFTCardItem = {
  id: number;
  slug: string;
  name: string;
  ability: string;
  rarity: 'Comum' | 'Rara' | 'Épica' | 'Lendária' | 'Mítica';
  price: number;
  owned: boolean;
  equipped: boolean;
  art: string;
  icon: string;
};

export type StakingDeposit = {
  id: string;
  amount: number;
  durationDays: number;
  apy: number;
  startDate: number;
  earned: number;
};

export type StageProgress = {
  stageId: number;
  unlocked: boolean;
  completed: boolean;
  stars: number;
  highScore: number;
};

type Web3GameState = {
  walletConnected: boolean;
  walletAddress: string;
  connectWallet: () => void;
  disconnectWallet: () => void;

  koiBalance: number;
  pearlBalance: number;
  addTokens: (koi: number, pearl: number) => void;
  payEntryFee: (fee: number) => boolean;

  stagesProgress: Record<number, StageProgress>;
  unlockStage: (stageId: number) => void;
  completeStage: (stageId: number, score: number, stars: number, rewardKoi: number) => void;

  nftCards: NFTCardItem[];
  equippedNft: NFTCardItem | null;
  equipNft: (cardId: number) => void;
  unequipNft: () => void;
  buyNft: (cardId: number) => boolean;

  // Mining
  dailyHashRate: number;
  pendingMiningYield: number;
  lastMiningClaim: number;
  claimMiningYield: () => number;

  // Staking
  stakingDeposits: StakingDeposit[];
  totalStaked: number;
  stakeTokens: (amount: number, days: number) => boolean;
  unstakeTokens: (depositId: string) => void;

  // Referral
  referralCode: string;
  referredCount: number;
  referralEarnings: number;
  claimReferralRewards: () => void;
};

const INITIAL_NFT_CARDS: NFTCardItem[] = PHASES.map((p) => ({
  id: p.id,
  slug: p.slug,
  name: p.nftName,
  ability: p.nftAbility,
  rarity: p.id === 12 ? 'Mítica' : p.id >= 10 ? 'Lendária' : p.id >= 7 ? 'Épica' : p.id >= 4 ? 'Rara' : 'Comum',
  price: p.entryCost * 5,
  owned: p.id === 1, // Start with Card #1 owned
  equipped: p.id === 1, // Start with Card #1 equipped
  art: p.cardArt,
  icon: p.icon,
}));

const INITIAL_STAGES: Record<number, StageProgress> = PHASES.reduce((acc, p) => {
  acc[p.id] = {
    stageId: p.id,
    unlocked: p.id === 1, // Stage 1 unlocked by default
    completed: false,
    stars: 0,
    highScore: 0,
  };
  return acc;
}, {} as Record<number, StageProgress>);

const Web3GameStateContext = createContext<Web3GameState | null>(null);

const STORAGE_KEY = 'koi_legend_game_state_v2';

export function Web3GameStateProvider({ children }: { children: React.ReactNode }) {
  const [walletConnected, setWalletConnected] = useState(true);
  const [walletAddress, setWalletAddress] = useState('0x71C...8f9A');

  const [koiBalance, setKoiBalance] = useState<number>(() => {
    if (typeof window === 'undefined') return 350;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.koiBalance !== undefined) return parsed.koiBalance;
      }
    } catch {}
    return 350;
  });

  const [pearlBalance, setPearlBalance] = useState<number>(() => {
    if (typeof window === 'undefined') return 120;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.pearlBalance !== undefined) return parsed.pearlBalance;
      }
    } catch {}
    return 120;
  });

  const [stagesProgress, setStagesProgress] = useState<Record<number, StageProgress>>(() => {
    if (typeof window === 'undefined') return INITIAL_STAGES;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.stagesProgress) return parsed.stagesProgress;
      }
    } catch {}
    return INITIAL_STAGES;
  });

  const [nftCards, setNftCards] = useState<NFTCardItem[]>(() => {
    if (typeof window === 'undefined') return INITIAL_NFT_CARDS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nftCards) return parsed.nftCards;
      }
    } catch {}
    return INITIAL_NFT_CARDS;
  });

  const [lastMiningClaim, setLastMiningClaim] = useState<number>(() => {
    if (typeof window === 'undefined') return Date.now() - 3600 * 1000 * 4;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lastMiningClaim) return parsed.lastMiningClaim;
      }
    } catch {}
    return Date.now() - 3600 * 1000 * 4;
  });

  const [stakingDeposits, setStakingDeposits] = useState<StakingDeposit[]>(() => {
    if (typeof window === 'undefined')
      return [
        {
          id: 'stk-1',
          amount: 100,
          durationDays: 90,
          apy: 28,
          startDate: Date.now() - 86400 * 1000 * 10,
          earned: 14.2,
        },
      ];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.stakingDeposits) return parsed.stakingDeposits;
      }
    } catch {}
    return [
      {
        id: 'stk-1',
        amount: 100,
        durationDays: 90,
        apy: 28,
        startDate: Date.now() - 86400 * 1000 * 10,
        earned: 14.2,
      },
    ];
  });

  const [referralCode] = useState('KOI-LEGEND-992');
  const [referredCount] = useState(5);
  const [referralEarnings, setReferralEarnings] = useState<number>(() => {
    if (typeof window === 'undefined') return 42.5;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.referralEarnings !== undefined) return parsed.referralEarnings;
      }
    } catch {}
    return 42.5;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      const stateToSave = {
        koiBalance,
        pearlBalance,
        stagesProgress,
        nftCards,
        lastMiningClaim,
        stakingDeposits,
        referralEarnings,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }, [koiBalance, pearlBalance, stagesProgress, nftCards, lastMiningClaim, stakingDeposits, referralEarnings]);

  const equippedNft = nftCards.find((c) => c.equipped) || null;

  const connectWallet = () => {
    setWalletConnected(true);
    setWalletAddress('0x71C...' + Math.floor(1000 + Math.random() * 9000).toString(16));
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
  };

  const addTokens = (koi: number, pearl: number) => {
    setKoiBalance((b) => Math.max(0, b + koi));
    setPearlBalance((b) => Math.max(0, b + pearl));
  };

  const payEntryFee = (fee: number): boolean => {
    if (koiBalance >= fee) {
      setKoiBalance((b) => b - fee);
      return true;
    }
    return false;
  };

  const unlockStage = (stageId: number) => {
    if (stageId < 1 || stageId > 12) return;
    setStagesProgress((prev) => ({
      ...prev,
      [stageId]: {
        ...prev[stageId],
        unlocked: true,
      },
    }));
  };

  const completeStage = (stageId: number, score: number, stars: number, rewardKoi: number) => {
    setStagesProgress((prev) => {
      const current = prev[stageId] || {
        stageId,
        unlocked: true,
        completed: false,
        stars: 0,
        highScore: 0,
      };

      const updated: Record<number, StageProgress> = {
        ...prev,
        [stageId]: {
          stageId,
          unlocked: true,
          completed: true,
          stars: Math.max(current.stars, stars),
          highScore: Math.max(current.highScore, score),
        },
      };

      // Unlock next stage!
      if (stageId < 12) {
        updated[stageId + 1] = {
          ...(prev[stageId + 1] || {
            stageId: stageId + 1,
            completed: false,
            stars: 0,
            highScore: 0,
          }),
          unlocked: true,
        };
      }

      return updated;
    });

    // Grant $KOI completion reward + pearl bonus
    addTokens(rewardKoi, Math.floor(rewardKoi * 0.5));

    // Also auto-grant NFT card for that stage if not owned!
    setNftCards((cards) =>
      cards.map((c) => (c.id === stageId ? { ...c, owned: true } : c))
    );
  };

  const equipNft = (cardId: number) => {
    setNftCards((cards) =>
      cards.map((c) => ({
        ...c,
        equipped: c.id === cardId && c.owned,
      }))
    );
  };

  const unequipNft = () => {
    setNftCards((cards) => cards.map((c) => ({ ...c, equipped: false })));
  };

  const buyNft = (cardId: number): boolean => {
    const card = nftCards.find((c) => c.id === cardId);
    if (!card || card.owned) return false;
    if (koiBalance >= card.price) {
      setKoiBalance((b) => b - card.price);
      setNftCards((cards) =>
        cards.map((c) => (c.id === cardId ? { ...c, owned: true } : c))
      );
      return true;
    }
    return false;
  };

  // Mining Hash Rate calculation
  const unlockedCount = Object.values(stagesProgress).filter((s) => s.unlocked).length;
  const ownedNftCount = nftCards.filter((c) => c.owned).length;
  const totalStaked = stakingDeposits.reduce((sum, d) => sum + d.amount, 0);

  const dailyHashRate = unlockedCount * 12 + ownedNftCount * 20 + totalStaked * 0.15; // $KOI / day

  // Calculate pending mining yield based on time elapsed
  const hoursSinceLastClaim = Math.max(0, (Date.now() - lastMiningClaim) / (1000 * 3600));
  const pendingMiningYield = Number(((dailyHashRate / 24) * hoursSinceLastClaim).toFixed(2));

  const claimMiningYield = () => {
    const yieldAmount = pendingMiningYield;
    if (yieldAmount > 0) {
      addTokens(yieldAmount, Math.floor(yieldAmount * 0.3));
      setLastMiningClaim(Date.now());
    }
    return yieldAmount;
  };

  const stakeTokens = (amount: number, days: number): boolean => {
    if (amount <= 0 || koiBalance < amount) return false;

    const apyMap: Record<number, number> = { 30: 12, 90: 28, 365: 65 };
    const apy = apyMap[days] || 15;

    setKoiBalance((b) => b - amount);
    setStakingDeposits((prev) => [
      ...prev,
      {
        id: `stk-${Date.now()}`,
        amount,
        durationDays: days,
        apy,
        startDate: Date.now(),
        earned: 0,
      },
    ]);
    return true;
  };

  const unstakeTokens = (depositId: string) => {
    const deposit = stakingDeposits.find((d) => d.id === depositId);
    if (!deposit) return;

    setKoiBalance((b) => b + deposit.amount + deposit.earned);
    setStakingDeposits((prev) => prev.filter((d) => d.id !== depositId));
  };

  const claimReferralRewards = () => {
    if (referralEarnings > 0) {
      addTokens(referralEarnings, Math.floor(referralEarnings * 0.4));
      setReferralEarnings(0);
    }
  };

  return (
    <Web3GameStateContext.Provider
      value={{
        walletConnected,
        walletAddress,
        connectWallet,
        disconnectWallet,
        koiBalance,
        pearlBalance,
        addTokens,
        payEntryFee,
        stagesProgress,
        unlockStage,
        completeStage,
        nftCards,
        equippedNft,
        equipNft,
        unequipNft,
        buyNft,
        dailyHashRate,
        pendingMiningYield,
        lastMiningClaim,
        claimMiningYield,
        stakingDeposits,
        totalStaked,
        stakeTokens,
        unstakeTokens,
        referralCode,
        referredCount,
        referralEarnings,
        claimReferralRewards,
      }}
    >
      {children}
    </Web3GameStateContext.Provider>
  );
}

export function useWeb3Game() {
  const ctx = useContext(Web3GameStateContext);
  if (!ctx) {
    throw new Error('useWeb3Game must be used within a Web3GameStateProvider');
  }
  return ctx;
}
