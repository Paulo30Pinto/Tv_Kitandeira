import React from 'react';
import { Channel, StreamType } from '../types';
import { Play, Globe, Radio, Signal } from 'lucide-react';

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
      {/* 1. Cover Image Area (40% height approx on mobile, fixed height visually) */}
      <div className={`h-36 w-full ${channel.logoColor} relative overflow-hidden`}>
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-black/20" />
        
        {/* Animated pattern for "Live" feel */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />

        {/* Channel Abbreviation/Logo Placeholder */}
        <div className="absolute bottom-2 left-4 z-10">
          <h2 className="text-4xl font-black text-white/20 tracking-tighter select-none transform translate-y-2 group-hover:translate-y-0 transition-transform">
            {channel.name.substring(0, 3).toUpperCase()}
          </h2>
        </div>

        {/* LIVE Badge: Absolute Top-Right */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm animate-pulse">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
          AO VIVO
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="p-4 flex-1 relative flex flex-col">
        
        {/* Header: Title & Country Pill */}
        <div className="flex flex-col items-start gap-2 mb-2 pr-12"> {/* pr-12 to avoid overlap with Play button if it were top */}
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-gray-800 text-gray-400 border border-gray-700/50 tracking-wider">
            {channel.country}
          </span>
          <h3 className="text-lg md:text-xl font-bold text-gray-100 leading-tight group-hover:text-cyan-400 transition-colors line-clamp-1">
            {channel.name}
          </h3>
        </div>

        {/* Description: Truncated to 1-2 lines */}
        <p className="text-gray-500 text-xs font-medium leading-relaxed line-clamp-2 mb-4 pr-4">
          {channel.description}
        </p>

        {/* Tags / Meta Icons */}
        <div className="mt-auto flex items-center gap-3 pt-3 border-t border-gray-800/50">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Globe size={12} className="text-cyan-600" />
            <span>{channel.category}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Signal size={12} className={channel.type === StreamType.HLS ? 'text-green-500' : 'text-orange-500'} />
            <span className="uppercase text-[10px]">{channel.type === StreamType.HLS ? 'HD' : 'WEB'}</span>
          </div>
        </div>

        {/* 3. Floating Play Button: Absolute Bottom-Right */}
        <div className="absolute bottom-4 right-4 z-20">
          <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-900/20 group-hover:bg-cyan-500 group-hover:scale-110 transition-all duration-300 ring-2 ring-[#161616]">
            <Play fill="white" className="text-white ml-1" size={20} />
          </div>
        </div>
      </div>
    </button>
  );
};