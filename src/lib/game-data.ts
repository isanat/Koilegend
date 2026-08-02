/**
 * Koi Legend - Game Data
 * The 12 phases of the Koi's journey to become a Dragon.
 * Each phase has: story, challenge, NFT card, entry cost (tokens), reward (tokens).
 */

export type PhaseDifficulty = 'iniciante' | 'facil' | 'medio' | 'dificil' | 'lendario';

export type GamePhase = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  story: string;
  challenge: string;
  nftName: string;
  nftAbility: string;
  entryCost: number;   // in $KOI tokens
  reward: number;      // in $PEARL tokens
  difficulty: PhaseDifficulty;
  cardArt: string;     // path to NFT card image
  playable?: boolean;  // whether this phase has a playable demo
  sceneKey?: string;   // Phaser scene key if playable
  color: string;       // theme color for UI
  icon: string;        // emoji or symbol
};

export const PHASES: GamePhase[] = [
  {
    id: 1,
    slug: 'rio-turbulento',
    title: 'O Nascimento no Rio Turbulento',
    subtitle: 'Onde tudo começa',
    story:
      'O peixe koi nasce em um rio repleto de correntezas e pedras afiadas. Ele precisa aprender a navegar para sobreviver.',
    challenge:
      'Sobreviva às correntes iniciais enquanto coleta pérolas de energia para ganhar força.',
    nftName: 'Rio Turbulento',
    nftAbility: 'Reduz o dano causado pelas pedras em 25%.',
    entryCost: 10,
    reward: 15,
    difficulty: 'iniciante',
    cardArt: '/game/cards/card-01-rio-turbulento.jpg',
    playable: true,
    sceneKey: 'RiverScene',
    color: '#0ea5e9',
    icon: '🌊',
  },
  {
    id: 2,
    slug: 'primeiro-predador',
    title: 'O Primeiro Predador',
    subtitle: 'Garças e cobras espreitam',
    story:
      'O koi enfrenta predadores como garças e cobras que surgem das sombras do rio.',
    challenge: 'Escapar de ataques rápidos enquanto coleta itens de proteção.',
    nftName: 'Predador',
    nftAbility: 'Concede imunidade temporária a ataques por 3 segundos.',
    entryCost: 15,
    reward: 20,
    difficulty: 'facil',
    cardArt: '/game/cards/card-02-predador.jpg',
    color: '#84cc16',
    icon: '🦅',
  },
  {
    id: 3,
    slug: 'correntes-enganosas',
    title: 'As Correntes Enganosas',
    subtitle: 'Escolha o caminho certo',
    story:
      'O rio se divide em várias direções, e o koi deve escolher o caminho certo entre muitos enganosos.',
    challenge: 'Decida estrategicamente para evitar armadilhas e maximizar recompensas.',
    nftName: 'Corrente da Sabedoria',
    nftAbility: 'Revela dicas sobre o melhor caminho.',
    entryCost: 20,
    reward: 30,
    difficulty: 'facil',
    cardArt: '/game/cards/card-01-rio-turbulento.jpg',
    color: '#06b6d4',
    icon: '🌀',
  },
  {
    id: 4,
    slug: 'encontro-peixes',
    title: 'O Encontro com os Outros Peixes',
    subtitle: 'Resista à pressão social',
    story:
      'Outros peixes zombam do koi por sua ambição de alcançar a cachoeira.',
    challenge: 'Resista à pressão social e ganhe confiança completando mini desafios motivacionais.',
    nftName: 'Confiança Inabalável',
    nftAbility: 'Aumenta a resistência do jogador em desafios sociais.',
    entryCost: 25,
    reward: 35,
    difficulty: 'medio',
    cardArt: '/game/cards/card-01-rio-turbulento.jpg',
    color: '#f59e0b',
    icon: '🐟',
  },
  {
    id: 5,
    slug: 'redemoinho',
    title: 'O Redemoinho Ancestral',
    subtitle: 'Força contra o abismo',
    story:
      'O koi enfrenta redemoinhos violentos que ameaçam puxá-lo para o fundo do rio.',
    challenge: 'Resista à sucção dos redemoinhos enquanto coleta pérolas de sabedoria.',
    nftName: 'Força do Koi',
    nftAbility: 'Aumenta a regeneração de Dash em 80%.',
    entryCost: 30,
    reward: 45,
    difficulty: 'medio',
    cardArt: '/game/cards/card-05-redemoinho.jpg',
    playable: true,
    sceneKey: 'WhirlpoolScene',
    color: '#8b5cf6',
    icon: '🌪️',
  },
  {
    id: 6,
    slug: 'escuridao-noite',
    title: 'A Escuridão da Noite',
    subtitle: 'Confie nos instintos',
    story:
      'Durante uma noite sem estrelas, o koi precisa confiar em seus instintos para navegar.',
    challenge: 'Navegue no escuro enquanto evita obstáculos invisíveis.',
    nftName: 'Visão do Instinto',
    nftAbility: 'Ilumina parcialmente o caminho à frente.',
    entryCost: 35,
    reward: 50,
    difficulty: 'medio',
    cardArt: '/game/cards/card-01-rio-turbulento.jpg',
    color: '#475569',
    icon: '🌙',
  },
  {
    id: 7,
    slug: 'tempestade-violenta',
    title: 'A Tempestade Elétrica',
    subtitle: 'Raios e fúria dos céus',
    story:
      'O rio é atingido por uma tempestade violenta com relâmpagos cortando as águas.',
    challenge: 'Desvie dos raios telegrafados em vermelho e navegue pelas águas revoltas.',
    nftName: 'Calmaria na Tempestade',
    nftAbility: 'Inicia a fase com um Escudo Protetor de Água ativo.',
    entryCost: 40,
    reward: 60,
    difficulty: 'dificil',
    cardArt: '/game/cards/card-07-tempestade.jpg',
    playable: true,
    sceneKey: 'StormScene',
    color: '#6366f1',
    icon: '⛈️',
  },
  {
    id: 8,
    slug: 'arvore-caida',
    title: 'A Árvore Caída',
    subtitle: 'Encontre a solução',
    story:
      'Um tronco gigante bloqueia o caminho, forçando o koi a encontrar uma solução criativa.',
    challenge: 'Escolha entre passar por cima, por baixo ou ao redor — cada caminho tem um risco.',
    nftName: 'Flexibilidade do Koi',
    nftAbility: 'Reduz o custo de erros na escolha do caminho.',
    entryCost: 45,
    reward: 70,
    difficulty: 'dificil',
    cardArt: '/game/cards/card-01-rio-turbulento.jpg',
    color: '#16a34a',
    icon: '🌳',
  },
  {
    id: 9,
    slug: 'espinhos-fundo',
    title: 'Os Espinhos do Fundo do Rio',
    subtitle: 'Precisão absoluta',
    story:
      'O fundo do rio está coberto de espinhos afiados que podem ferir gravemente o koi.',
    challenge: 'Navegue com cuidado cirúrgico para evitar ferimentos.',
    nftName: 'Pele Resistente',
    nftAbility: 'Reduz o dano causado pelos espinhos em 60%.',
    entryCost: 50,
    reward: 80,
    difficulty: 'dificil',
    cardArt: '/game/cards/card-01-rio-turbulento.jpg',
    color: '#dc2626',
    icon: '⚠️',
  },
  {
    id: 10,
    slug: 'espirito-rio',
    title: 'O Encontro com o Espírito do Rio',
    subtitle: 'Coragem e sabedoria',
    story:
      'O koi encontra o guardião do rio que desafia sua determinação com enigmas antigos.',
    challenge: 'Resolva enigmas para provar coragem e sabedoria.',
    nftName: 'Bênção do Espírito',
    nftAbility: 'Concede vantagens em enigmas e charadas.',
    entryCost: 60,
    reward: 100,
    difficulty: 'lendario',
    cardArt: '/game/cards/card-10-espirito-rio.jpg',
    color: '#a855f7',
    icon: '✨',
  },
  {
    id: 11,
    slug: 'cachoeira-dragao',
    title: 'A Cachoeira do Dragão',
    subtitle: 'O salto lendário',
    story:
      'O koi precisa saltar repetidamente contra uma queda d\'água colossal — o teste final de persistência.',
    challenge: 'Acumule energia e salte cada vez mais alto contra a cachoeira.',
    nftName: 'Salto Lendário',
    nftAbility: 'Aumenta a eficiência dos saltos em 35%.',
    entryCost: 75,
    reward: 120,
    difficulty: 'lendario',
    cardArt: '/game/cards/card-11-cachoeira-dragao.jpg',
    playable: true,
    sceneKey: 'WaterfallScene',
    color: '#f97316',
    icon: '💧',
  },
  {
    id: 12,
    slug: 'transformacao-dragao',
    title: 'A Transformação em Dragão',
    subtitle: 'A ascensão final',
    story:
      'Ao alcançar o topo da cachoeira, o koi se transforma em um dragão celestial, completando sua jornada.',
    challenge: 'Demonstre todas as habilidades aprendidas para completar a jornada lendária.',
    nftName: 'Ascensão do Dragão',
    nftAbility: 'Símbolo máximo de conquista — status lendário no jogo.',
    entryCost: 100,
    reward: 200,
    difficulty: 'lendario',
    cardArt: '/game/cards/card-12-ascensao-dragao.jpg',
    color: '#eab308',
    icon: '🐉',
  },
];

export function getPhase(slug: string): GamePhase | undefined {
  return PHASES.find((p) => p.slug === slug);
}

export function getPlayablePhases(): GamePhase[] {
  return PHASES.filter((p) => p.playable);
}

export const DIFFICULTY_LABEL: Record<PhaseDifficulty, string> = {
  iniciante: 'Iniciante',
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
  lendario: 'Lendário',
};

export const DIFFICULTY_COLOR: Record<PhaseDifficulty, string> = {
  iniciante: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  facil: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  medio: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  dificil: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  lendario: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
};
