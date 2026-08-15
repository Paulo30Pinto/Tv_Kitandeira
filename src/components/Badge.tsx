import React from 'react';
import { ContentBadge } from '../types';

interface BadgeProps {
  type?: ContentBadge;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, className = '' }) => {
  if (!type) return null;

  switch (type) {
    case 'DUB':
      return (
        <span className={`bg-[#E50914] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md ${className}`}>
          DUB
        </span>
      );
    case 'LEG':
      return (
        <span className={`bg-neutral-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md ${className}`}>
          LEG
        </span>
      );
    case 'VIP':
      return (
        <span className={`bg-[#FFC107] text-black text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md ${className}`}>
          VIP
        </span>
      );
    case 'TRAILER':
      return (
        <span className={`bg-sky-500 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md ${className}`}>
          Trailer
        </span>
      );
    case 'LIVE':
      return (
        <span className={`bg-[#E50914] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          LIVE
        </span>
      );
    default:
      return null;
  }
};

export const ExclusiveOverlay: React.FC = () => {
  return (
    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-4 pb-1.5 px-1 text-center">
      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
        SÓ NO ANGOFLIX
      </span>
    </div>
  );
};
