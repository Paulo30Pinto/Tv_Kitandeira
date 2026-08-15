import React from 'react';
import { Category } from '../types';
import { 
  X, LayoutGrid, Globe2, Smile, Trophy, GraduationCap, 
  Globe, Music, Film, Tv, Sparkles, Heart, Radio 
} from 'lucide-react';

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  channelCounts: Record<string, number>;
}

export const CategoriesModal: React.FC<CategoriesModalProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  channelCounts,
}) => {
  if (!isOpen) return null;

  const categories = [
    { id: 'All', label: 'Todos os Canais', icon: Radio, count: channelCounts['All'] || 0 },
    { id: Category.NEWS, label: 'Notícias', icon: Globe2, count: channelCounts[Category.NEWS] || 0 },
    { id: Category.KIDS, label: 'Infantil', icon: Smile, count: channelCounts[Category.KIDS] || 0 },
    { id: Category.SPORTS, label: 'Desporto', icon: Trophy, count: channelCounts[Category.SPORTS] || 0 },
    { id: Category.EDUCATION, label: 'Educação & Gov', icon: GraduationCap, count: channelCounts[Category.EDUCATION] || 0 },
    { id: Category.MUSIC, label: 'Música', icon: Music, count: channelCounts[Category.MUSIC] || 0 },
    { id: Category.GENERAL, label: 'Variedades', icon: LayoutGrid, count: channelCounts[Category.GENERAL] || 0 },
    { id: Category.NOVELAS, label: 'Novelas', icon: Tv, count: channelCounts[Category.NOVELAS] || 0 },
    { id: Category.MOVIES, label: 'Filmes', icon: Film, count: channelCounts[Category.MOVIES] || 0 },
    { id: Category.INTERNATIONAL, label: 'Internacional', icon: Globe, count: channelCounts[Category.INTERNATIONAL] || 0 },
    { id: 'fav', label: 'Favoritos', icon: Heart, count: channelCounts['fav'] || 0 },
  ];

  return (
    <div className="fixed inset-0 z-[4000] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-[#0f1424] border border-white/10 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00B5FF]/10 text-[#00B5FF] flex items-center justify-center">
              <LayoutGrid size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Categorias de Canais</h3>
              <p className="text-[11px] text-slate-400">Escolha uma categoria para filtrar a emissão</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Categories Grid List */}
        <div className="p-4 overflow-y-auto grid grid-cols-2 gap-2.5 custom-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onClose();
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 text-left active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#00B5FF] to-blue-600 border-[#00B5FF] text-slate-950 font-black shadow-[0_0_15px_rgba(0,181,255,0.4)]'
                    : 'bg-[#141a2c] hover:bg-[#1b233a] border-white/5 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon size={18} className={isSelected ? 'text-slate-950' : 'text-[#00B5FF]'} />
                  <span className={`text-xs truncate ${isSelected ? 'font-black' : 'font-bold'}`}>
                    {cat.label}
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-black/20 text-slate-950' : 'bg-white/5 text-slate-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
