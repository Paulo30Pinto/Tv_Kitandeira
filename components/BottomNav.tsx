import React from 'react';
import { Home, LayoutGrid, Heart, Search, Tv, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearchFocus: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onSearchFocus }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'menu', icon: LayoutGrid, label: 'Menu' },
    { id: 'fav', icon: Heart, label: 'Favoritos' },
    { id: 'profile', icon: User, label: 'Conta' },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100] pb-safe">
      <div className="glass rounded-[2.5rem] h-20 px-8 flex items-center justify-between shadow-[0_30px_60px_rgba(0,0,0,0.8)] border-white/10 relative overflow-hidden">
        
        {/* Navigation Indicator Background Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-20 bg-cyan-500/20 rounded-full blur-3xl opacity-50" />
        </div>

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-500 relative ${isActive ? 'text-cyan-400 -translate-y-1' : 'text-white/30'}`}
            >
              {isActive && (
                <>
                  <div className="absolute -top-3 w-10 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_20px_cyan]" />
                  <div className="absolute -top-10 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl animate-pulse" />
                </>
              )}
              <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-500" />
              <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50 h-0 overflow-hidden'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};