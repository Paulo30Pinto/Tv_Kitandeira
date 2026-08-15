import React, { useState } from 'react';
import { TRENDING_ITEMS, NACIONAIS_ITEMS, LANCAMENTOS_ITEMS, LIVE_CHANNELS } from '../data/mockData';
import { ContentCard } from '../components/ContentCard';
import { useApp } from '../context/AppContext';
import { Flame } from 'lucide-react';

export const TrendingScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Em alta');
  const [activeType, setActiveType] = useState<string>('Tudo');
  const { playChannel } = useApp();

  const mainCategories = ['Em alta', 'Reality', 'Documentário', 'Lista crescente', '18+'];
  const typePills = ['Tudo', 'Filmes', 'Séries', '🟢 JOGOS AO VIVO'];

  // Combine content items
  const allMedia = [...TRENDING_ITEMS, ...NACIONAIS_ITEMS, ...LANCAMENTOS_ITEMS];

  // Filter based on selected category & type
  const filteredItems = allMedia.filter((item) => {
    const categoryMatches = activeCategory === 'Em alta' || item.category === activeCategory;
    
    if (activeType === 'Tudo') return categoryMatches;
    if (activeType === 'Filmes') return categoryMatches && item.type === 'filme';
    if (activeType === 'Séries') return categoryMatches && item.type === 'serie';
    return categoryMatches;
  });

  return (
    <div className="w-full pb-24 px-4 pt-3 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <Flame className="text-[#E50914]" size={24} />
        <h1 className="text-xl sm:text-2xl font-black text-white">Tendências em Angola</h1>
      </div>

      {/* Main Categories Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none border-b border-white/10">
        {mainCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
                : 'bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Type Sub-Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {typePills.map((pill) => {
          const isLivePill = pill.includes('JOGOS AO VIVO');
          const isActive = activeType === pill;

          return (
            <button
              key={pill}
              onClick={() => setActiveType(pill)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-black'
                  : isLivePill
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                  : 'bg-neutral-900 text-neutral-400 border border-white/5'
              }`}
            >
              {pill}
            </button>
          );
        })}
      </div>

      {/* Grid or Live List */}
      {activeType === '🟢 JOGOS AO VIVO' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LIVE_CHANNELS.map((ch) => (
            <div
              key={ch.id}
              onClick={() => playChannel(ch)}
              className="bg-neutral-900 border border-white/10 rounded-2xl p-3 flex items-center justify-between hover:border-[#E50914] cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <img src={ch.logo} alt={ch.name} className="w-12 h-12 rounded-xl object-cover bg-black" />
                <div>
                  <h4 className="font-bold text-sm text-white">{ch.name}</h4>
                  <p className="text-xs text-neutral-400">{ch.currentProgram}</p>
                </div>
              </div>
              <span className="bg-[#E50914] text-white text-[10px] font-black px-2 py-1 rounded-md uppercase">
                AO VIVO
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className="flex justify-center">
              <ContentCard item={item} rankNumber={index < 5 ? index + 1 : undefined} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
