import React from 'react';
import { 
  Tv, Globe2, Film, Trophy, Music, GraduationCap, 
  Globe, Smile, Heart, LayoutGrid, Calendar, LogIn,
  ShieldCheck, Settings, History
} from 'lucide-react';
import { Category, ActiveNavView } from '../types';

interface SidebarProps {
  activeView: ActiveNavView | Category | 'All';
  onSelectView: (view: ActiveNavView | Category | 'All') => void;
  onInstall?: () => void;
  onLoginClick?: () => void;
  onSettingsClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onSelectView, 
  onLoginClick,
  onSettingsClick 
}) => {
  const menuItems = [
    { id: 'All', label: 'Todos os Canais', icon: Tv },
    { id: Category.NEWS, label: 'Notícias', icon: Globe2 },
    { id: Category.KIDS, label: 'Infantil', icon: Smile },
    { id: Category.SPORTS, label: 'Desporto', icon: Trophy },
    { id: Category.EDUCATION, label: 'Educação & Gov', icon: GraduationCap },
    { id: Category.INTERNATIONAL, label: 'Internacional', icon: Globe },
    { id: Category.MUSIC, label: 'Música', icon: Music },
    { id: Category.GENERAL, label: 'Variedades', icon: LayoutGrid },
    { id: Category.MOVIES, label: 'Filme', icon: Film },
    { id: Category.NOVELAS, label: 'Novelas', icon: Tv },
    { id: 'fav', label: 'Favoritos', icon: Heart },
    { id: 'recent', label: 'Recentes', icon: History },
    { id: 'prog', label: 'Programação (EPG)', icon: Calendar },
    { id: 'admin', label: 'Painel Admin', icon: ShieldCheck },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[260px] bg-[#090d16] border-r border-white/10 h-full px-4 py-6 select-none shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3.5 px-3 mb-8 cursor-pointer group" onClick={() => onSelectView('All')}>
        <div className="w-12 h-8 bg-white rounded-full flex items-center justify-center shadow-lg p-1 group-hover:scale-105 transition-transform">
          <img src="https://teiptv.netlify.app/TEIP.png" alt="TeIP" className="h-6 w-auto object-contain" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
            TeIP
          </h1>
          <span className="text-[9px] font-semibold text-cyan-400 tracking-[0.25em] uppercase">
            UNINDO TVS
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id as any)}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium
                ${isActive 
                  ? 'bg-[#00a8e8] text-slate-950 font-bold shadow-[0_0_20px_rgba(0,168,232,0.35)] scale-[1.01]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <Icon size={18} className={isActive ? 'text-slate-950' : 'text-gray-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Item */}
      <div className="pt-4 border-t border-white/5 mt-auto px-2 space-y-2">
        <button 
          onClick={onSettingsClick}
          className="w-full flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-xl transition-colors text-sm font-semibold"
        >
          <Settings size={18} />
          <span>Definições</span>
        </button>

        <button 
          onClick={onLoginClick}
          className="w-full flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-xl transition-colors text-sm font-semibold"
        >
          <LogIn size={18} className="rotate-180" />
          <span>Entrar / Perfil</span>
        </button>

        <p className="text-[10px] text-gray-500 font-normal leading-tight pt-1">
          Navegue com o comando da TV ou setas do teclado.
        </p>
      </div>
    </aside>
  );
};


