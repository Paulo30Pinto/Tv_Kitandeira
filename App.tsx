import React, { useState, useEffect, useRef } from 'react';
import { CHANNELS } from './constants';
import { Channel, Category } from './types';
import { ChannelCard } from './components/ChannelCard';
import { VideoPlayer } from './components/VideoPlayer';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { ArrowLeft, Search, X, Tv, WifiOff, Download } from 'lucide-react';

const App: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // PWA Install Prompt Logic
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const filteredChannels = CHANNELS.filter(channel => {
    const matchesCategory = activeCategory === 'All' || channel.category === activeCategory;
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          channel.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveChannel(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setActiveCategory('All');
      setSearchTerm('');
      setIsMobileMenuOpen(false);
    } else if (tab === 'menu') {
      setIsMobileMenuOpen(true);
    }
  };

  const handleSearchFocus = () => {
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const handleMobileCategorySelect = (cat: Category | 'All') => {
    setActiveCategory(cat);
    setIsMobileMenuOpen(false);
    setActiveTab('home');
  };

  return (
    <div className="flex h-screen w-screen bg-[#0f0f0f] text-white overflow-hidden font-sans select-none">
      
      {/* Offline Banner */}
      {!isOnline && (
        <div className="absolute top-0 left-0 right-0 z-[60] bg-red-600 text-white text-[10px] font-black py-1 px-4 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
          <WifiOff size={12} />
          VOCÊ ESTÁ OFFLINE. ALGUMAS TRANSMISSÕES PODEM NÃO CARREGAR.
        </div>
      )}

      {/* Player Overlay */}
      {activeChannel && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute top-0 left-0 right-0 p-4 pt-safe bg-gradient-to-b from-black/95 to-transparent z-10 flex justify-between items-center pointer-events-none">
            <button 
              onClick={() => setActiveChannel(null)}
              className="pointer-events-auto flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2.5 rounded-full transition-all text-sm font-bold border border-white/10 active:scale-95"
            >
              <ArrowLeft size={18} />
              Voltar
            </button>
            <div className="text-right">
              <h2 className="text-lg font-bold drop-shadow-md text-white">{activeChannel.name}</h2>
              <span className="text-[10px] text-white font-black bg-red-600 px-2 py-0.5 rounded ml-2 uppercase tracking-wider">AO VIVO</span>
            </div>
          </div>
          
          <div className="flex-grow w-full h-full">
            <VideoPlayer channel={activeChannel} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <Sidebar 
        activeCategory={activeCategory} 
        onSelectCategory={setActiveCategory} 
        onInstall={deferredPrompt ? handleInstallClick : undefined}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#0f0f0f]">
        
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-30 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-white/5 transition-all duration-300 pt-safe">
          <div className="flex flex-col px-4 py-3 gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Tv size={16} className="text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white italic">Kitandeira</span>
              </div>
              
              {deferredPrompt && (
                <button 
                  onClick={handleInstallClick}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black p-2 rounded-lg transition-all animate-pulse shadow-lg shadow-cyan-500/20"
                >
                  <Download size={16} strokeWidth={3} />
                </button>
              )}
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-500 group-focus-within:text-cyan-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Pesquisar canais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a1a1a] text-sm text-white rounded-xl pl-10 pr-4 py-3 border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all placeholder-gray-600 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Categories Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute inset-0 bg-[#0f0f0f] z-30 pt-safe pb-20 overflow-y-auto animate-in slide-in-from-bottom duration-300">
             <div className="px-4 py-6 flex justify-between items-center border-b border-white/5 mb-4">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Categorias</h2>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 bg-white/5 rounded-full text-gray-400 active:scale-90 transition-transform"
                >
                  <X size={24} />
                </button>
             </div>
             <div className="grid grid-cols-1 gap-2 px-4">
                <button 
                  onClick={() => handleMobileCategorySelect('All')} 
                  className={`p-5 rounded-2xl text-left border transition-all flex items-center justify-between ${activeCategory === 'All' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-[#161616] border-white/5 text-gray-400'}`}
                >
                  <span className="font-bold text-lg">Todos os Canais</span>
                  <Tv size={20} />
                </button>
                {Object.values(Category).map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => handleMobileCategorySelect(cat)} 
                    className={`p-5 rounded-2xl text-left border transition-all flex items-center justify-between ${activeCategory === cat ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-[#161616] border-white/5 text-gray-400'}`}
                  >
                    <span className="font-bold text-lg">{cat}</span>
                  </button>
                ))}
             </div>
          </div>
        )}

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto p-4 md:p-10 pb-28 md:pb-10">
            <div className="hidden md:flex items-center justify-between mb-10">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                  {activeCategory === 'All' ? 'Sintonize o Mundo' : activeCategory}
                </h2>
                <p className="text-gray-500 font-medium mt-1">Canais públicos e abertos em alta definição.</p>
              </div>
              <div className="relative w-80">
                 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                 <input 
                    type="text" 
                    placeholder="Buscar nome ou descrição..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#161616] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/5 transition-all shadow-xl"
                 />
              </div>
            </div>

            <div className="mb-4 text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
              {filteredChannels.length} canais disponíveis agora
            </div>

            {filteredChannels.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                {filteredChannels.map(channel => (
                  <ChannelCard 
                    key={channel.id} 
                    channel={channel} 
                    onClick={setActiveChannel} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <Search size={40} className="text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-400">Nenhum resultado</h3>
                <p className="text-sm text-gray-600 max-w-xs mt-2">Não encontramos canais para "{searchTerm}". Tente termos mais genéricos.</p>
              </div>
            )}
          </div>
        </div>

        <BottomNav 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          onSearchFocus={handleSearchFocus}
        />
      </main>
    </div>
  );
};

export default App;