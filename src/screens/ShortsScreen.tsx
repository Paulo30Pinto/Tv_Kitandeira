import React, { useState } from 'react';
import { SHORTS_DATA } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { Heart, MessageCircle, Share2, Lock, ArrowLeft, Volume2, VolumeX } from 'lucide-react';

export const ShortsScreen: React.FC = () => {
  const { goBack, showToast } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const currentShort = SHORTS_DATA[currentIndex];
  const isLiked = likedMap[currentShort.id];

  const handleLike = () => {
    setLikedMap((prev) => {
      const updated = !prev[currentShort.id];
      if (updated) showToast('Gostou do vídeo ❤️');
      return { ...prev, [currentShort.id]: updated };
    });
  };

  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center animate-fadeIn">
      {/* Short Video Canvas */}
      <div className="relative w-full h-full max-w-md bg-neutral-900 flex items-center justify-center overflow-hidden">
        <video
          src={currentShort.videoUrl}
          autoPlay
          loop
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
        />

        {/* Top Header Overlay */}
        <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between text-white drop-shadow-md">
          <button
            onClick={goBack}
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/70 active:scale-90 transition-all"
            aria-label="Voltar"
          >
            <ArrowLeft size={22} />
          </button>

          <span className="text-sm font-black tracking-widest text-[#E50914]">
            ANGOFLIX SHORTS
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMuted(!muted)}
              className="p-2.5 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/70 active:scale-90 transition-all"
              aria-label="Som"
            >
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button
              onClick={() => showToast('Tela bloqueada para reprodução contínua')}
              className="p-2.5 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/70 active:scale-90 transition-all"
              aria-label="Bloquear"
            >
              <Lock size={20} />
            </button>
          </div>
        </div>

        {/* Right Action Icons Column */}
        <div className="absolute right-4 bottom-24 z-20 flex flex-col items-center gap-5">
          {/* Like */}
          <button
            onClick={handleLike}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={`p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 group-active:scale-90 transition-all ${
              isLiked ? 'text-[#E50914] bg-red-600/20' : 'text-white'
            }`}>
              <Heart size={24} className={isLiked ? 'fill-[#E50914]' : ''} />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow-md">
              {currentShort.likes + (isLiked ? 1 : 0)}
            </span>
          </button>

          {/* Comment */}
          <button
            onClick={() => showToast('Comentários abertos em breve')}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 group-active:scale-90 transition-all text-white">
              <MessageCircle size={24} />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow-md">
              {currentShort.comments}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'Angoflix Shorts', url: window.location.href });
              } else {
                showToast('Link do vídeo copiado para a área de transferência');
              }
            }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 group-active:scale-90 transition-all text-white">
              <Share2 size={24} />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow-md">
              {currentShort.shares}
            </span>
          </button>
        </div>

        {/* Bottom Details Overlay */}
        <div className="absolute bottom-6 inset-x-4 pr-16 z-20 text-white flex flex-col gap-2 drop-shadow-md">
          <div className="flex items-center gap-2">
            <img
              src={currentShort.channelAvatar}
              alt={currentShort.channelName}
              className="w-10 h-10 rounded-full border-2 border-[#E50914] object-cover"
            />
            <span className="text-sm font-bold text-white">@{currentShort.channelName}</span>
            <button
              onClick={() => showToast('Inscrito no canal!')}
              className="bg-[#E50914] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase"
            >
              Inscrever-se
            </button>
          </div>

          <p className="text-xs text-neutral-200 line-clamp-2 leading-relaxed font-medium">
            {currentShort.caption}
          </p>
        </div>

        {/* Navigation Touch Controls for Up/Down swipe */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
          <button
            onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : SHORTS_DATA.length - 1))}
            className="bg-black/50 text-white p-2 rounded-full text-xs font-bold border border-white/20 hover:bg-[#E50914]"
          >
            ▲
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % SHORTS_DATA.length)}
            className="bg-black/50 text-white p-2 rounded-full text-xs font-bold border border-white/20 hover:bg-[#E50914]"
          >
            ▼
          </button>
        </div>
      </div>
    </div>
  );
};
