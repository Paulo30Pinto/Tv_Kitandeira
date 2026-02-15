import React, { useState, useEffect, useCallback } from 'react';
import { Channel } from '../types';
import { Sparkles, TrendingUp, Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroCarouselProps {
  channels: Channel[];
  onChannelSelect: (channel: Channel) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ channels, onChannelSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === channels.length - 1 ? 0 : prev + 1));
  }, [channels.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? channels.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  return (
    <div 
      className="relative w-full group mb-12 mt-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-[3rem] border border-white/10 shadow-2xl">
        {channels.map((channel, index) => (
          <div
            key={channel.id}
            className={`absolute inset-0 transition-all duration-1000 ease-out flex items-end p-8 md:p-12 ${
              index === currentIndex 
                ? 'opacity-100 scale-100 translate-x-0' 
                : 'opacity-0 scale-110 translate-x-8 pointer-events-none'
            }`}
          >
            {/* Dynamic Gradient Background based on channel logoColor */}
            <div className={`absolute inset-0 ${channel.logoColor} opacity-40 mix-blend-overlay`} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent z-0" />
            
            {/* Content Overlay */}
            <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl animate-in slide-in-from-bottom-8 duration-700 delay-150">
                <div className="bg-white/10 backdrop-blur-2xl px-5 py-2 rounded-full border border-white/20 text-[11px] font-black flex items-center gap-2 shadow-xl w-fit mb-6">
                  <Sparkles size={14} className="text-yellow-400 animate-pulse" /> 
                  DESTAQUE DA SEMANA
                </div>
                
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp size={18} className="text-cyan-400" />
                  <span className="text-[12px] font-black text-cyan-400 uppercase tracking-[0.3em]">
                    Sintonizado por milhares
                  </span>
                </div>
                
                <h2 className="text-4xl md:text-7xl font-black font-syne mb-4 tracking-tight italic uppercase drop-shadow-2xl">
                  {channel.name}
                </h2>
                <p className="text-sm md:text-xl text-white/60 line-clamp-2 drop-shadow-lg font-medium leading-relaxed">
                  {channel.description}
                </p>
              </div>

              <button 
                onClick={() => onChannelSelect(channel)}
                className="group/play flex-shrink-0 w-24 h-24 md:w-32 md:h-32 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-110 active:scale-95 transition-all duration-500"
              >
                <Play fill="currentColor" size={40} className="ml-1 group-hover/play:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Navigation Controls */}
      <div className="absolute inset-y-0 left-4 md:left-8 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={prevSlide}
          className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-75"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
      <div className="absolute inset-y-0 right-4 md:right-8 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={nextSlide}
          className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-75"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {channels.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-500 rounded-full ${
              index === currentIndex 
                ? 'w-10 h-2 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]' 
                : 'w-2 h-2 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};