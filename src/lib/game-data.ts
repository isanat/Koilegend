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
  playable: boolean;   // ALL 12 stages are playable!
  sceneKey: string;    // Phaser scene key
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
      'O koi enfrenta predadores como garças famintas e cobras d\'água velozes que atacam das sombras.',
    challenge: 'Escapar de ataques rápidos telegrafados enquanto coleta bolhas de escudo e energia.',
    nftName: 'Predador',
    nftAbility: 'Concede imunidade temporária a ataques e +1 coração.',
    entryCost: 15,
    reward: 20,
    difficulty: 'facil',
    cardArt: '/game/cards/card-02-predador.jpg',
    playable: true,
    sceneKey: 'PredatorScene',
    color: '#84cc16',
    icon: '🦅',
  },
  {
    id: 3,
    slug: 'correntes-enganosas',
    title: 'As Correntes Enganosas',
    subtitle: 'Escolha o caminho certo',
    story:
      'O rio se divide em várias ramificações. Algumas levam a águas calmas e ricas em tesouros; outras, a redemoinhos e armadilhas.',
    challenge: 'Navegue entre ramificações escolhendo as correntes douradas e desviando de armadilhas.',
    nftName: 'Corrente da Sabedoria',
    nftAbility: 'Revela com brilho dourado as melhores rotas do rio.',
    entryCost: 20,
    reward: 30,
    difficulty: 'facil',
    cardArt: '/game/cards/card-01-rio-turbulento.jpg',
    playable: true,
    sceneKey: 'CurrentsScene',
    color: '#06b6d4',
    icon: '🌀',
  },
  {
    id: 4,
    slug: 'encontro-peixes',
    title: 'O Encontro com os Outros Peixes',
    subtitle: 'Resista à pressão social',
    story:
      'Outros peixes zombam do koi por sua ambição de nadar contra a corrente até a cachoeira do dragão.',
    challenge: 'Desvie das orbes de dúvida e escárnio enviadas pelos rivais e mantenha sua aura de coragem.',
    nftName: 'Confiança Inabalável',
    nftAbility: 'Aumenta a resistência moral e ganha multiplicador de pontos.',
    entryCost: 25,
    reward: 35,
    difficulty: 'medio',
    cardArt: '/game/cards/card-01-rio-turbulento.jpg',
    playable: true,
    sceneKey: 'PeerPressureScene',
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
    challenge: 'Resista à sucção gravicional dos redemoinhos enquanto usa impulsos de velocidade.',
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
      'Durante uma noite sem estrelas, as águas ficam totalmente escuras. O koi precisa usar sua luminescência interior.',
    challenge: 'Navegue sob visão noturna restrita usando a iluminação das pérolas para avistar rochas.',
    nftName: 'Visão do Instinto',
    nftAbility: 'Expande o raio da aura de iluminação ao redor do Koi.',
    entryCost: 35,
    reward: 50,
    difficulty: 'medio',
    cardArt: '/game/cards/card-01-rio-turbulento.jpg',
    playable: true,
    sceneKey: 'NightScene',
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
    challenge: 'Desvie dos raios telegrafados em vermelho e navegue pelas ondas gigantes da tempestade.',
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
      'Um tronco secular e colossal bloqueia o leito principal do rio, criando passagens perigosas por cima, por baixo e pelas margens.',
    challenge: 'Adapte rapidamente sua altitude para saltar por cima, submergir sob raízes ou contornar o tronco.',
    nftName: 'Flexibilidade do Koi',
    nftAbility: 'Reduz a penalidade de impacto e regenera estamina mais rápido.',
    entryCost: 45,
    reward: 70,
    difficulty: 'dificil',
    cardArt: '/game/cards/card-01-rio-turbulento.jpg',
    playable: true,
    sceneKey: 'FallenTreeScene',
    color: '#16a34a',
    icon: '🌳',
  },
  {
    id: 9,
    slug: 'espinhos-fundo',
    title: 'Os Espinhos do Fundo do Rio',
    subtitle: 'Precisão absoluta',
    story:
      'Um cânion subaquático repleto de corais pontiagudos e anêmonas venenosas exige controle cirúrgico.',
    challenge: 'Mantenha altitude perfeita no centro do túnel para evitar tocar as paredes espinhosas.',
    nftName: 'Pele Resistente',
    nftAbility: 'Reduz o dano causado por espinhos em 60%.',
    entryCost: 50,
    reward: 80,
    difficulty: 'dificil',
    cardArt: '/game/cards/card-01-rio-turbulento.jpg',
    playable: true,
    sceneKey: 'ThornsScene',
    color: '#dc2626',
    icon: '⚠️',
  },
  {
    id: 10,
    slug: 'espirito-rio',
    title: 'O Encontro com o Espírito do Rio',
    subtitle: 'Coragem e sabedoria',
    story:
      'O lendário Guardião do Rio surge das profundezas em formato místico para testar a nobreza e sabedoria do koi.',
    challenge: 'Acompanhe as frequências de luz e orbes místicas do Espírito para demonstrar mestria espiritual.',
    nftName: 'Bênção do Espírito',
    nftAbility: 'Concede atração magnética de orbes e imunidade parcial a falhas.',
    entryCost: 60,
    reward: 100,
    difficulty: 'lendario',
    cardArt: '/game/cards/card-10-espirito-rio.jpg',
    playable: true,
    sceneKey: 'RiverSpiritScene',
    color: '#a855f7',
    icon: '✨',
  },
  {
    id: 11,
    slug: 'cachoeira-dragao',
    title: 'A Cachoeira do Dragão',
    subtitle: 'O salto lendário',
    story:
      'A colossal Porta do Dragão (Longmen) ergue-se nos céus. O koi deve saltar verticalmente contra a torrente impetuosa.',
    challenge: 'Acumule energia e salte ritmicamente contra a cachoeira até alcançar a crista máxima.',
    nftName: 'Salto Lendário',
    nftAbility: 'Aumenta a força dos saltos em 35% e recupera energia por impulso.',
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
    subtitle: 'A ascensão celestial',
    story:
      'Superada a cachoeira, o koi renasce como o Dragão Celestial Dourado! Voe livremente pelos céus das nuvens sagradas.',
    challenge: 'Voe como o Dragão Dourado, dispare chamas místicas contra nuvens tempestuosas e atinja o ápice da lenda!',
    nftName: 'Ascensão do Dragão',
    nftAbility: 'Símbolo supremo de conquista — concede bônus de mineração máximo (+100 $KOI/dia).',
    entryCost: 100,
    reward: 200,
    difficulty: 'lendario',
    cardArt: '/game/cards/card-12-ascensao-dragao.jpg',
    playable: true,
    sceneKey: 'DragonAscensionScene',
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
