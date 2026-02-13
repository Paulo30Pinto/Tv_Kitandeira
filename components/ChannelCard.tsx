import React from 'react';
import { Channel } from '../types';
import { Play, Info, Heart } from 'lucide-react';

interface ChannelCardProps {
  channel: Channel;
  onClick: (channel: Channel) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onClick }) => {
  return (
    <div className="perspective-1000 group">
      <button
        onClick={() => onClick(channel)}
        className="w-full relative flex flex-col bg-white/5 rounded-[2rem] overflow-hidden transition-all duration-500 transform group-active:scale-95 group-hover:-translate-y-2 border border-white/10 shadow-2xl"
      >
        {/* Thumbnail Area */}
        <div className={`aspect-[4/5] w-full ${channel.logoColor} relative overflow-hidden`}>
          {/* Layered Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
          
          {/* Static Texture */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none" 
               style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")'}} />

          {/* Logo Abbreviation */}
          <div className="absolute inset-0 flex items-center justify-center z-10 transition-transform duration-700 group-hover:scale-125">
            <span className="text-5xl font-black text-white/20 tracking-tighter select-none font-syne">
              {channel.name.substring(0, 2).toUpperCase()}
            </span>
          </div>

          {/* Badge & Meta */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 bg-red-500/90 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
          </div>

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
            <h3 className="text-lg font-extrabold text-white leading-tight mb-1 font-syne group-hover:text-cyan-400 transition-colors">
              {channel.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-cyan-500/80 font-black uppercase tracking-widest">{channel.category}</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span className="text-[10px] text-white/40 font-bold">{channel.country}</span>
            </div>
          </div>

          {/* Hover Actions Bar */}
          <div className="absolute inset-x-0 top-0 h-full flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-cyan-950/20 backdrop-blur-sm z-30">
             <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl transform scale-50 group-hover:scale-100 transition-transform duration-500 delay-75">
               <Play fill="currentColor" size={24} className="ml-1" />
             </div>
          </div>
        </div>

        {/* Quick Footer */}
        <div className="h-2 bg-gradient-to-r from-cyan-500/50 to-blue-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </button>
    </div>
  );
};