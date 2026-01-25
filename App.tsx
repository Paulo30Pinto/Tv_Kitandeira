import React, { useState, useEffect } from 'react';
import { CHANNELS } from './constants';
import { Channel, Category } from './types';
import { ChannelCard } from './components/ChannelCard';
import { VideoPlayer } from './components/VideoPlayer';
import { Sidebar } from './components/Sidebar';
import { ArrowLeft, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter channels
  const filteredChannels = activeCategory === 'All' 
    ? CHANNELS 
    : CHANNELS.filter(c => c.category === activeCategory);

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

  const handleMobileSelect = (cat: Category | 'All') => {
    setActiveCategory(cat);
    setIsMobileMenuOpen(false);
  };

  const getMobileMenuClass = (cat: Category | 'All') => 
    `block w-full text-left p-3 rounded ${activeCategory === cat ? 'bg-blue-900 text-blue-200' : 'text-gray-300'}`;

  return (
    <div className="flex h-screen w-screen bg-[#0f0f0f] text-white overflow-hidden">
      
      {/* Player Overlay - Shows when channel is active */}
      {activeChannel && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
          {/* Top Bar inside Player */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center pointer-events-none">
            <button 
              onClick={() => setActiveChannel(null)}
              className="pointer-events-auto flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full transition-all text-sm font-medium border border-white/10"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
            <div className="text-right">
              <h2 className="text-lg font-bold drop-shadow-md">{activeChannel.name}</h2>
              <span className="text-xs text-gray-300 font-medium bg-red-600/80 px-2 py-0.5 rounded ml-2">AO VIVO</span>
            </div>
          </div>
          
          <div className="flex-grow w-full h-full">
            <VideoPlayer channel={activeChannel} />
          </div>
        </div>
      )}

      {/* Main UI */}
      <Sidebar activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
          <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">LusoTV</span>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-gray-800 text-gray-200"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-gray-900 z-40 border-b border-gray-800 shadow-xl p-4 space-y-2 overflow-y-auto max-h-[80vh]">
            <button onClick={() => handleMobileSelect('All')} className={getMobileMenuClass('All')}>Todos</button>
            <button onClick={() => handleMobileSelect(Category.NEWS)} className={getMobileMenuClass(Category.NEWS)}>Notícias</button>
            <button onClick={() => handleMobileSelect(Category.SPORTS)} className={getMobileMenuClass(Category.SPORTS)}>Desporto</button>
            <button onClick={() => handleMobileSelect(Category.EDUCATION)} className={getMobileMenuClass(Category.EDUCATION)}>Educação & Gov</button>
            <button onClick={() => handleMobileSelect(Category.INTERNATIONAL)} className={getMobileMenuClass(Category.INTERNATIONAL)}>Internacional</button>
            <button onClick={() => handleMobileSelect(Category.MUSIC)} className={getMobileMenuClass(Category.MUSIC)}>Música</button>
            <button onClick={() => handleMobileSelect(Category.GENERAL)} className={getMobileMenuClass(Category.GENERAL)}>Variedades</button>
            <button onClick={() => handleMobileSelect(Category.PUBLIC)} className={getMobileMenuClass(Category.PUBLIC)}>Públicos</button>
          </div>
        )}

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {activeCategory === 'All' ? 'Canais em Destaque' : activeCategory}
              </h2>
              <p className="text-gray-400 text-sm">Selecione um canal para iniciar a transmissão</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {filteredChannels.map(channel => (
                <ChannelCard 
                  key={channel.id} 
                  channel={channel} 
                  onClick={setActiveChannel} 
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;