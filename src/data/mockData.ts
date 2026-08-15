import { MediaItem, LiveChannel, ShortItem, UserProfile } from '../types';

export const HERO_SLIDES: MediaItem[] = [
  {
    id: 'hero-1',
    title: 'The Boys',
    type: 'serie',
    year: 2026,
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
    badge: 'DUB',
    isNewSeason: true,
    seasons: 5,
    episodesCount: 250,
    imdb: 8.4,
    description: 'Em um mundo onde os super-heróis abraçam o lado sombrio de sua fama massiva, Os Boys embarcam em uma busca heróica para expor a verdade.',
    category: 'Lançamentos',
    subType: 'series'
  },
  {
    id: 'hero-2',
    title: 'Impuros',
    type: 'serie',
    year: 2025,
    thumbnail: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&q=80',
    cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&q=80',
    badge: 'DUB',
    isNewSeason: true,
    seasons: 6,
    episodesCount: 60,
    imdb: 8.1,
    description: 'Evandro entra no mundo do crime e transforma sua facção em um império. Suas ambições chamam a atenção do policial federal Morello.',
    category: 'Lançamentos',
    isExclusive: true,
    subType: 'series'
  },
  {
    id: 'hero-3',
    title: 'A Casa do Dragão',
    type: 'serie',
    year: 2026,
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80',
    cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80',
    badge: 'VIP',
    isNewSeason: true,
    seasons: 2,
    episodesCount: 20,
    imdb: 8.5,
    description: 'A história da Casa Targaryen 200 anos antes dos eventos de Game of Thrones, retratando o início da guerra civil Targaryen.',
    category: 'Lançamentos',
    subType: 'series'
  },
  {
    id: 'hero-4',
    title: 'Consequência',
    type: 'filme',
    year: 2026,
    thumbnail: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=600&q=80',
    cover: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
    badge: 'VIP',
    releaseDate: '05/04/2026',
    imdb: 8.9,
    description: 'Reef Hawk, o queridinho de Hollywood desde os seis anos, enfrenta dilemas perigosos após um escândalo no tapete vermelho.',
    category: 'Tendências',
    subType: 'filmes',
    isExclusive: true
  }
];

export const NACIONAIS_ITEMS: MediaItem[] = [
  {
    id: 'nac-1',
    title: 'Perseguida',
    type: 'filme',
    year: 2026,
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80',
    badge: 'DUB',
    isExclusive: true,
    description: 'Um suspense emocionante gravado entre Luanda e Benguela. Uma mulher corre contra o tempo para revelar uma conspiração.',
    category: 'Nacionais',
    subType: 'filmes'
  },
  {
    id: 'nac-2',
    title: 'O Espantalho',
    type: 'filme',
    year: 2025,
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
    badge: 'DUB',
    description: 'Mistério nas lavouras do Huambo. Lendas locais ganham vida em um drama arrebatador.',
    category: 'Nacionais',
    subType: 'filmes'
  },
  {
    id: 'nac-3',
    title: 'Consequência',
    type: 'filme',
    year: 2026,
    thumbnail: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=600&q=80',
    badge: 'VIP',
    isExclusive: true,
    description: 'A jornada de superação e as escolhas que definem o futuro de uma família em Luanda.',
    category: 'Nacionais',
    subType: 'filmes'
  },
  {
    id: 'nac-4',
    title: 'O Último Conquistador',
    type: 'filme',
    year: 2024,
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80',
    badge: 'DUB',
    description: 'Epopéia histórica épica sobre o reino do Kongo e as rotas comerciais no século XVII.',
    category: 'Nacionais',
    subType: 'filmes'
  }
];

