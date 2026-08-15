import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ScreenTab, MediaItem, LiveChannel, UserProfile } from '../types';
import { MOCK_USER, HERO_SLIDES, LIVE_CHANNELS } from '../data/mockData';

interface AppContextType {
  activeTab: ScreenTab;
  setActiveTab: (tab: ScreenTab) => void;
  previousTab: ScreenTab;
  
  // Active content filter for Home
  homeFilter: string; // 'Para você' | 'Filmes' | 'Séries' | 'Jogos ao Vivo'
  setHomeFilter: (filter: string) => void;

  // Selected media for Player screen
  currentPlayingMedia: MediaItem | null;
  setCurrentPlayingMedia: (media: MediaItem | null) => void;

  // Selected channel for Live TV screen & Player
  currentPlayingChannel: LiveChannel | null;
  setCurrentPlayingChannel: (channel: LiveChannel | null) => void;

  // Favorites
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  // Toast Notification
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // User
  user: UserProfile;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // D-Pad / TV Spatial Navigation focus state
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;

  // Helper navigation
  playMedia: (media: MediaItem) => void;
  playChannel: (channel: LiveChannel) => void;
  openSearch: () => void;
  goBack: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<ScreenTab>('inicio');
  const [previousTab, setPreviousTab] = useState<ScreenTab>('inicio');
  const [homeFilter, setHomeFilter] = useState<string>('Para você');

  const [currentPlayingMedia, setCurrentPlayingMedia] = useState<MediaItem | null>(HERO_SLIDES[0]);
  const [currentPlayingChannel, setCurrentPlayingChannel] = useState<LiveChannel | null>(LIVE_CHANNELS[0]);

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('angoflix_favorites');
      return saved ? JSON.parse(saved) : ['hero-1', 'nac-1', 'ch-1', 'ch-2'];
    } catch {
      return ['hero-1', 'nac-1', 'ch-1', 'ch-2'];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [user] = useState<UserProfile>(MOCK_USER);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [focusedId, setFocusedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('angoflix_favorites', JSON.stringify(favoriteIds));
    } catch (e) {
      console.error(e);
    }
  }, [favoriteIds]);

  const setActiveTab = (tab: ScreenTab) => {
    if (tab !== activeTab) {
      setPreviousTab(activeTab);
      setActiveTabState(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        showToast('Removido dos favoritos');
        return prev.filter((item) => item !== id);
      } else {
        showToast('Adicionado aos favoritos ❤️');
        return [...prev, id];
      }
    });
  };

  const isFavorite = (id: string) => favoriteIds.includes(id);

  const playMedia = (media: MediaItem) => {
    setCurrentPlayingMedia(media);
    setCurrentPlayingChannel(null);
    setActiveTab('player');
  };

  const playChannel = (channel: LiveChannel) => {
    setCurrentPlayingChannel(channel);
    setCurrentPlayingMedia(null);
    setActiveTab('player');
  };

  const openSearch = () => {
    setActiveTab('busca');
  };

  const goBack = () => {
    if (activeTab === 'player' || activeTab === 'busca') {
      setActiveTab(previousTab || 'inicio');
    } else {
      setActiveTab('inicio');
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        previousTab,
        homeFilter,
        setHomeFilter,
        currentPlayingMedia,
        setCurrentPlayingMedia,
        currentPlayingChannel,
        setCurrentPlayingChannel,
        favoriteIds,
        toggleFavorite,
        isFavorite,
        toastMessage,
        showToast,
        user,
        searchQuery,
        setSearchQuery,
        focusedId,
        setFocusedId,
        playMedia,
        playChannel,
        openSearch,
        goBack
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
