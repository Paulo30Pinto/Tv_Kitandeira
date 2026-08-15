import React, { useState, useEffect } from 'react';
import { HERO_SLIDES } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { Play, Info, Plus, Check } from 'lucide-react';

export const HeroCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { playMedia, isFavorite, toggleFavorite } = useApp();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentIndex];
  const favorited = isFavorite(slide.id);

  return (
    <div className="relative w-full flex flex-col mb-6">
      {/* Cover Image & Gradient Container */}
      <div className="relative w-full h-[280px] sm:h-[380px] md:h-[450px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-neutral-900">
        <img
          src={slide.cover || slide.thumbnail}
          alt={slide.title}
          className="w-full h-full object-cover transition-all duration-700 scale-105"
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d]/80 via-transparent to-transparent" />

        {/* Top Badges */}
        {slide.isExclusive && (
          <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <span className="text-[10px] sm:text-xs font-black uppercase text-white tracking-widest">
              SÓ NO ANGOFLIX
            </span>
          </div>
        )}
      </div>

      {/* Content Details Below Banner */}
      <div className="px-4 -mt-16 sm:-mt-24 z-10 flex flex-col items-center text-center">
        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
          {slide.title}
        </h1>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-neutral-300 my-2 font-medium">
          {slide.episodesCount && (
            <span>{slide.episodesCount} eps</span>
          )}

          {slide.isNewSeason && (
            <span className="bg-[#E50914] text-white font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-sm uppercase tracking-wider">
              Nova Temporada
            </span>
          )}

          {slide.seasons && (
            <span>{slide.seasons} Temp</span>
          )}

          {slide.imdb && (
            <span className="bg-[#0081A7] text-white text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-sm flex items-center gap-1">
              IMDB <span className="text-white">{slide.imdb}</span>
            </span>
          )}
        </div>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl line-clamp-2 mb-4">
          {slide.description}
        </p>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => playMedia(slide)}
            className="flex items-center gap-2 bg-[#E50914] hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-red-600/30 active:scale-95 transition-all"
          >
            <Play size={18} className="fill-white" />
            <span>Assistir Agora</span>
          </button>

          <button
            onClick={() => toggleFavorite(slide.id)}
            className="flex items-center gap-2 bg-neutral-800/90 hover:bg-neutral-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm border border-white/10 active:scale-95 transition-all"
          >
            {favorited ? <Check size={18} className="text-[#1DB954]" /> : <Plus size={18} />}
            <span>{favorited ? 'Na Minha Lista' : 'Minha Lista'}</span>
          </button>
        </div>

        {/* Pagination Dots Indicator */}
        <div className="flex items-center gap-2 mt-4">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'w-6 bg-[#E50914]' : 'w-1.5 bg-neutral-600'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
