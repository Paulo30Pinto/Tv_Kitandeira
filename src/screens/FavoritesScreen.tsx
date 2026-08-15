import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  HERO_SLIDES, 
  NACIONAIS_ITEMS, 
  LANCAMENTOS_ITEMS, 
  ULTIMOS_ADICIONADOS, 
  TRENDING_ITEMS, 
  LIVE_CHANNELS 
} from '../data/mockData';
import { ContentCard } from '../components/ContentCard';
import { Bookmark, Play, Heart } from 'lucide-react';

export const FavoritesScreen: React.FC = () => {
  const { favoriteIds, playChannel, toggleFavorite } = useApp();

  const allMedia = [
    ...HERO_SLIDES,
    ...NACIONAIS_ITEMS,
    ...LANCAMENTOS_ITEMS,
    ...ULTIMOS_ADICIONADOS,
    ...TRENDING_ITEMS
  ];

  const favoriteMedia = allMedia.filter((item) => favoriteIds.includes(item.id));
  const favoriteChannels = LIVE_CHANNELS.filter((ch) => favoriteIds.includes(ch.id));

  const isEmpty = favoriteMedia.length === 0 && favoriteChannels.length === 0;

  return (
    <div className="w-full pb-24 px-4 pt-3 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <Bookmark className="text-[#E50914]" size={24} />
        <h1 className="text-xl sm:text-2xl font-black text-white">Meus Favoritos</h1>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-neutral-500 mb-4">
            <Bookmark size={32} />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Sua lista está vazia</h3>
          <p className="text-xs text-neutral-400 max-w-xs">
            Toque no ícone de coração em qualquer filme, série ou canal para salvá-lo aqui.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Favorite Live Channels */}
          {favoriteChannels.length > 0 && (
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white mb-3">Canais de TV Favoritos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {favoriteChannels.map((ch) => (
                  <div
                    key={ch.id}
                    onClick={() => playChannel(ch)}
                    className="bg-neutral-900 border border-white/10 rounded-2xl p-3 flex items-center justify-between hover:border-[#E50914] cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img src={ch.logo} alt={ch.name} className="w-12 h-12 rounded-xl object-cover bg-black" />
                      <div>
                        <h4 className="font-bold text-sm text-white">{ch.name}</h4>
                        <p className="text-xs text-neutral-400">{ch.currentProgram}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(ch.id);
                        }}
                        className="p-2 text-[#E50914]"
                      >
                        <Heart size={18} className="fill-[#E50914]" />
                      </button>
                      <button className="p-2 rounded-full bg-[#E50914] text-white">
                        <Play size={14} className="fill-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Movies & Series */}
          {favoriteMedia.length > 0 && (
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white mb-3">Filmes e Séries Guardados</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {favoriteMedia.map((item) => (
                  <div key={item.id} className="flex justify-center">
                    <ContentCard item={item} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
