import React from 'react';
import { Tv, LayoutGrid, Calendar, Heart, LogIn } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearchFocus?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'canais', icon: Tv, label: 'CANAIS' },
    { id: 'categorias', icon: LayoutGrid, label: 'CATEGORIAS' },
    { id: 'guia', icon: Calendar, label: 'GUIA' },
    { id: 'favoritos', icon: Heart, label: 'FAVORITOS' },
    { id: 'entrar', icon: LogIn, label: 'ENTRAR' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-[#090d19]/95 backdrop-blur-xl select-none">
      {/* Top Gradient Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#00B5FF] via-[#d946ef] to-[#00B5FF] opacity-80" />

      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id || (activeTab === 'All' && tab.id === 'canais') || (activeTab === 'home' && tab.id === 'canais');
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all active:scale-95 ${
                isActive ? 'text-[#00B5FF]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} className={isActive ? 'drop-shadow-[0_0_8px_rgba(0,181,255,0.6)]' : ''} />
              <span className={`text-[10px] tracking-wider uppercase ${isActive ? 'font-black' : 'font-bold'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

