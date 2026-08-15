import React, { useState, useRef, useEffect } from 'react';
import { LIVE_CHANNELS } from '../data/mockData';
import { LiveChannel } from '../types';
import { useApp } from '../context/AppContext';
import Hls from 'hls.js';
import { Search, Heart, Maximize2, Radio, Play } from 'lucide-react';

export const ChannelsScreen: React.FC = () => {
  const { currentPlayingChannel, setCurrentPlayingChannel, playChannel, isFavorite, toggleFavorite } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('CANAIS DE ESPORTES');
  const [channelSearch, setChannelSearch] = useState<string>('');
  const [subTab, setSubTab] = useState<'Canais' | 'Favoritos'>('Canais');

  const videoRef = useRef<HTMLVideoElement>(null);

  const activeChannel = currentPlayingChannel || LIVE_CHANNELS[1];

  const channelCategories = [
    'Geral',
    'CANAIS DE ESPORTES',
    'GLOBO',
    'SBT',
    'TNT',
    'TeleCine',
    'Canais de filmes',
    'Notícias',
    'Canais 24h',
    '+18'
  ];

  // HLS Video Stream initialization
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeChannel?.streamUrl) return;

    if (Hls.isSupported() && activeChannel.streamUrl.endsWith('.m3u8')) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(activeChannel.streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = activeChannel.streamUrl;
      video.play().catch(() => {});
    }
  }, [activeChannel]);

  // Filter channels based on tab, category, and search query
  const filteredChannels = LIVE_CHANNELS.filter((ch) => {
    const matchesSearch = ch.name.toLowerCase().includes(channelSearch.toLowerCase());
    if (subTab === 'Favoritos') {
      return isFavorite(ch.id) && matchesSearch;
    }
    const matchesCategory = activeCategory === 'Geral' || ch.category === activeCategory;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full pb-24 animate-fadeIn">
      {/* Top Mini Live Video Preview Player */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-black border-b border-white/10 overflow-hidden group">
        <video
          ref={videoRef}
          controls
          playsInline
          muted
          autoPlay
          className="w-full h-full object-cover"
          poster={activeChannel.logo}
        />

        {/* Live Channel Info Overlay */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-ping" />
          <span className="text-xs font-black text-white">AO VIVO</span>
          <span className="text-xs text-neutral-300 font-semibold border-l border-white/20 pl-2">
            {activeChannel.name}
          </span>
        </div>

        {/* Expand Fullscreen Player Button */}
        <button
          onClick={() => playChannel(activeChannel)}
          className="absolute bottom-3 right-3 z-10 bg-[#E50914] hover:bg-red-700 text-white p-2.5 rounded-xl shadow-lg active:scale-90 transition-all flex items-center gap-1.5 text-xs font-bold"
        >
          <Maximize2 size={16} />
          <span className="hidden sm:inline">Expandir Player</span>
        </button>
      </div>

      {/* Sub-Tabs: Canais vs Favoritos */}
      <div className="px-4 py-3 flex items-center gap-4 bg-[#0d0d0d] border-b border-white/5">
        <button
          onClick={() => setSubTab('Canais')}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
            subTab === 'Canais' ? 'bg-[#E50914] text-white' : 'bg-neutral-900 text-neutral-400'
          }`}
        >
          Todos os Canais
        </button>

        <button
          onClick={() => setSubTab('Favoritos')}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            subTab === 'Favoritos' ? 'bg-[#E50914] text-white' : 'bg-neutral-900 text-neutral-400'
          }`}
        >
          <Heart size={14} className="fill-current" />
          Favoritos
        </button>
      </div>

      {/* Channel Search Input */}
      <div className="p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={channelSearch}
            onChange={(e) => setChannelSearch(e.target.value)}
            placeholder="Pesquisar canal pelo nome..."
            className="w-full bg-neutral-900 text-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#E50914]"
          />
        </div>
      </div>

      {/* Split Layout: Categories Left Sidebar + Channel List Right */}
      <div className="flex px-4 gap-3">
        {/* Left Vertical Categories Navigation */}
        {subTab === 'Canais' && (
          <div className="w-28 sm:w-44 shrink-0 flex flex-col gap-1.5 max-h-[500px] overflow-y-auto scrollbar-none border-r border-white/5 pr-2">
            {channelCategories.map((cat) => {
              const isSelected = activeCategory === cat;
              const isSports = cat.includes('ESPORTES');

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-left text-[11px] sm:text-xs font-bold px-3 py-2.5 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-[#E50914] text-white shadow-md'
                      : isSports
                      ? 'bg-red-950/40 text-red-400 border border-red-500/20'
                      : 'text-neutral-400 hover:text-white bg-neutral-900/60'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Right Channels List */}
        <div className="flex-1 flex flex-col gap-2 max-h-[500px] overflow-y-auto scrollbar-none pr-1">
          {filteredChannels.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs">
              Nenhum canal encontrado nesta categoria.
            </div>
          ) : (
            filteredChannels.map((channel) => {
              const isSelected = activeChannel.id === channel.id;
              const favorited = isFavorite(channel.id);

              return (
                <div
                  key={channel.id}
                  onClick={() => setCurrentPlayingChannel(channel)}
                  className={`group flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#E50914]/15 border-[#E50914] text-white'
                      : 'bg-neutral-900/80 border-white/5 hover:border-white/20 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Logo Card */}
                    <div className="w-12 h-12 rounded-xl bg-black border border-white/10 overflow-hidden shrink-0 flex items-center justify-center p-1">
                      <img src={channel.logo} alt={channel.name} className="w-full h-full object-contain" />
                    </div>

                    {/* Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-[#E50914] transition-colors">
                          {channel.name}
                        </h4>
                        <span className="bg-[#E50914] text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                          LIVE
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                        {channel.currentProgram || 'Transmissão em Alta Definição'}
                      </p>
                    </div>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(channel.id);
                      }}
                      className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
                    >
                      <Heart size={16} className={favorited ? 'fill-[#E50914] text-[#E50914]' : ''} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playChannel(channel);
                      }}
                      className="p-2 rounded-full bg-[#E50914] text-white hover:scale-105 transition-transform"
                    >
                      <Play size={14} className="fill-white" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
