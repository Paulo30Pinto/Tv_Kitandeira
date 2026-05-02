import React, { useState, useEffect, useRef } from 'react';
import { CHANNELS } from './constants';
import { Channel, Category } from './types';
import { ChannelCard } from './components/ChannelCard';
import { VideoPlayer } from './components/VideoPlayer';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { HeroCarousel } from './components/HeroCarousel';
import { ArrowLeft, Search, X, Tv, WifiOff, Download, Sparkles, TrendingUp, Play, Bell, ChevronUp, ChevronDown } from 'lucide-react';

const App: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // Controls visibility state
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);
  
  const featuredChannels = CHANNELS.slice(0, 5);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    const saved = localStorage.getItem('teip_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // Reset controls when channel changes
  useEffect(() => {
    if (activeChannel) {
      handleUserActivity();
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [activeChannel]);

  const toggleFavorite = (id: string) => {
    const newFavs = favorites.includes(id) 
      ? favorites.filter(fav => fav !== id)
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('teip_favorites', JSON.stringify(newFavs));
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const handleUserActivity = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 4000);
  };

  const filteredChannels = CHANNELS.filter(channel => {
    const matchesCategory = activeCategory === 'All' || channel.category === activeCategory;
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          channel.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'fav' ? favorites.includes(channel.id) : true;
    return matchesCategory && matchesSearch && matchesTab;
  });

  // Helper for TV Overlay
  const getChannelInfo = (channel: Channel) => {
    const index = CHANNELS.findIndex(c => c.id === channel.id);
    const number = (index + 1).toString().padStart(3, '0');
    const prev = CHANNELS[index - 1] || CHANNELS[CHANNELS.length - 1];
    const next = CHANNELS[index + 1] || CHANNELS[0];
    const prevNum = (CHANNELS.findIndex(c => c.id === prev.id) + 1).toString().padStart(3, '0');
    const nextNum = (CHANNELS.findIndex(c => c.id === next.id) + 1).toString().padStart(3, '0');
    return { number, prev, next, prevNum, nextNum };
  };

  const handleCategorySelect = (category: Category | 'All') => {
    setActiveCategory(category);
    setActiveTab('home'); // Redireciona para home para ver os resultados
  };

  return (
    <div className="flex h-screen w-screen bg-[#050505] text-white overflow-hidden font-jakarta select-none">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Connection Status */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[1000] glass border-none bg-red-600/80 text-[10px] font-black py-2 px-4 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-500">
          <WifiOff size={14} /> MODO OFFLINE ATIVADO
        </div>
      )}

      {/* Fullscreen Video Overlay - TV Style */}
      {activeChannel && (() => {
        const { number, prev, next, prevNum, nextNum } = getChannelInfo(activeChannel);
        
        return (
          <div 
            className={`fixed inset-0 z-[2000] bg-black animate-in fade-in zoom-in-95 duration-500 ${!controlsVisible ? 'cursor-none' : ''}`}
            onMouseMove={handleUserActivity}
            onClick={handleUserActivity}
            onTouchStart={handleUserActivity}
          >
            {/* Video Layer */}
            <div className="absolute inset-0 z-0">
              <VideoPlayer channel={activeChannel} />
            </div>

            {/* Top UI: Back Button */}
            <div 
              className={`absolute top-0 left-0 right-0 p-6 pt-safe z-50 flex justify-between transition-opacity duration-500 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveChannel(null);
                }}
                className="w-12 h-12 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full border border-white/10 active:scale-90 transition-all hover:bg-white/20 text-white group shadow-xl"
              >
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>

            {/* TV Info Control Panel */}
            <div 
              className={`absolute bottom-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out ${controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
            >
              {/* Gradient Backdrop */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent h-80 -z-10 bottom-0" />

              <div className="px-8 pb-10 md:px-12 md:pb-12 max-w-7xl mx-auto flex flex-col gap-6">
                
                {/* Main Program Bar */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                  
                  {/* Channel ID */}
                  <div className="flex items-center gap-4 md:gap-5 min-w-max">
                     <span className="text-5xl sm:text-6xl md:text-7xl font-black font-syne text-white/90 tabular-nums tracking-tighter drop-shadow-2xl">
                       {number}
                     </span>
                     <div className="h-12 md:h-16 w-px bg-white/20" />
                     <div className="flex flex-col gap-0.5 md:gap-1">
                        <span className="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-[0.2em]">{activeChannel.category}</span>
                        <h2 className="text-xl sm:text-2xl md:text-4xl font-black italic uppercase leading-none drop-shadow-lg">{activeChannel.name}</h2>
                     </div>
                  </div>

                  {/* Program Info & Progress */}
                  <div className="flex-1 w-full bg-white/5 backdrop-blur-xl border-t border-white/10 p-4 md:p-5 rounded-2xl flex flex-col gap-2 md:gap-3 shadow-2xl">
                     <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black tracking-widest text-cyan-400/80 mb-0.5">
                        <span>PROGRAMAÇÃO AO VIVO</span>
                        <div className="flex items-center gap-1.5 md:gap-2 text-red-500 bg-red-500/10 px-2 py-0.5 rounded">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                          DIRETO
                        </div>
                     </div>
                     
                     <div className="flex justify-between items-end gap-4">
                       <h3 className="text-lg md:text-xl font-bold text-white line-clamp-1 leading-tight">{activeChannel.description}</h3>
                       <span className="text-[10px] md:text-xs text-white/30 font-mono whitespace-nowrap hidden sm:block border border-white/10 px-2 py-0.5 rounded">HD 1080p</span>
                     </div>

                     <div className="flex items-center gap-3 md:gap-4 mt-1">
                        <span className="text-[10px] md:text-xs font-bold text-white/40">15:30</span>
                        <div className="flex-1 h-1 md:h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                           <div className="absolute inset-y-0 left-0 w-[65%] bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-white/40">18:00</span>
                     </div>
                  </div>
                </div>

                {/* Channel List / Navigation Hint */}
                <div className="hidden md:flex items-center gap-4 text-sm font-medium text-white/40 pl-2 animate-in slide-in-from-bottom-4 duration-1000 delay-100">
                   <div className="flex items-center gap-3 group/nav cursor-pointer hover:text-white transition-colors">
                      <ChevronUp size={16} />
                      <span className="tabular-nums opacity-50 font-mono">{prevNum}</span>
                      <span className="uppercase text-xs font-bold tracking-wider">{prev.name}</span>
                   </div>
                   <div className="w-1 h-1 bg-white/20 rounded-full" />
                   <div className="flex items-center gap-3 text-cyan-400 font-bold scale-105">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan]" />
                      <span className="tabular-nums font-mono">{number}</span>
                      <span className="uppercase text-xs tracking-wider">{activeChannel.name}</span>
                   </div>
                   <div className="w-1 h-1 bg-white/20 rounded-full" />
                   <div className="flex items-center gap-3 group/nav cursor-pointer hover:text-white transition-colors">
                      <span className="tabular-nums opacity-50 font-mono">{nextNum}</span>
                      <span className="uppercase text-xs font-bold tracking-wider">{next.name}</span>
                      <ChevronDown size={16} />
                   </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      <Sidebar 
        activeCategory={activeCategory} 
        onSelectCategory={handleCategorySelect} 
        onInstall={deferredPrompt ? handleInstallClick : undefined}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* Mobile Header: Futuristic Glass Pill */}
        <div className="md:hidden pt-safe pb-4 px-6 z-40">
          <div className="flex items-center justify-between py-5 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center shadow-xl glow-border overflow-hidden">
                <img src="https://teiptv.netlify.app/TEIP.png" alt="TEIP Logo" className="w-8 h-8 object-contain" />
              </div>
              <h1 className="text-3xl font-black font-syne tracking-tighter italic">TEIP</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-12 h-12 glass rounded-full flex items-center justify-center text-white/60">
                <Bell size={20} />
              </button>
              {deferredPrompt && (
                <button onClick={handleInstallClick} className="w-12 h-12 bg-cyan-500 text-black rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">
                  <Download size={22} strokeWidth={3} />
                </button>
              )}
            </div>
          </div>

          <div className="relative group mb-6">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search size={20} className="text-white/20 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Pesquisar canais ou programas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass rounded-3xl pl-16 pr-6 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 placeholder-white/20 transition-all shadow-inner"
            />
          </div>

          {/* Mobile Categories Scroll */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
            <button
              onClick={() => handleCategorySelect('All')}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                activeCategory === 'All' 
                  ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
                  : 'bg-white/5 text-white/40 border-white/5'
              }`}
            >
              TUDO
            </button>
            {Object.entries(Category).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleCategorySelect(value as Category)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                  activeCategory === value 
                    ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
                    : 'bg-white/5 text-white/40 border-white/5'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-4 sm:px-6 md:px-12 pb-32 md:pb-12">
          
          {/* Hero Section (Carousel) */}
          {!searchTerm && activeCategory === 'All' && activeTab === 'home' && (
             <div className="max-w-7xl mx-auto w-full overflow-hidden">
               <HeroCarousel 
                 channels={featuredChannels} 
                 onChannelSelect={setActiveChannel} 
               />
             </div>
          )}

          <div className="max-w-7xl mx-auto">
            <div className="hidden md:block py-6 lg:py-10">
               <h1 className="text-2xl md:text-3xl lg:text-4xl font-black font-syne tracking-tighter mb-2 italic uppercase">TEIP Stream</h1>
               <div className="flex items-center gap-4">
                 <p className="text-white/40 font-medium text-sm lg:text-base">Sintonize o futuro da televisão pública digital.</p>
                 <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
               </div>
            </div>

            <div className="flex items-center justify-between mb-4 md:mb-6 mt-2 md:mt-0">
               <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse glow-accent" />
                  <h2 className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/40">
                    {filteredChannels.length} Estações Ativas
                  </h2>
               </div>
               {activeTab === 'fav' && (
                 <span className="text-[9px] md:text-[10px] font-bold text-cyan-500 bg-cyan-500/10 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-cyan-500/20">MEUS FAVORITOS</span>
               )}
            </div>

            {filteredChannels.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-8 lg:gap-10">
                {filteredChannels.map(channel => (
                  <ChannelCard 
                    key={channel.id} 
                    channel={channel} 
                    onClick={setActiveChannel}
                    isFavorite={favorites.includes(channel.id)}
                    onFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 glass rounded-[2.5rem] flex items-center justify-center mb-6 border-dashed rotate-12">
                  <X size={40} className="text-white/5" />
                </div>
                <h3 className="text-xl font-bold text-white/40 font-syne">NADA NA ÓRBITA</h3>
                <p className="text-xs text-white/20 mt-2 max-w-xs">Tente redefinir seus filtros ou pesquise por outro termo.</p>
              </div>
            )}
          </div>
        </div>

        {/* Orbit Bottom Navigation */}
        <BottomNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onSearchFocus={() => {}} 
        />
      </main>
    </div>
  );
};

export default App;