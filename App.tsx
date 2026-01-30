import React, { useState, useEffect, useRef } from 'react';
import { CHANNELS } from './constants';
import { Channel, Category } from './types';
import { ChannelCard } from './components/ChannelCard';
import { VideoPlayer } from './components/VideoPlayer';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { ArrowLeft, Search, X, Tv } from 'lucide-react';

const App: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'search', 'menu'
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter channels logic
  const filteredChannels = CHANNELS.filter(channel => {
    const matchesCategory = activeCategory === 'All' || channel.category === activeCategory;
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          channel.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle ESC key to close player
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveChannel(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle mobile bottom nav actions
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
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleMobileCategorySelect = (cat: Category | 'All') => {
    setActiveCategory(cat);
    setIsMobileMenuOpen(false);
    setActiveTab('home');
  };

  return (
    <div className="flex h-screen w-screen bg-[#0f0f0f] text-white overflow-hidden font-sans">
      
      {/* Player Overlay - Fullscreen */}
      {activeChannel && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 to-transparent z-10 flex justify-between items-center pointer-events-none">
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
      <Sidebar activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#0f0f0f]">
        
        {/* Mobile Sticky Header */}
        <div className="md:hidden sticky top-0 z-30 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-gray-800 transition-all duration-300">
          <div className="flex flex-col px-4 py-3 gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Tv size={16} className="text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">LusoTV</span>
              </div>
              
              {/* Category Pill (Visual Indicator) */}
              {activeCategory !== 'All' && (
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-900/50">
                  {activeCategory}
                </span>
              )}
            </div>

            {/* Integrated Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Pesquisar canais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a1a1a] text-sm text-white rounded-xl pl-10 pr-4 py-2.5 border border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all placeholder-gray-600"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Categories Drawer (Replaces old menu) */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute inset-0 bg-[#0f0f0f] z-30 pt-4 pb-20 overflow-y-auto animate-in slide-in-from-bottom-5">
             <div className="px-4 mb-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Categorias</h2>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 bg-gray-800 rounded-full text-gray-400"
                >
                  <X size={20} />
                </button>
             </div>
             <div className="grid grid-cols-2 gap-3 px-4">
                <button onClick={() => handleMobileCategorySelect('All')} className="p-4 bg-[#1a1a1a] rounded-xl text-left border border-gray-800 active:border-cyan-500 active:bg-cyan-950/20">
                  <span className="font-bold text-gray-200">Todos</span>
                </button>
                {Object.values(Category).map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => handleMobileCategorySelect(cat)} 
                    className={`p-4 rounded-xl text-left border transition-all ${activeCategory === cat ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-400' : 'bg-[#1a1a1a] border-gray-800 text-gray-400'}`}
                  >
                    <span className="font-bold text-sm">{cat}</span>
                  </button>
                ))}
             </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
            
            {/* Desktop Header (Hidden on Mobile) */}
            <div className="hidden md:block mb-8">
               <h2 className="text-3xl font-bold text-white mb-2">
                {activeCategory === 'All' ? 'Canais em Destaque' : activeCategory}
              </h2>
              <div className="flex items-center justify-between">
                <p className="text-gray-400">Assista ao vivo aos melhores canais gratuitos.</p>
                {/* Desktop Search */}
                <div className="relative w-64">
                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                   <input 
                      type="text" 
                      placeholder="Buscar..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                   />
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-xs text-gray-500 font-medium uppercase tracking-widest md:hidden">
              {filteredChannels.length} Canais Encontrados
            </div>

            {filteredChannels.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredChannels.map(channel => (
                  <ChannelCard 
                    key={channel.id} 
                    channel={channel} 
                    onClick={setActiveChannel} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                <Tv size={48} className="mb-4 text-gray-600" />
                <h3 className="text-xl font-bold text-gray-400">Nenhum canal encontrado</h3>
                <p className="text-sm text-gray-600">Tente buscar por outro termo.</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
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