export const LANCAMENTOS_ITEMS: MediaItem[] = [
  {
    id: 'lan-1',
    title: 'Impuros',
    type: 'serie',
    year: 2026,
    thumbnail: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&q=80',
    badge: 'DUB',
    isNewSeason: true,
    seasons: 6,
    description: 'Nova temporada cheia de adrenalina e novas alianças internacionais.',
    category: 'Lançamentos',
    subType: 'series'
  },
  {
    id: 'lan-2',
    title: 'Trust Me: The False Prophet',
    type: 'serie',
    year: 2026,
    thumbnail: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80',
    badge: 'DUB',
    description: 'Uma investigação perigosa sobre um líder cultista que manipula seguidores nas sombras.',
    category: 'Lançamentos',
    subType: 'series'
  },
  {
    id: 'lan-3',
    title: 'Rep - A Sala de Aula',
    type: 'serie',
    year: 2026,
    thumbnail: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80',
    badge: 'DUB',
    description: 'Jovens universitários enfrentam segredos perigosos durante um semestre de exames.',
    category: 'Lançamentos',
    subType: 'series'
  },
  {
    id: 'lan-4',
    title: 'Stranger Things 85',
    type: 'serie',
    year: 2026,
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80',
    badge: 'VIP',
    isNewSeason: true,
    description: 'A batalha final em Hawkins. O Mundo Invertido ameaça consumir tudo.',
    category: 'Lançamentos',
    subType: 'series'
  }
];

export const ULTIMOS_ADICIONADOS: MediaItem[] = [
  {
    id: 'ult-1',
    title: 'Classe dos Heróis 1',
    type: 'serie',
    year: 2026,
    thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&q=80',
    badge: 'DUB',
    description: 'Um jovem estudante enfrenta o bullying usando táticas científicas inteligentes e artes marciais.',
    category: 'Últimos Adicionados',
    subType: 'series'
  },
  {
    id: 'ult-2',
    title: 'Avatar: Fogo e Cinzas',
    type: 'filme',
    year: 2026,
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
    badge: 'VIP',
    description: 'A tribo das cinzas emerge em Pandora trazendo um conflito devastador entre as clãs Na\'vi.',
    category: 'Últimos Adicionados',
    subType: 'filmes'
  },
  {
    id: 'ult-3',
    title: 'Titãs - Temporada Final',
    type: 'serie',
    year: 2025,
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80',
    badge: 'LEG',
    description: 'Dick Grayson e sua equipe enfrentam a seita do Sangue em Metrópolis.',
    category: 'Últimos Adicionados',
    subType: 'series'
  },
  {
    id: 'ult-4',
    title: 'Inteligência Humana',
    type: 'filme',
    year: 2026,
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
    badge: 'DUB',
    description: 'Agentes do serviço secreto utilizam contra-espionagem de alto risco para impedir um ataque cibernético.',
    category: 'Últimos Adicionados',
    subType: 'filmes'
  }
];

export const KIDS_MOVIES: MediaItem[] = [
  {
    id: 'kids-1',
    title: 'Phineas e Ferb',
    type: 'filme',
    year: 2025,
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80',
    badge: 'DUB',
    description: 'Os dois irmãos inventores aproveitam cada dia das férias com invenções fabulosas enquanto Perry o Ornitorrinco salva o mundo.',
    category: 'Filmes para Crianças',
    subType: 'filmes'
  },
  {
    id: 'kids-2',
    title: 'Hamtaro - Grandes Aventuras',
    type: 'filme',
    year: 2024,
    thumbnail: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=600&q=80',
    badge: 'DUB',
    description: 'Hamtaro e o clube dos Ham-Hams embarcam em uma missão para resgatar uma joia mágica.',
    category: 'Filmes para Crianças',
    subType: 'filmes'
  },
  {
    id: 'kids-3',
    title: 'Go Gormiti',
    type: 'serie',
    year: 2025,
    thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&q=80',
    badge: 'DUB',
    description: 'Quatro jovens guardiões convocam os lordes dos elementos para proteger a ilha de Gorm.',
    category: 'Filmes para Crianças',
    subType: 'series'
  },
  {
    id: 'kids-4',
    title: 'Saúdem Todos o King Julien',
    type: 'serie',
    year: 2025,
    thumbnail: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=600&q=80',
    badge: 'DUB',
    description: 'O lêmure mais festeiro de Madagascar comanda o reino com muita dança e confusão.',
    category: 'Filmes para Crianças',
    subType: 'series'
  }
];

