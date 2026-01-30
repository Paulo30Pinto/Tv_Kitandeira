import React from 'react';
import { Home, Search, Grid, Heart } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearchFocus: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onSearchFocus }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around z-40 pb-safe">
      <button 
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'home' ? 'text-cyan-400' : 'text-gray-500'}`}
      >
        <Home size={20} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Início</span>
      </button>

      <button 
        onClick={() => {
          onTabChange('search');
          onSearchFocus();
        }}
        className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'search' ? 'text-cyan-400' : 'text-gray-500'}`}
      >
        <Search size={20} strokeWidth={activeTab === 'search' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Buscar</span>
      </button>

      <button 
        onClick={() => onTabChange('menu')}
        className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'menu' ? 'text-cyan-400' : 'text-gray-500'}`}
      >
        <Grid size={20} strokeWidth={activeTab === 'menu' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Canais</span>
      </button>

      <button 
        className="flex flex-col items-center gap-1 p-2 text-gray-600 cursor-not-allowed opacity-50"
        aria-disabled="true"
      >
        <Heart size={20} />
        <span className="text-[10px] font-medium">Favoritos</span>
      </button>
    </div>
  );
};