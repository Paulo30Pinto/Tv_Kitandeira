import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StreamPlayer } from '../components/StreamPlayer';
import { Channel, StreamType, Country, Category } from '../types';
import { LIVE_CHANNELS } from '../data/mockData';
import Hls from 'hls.js';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Lock, 
  RotateCcw, 
  RotateCw,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export const PlayerScreen: React.FC = () => {
  const { currentPlayingMedia, currentPlayingChannel, setCurrentPlayingChannel, goBack, showToast, isFavorite, toggleFavorite } = useApp();

  // If playing a live channel, use the full TV StreamPlayer
  if (currentPlayingChannel) {
    const formattedChannel: Channel = {
      id: currentPlayingChannel.id,
      name: currentPlayingChannel.name,
      description: currentPlayingChannel.currentProgram || 'Transmissão ao vivo em alta definição.',
      logoColor: 'bg-gradient-to-br from-cyan-600 to-blue-800',
      logoImage: currentPlayingChannel.logo,
      watermark: currentPlayingChannel.name.substring(0, 2),
      streamUrl: currentPlayingChannel.streamUrl,
      type: StreamType.HLS,
      country: Country.ANGOLA,
      category: (currentPlayingChannel.category as any) || Category.GENERAL,
      resolution: '1080p',
      status: 'ONLINE',
      channelNumber: currentPlayingChannel.id.replace('ch-', '').padStart(3, '0')
    };

    const formattedAllChannels: Channel[] = LIVE_CHANNELS.map((ch, idx) => ({
      id: ch.id,
      name: ch.name,
      description: ch.currentProgram || 'Transmissão ao vivo em alta definição.',
      logoColor: 'bg-gradient-to-br from-cyan-600 to-blue-800',
      logoImage: ch.logo,
      watermark: ch.name.substring(0, 2),
      streamUrl: ch.streamUrl,
      type: StreamType.HLS,
      country: Country.ANGOLA,
      category: (ch.category as any) || Category.GENERAL,
      resolution: '1080p',
      status: 'ONLINE',
      channelNumber: (idx + 1).toString().padStart(3, '0')
    }));

    return (
      <StreamPlayer
        channel={formattedChannel}
        channels={formattedAllChannels}
        onSelectChannel={(ch) => {
          const found = LIVE_CHANNELS.find(l => l.id === ch.id);
          if (found) setCurrentPlayingChannel(found);
        }}
        onClose={goBack}
        isFavorite={isFavorite(currentPlayingChannel.id)}
        onToggleFavorite={toggleFavorite}
      />
    );
  }

  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [showControls, setShowControls] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  const title = currentPlayingChannel ? currentPlayingChannel.name : currentPlayingMedia?.title || 'Angoflix Video';
  const isLive = currentPlayingChannel ? currentPlayingChannel.isLive : currentPlayingMedia?.isLive;

  // Stream source selection: either live channel .m3u8 or sample video
  const streamUrl = currentPlayingChannel?.streamUrl || currentPlayingMedia?.streamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported() && streamUrl.endsWith('.m3u8')) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });
      return () => hls.destroy();
    } else {
      video.src = streamUrl;
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [streamUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setProgress((cur / dur) * 100);

    const format = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    setCurrentTime(format(cur));
    setDuration(format(dur));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekTo = (parseFloat(e.target.value) / 100) * (videoRef.current.duration || 1);
    videoRef.current.currentTime = seekTo;
  };

  return (
    <div 
      onClick={() => !isLocked && setShowControls((prev) => !prev)}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden animate-fadeIn select-none"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        playsInline
        autoPlay
        className="w-full h-full object-contain bg-black"
        poster={currentPlayingMedia?.cover || currentPlayingChannel?.logo}
      />

      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/80 flex flex-col justify-between p-4 sm:p-6 transition-opacity duration-300">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goBack();
                }}
                className="p-2.5 rounded-full bg-black/50 hover:bg-black/80 active:scale-90 transition-all"
                aria-label="Voltar"
              >
                <ArrowLeft size={22} />
              </button>

              <div>
                <h2 className="text-sm sm:text-lg font-black text-white">{title}</h2>
                {isLive && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
                    <span className="text-[10px] font-bold uppercase text-[#E50914]">AO VIVO</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLocked(!isLocked);
                  showToast(isLocked ? 'Tela desbloqueada' : 'Tela bloqueada');
                }}
                className="p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white"
                aria-label="Bloquear"
              >
                <Lock size={20} className={isLocked ? 'text-[#E50914]' : 'text-white'} />
              </button>
            </div>
          </div>

          {/* Center Play/Pause Controls */}
          <div className="flex items-center justify-center gap-8 text-white">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current) videoRef.current.currentTime -= 10;
              }}
              className="p-3 rounded-full bg-black/50 hover:bg-black/80 active:scale-90 transition-all"
            >
              <RotateCcw size={28} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-2xl shadow-red-600/50 hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} className="fill-white ml-1" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current) videoRef.current.currentTime += 10;
              }}
              className="p-3 rounded-full bg-black/50 hover:bg-black/80 active:scale-90 transition-all"
            >
              <RotateCw size={28} />
            </button>
          </div>

          {/* Bottom Bar Controls */}
          <div className="flex flex-col gap-2 text-white" onClick={(e) => e.stopPropagation()}>
            {/* Seek bar */}
            {!isLive && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-neutral-300">{currentTime}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-1.5 accent-[#E50914] bg-neutral-700 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-mono text-neutral-300">{duration}</span>
              </div>
            )}

            {/* Bottom buttons */}
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => showToast('Áudio: Português (Angola) · Legendas: Desativadas')}
                  className="flex items-center gap-1.5 text-xs font-bold bg-neutral-800/80 px-3 py-1.5 rounded-xl border border-white/10 hover:bg-neutral-700"
                >
                  <MessageSquare size={14} />
                  <span>Áudio / Legendas</span>
                </button>

                <button
                  onClick={() => showToast('Modo de tela: 16:9 Adaptado')}
                  className="flex items-center gap-1.5 text-xs font-bold bg-neutral-800/80 px-3 py-1.5 rounded-xl border border-white/10 hover:bg-neutral-700"
                >
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Redimensionar</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="p-2 rounded-full hover:bg-white/10"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                <button
                  onClick={() => {
                    if (document.fullscreenElement) {
                      document.exitFullscreen().catch(() => {});
                    } else {
                      document.documentElement.requestFullscreen().catch(() => {});
                    }
                  }}
                  className="p-2 rounded-full hover:bg-white/10"
                >
                  <Maximize2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
