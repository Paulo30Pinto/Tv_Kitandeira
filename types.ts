
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
  UN = 'ONU'
}

export enum Category {
  NEWS = 'Notícias',
  GENERAL = 'Variedades',
  PUBLIC = 'Público',
  SPORTS = 'Desporto',
  MUSIC = 'Música',
  EDUCATION = 'Educação & Gov',
  INTERNATIONAL = 'Internacional',
  KIDS = 'Infantil'
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  logoColor: string; 
  streamUrl: string;
  type: StreamType;
  country: Country;
  category: Category;
  youtubeId?: string;
  youtubeHandle?: string; 
}