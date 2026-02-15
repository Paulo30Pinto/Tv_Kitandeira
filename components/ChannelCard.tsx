import React from 'react';
import { Channel } from '../types';
import { Play, Info, Heart } from 'lucide-react';

interface ChannelCardProps {
  channel: Channel;
  onClick: (channel: Channel) => void;
  isFavorite?: boolean;
  onFavorite?: (id: string) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onClick, isFavorite, onFavorite }) => {
  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(channel);
    }
  };

  return (
    <div className="perspective-card group">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onClick(channel)}
        onKeyDown={handleCardKeyDown}
        className="inner-card w-full relative flex flex-col glass-card rounded-[2.5rem] overflow-hidden transition-all duration-500 group-active:scale-95 group-hover:-translate-y-2 border border-white/10"
      >
        {/* Layered Visual Background */}
        <div className={`aspect-[4/5] w-full ${channel.logoColor} relative overflow-hidden`}>
          {/* Subtle Parallax Background Abbreviation */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 transform -translate-z-10 group-hover:scale-110 transition-transform duration-700">
            <span className="text-7xl font-black font-syne tracking-tighter text-white select-none">
              {channel.name.substring(0, 2).toUpperCase()}
            </span>
          </div>

          {/* Gradients & Textures */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/30 z-10" />
          <div className="absolute inset-0 bg-cyan-400/5 mix-blend-overlay" />

          {/* Top Meta Info */}
          <div className="absolute top-5 left-5 z-20 flex flex-col gap-3">
            <div className="flex items-center gap-2 bg-red-600/90 backdrop-blur-xl text-white text-[9px] font-black px-3 py-1.5 rounded-full live-indicator shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              AO VIVO
            </div>
          </div>

          {/* Favorite Toggle (Quick Action) */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavorite?.(channel.id);
            }}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            className="absolute top-5 right-5 z-30 p-2.5 rounded-full glass hover:bg-white/10 transition-colors"
          >
            <Heart size={16} className={isFavorite ? "fill-cyan-400 text-cyan-400" : "text-white/40"} />
          </button>

          {/* Play Center Glow - Only on Hover/Touch */}
          <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
              <Play fill="white" size={28} className="ml-1 text-white" />
            </div>
          </div>

          {/* Information Section */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 drop-shadow-lg">
                {channel.category}
              </span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span className="text-[10px] font-bold text-white/40 uppercase">
                {channel.country}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white leading-tight font-syne group-hover:text-cyan-200 transition-colors">
              {channel.name}
            </h3>
          </div>
        </div>

        {/* Card Interactive Border (Bottom Glow) */}
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>
    </div>
  );
};
