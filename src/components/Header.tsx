import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Search, Download } from 'lucide-react';

export const Header: React.FC = () => {
  const { openSearch, showToast, user } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d0d0d]/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-2 cursor-pointer">
        <span className="text-xl sm:text-2xl font-black tracking-tighter text-[#E50914] drop-shadow-[0_2px_10px_rgba(229,9,20,0.5)]">
          ANGOFLIX
        </span>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <button
          onClick={() => showToast('Você não possui novas notificações')}
          className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          aria-label="Notificações"
        >
          <Bell size={20} />
        </button>

        {/* Search Icon */}
        <button
          onClick={openSearch}
          className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          aria-label="Buscar"
        >
          <Search size={20} />
        </button>

        {/* Download Icon */}
        <button
          onClick={() => showToast(`Downloads offline: ${user.downloadsCount} itens gravados`)}
          className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all relative"
          aria-label="Downloads"
        >
          <Download size={20} />
          {user.downloadsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#1DB954]" />
          )}
        </button>
      </div>
    </header>
  );
};
