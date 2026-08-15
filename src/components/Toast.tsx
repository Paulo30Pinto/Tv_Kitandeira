import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#1e1e1e]/95 text-white px-5 py-3 rounded-full border border-red-600/40 shadow-2xl backdrop-blur-md text-xs sm:text-sm font-semibold tracking-wide animate-bounce">
      <CheckCircle2 size={18} className="text-[#E50914] shrink-0" />
      <span>{toastMessage}</span>
    </div>
  );
};
