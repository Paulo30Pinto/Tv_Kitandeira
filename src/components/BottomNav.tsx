import React from 'react';
import { useApp } from '../context/AppContext';
import { ScreenTab } from '../types';
import { Home, Flame, Tv, PlayCircle, Bookmark, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems: { id: ScreenTab; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'tendencias', label: 'Tendências', icon: Flame },
    { id: 'canais', label: 'Canais', icon: Tv },
    { id: 'shorts', label: 'Shorts', icon: PlayCircle },
    { id: 'favoritos', label: 'Favoritos', icon: Bookmark },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  // Hide bottom nav in video player screen for clean fullscreen viewing
  if (activeTab === 'player') return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#0d0d0d]/95 backdrop-blur-lg border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 active:scale-90 ${
              isActive ? 'text-[#E50914]' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <div className={`p-1 rounded-full ${isActive ? 'bg-[#E50914]/10' : ''}`}>
              <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
            </div>
            <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${isActive ? 'font-bold text-[#E50914]' : 'text-neutral-400'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