export const TRENDING_ITEMS: MediaItem[] = [
  {
    id: 'tr-1',
    title: 'Consequência',
    type: 'filme',
    year: 2026,
    thumbnail: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=600&q=80',
    badge: 'VIP',
    releaseDate: '05/04/2026',
    description: 'Introdução: Reef Hawk, o queridinho de Hollywood desde os seis anos, não está bem. Ao descobrir um esquema oculto...',
    category: 'Em alta',
    subType: 'filmes'
  },
  {
    id: 'tr-2',
    title: 'Ligação Explosiva',
    type: 'filme',
    year: 2021,
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
    badge: 'VIP',
    releaseDate: '22/06/2021',
    description: 'Introdução: Uma família comum enfrenta circunstâncias imprevisíveis desencadeadas por uma ligação anônima...',
    category: 'Em alta',
    subType: 'filmes'
  },
  {
    id: 'tr-3',
    title: 'Vamos Ficar Bem',
    type: 'serie',
    year: 2026,
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
    badge: 'TRAILER',
    releaseDate: '24/03/2026',
    description: 'Introdução: Em uma festa, os opostos Aktan e Lal se apaixonam perdidamente. Seu romance de verão promete desafiar famílias...',
    category: 'Em alta',
    subType: 'series'
  },
  {
    id: 'tr-4',
    title: 'Trocadas na Maternidade',
    type: 'serie',
    year: 2011,
    thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80',
    badge: 'VIP',
    releaseDate: '05/06/2011',
    description: 'Duas garotas adolescentes descobrem que foram trocadas ao nascer na maternidade e tentam unir suas famílias.',
    category: 'Em alta',
    subType: 'series'
  },
  {
    id: 'tr-5',
    title: 'Euphoria',
    type: 'serie',
    year: 2025,
    thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80',
    badge: 'VIP',
    description: 'Um grupo de estudantes de ensino médio navega por amor, amizades e traumas no mundo moderno.',
    category: 'Reality',
    subType: 'series'
  },
  {
    id: 'tr-6',
    title: 'Classe dos Heróis 1',
    type: 'serie',
    year: 2026,
    thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&q=80',
    badge: 'DUB',
    description: 'Ação escolar sul-coreana intensa de superação e estratégia.',
    category: 'Lista crescente',
    subType: 'series'
  },
  {
    id: 'tr-7',
    title: 'Avatar: Fogo e Cinzas',
    type: 'filme',
    year: 2026,
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
    badge: 'VIP',
    description: 'Novo capítulo deslumbrante no ecossistema mágico de Pandora.',
    category: 'Em alta',
    subType: 'filmes'
  },
  {
    id: 'tr-8',
    title: 'NooBees',
    type: 'serie',
    year: 2024,
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80',
    badge: 'DUB',
    description: 'Gamers formam uma equipe lendária de eSports para vencer a liga profissional.',
    category: 'Lista crescente',
    subType: 'series'
  },
  {
    id: 'tr-9',
    title: '3%',
    type: 'serie',
    year: 2024,
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80',
    badge: 'DUB',
    description: 'Dystopia futurista onde apenas 3% da população chega ao Lado do Mar.',
    category: 'Documentário',
    subType: 'series'
  },
  {
    id: 'tr-10',
    title: 'Tyler Perry\'s The Oval',
    type: 'serie',
    year: 2025,
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    badge: 'LEG',
    description: 'Os segredos e o poder por trás da família presidencial na Casa Branca.',
    category: 'Em alta',
    subType: 'series'
  }
];

