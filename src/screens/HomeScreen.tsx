import React from 'react';
import { useApp } from '../context/AppContext';
import { HeroCarousel } from '../components/HeroCarousel';
import { ContentCard } from '../components/ContentCard';
import { AppLauncherRow } from '../components/AppLauncherRow';
import { 
  NACIONAIS_ITEMS, 
  LANCAMENTOS_ITEMS, 
  ULTIMOS_ADICIONADOS, 
  KIDS_MOVIES,
  TRENDING_ITEMS,
  LIVE_CHANNELS
} from '../data/mockData';
import { ChevronRight } from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const { homeFilter, setHomeFilter, setActiveTab, playChannel } = useApp();

  const topTabs = ['Para você', 'Filmes', 'Séries', '🔴 Jogos ao Vivo'];

  return (
    <div className="w-full pb-24 animate-fadeIn">
      {/* Top Filter Tabs Bar */}
      <div className="px-4 py-2 flex items-center gap-4 overflow-x-auto scrollbar-none border-b border-white/5 sticky top-14 z-30 bg-[#0d0d0d]/90 backdrop-blur-md">
        {topTabs.map((tab) => {
          const isActive = homeFilter === tab;
          const isLiveTab = tab.includes('Jogos ao Vivo');

          return (
            <button
              key={tab}
              onClick={() => setHomeFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-black shadow-md'
                  : isLiveTab
                  ? 'text-red-500 hover:text-red-400 bg-red-500/10 border border-red-500/30'
                  : 'text-neutral-400 hover:text-white bg-white/5'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Main Home Content */}
      {homeFilter === '🔴 Jogos ao Vivo' ? (
        <div className="p-4 flex flex-col gap-4">
          <div className="bg-red-950/30 border border-red-600/30 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                Jogos e Transmissões ao Vivo
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Girabola, Champions League, Liga Europa e UFC em alta definição.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {LIVE_CHANNELS.map((channel) => (
              <div
                key={channel.id}
                onClick={() => playChannel(channel)}
                className="bg-neutral-900 border border-white/10 rounded-2xl p-3 flex items-center justify-between hover:border-[#E50914] cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <img src={channel.logo} alt={channel.name} className="w-12 h-12 rounded-xl object-cover bg-black" />
                  <div>
                    <h4 className="font-bold text-sm text-white">{channel.name}</h4>
                    <p className="text-xs text-neutral-400">{channel.currentProgram}</p>
                  </div>
                </div>
                <span className="bg-[#E50914] text-white text-[10px] font-black px-2 py-1 rounded-md uppercase">
                  AO VIVO
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Hero Banner Carousel */}
          <HeroCarousel />

          {/* Section: Nacionais */}
          <section className="my-6 px-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-bold text-white">Nacionais</h3>
              <button 
                onClick={() => setActiveTab('tendencias')}
                className="flex items-center text-xs text-neutral-400 hover:text-[#E50914] transition-colors"
              >
                <span>Mais</span>
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {NACIONAIS_ITEMS.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          {/* Section: Lançamentos */}
          <section className="my-6 px-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-bold text-white">Lançamentos</h3>
              <button 
                onClick={() => setActiveTab('tendencias')}
                className="flex items-center text-xs text-neutral-400 hover:text-[#E50914] transition-colors"
              >
                <span>Mais</span>
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {LANCAMENTOS_ITEMS.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          {/* Section: Últimos Adicionados */}
          <section className="my-6 px-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-bold text-white">Últimos Adicionados</h3>
              <button 
                onClick={() => setActiveTab('tendencias')}
                className="flex items-center text-xs text-neutral-400 hover:text-[#E50914] transition-colors"
              >
                <span>Mais</span>
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {ULTIMOS_ADICIONADOS.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          {/* Section: Filmes para Crianças */}
          <section className="my-6 px-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-bold text-white">Filmes para Crianças</h3>
              <button 
                onClick={() => setActiveTab('tendencias')}
                className="flex items-center text-xs text-neutral-400 hover:text-[#E50914] transition-colors"
              >
                <span>Mais</span>
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {KIDS_MOVIES.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          {/* Aplicativos Launcher Row */}
          <AppLauncherRow />
        </>
      )}
    </div>
  );
};
