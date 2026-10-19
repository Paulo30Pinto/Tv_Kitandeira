import React, { useState, useEffect, useRef } from 'react';
import { ALL_CHANNELS, LUSOFONIA_COUNT } from './src/data/channels';
import { EpgProvider } from './src/epg/EpgContext';
import { Channel, Category, ActiveNavView, ParentalControlSettings, PlaylistSource, WatchHistoryItem } from './types';
import { ChannelCard } from './components/ChannelCard';
import { VideoPlayer } from './components/VideoPlayer';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { EPGGuide } from './components/EPGGuide';
import { AdminPanel } from './components/AdminPanel';
import { SettingsModal } from './components/SettingsModal';
import { CategoriesModal } from './components/CategoriesModal';
import { AccountModal } from './components/AccountModal';
import { useTVNavigation } from './hooks/useTVNavigation';
import { Search, X, WifiOff, Download, Radio, Sparkles, Check, Heart, Layers, Globe2 } from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'All', label: 'Todos' },
  { id: 'lusofonia', label: 'Lusófonos' },
  { id: Category.NEWS, label: 'Notícias' },
  { id: Category.KIDS, label: 'Infantil' },
  { id: Category.SPORTS, label: 'Desporto' },
  { id: Category.EDUCATION, label: 'Educação' },
  { id: Category.INTERNATIONAL, label: 'Internacional' },
  { id: Category.MUSIC, label: 'Música' },
  { id: Category.GENERAL, label: 'Variedades' },
  { id: Category.MOVIES, label: 'Filmes' },
  { id: Category.NOVELAS, label: 'Novelas' },
  { id: 'fav', label: 'Favoritos' },
];

