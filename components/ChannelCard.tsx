import React from 'react';
import { Channel } from '../types';
import { Play } from 'lucide-react';

interface ChannelCardProps {
  channel: Channel;
  onClick: (channel: Channel) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onClick }) => {
  return (
    <button
      onClick={() => onClick(channel)}
      className="group relative flex flex-col w-full bg-[#161616] rounded-xl shadow-md overflow-hidden hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-cyan-500"
      aria-label={`Assistir ${channel.name}`}
    >
      {/* Thumbnail Area - Aspect Ratio 16:9 */}
      <div className={`aspect-video w-full ${channel.logoColor} relative overflow-hidden flex items-center justify-center`}>
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-transparent opacity-80" />
        
        {/* Pattern for texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />

        {/* Logo / Initials Centered & Prominent */}
        <div className="relative z-10 transform transition-transform duration-500 group-hover:scale-110">
          <h2 className="text-3xl md:text-4xl font-black text-white/90 tracking-tighter drop-shadow-lg select-none">
            {channel.name.substring(0, 2).toUpperCase()}
          </h2>
        </div>

        {/* LIVE Badge: Top Right */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-600/90 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm z-20">
          <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
          AO VIVO
        </div>

        {/* Play Overlay (Visible on Hover/Focus) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 z-20">
           <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
             <Play fill="white" className="text-white ml-1" size={16} />
           </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 flex-1 flex flex-col justify-between w-full bg-[#1a1a1a]">
        <div>
          {/* Title */}
          <h3 className="text-sm font-bold text-gray-100 leading-tight group-hover:text-cyan-400 transition-colors line-clamp-1 mb-1">
            {channel.name}
          </h3>
          
          {/* Subtitle / Metadata */}
          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium uppercase tracking-wide">
            <span className="truncate max-w-[80px]">{channel.category}</span>
            <span className="w-0.5 h-2 bg-gray-700 rounded-full"></span>
            <span>{channel.country}</span>
          </div>
        </div>
      </div>
    </button>
  );
};