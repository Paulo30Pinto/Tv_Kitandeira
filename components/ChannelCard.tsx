import React from 'react';
import { Channel, StreamType } from '../types';
import { Play, Globe, Radio } from 'lucide-react';

interface ChannelCardProps {
  channel: Channel;
  onClick: (channel: Channel) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onClick }) => {
  return (
    <button
      onClick={() => onClick(channel)}
      className="group relative flex flex-col bg-gray-900 rounded-2xl overflow-hidden hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:ring-4 hover:ring-blue-600 transition-all duration-300 text-left focus:outline-none focus:ring-4 focus:ring-blue-500 border border-gray-800"
    >
      {/* Thumbnail / Logo Holder */}
      <div className={`h-40 w-full ${channel.logoColor} flex items-center justify-center relative overflow-hidden`}>
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60 opacity-60" />
        
        {/* Glowing effect on hover */}
        <div className="absolute -inset-1 bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative z-10 flex flex-col items-center">
          <span className="text-4xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-tighter">
            {channel.name.split(' ')[0]}
          </span>
          {channel.name.split(' ').length > 1 && (
             <span className="text-sm font-bold text-white/80 -mt-1 uppercase">
               {channel.name.split(' ').slice(1).join(' ')}
             </span>
          )}
        </div>
        
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-blue-900/40 backdrop-blur-[2px]">
          <div className="bg-white text-blue-600 p-4 rounded-full shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
            <Play fill="currentColor" size={28} />
          </div>
        </div>

        {/* Live Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter animate-pulse shadow-lg">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
          AO VIVO
        </div>
      </div>

      {/* Details Section */}
      <div className="p-5 flex flex-col flex-grow w-full bg-gradient-to-b from-gray-900 to-black">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-black text-xl text-white group-hover:text-blue-400 transition-colors truncate">
            {channel.name}
          </h3>
          <span className="text-[10px] font-black bg-gray-800 text-gray-400 px-2 py-1 rounded-md uppercase tracking-widest border border-gray-700">
            {channel.country}
          </span>
        </div>
        
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-4 group-hover:text-gray-300 transition-colors">
          {channel.description}
        </p>

        <div className="mt-auto flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-800 pt-3">
          <div className="flex items-center gap-1.5">
            <Globe size={14} className="text-blue-500" />
            <span>{channel.category}</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <Radio size={14} className={channel.type === StreamType.HLS ? 'text-green-500' : 'text-red-500'} />
            <span>{channel.type === StreamType.HLS ? 'DIGITAL' : 'STREAM'}</span>
          </div>
        </div>
      </div>
    </button>
  );
};