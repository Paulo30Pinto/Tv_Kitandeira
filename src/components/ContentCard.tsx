import React from 'react';
import { MediaItem } from '../types';
import { Badge, ExclusiveOverlay } from './Badge';
import { useApp } from '../context/AppContext';
import { Heart, Play } from 'lucide-react';

interface ContentCardProps {
  item: MediaItem;
  rankNumber?: number;
}

export const ContentCard: React.FC<ContentCardProps> = ({ item, rankNumber }) => {
  const { playMedia, isFavorite, toggleFavorite } = useApp();
  const favorited = isFavorite(item.id);

  return (
    <div className="group relative flex flex-col w-32 sm:w-40 md:w-48 shrink-0 transition-transform duration-300 hover:scale-105">
      {/* Poster Image Container */}
      <div 
        onClick={() => playMedia(item)}
        className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shadow-lg cursor-pointer group-focus:ring-2 group-focus:ring-[#E50914]"
      >
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
          {item.badge && <Badge type={item.badge} />}
        </div>

        {/* Exclusive Overlay */}
        {item.isExclusive && <ExclusiveOverlay />}

        {/* Play Icon Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#E50914] flex items-center justify-center text-white shadow-xl scale-90 group-hover:scale-100 transition-transform">
            <Play size={20} className="fill-white ml-0.5" />
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(item.id);
          }}
          aria-label="Adicionar aos favoritos"
          className="absolute top-2 left-2 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-colors"
        >
          <Heart size={16} className={favorited ? 'fill-[#E50914] text-[#E50914]' : 'text-white/80'} />
        </button>

        {/* Rank Number Badge if supplied (for Trending List) */}
        {rankNumber && (
          <div className="absolute -bottom-2 -left-2 z-20 text-5xl font-black text-[#E50914] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] italic stroke-white">
            {rankNumber}
          </div>
        )}
      </div>

      {/* Title Below */}
      <div className="mt-2 flex flex-col">
        <h4 className="text-xs sm:text-sm font-semibold text-white/90 truncate group-hover:text-[#E50914] transition-colors">
          {item.title}
        </h4>
        <div className="flex items-center gap-2 text-[10px] text-white/50 mt-0.5">
          <span>{item.year}</span>
          {item.imdb && <span className="text-amber-400 font-bold">★ {item.imdb}</span>}
        </div>
      </div>
    </div>
  );
};
