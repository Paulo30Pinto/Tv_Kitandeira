export type ContentBadge = 'DUB' | 'LEG' | 'VIP' | 'TRAILER' | 'LIVE' | '4K' | 'HD';

export enum StreamType {
  HLS = 'HLS',
  YOUTUBE = 'YOUTUBE',
  IFRAME = 'IFRAME',
  EXTERNAL = 'EXTERNAL',
  DASH = 'DASH'
}

export enum Country {
  ANGOLA = 'Angola',
  BRASIL = 'Brasil',
  PORTUGAL = 'Portugal',
  GLOBAL = 'Global'
}

export enum Category {
  NEWS = 'Notícias',
  KIDS = 'Infantil',
  SPORTS = 'Desporto',
  EDUCATION = 'Educação & Gov',
  INTERNATIONAL = 'Internacional',
  MUSIC = 'Música',
  GENERAL = 'Variedades',
  MOVIES = 'Filme',
  NOVELAS = 'Novelas',
  PUBLIC = 'Público',
  FOOTBALL = 'Futebol',
  SERIES = 'Séries',
  CARTOON = 'Desenhos',
  ANIME = 'Anime'
}

export type LiveStatus = 'ONLINE' | 'OFFLINE' | 'BUFFERING' | 'ERROR';

export interface Channel {
  id: string;
  name: string;
  description: string;
  logoColor: string; 
  logoImage?: string;
  watermark?: string; // e.g. "TP", "TZ", "TG", "GO", "ZV"
  streamUrl: string;
  type: StreamType;
  country: Country;
  category: Category;
  language?: string;
  resolution?: '4K' | '1080p' | '720p';
  status?: LiveStatus;
  isAdult?: boolean;
  channelNumber?: string;
}

export interface EPGProgram {
  id: string;
  channelId: string;
  title: string;
  description: string;
  startTime: string; // ISO or HH:mm
  endTime: string;   // ISO or HH:mm
  category: string;
  progressPercent?: number;
  isLive?: boolean;
}

export interface WatchHistoryItem {
  channelId: string;
  channelName: string;
  category: string;
  lastWatchedAt: number; // Date.now()
  watchedSeconds: number;
}

export interface PlaylistSource {
  id: string;
  name: string;
  url: string;
  channelsCount: number;
  lastUpdated: string;
  isActive: boolean;
}

export interface ParentalControlSettings {
  isPinEnabled: boolean;
  pinCode: string;
  blockAdultContent: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  isVip: boolean;
  tier: string;
  downloadsCount: number;
  role?: 'admin' | 'user';
}

export type ActiveNavView = 'all' | 'news' | 'sports' | 'kids' | 'movies' | 'series' | 'music' | 'education' | 'international' | 'general' | 'novelas' | 'fav' | 'recent' | 'prog' | 'admin' | 'settings';

export type ScreenTab = 'inicio' | 'tendencias' | 'canais' | 'shorts' | 'favoritos' | 'perfil' | 'busca' | 'player';

export type MediaType = 'filme' | 'serie' | 'jogo' | 'canal';

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  year: number | string;
  thumbnail: string;
  cover?: string;
  badge?: ContentBadge;
  isExclusive?: boolean;
  description: string;
  imdb?: number;
  seasons?: number;
  episodesCount?: number;
  isNewSeason?: boolean;
  category: string;
  subType?: 'tudo' | 'filmes' | 'series' | 'jogos';
  releaseDate?: string;
  streamUrl?: string;
  isLive?: boolean;
}

export interface LiveChannel {
  id: string;
  name: string;
  category: string;
  logo: string;
  streamUrl: string;
  status: 'Online' | 'Offline';
  isLive: boolean;
  currentProgram?: string;
  isFavorite?: boolean;
  country?: Country;
  language?: string;
  epgId?: string;
  source?: 'iptv-org' | 'official';
}

export interface ShortItem {
  id: string;
  channelName: string;
  channelAvatar: string;
  caption: string;
  videoUrl: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
}


