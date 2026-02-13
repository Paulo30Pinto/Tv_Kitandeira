import React from 'react';
import { Tv, Globe2, Film, Info, Trophy, Music, GraduationCap, Globe, Smile, Download } from 'lucide-react';
import { Category } from '../types';

interface SidebarProps {
  activeCategory: Category | 'All';
  onSelectCategory: (cat: Category | 'All') => void;
  onInstall?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeCategory, onSelectCategory, onInstall }) => {
  const menuItems = [
    { id: 'All', label: 'Início', icon: Tv },
    { id: Category.NEWS, label: 'Notícias', icon: Globe2 },
    { id: Category.KIDS, label: 'Infantil', icon: Smile },
    { id: Category.SPORTS, label: 'Desporto', icon: Trophy },
    { id: Category.EDUCATION, label: 'Educação', icon: GraduationCap },
    { id: Category.INTERNATIONAL, label: 'Mundo', icon: Globe },
    { id: Category.MUSIC, label: 'Música', icon: Music },
    { id: Category.GENERAL, label: 'Variedades', icon: Film },
    { id: Category.PUBLIC, label: 'Públicos', icon: Info },
  ];

  return (
    <div className="hidden md:flex flex-col w-72 bg-[#0a0a0a] border-r border-white/5 h-full p-8">
      <div className="mb-12 flex items-center gap-4 px-2">
        <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden border border-white/10 rotate-3">
          <img src="logo_no_bg.png" alt="TEIP Logo" className="w-9 h-9 object-contain" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white italic leading-none">
            TEIP
          </h1>
          <span className="text-[9px] font-black text-cyan-500 tracking-[0.3em] uppercase">Digital Stream</span>
        </div>
      </div>

      <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-320px)] pr-2 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = activeCategory === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectCategory(item.id as Category | 'All')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group text-sm font-bold
                ${isActive 
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/10 scale-[1.02]' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-white'
                }`}
            >
              <Icon size={20} className={isActive ? 'text-black' : 'text-gray-600 group-hover:text-cyan-400'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-8">
        {onInstall && (
          <button 
            onClick={onInstall}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl mb-6 transition-all border border-white/5 active:scale-95"
          >
            <Download size={18} className="text-cyan-400" />
            INSTALAR APP
          </button>
        )}
        
        <div className="bg-[#111] rounded-3xl p-5 border border-white/5 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform">
             <img src="logo_no_bg.png" alt="" className="w-12 h-12 grayscale" />
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-widest relative z-10">
            Interface otimizada<br/>
            <span className="text-cyan-400 font-black">v3.0 Nebula</span>
          </p>
          <div className="mt-2 flex justify-center gap-1">
            <div className="w-1 h-1 bg-green-500 rounded-full" />
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
            <div className="w-1 h-1 bg-green-500 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
