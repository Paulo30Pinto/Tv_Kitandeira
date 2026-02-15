import React, { useState, useEffect, useRef } from 'react';
import { CHANNELS } from './constants';
import { Channel, Category } from './types';
import { ChannelCard } from './components/ChannelCard';
import { VideoPlayer } from './components/VideoPlayer';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { HeroCarousel } from './components/HeroCarousel';
import { ArrowLeft, Search, X, Tv, WifiOff, Download, Sparkles, TrendingUp, Play, Bell } from 'lucide-react';

const App: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const featuredChannels = CHANNELS.slice(0, 5);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    // Load favorites from local storage
    const saved = localStorage.getItem('teip_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

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

  const filteredChannels = CHANNELS.filter(channel => {
    const matchesCategory = activeCategory === 'All' || channel.category === activeCategory;
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          channel.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'fav' ? favorites.includes(channel.id) : true;
    return matchesCategory && matchesSearch && matchesTab;
  });

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

      {/* Fullscreen Video Overlay */}
      {activeChannel && (
        <div className="fixed inset-0 z-[2000] bg-black flex flex-col animate-in fade-in zoom-in-95 duration-500">
          <div className="absolute top-0 left-0 right-0 p-8 pt-safe flex justify-between items-center z-50">
            <button 
              onClick={() => setActiveChannel(null)}
              className="w-14 h-14 flex items-center justify-center glass rounded-full active:scale-90 transition-all"
            >
              <ArrowLeft size={28} />
            </button>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Transmitindo</span>
              </div>
              <h2 className="text-2xl font-black font-syne italic">{activeChannel.name}</h2>
            </div>
          </div>
          <div className="flex-grow">
            <VideoPlayer channel={activeChannel} />
          </div>
        </div>
      )}

      <Sidebar 
        activeCategory={activeCategory} 
        onSelectCategory={setActiveCategory} 
        onInstall={deferredPrompt ? handleInstallClick : undefined}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* Mobile Header: Futuristic Glass Pill */}
        <div className="md:hidden pt-safe pb-4 px-6 z-40">
          <div className="flex items-center justify-between py-5 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center shadow-xl glow-border overflow-hidden">
                <img src="/TEIP.png" alt="TEIP Logo" className="w-8 h-8 object-contain" />
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

          <div className="relative group">
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
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 pb-36">
          
          {/* Hero Section (Carousel) */}
          {!searchTerm && activeCategory === 'All' && activeTab === 'home' && (
             <HeroCarousel 
               channels={featuredChannels} 
               onChannelSelect={setActiveChannel} 
             />
          )}

          <div className="max-w-7xl mx-auto">
            <div className="hidden md:block py-16">
               <h1 className="text-7xl font-black font-syne tracking-tighter mb-4 italic uppercase">TEIP Stream</h1>
               <div className="flex items-center gap-4">
                 <p className="text-white/40 font-medium text-xl">Sintonize o futuro da televisão pública digital.</p>
                 <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
               </div>
            </div>

            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse glow-accent" />
                  <h2 className="text-[13px] font-black uppercase tracking-[0.4em] text-white/40">
                    {filteredChannels.length} Estações Ativas
                  </h2>
               </div>
               {activeTab === 'fav' && (
                 <span className="text-xs font-bold text-cyan-500 bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">MEUS FAVORITOS</span>
               )}
            </div>

            {filteredChannels.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-10">
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
              <div className="flex flex-col items-center justify-center py-48 text-center animate-in fade-in zoom-in duration-700">
                <div className="w-32 h-32 glass rounded-[3rem] flex items-center justify-center mb-8 border-dashed rotate-12">
                  <X size={56} className="text-white/5" />
                </div>
                <h3 className="text-2xl font-bold text-white/40 font-syne">NADA NA ÓRBITA</h3>
                <p className="text-sm text-white/20 mt-2 max-w-xs">Tente redefinir seus filtros ou pesquise por outro termo.</p>
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