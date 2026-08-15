import React from 'react';
import { useApp } from '../context/AppContext';
import { TRENDING_ITEMS, HERO_SLIDES, NACIONAIS_ITEMS } from '../data/mockData';
import { Badge } from '../components/Badge';
import { ArrowLeft, Search as SearchIcon, X, Play } from 'lucide-react';

export const SearchScreen: React.FC = () => {
  const { searchQuery, setSearchQuery, goBack, playMedia } = useApp();

  const allItems = [...TRENDING_ITEMS, ...HERO_SLIDES, ...NACIONAIS_ITEMS];

  const searchResults = searchQuery.trim()
    ? allItems.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allItems;

  return (
    <div className="w-full min-h-screen bg-[#0d0d0d] pb-24 p-4 animate-fadeIn">
      {/* Search Header Bar */}
      <div className="flex items-center gap-3 mb-6 sticky top-0 bg-[#0d0d0d] pt-2 pb-3 z-30">
        <button
          onClick={goBack}
          className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
          aria-label="Voltar"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="flex-1 relative flex items-center">
          <SearchIcon size={18} className="absolute left-3 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar vídeos relacionados..."
            className="w-full bg-neutral-900 text-white pl-10 pr-10 py-2.5 rounded-xl border border-white/10 text-xs sm:text-sm focus:outline-none focus:border-[#E50914] transition-colors"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-neutral-400 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          onClick={() => setSearchQuery(searchQuery)}
          className="bg-[#E50914] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md active:scale-95 transition-all"
        >
          Pesquisar
        </button>
      </div>

      {/* Tendências Numbered Search List */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
          <span>Tendências de Busca</span>
        </h2>

        <div className="flex flex-col gap-3">
          {searchResults.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              onClick={() => playMedia(item)}
              className="group flex gap-3 p-2 rounded-2xl bg-neutral-900/60 border border-white/5 hover:border-[#E50914]/50 cursor-pointer transition-all"
            >
              {/* Thumbnail Container */}
              <div className="relative w-28 sm:w-36 aspect-[16/9] rounded-xl overflow-hidden bg-neutral-800 shrink-0">
                <img
                  src={item.cover || item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                
                {/* Number Badge */}
                <div className="absolute top-1 left-1 bg-black/80 text-[#E50914] font-black text-xs px-2 py-0.5 rounded-md">
                  #{idx + 1}
                </div>

                {/* Badge Top-Right */}
                {item.badge && (
                  <div className="absolute top-1 right-1">
                    <Badge type={item.badge} />
                  </div>
                )}

                {/* Play Hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play size={20} className="fill-white text-white" />
                </div>
              </div>

              {/* Info Container */}
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#E50914] transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {item.releaseDate ? item.releaseDate : `${item.year}`} · {item.type === 'filme' ? 'Filme' : 'Série'} · {item.badge || 'DUB'}
                  </p>
                </div>

                <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
