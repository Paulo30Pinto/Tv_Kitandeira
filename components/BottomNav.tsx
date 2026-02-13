import React from 'react';
import { Home, LayoutGrid, Heart, Search, Tv } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearchFocus: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onSearchFocus }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Feed' },
    { id: 'search', icon: Tv, label: 'Live' },
    { id: 'menu', icon: LayoutGrid, label: 'Categorias' },
    { id: 'fav', icon: Heart, label: 'Meus' },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] h-20 px-8 flex items-center justify-between shadow-2xl relative overflow-hidden">
        {/* Glow Layer */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-cyan-500/10 rounded-full blur-2xl" />

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-500 relative ${isActive ? 'text-cyan-400 -translate-y-1' : 'text-white/20'}`}
            >
              {isActive && (
                <div className="absolute -top-3 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_cyan]" />
              )}
              <Icon size={isActive ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[9px] font-black uppercase tracking-widest transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};