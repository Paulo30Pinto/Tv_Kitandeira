
import React, { useState, useEffect, useRef } from 'react';
import { CHANNELS } from './constants';
import { Channel, Category } from './types';
import { ChannelCard } from './components/ChannelCard';
import { VideoPlayer } from './components/VideoPlayer';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
// Fix: Added missing 'Play' import from lucide-react
import { ArrowLeft, Search, X, Tv, WifiOff, Download, Sparkles, TrendingUp, Play } from 'lucide-react';

const App: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
  }, []);

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
    return matchesCategory && matchesSearch;
  });

  const featuredChannel = CHANNELS[0];

  return (
    <div className="flex h-screen w-screen bg-[#050505] text-white overflow-hidden font-jakarta select-none">
      
      {/* Dynamic Background Orbs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Offline Alert */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600/90 backdrop-blur-md text-[10px] font-black py-2 px-4 flex items-center justify-center gap-2">
          <WifiOff size={14} /> SEM CONEXÃO COM A INTERNET
        </div>
      )}

      {/* Fullscreen Player Overlay */}
      {activeChannel && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col animate-in fade-in zoom-in-95 duration-500">
          <div className="absolute top-0 left-0 right-0 p-6 pt-safe flex justify-between items-center z-10">
            <button 
              onClick={() => setActiveChannel(null)}
              className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-2xl rounded-full border border-white/20 active:scale-90 transition-all"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-1">Streaming HD</span>
              <h2 className="text-xl font-bold font-syne">{activeChannel.name}</h2>
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

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile Futuristic Header */}
        <div className="md:hidden pt-safe pb-4 px-6 bg-gradient-to-b from-[#050505] to-transparent z-40">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center shadow-xl">
                <Tv size={20} className="text-cyan-400" />
              </div>
              <h1 className="text-2xl font-black font-syne tracking-tighter italic">KITANDEIRA</h1>
            </div>
            {deferredPrompt && (
              <button onClick={handleInstallClick} className="w-10 h-10 bg-cyan-500 text-black rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20 active:scale-90 transition-transform">
                <Download size={18} strokeWidth={3} />
              </button>
            )}
          </div>

          <div className="relative mt-2">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search size={18} className="text-white/20" />
            </div>
            <input
              type="text"
              placeholder="Encontre seu canal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-xl placeholder-white/20 transition-all"
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 pb-32">
          
          {/* Hero Highlight Mobile */}
          {!searchTerm && activeCategory === 'All' && (
             <div className="md:hidden mb-8 mt-2">
                <button 
                  onClick={() => setActiveChannel(featuredChannel)}
                  className="w-full aspect-[16/10] rounded-[2.5rem] bg-gradient-to-br from-cyan-600/20 to-blue-900/40 border border-white/10 relative overflow-hidden group active:scale-95 transition-transform"
                >
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20" />
                   <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-[10px] font-black flex items-center gap-2">
                      <Sparkles size={12} className="text-yellow-400" /> RECOMENDADO
                   </div>
                   <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={14} className="text-green-400" />
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Em alta agora</span>
                      </div>
                      <h2 className="text-3xl font-black font-syne mb-1 tracking-tight">{featuredChannel.name}</h2>
                      <p className="text-xs text-white/40 line-clamp-1">{featuredChannel.description}</p>
                   </div>
                   <div className="absolute bottom-6 right-6 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-2xl">
                      <Play fill="currentColor" size={20} className="ml-1" />
                   </div>
                </button>
             </div>
          )}

          <div className="max-w-7xl mx-auto">
            <div className="hidden md:block py-12">
               <h1 className="text-6xl font-black font-syne tracking-tighter mb-4 italic uppercase">Explorar Canais</h1>
               <p className="text-white/40 font-medium text-lg">Sua janela para o mundo, em tempo real.</p>
            </div>

            <div className="flex items-center gap-3 mb-6">
               <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse glow-accent" />
               <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/50">
                  {filteredChannels.length} Estações Ativas
               </h2>
            </div>

            {filteredChannels.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
                {filteredChannels.map(channel => (
                  <ChannelCard key={channel.id} channel={channel} onClick={setActiveChannel} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 border-dashed">
                  <X size={40} className="text-white/10" />
                </div>
                <h3 className="text-xl font-bold text-white/40">Nada encontrado</h3>
                <p className="text-sm text-white/20 mt-1">Tente pesquisar por país ou categoria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Futuristic Bottom Nav */}
        <BottomNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onSearchFocus={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        />
      </main>
    </div>
  );
};

export default App;