const App: React.FC = () => {
  // Main Data States
  const [channels, setChannels] = useState<Channel[]>(ALL_CHANNELS);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeView, setActiveView] = useState<ActiveNavView | Category | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  
  // Modals & UI States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Parental Control State
  const [parentalSettings, setParentalSettings] = useState<ParentalControlSettings>({
    isPinEnabled: false,
    pinCode: '0000',
    blockAdultContent: false,
  });

  // Load Saved Favorites & Parental Settings
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    const savedFavs = localStorage.getItem('teip_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const savedParental = localStorage.getItem('teip_parental');
    if (savedParental) setParentalSettings(JSON.parse(savedParental));
  }, []);

  // Show Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle Favorite
  const toggleFavorite = (id: string) => {
    const isFav = favorites.includes(id);
    const newFavs = isFav 
      ? favorites.filter(fav => fav !== id)
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('teip_favorites', JSON.stringify(newFavs));
    showToast(isFav ? 'Removido dos Favoritos' : 'Adicionado aos Favoritos');
  };

  // Handle Select Channel & Add to Watch History
  const handleSelectChannel = (channel: Channel) => {
    setActiveChannel(channel);

    // Add to history
    const newHistory = [
      {
        channelId: channel.id,
        channelName: channel.name,
        category: channel.category,
        lastWatchedAt: Date.now(),
        watchedSeconds: 0,
      },
      ...watchHistory.filter((item) => item.channelId !== channel.id),
    ].slice(0, 20);

    setWatchHistory(newHistory);
  };

  // TV Remote Navigation Hook
  const { channelNotice } = useTVNavigation({
    channels,
    onSelectChannel: handleSelectChannel,
    onClosePlayer: () => setActiveChannel(null),
    isPlayerOpen: !!activeChannel,
  });

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  // Admin Callbacks
  const handleAddChannel = (newChannel: Channel) => {
    setChannels([newChannel, ...channels]);
    showToast(`Canal ${newChannel.name} adicionado com sucesso!`);
  };

  const handleDeleteChannel = (id: string) => {
    setChannels(channels.filter((c) => c.id !== id));
    showToast('Canal removido do sistema.');
  };

  const handleAddPlaylist = (playlist: PlaylistSource) => {
    showToast(`Lista ${playlist.name} sincronizada!`);
  };

  // Channel Category Counts
  const categoryCounts: Record<string, number> = {
    All: channels.length,
    fav: favorites.length,
    lusofonia: LUSOFONIA_COUNT,
  };
  channels.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  // Filter Channels
  const filteredChannels = channels.filter((channel) => {
    const matchesSearch =
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (channel.watermark && channel.watermark.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeView === 'lusofonia') return channel.source === 'iptv-org';
    if (activeView === 'fav') return favorites.includes(channel.id);
    if (activeView === 'recent') return watchHistory.some((item) => item.channelId === channel.id);
    if (activeView === 'All' || activeView === 'canais') return true;

    return channel.category === activeView;
  });

  // Active Section Title Label
  const getSectionTitle = () => {
    if (activeView === 'fav') return 'CANAIS FAVORITOS';
    if (activeView === 'lusofonia') return 'CANAIS DA LUSOFONIA';
    if (activeView === 'recent') return 'VISTOS RECENTEMENTE';
    if (activeView === 'All' || activeView === 'canais') return 'TODOS OS CANAIS';
    return (activeView as string).toUpperCase();
  };

  return (
    <div className="flex h-screen w-screen bg-[#090B16] text-white overflow-hidden font-jakarta select-none">
      {/* Background Futuristic Ambience Glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-[#00B5FF]/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-[#00D2FF]/10 rounded-full blur-[160px]" />
      </div>

      {/* Offline Alert Bar */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[1000] bg-red-600 text-white text-[11px] font-bold py-1.5 px-4 flex items-center justify-center gap-2">
          <WifiOff size={14} /> MODO OFFLINE ATIVADO
        </div>
      )}

      {/* TV Direct Number Typing Toast Notice */}
      {channelNotice && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[3500] bg-[#00B5FF] text-slate-950 font-black text-lg px-6 py-2 rounded-2xl shadow-[0_0_30px_rgba(0,181,255,0.6)] animate-pulse">
          {channelNotice}
        </div>
      )}

      {/* Quick Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[3500] bg-[#121828] border border-cyan-500/50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check size={16} className="text-[#00B5FF]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Fullscreen Video Overlay - TV Digital Experience */}
      {activeChannel && (
        <VideoPlayer
          channel={activeChannel}
          channels={channels}
          onSelectChannel={handleSelectChannel}
          onClose={() => setActiveChannel(null)}
          isFavorite={favorites.includes(activeChannel.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* Fixed Left Sidebar (Desktop View) */}
      <Sidebar
        activeView={activeView}
        onSelectView={(view) => setActiveView(view as any)}
        onInstall={deferredPrompt ? handleInstallClick : undefined}
        onLoginClick={() => setIsAccountOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* Main App Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 bg-[#090B16]">
        {/* Top Header matching exact screenshot */}
        <header className="px-4 sm:px-6 pt-3 pb-2 flex flex-col gap-3 bg-[#090B16] shrink-0">
          {/* Top Brand & Live Badge Row */}
          <div className="flex items-center justify-between">
            {/* Left: TeIP Pill Logo & Titles */}
            <div 
              className="flex items-center gap-2.5 cursor-pointer" 
              onClick={() => {
                setActiveView('All');
                setSearchTerm('');
              }}
            >
              <div className="bg-white rounded-2xl px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center justify-center shadow-lg min-w-[56px] h-8 sm:h-9">
                <img 
                  src="https://teiptv.netlify.app/TEIP.png" 
                  alt="TeIP" 
                  className="h-5 sm:h-6 w-auto object-contain" 
                  onError={(e) => {
                    // Fallback to stylized SVG representation if external netlify asset fails
                    (e.target as HTMLElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent && !parent.querySelector('.teip-fallback')) {
                      const span = document.createElement('span');
                      span.className = 'teip-fallback font-black text-sm sm:text-base tracking-tighter bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent';
                      span.innerText = 'TeIP';
                      parent.appendChild(span);
                    }
                  }}
                />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-base sm:text-lg font-black text-white leading-tight tracking-tight">
                  TeIP
                </h1>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                  UNINDO TVS
                </span>
              </div>
            </div>

            {/* Right: Live Count Pill Badge */}
            <div className="bg-[#121828] border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
              <Radio size={13} className="text-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-300">
                {channels.length} ao vivo
              </span>
            </div>
          </div>

          {/* Search Box (Full Width matching screenshot) */}
          <div className="relative w-full">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar canais"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121828] border border-white/10 focus:border-[#00B5FF]/70 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition-colors shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Subheader: Section Title & Results Count */}
          {activeView !== 'prog' && activeView !== 'admin' && (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-black tracking-wider">
                <Sparkles size={13} className="text-slate-400" />
                <span>{getSectionTitle()}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {filteredChannels.length} resultados
              </span>
            </div>
          )}

          {/* Horizontal Category Scroll Tabs (matching screenshot) */}
          {activeView !== 'prog' && activeView !== 'admin' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
              {CATEGORY_TABS.map((tab) => {
                const isActive = (activeView === tab.id) || (activeView === 'canais' && tab.id === 'All');
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveView(tab.id as any);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                      isActive
                        ? 'bg-white text-slate-950 shadow-md font-black'
                        : 'bg-[#131929] text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </header>

        {/* Content Router Views */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-6 pb-24">
          {activeView === 'prog' ? (
            <EPGGuide channels={channels} onSelectChannel={handleSelectChannel} />
          ) : activeView === 'admin' ? (
            <AdminPanel
              channels={channels}
              onAddChannel={handleAddChannel}
              onDeleteChannel={handleDeleteChannel}
              onAddPlaylist={handleAddPlaylist}
            />
          ) : (
            <div className="py-2">
              {/* Channel Grid (Mobile 2-columns, desktop responsive) */}
              {filteredChannels.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {filteredChannels.map((channel) => (
                    <ChannelCard
                      key={channel.id}
                      channel={channel}
                      onClick={handleSelectChannel}
                      isFavorite={favorites.includes(channel.id)}
                      onFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-3 text-slate-400">
                    <X size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-white">Nenhum canal encontrado</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Tente selecionar outra categoria ou limpar o termo de pesquisa.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation Bar matching screenshot */}
        <BottomNav
          activeTab={
            activeView === 'fav'
              ? 'favoritos'
              : activeView === 'prog'
              ? 'guia'
              : 'canais'
          }
          onTabChange={(tabId) => {
            if (tabId === 'canais') {
              setActiveView('All');
            } else if (tabId === 'categorias') {
              setIsCategoriesOpen(true);
            } else if (tabId === 'guia') {
              setActiveView('prog');
            } else if (tabId === 'favoritos') {
              setActiveView('fav');
            } else if (tabId === 'entrar') {
              setIsAccountOpen(true);
            }
          }}
        />
      </main>

      {/* Categories Drawer / Modal */}
      <CategoriesModal
        isOpen={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
        selectedCategory={activeView as string}
        onSelectCategory={(cat) => {
          setActiveView(cat as any);
        }}
        channelCounts={categoryCounts}
      />

      {/* Account / Login & Parental Control Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        parentalSettings={parentalSettings}
        onUpdateParental={(newSettings) => {
          setParentalSettings(newSettings);
          localStorage.setItem('teip_parental', JSON.stringify(newSettings));
          showToast('Definições guardadas com sucesso.');
        }}
        onOpenAdmin={() => setActiveView('admin')}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        parentalSettings={parentalSettings}
        onUpdateParental={(newSettings) => {
          setParentalSettings(newSettings);
          localStorage.setItem('teip_parental', JSON.stringify(newSettings));
          showToast('Definições guardadas com sucesso.');
        }}
      />
    </div>
  );
};

export default App;