export const LIVE_CHANNELS: LiveChannel[] = [
  {
    id: 'ch-1',
    name: 'GLOOB HD',
    category: 'Geral',
    logo: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200&q=80',
    streamUrl: 'https://directes-tv-int.3catdirectes.cat/live-content/esport3-hls/master.m3u8',
    status: 'Online',
    isLive: true,
    currentProgram: 'Alvinnn!!! e os Esquilos'
  },
  {
    id: 'ch-2',
    name: 'CAZÉ TV HD 2',
    category: 'CANAIS DE ESPORTES',
    logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=200&q=80',
    streamUrl: 'https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/Caze_TV.m3u8',
    status: 'Online',
    isLive: true,
    currentProgram: 'Mundo Esportivo Ao Vivo'
  },
  {
    id: 'ch-3',
    name: 'CAZÉ TV HD',
    category: 'CANAIS DE ESPORTES',
    logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=200&q=80',
    streamUrl: 'https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/Caze_TV.m3u8',
    status: 'Online',
    isLive: true,
    currentProgram: 'Girabola & Liga dos Campeões'
  },
  {
    id: 'ch-4',
    name: 'DAZN SERIE A',
    category: 'CANAIS DE ESPORTES',
    logo: 'https://images.unsplash.com/photo-1579952318893-20a31006100e?w=200&q=80',
    streamUrl: 'https://aegis-cloudfront-1.tubi.video/651ee7d3-e75b-4748-be86-422d43ff24b6/playlist.m3u8',
    status: 'Online',
    isLive: true,
    currentProgram: 'Futebol Italiano Ao Vivo'
  },
  {
    id: 'ch-5',
    name: 'DAZN',
    category: 'CANAIS DE ESPORTES',
    logo: 'https://images.unsplash.com/photo-1579952318893-20a31006100e?w=200&q=80',
    streamUrl: 'https://aegis-cloudfront-1.tubi.video/651ee7d3-e75b-4748-be86-422d43ff24b6/playlist.m3u8',
    status: 'Online',
    isLive: true,
    currentProgram: 'Boxe & MMA Internacional'
  },
  {
    id: 'ch-6',
    name: 'GLOBO SP HD',
    category: 'GLOBO',
    logo: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=200&q=80',
    streamUrl: 'https://video01.soultv.com.br/internacional/internacional/playlist.m3u8',
    status: 'Online',
    isLive: true,
    currentProgram: 'Jornal Nacional / Novela das 9'
  },
  {
    id: 'ch-7',
    name: 'SBT HD',
    category: 'SBT',
    logo: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=200&q=80',
    streamUrl: 'https://aegis-cloudfront-1.tubi.video/6fa0e83b-0e19-46d7-95fd-7d9526c8dab5/playlist.m3u8',
    status: 'Online',
    isLive: true,
    currentProgram: 'Programa Silvio Santos'
  },
  {
    id: 'ch-8',
    name: 'TNT SPORTS',
    category: 'TNT',
    logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=200&q=80',
    streamUrl: 'https://aegis-cloudfront-1.tubi.video/651ee7d3-e75b-4748-be86-422d43ff24b6/playlist.m3u8',
    status: 'Online',
    isLive: true,
    currentProgram: 'Champions League Show'
  },
  {
    id: 'ch-9',
    name: 'TELECINE PIPOCA',
    category: 'TeleCine',
    logo: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&q=80',
    streamUrl: 'https://d20oth1416y9a1.cloudfront.net/playlist/amg00711-zylofast-frequencenovelas-rakutenus/playlist.m3u8',
    status: 'Online',
    isLive: true,
    currentProgram: 'Maratona de Filmes de Ação'
  },
  {
    id: 'ch-10',
    name: 'CNN PORTUGAL',
    category: 'Notícias',
    logo: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&q=80',
    streamUrl: 'https://2-fss-2.streamhoster.com/pl_118/204972-2205186-1/playlist.m3u8',
    status: 'Online',
    isLive: true,
    currentProgram: 'Notícias do Mundo Ao Vivo'
  }
];

export const SHORTS_DATA: ShortItem[] = [
  {
    id: 'short-1',
    channelName: 'Angoflix',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    caption: 'conhece a bíblia? Reflexões e cenas emocionantes do novo drama da Angoflix.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    likes: 66,
    comments: 12,
    shares: 8
  },
  {
    id: 'short-2',
    channelName: 'Angoflix Studio',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    caption: 'Bastidores exclusivos da 6ª temporada de Impuros gravados em Luanda! 🔥',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    likes: 340,
    comments: 48,
    shares: 29
  },
  {
    id: 'short-3',
    channelName: 'Angoflix Esportes',
    channelAvatar: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150&q=80',
    caption: 'Melhores momentos da rodada da Girabola 2026! Quem leva o título este ano?',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    likes: 1250,
    comments: 104,
    shares: 92
  }
];

export const MOCK_USER: UserProfile = {
  name: 'Paulo Bunga',
  email: 'PauloBunga16@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&q=80',
  isVip: true,
  tier: 'Plano VIP Angoflix (Anual)',
  downloadsCount: 14
};

export const APP_LAUNCHERS = [
  { id: 'prime', name: 'Prime Video', bg: '#00A8E1', iconText: 'prime video' },
  { id: 'netflix', name: 'Netflix', bg: '#E50914', iconText: 'N' },
  { id: 'hbo', name: 'HBO MAX', bg: '#5822B4', iconText: 'HBO max' },
  { id: 'disney', name: 'Disney+', bg: '#113CCF', iconText: 'Disney+' },
  { id: 'globoplay', name: 'Globoplay', bg: '#FB0000', iconText: 'globo play' }
];
