import { Channel, StreamType, Country, Category } from './types';

export const CHANNELS: Channel[] = [
  // --- ANGOLA ---
  {
    id: 'tpa-1',
    name: 'TPA 1',
    description: 'Emissora pública de Angola. Referência nacional em notícias, cultura e entretenimento em sinal digital direto.',
    logoColor: 'bg-red-800',
    streamUrl: 'https://api.new.livestream.com/accounts/1181452/events/5141181/live.m3u8', 
    type: StreamType.HLS,
    country: Country.ANGOLA,
    category: Category.PUBLIC
  },
  {
    id: 'tv-zimbo',
    name: 'TV Zimbo',
    description: 'A primeira emissora privada de Angola. Programação diversificada com foco em jornalismo e debates em alta definição.',
    logoColor: 'bg-orange-700',
    streamUrl: 'https://sgn-cdn-video.vods2africa.com/Tv-Zimbo/index.fmp4.m3u8',
    type: StreamType.HLS,
    country: Country.ANGOLA,
    category: Category.GENERAL
  },
  {
    id: 'tv-girassol',
    name: 'TV Girassol',
    description: 'O novo olhar de Angola. Programação moderna com foco em entretenimento, cultura e informação.',
    logoColor: 'bg-yellow-600',
    streamUrl: 'https://sgn-cdn-video.vods2africa.com/Tv-Girassol/index.fmp4.m3u8',
    type: StreamType.HLS,
    country: Country.ANGOLA,
    category: Category.GENERAL
  },

  // --- BRASIL ---
  {
    id: 'sbt-br',
    name: 'SBT',
    description: 'A TV que tem a cara do Brasil. Programas de auditório, novelas e jornalismo popular ao vivo.',
    logoColor: 'bg-blue-600',
    streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UC5pB_L_1pS676XidX9-U79A',
    type: StreamType.YOUTUBE,
    country: Country.BRASIL,
    category: Category.GENERAL
  },
  {
    id: 'band-br',
    name: 'Band',
    description: 'Rede Bandeirantes: Tradição em esporte, jornalismo ágil e o melhor do entretenimento nacional.',
    logoColor: 'bg-emerald-700',
    streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UC77SSTf9m2pREHn06n6lQ5Q',
    type: StreamType.YOUTUBE,
    country: Country.BRASIL,
    category: Category.GENERAL
  },
  {
    id: 'globo-rural',
    name: 'Globo Rural',
    description: 'Notícias do campo, agronegócio e a vida rural brasileira em transmissão contínua.',
    logoColor: 'bg-green-800',
    streamUrl: 'https://www.youtube.com/embed/1IsLUmlTa5g',
    type: StreamType.YOUTUBE,
    country: Country.BRASIL,
    category: Category.GENERAL
  },
  {
    id: 'record-news-br',
    name: 'Record News',
    description: 'Jornalismo 24 horas por dia. Acompanhe as principais notícias do Brasil e do mundo em sinal digital.',
    logoColor: 'bg-slate-800',
    streamUrl: 'https://run-rnw-rn.otteravision.com/rnw/rn/rnw_rn_720p_high.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.NEWS
  },
  {
    id: 'cnn-brasil',
    name: 'CNN Brasil',
    description: 'A maior rede de notícias do mundo, com cobertura exclusiva dos fatos que movem o Brasil.',
    logoColor: 'bg-red-900',
    streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UCv8_id_fT_vU-v5S8Xp3U1Q',
    type: StreamType.YOUTUBE,
    country: Country.BRASIL,
    category: Category.NEWS
  },

  // --- NOVELAS & FILMES ---
  {
    id: 'sony-novelas',
    name: 'Sony Novelas',
    description: 'O destino principal para os amantes de teledramaturgia. Sucessos internacionais 24h por dia.',
    logoColor: 'bg-pink-900',
    streamUrl: 'https://spt-novelas-1-us.canelatv.wurl.tv/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.GLOBAL,
    category: Category.GENERAL
  },
  {
    id: 'telemundo-accion',
    name: 'Telemundo Acción',
    description: 'Adrenalina pura com as melhores séries de ação, suspense e dramas policiais latinos.',
    logoColor: 'bg-red-950',
    streamUrl: 'https://d3rciv7av2te5a.cloudfront.net/v1/master/3fec3e5cac39a52b2132f9c66c83dae043dc17d4/prod-plex/master.m3u8?ads.xumo_channelId=88889470',
    type: StreamType.HLS,
    country: Country.GLOBAL,
    category: Category.GENERAL
  },

  // --- PORTUGAL ---
  {
    id: 'rtp-i',
    name: 'RTP Internacional',
    description: 'O canal que une a comunidade lusófona global com o melhor da cultura e informação de Portugal.',
    logoColor: 'bg-blue-900',
    streamUrl: 'https://streaming-live.rtp.pt/liverepeater/smil:rtpi.smil/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.PORTUGAL,
    category: Category.PUBLIC
  },
  {
    id: 'euronews-luso',
    name: 'Euronews PT',
    description: 'Notícias internacionais sob uma perspectiva europeia, agora em português.',
    logoColor: 'bg-blue-500',
    streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UC4pA89_W_v_yTidv8_7_53w',
    type: StreamType.YOUTUBE,
    country: Country.GLOBAL,
    category: Category.NEWS
  },

  // --- ESPECIALIZADOS ---
  {
    id: 'redbull-tv',
    name: 'Red Bull TV',
    description: 'Esportes de ação, festivais de música e documentários exclusivos sobre alta performance.',
    logoColor: 'bg-zinc-900',
    streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    type: StreamType.HLS,
    country: Country.GLOBAL,
    category: Category.SPORTS
  },
  {
    id: 'nasa-live',
    name: 'NASA TV',
    description: 'Direto do espaço. Lançamentos, missões e a vida dos astronautas na Estação Espacial Internacional.',
    logoColor: 'bg-sky-950',
    streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UCLA_DiR1FfKNvjuUpBHmylQ',
    type: StreamType.YOUTUBE,
    country: Country.USA,
    category: Category.INTERNATIONAL
  }
];