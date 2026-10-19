import React from 'react';
import { Channel } from '../types';
import { Play, Heart } from 'lucide-react';

interface ChannelCardProps {
  channel: Channel;
  onClick: (channel: Channel) => void;
  isFavorite?: boolean;
  onFavorite?: (id: string) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onClick, isFavorite, onFavorite }) => {
  return (
    <div 
      onClick={() => onClick(channel)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(channel);
        }
      }}
      className="group relative bg-[#0e1322] hover:bg-[#13192c] border border-white/5 hover:border-cyan-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(0,181,255,0.2)] focus:outline-none focus:ring-2 focus:ring-[#00B5FF] flex flex-col select-none"
    >
      {/* Top Banner / Logo Area */}
      <div className={`relative aspect-[16/11] w-full overflow-hidden flex items-center justify-center p-4 sm:p-5 ${channel.logoColor || 'bg-gradient-to-br from-slate-800 to-slate-900'}`}>
        
        {/* Channel Logo Image */}
        {channel.logoImage ? (
          <img 
            src={channel.logoImage} 
            alt={channel.name} 
            className="max-h-[70%] max-w-[85%] object-contain relative z-10 transition-transform duration-500 group-hover:scale-105 drop-shadow-md"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center z-10">
            <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-wider uppercase opacity-90 drop-shadow">
              {channel.name}
            </span>
          </div>
        )}

        {/* Live Badge (Top Right Orange Pill like screenshot) */}
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 flex items-center gap-1 bg-[#ff5722] text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">
          <span className="w-1.5 h-1.5 bg-white rounded-full" />
          <span>AO VIVO</span>
        </div>

        {/* Big Watermark on Bottom Left (like TeIP, TP, TN, TZ, TG in screenshot) */}
        <div className="absolute bottom-1.5 left-2 sm:bottom-2 sm:left-3 z-20 pointer-events-none">
          <span className="text-xl sm:text-2xl font-black text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] font-sans tracking-tight">
            {channel.watermark || channel.name.substring(0, 2).toUpperCase()}
          </span>
        </div>

        {/* Action Buttons on Bottom Right (Heart & Play frosted circular buttons) */}
        <div className="absolute bottom-1.5 right-2 sm:bottom-2 sm:right-2.5 z-30 flex items-center gap-1.5">
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite?.(channel.id);
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-90"
            title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart size={13} className={isFavorite ? "fill-[#00B5FF] text-[#00B5FF]" : ""} />
          </button>

          {/* Play Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(channel);
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-[#00B5FF] hover:text-slate-950 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all active:scale-90"
            title="Reproduzir Canal"
          >
            <Play fill="currentColor" size={13} className="ml-0.5" />
          </button>
        </div>
      </div>

      {/* Info Section Below */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-center bg-[#0d1220]">
        <h3 className="text-xs sm:text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors truncate tracking-tight mb-0.5">
          {channel.name}
        </h3>
        <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
          {channel.category} • {channel.country}
        </div>
      </div>
    </div>
  );
};


