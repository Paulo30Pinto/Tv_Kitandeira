import React from 'react';
import { APP_LAUNCHERS } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { ExternalLink } from 'lucide-react';

export const AppLauncherRow: React.FC = () => {
  const { showToast } = useApp();

  return (
    <div className="w-full my-6 px-4">
      <h3 className="text-sm sm:text-base font-bold text-white mb-3">Aplicativos</h3>
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {APP_LAUNCHERS.map((app) => (
          <button
            key={app.id}
            onClick={() => showToast(`Abrindo ${app.name} no Angoflix...`)}
            className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
          >
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center p-3 text-white font-black text-xs sm:text-sm shadow-md border border-white/10 group-hover:scale-105 group-focus:ring-2 group-focus:ring-[#E50914] transition-all"
              style={{ backgroundColor: app.bg }}
            >
              <span className="text-center line-clamp-2 uppercase tracking-tighter drop-shadow-md">
                {app.iconText}
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 group-hover:text-white transition-colors">
              {app.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
