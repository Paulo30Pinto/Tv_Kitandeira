
export enum StreamType {
  HLS = 'HLS',           // .m3u8 streams
  YOUTUBE = 'YOUTUBE',   // YouTube Embeds
  IFRAME = 'IFRAME',     // Direct Iframe provided by broadcaster
  EXTERNAL = 'EXTERNAL'  // Must open in new tab (e.g. Globoplay)
}

export enum Country {
  ANGOLA = 'Angola',
  BRASIL = 'Brasil',
  PORTUGAL = 'Portugal',
  GLOBAL = 'Global',
  USA = 'EUA',
  UK = 'Reino Unido',
  GERMANY = 'Alemanha',
  FRANCE = 'França',
  SPAIN = 'Espanha',
  JAPAN = 'Japão',
  TURKEY = 'Turquia',
  SOUTH_KOREA = 'Coreia do Sul',
  INDIA = 'Índia',
  AUSTRALIA = 'Austrália',
  SOUTH_AFRICA = 'África do Sul',
  SINGAPORE = 'Singapura',
  CANADA = 'Canadá',
  POLAND = 'Polônia',
  UN = 'ONU',
  ARGENTINA = 'Argentina',
  HONG_KONG = 'Hong Kong',
  BELGIUM = 'Bélgica',
  NETHERLANDS = 'Países Baixos',
  MEXICO = 'México',
  BOLIVIA = 'Bolívia',
  EGYPT = 'Egito',
  CHILE = 'Chile',
  VENEZUELA = 'Venezuela',
  ITALY = 'Itália'
}

export enum Category {
  NEWS = 'Notícias',
  GENERAL = 'Variedades',
  PUBLIC = 'Público',
  SPORTS = 'Desporto',
  FOOTBALL = 'Futebol',
  MUSIC = 'Música',
  EDUCATION = 'Educação & Gov',
  INTERNATIONAL = 'Internacional',
  KIDS = 'Infantil',
  CARTOON = 'Desenhos',
  ANIME = 'Anime',
  NOVELAS = 'Novelas',
  SERIES = 'Séries',
  MOVIES = 'Filmes'
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  logoColor: string; 
  logoImage?: string;
  streamUrl: string;
  type: StreamType;
  country: Country;
  category: Category;
  language?: string;
  audio?: string;
  fallbackUrls?: string[];
  embedPolicy?: string;
  youtubeId?: string;
  youtubeHandle?: string; 
}
