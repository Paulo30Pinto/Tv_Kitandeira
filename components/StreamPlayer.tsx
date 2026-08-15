import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Channel, StreamType } from '../types';
import { getCurrentAndNextProgram, getChannelSchedule } from '../data/programs';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Heart, 
  List, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Search, 
  X, 
  Sparkles, 
  AlertTriangle, 
  Loader2, 
  Sliders, 
  Info, 
  Tv, 
  ExternalLink,
  Radio
} from 'lucide-react';
import Hls from 'hls.js';

export interface StreamPlayerProps {
  channel: Channel;
  channels?: Channel[];
  onSelectChannel?: (channel: Channel) => void;
  onClose?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (channelId: string) => void;
  previousChannel?: Channel | null;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = ({
  channel,
  channels = [],
  onSelectChannel,
  onClose,
  isFavorite = false,
  onToggleFavorite,
  previousChannel: initialPreviousChannel = null,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideControlsTimerRef = useRef<any>(null);
  const zappingTimerRef = useRef<any>(null);
  const numBufferTimerRef = useRef<any>(null);

  // Core Playback State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<'contain' | 'cover' | 'fill'>('contain');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // TV Features State
  const [showChannelDrawer, setShowChannelDrawer] = useState(false);
  const [showEPGDrawer, setShowEPGDrawer] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('1080p HD (Automático)');
  const [channelSearchTerm, setChannelSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Todos');

  // TV Zapping & History
  const [showZappingOSD, setShowZappingOSD] = useState(true);
  const [lastChannel, setLastChannel] = useState<Channel | null>(initialPreviousChannel);
  const [numericBuffer, setNumericBuffer] = useState<string>('');

  // Clock
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  // Calculate current program info & schedule
  const programInfo = getCurrentAndNextProgram(channel);
  const fullSchedule = getChannelSchedule(channel);

  // Update live clock
  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      const h = d.getHours().toString().padStart(2, '0');
      const m = d.getMinutes().toString().padStart(2, '0');
      setCurrentTimeStr(`${h}:${m}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  // Controls auto-hide timer
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    hideControlsTimerRef.current = setTimeout(() => {
      if (!showChannelDrawer && !showEPGDrawer && !showInfoModal && !showQualityMenu) {
        setShowControls(false);
      }
    }, 4500);
  }, [showChannelDrawer, showEPGDrawer, showInfoModal, showQualityMenu]);

  // Trigger Zapping OSD on channel change
  useEffect(() => {
    setShowZappingOSD(true);
    if (zappingTimerRef.current) clearTimeout(zappingTimerRef.current);
    zappingTimerRef.current = setTimeout(() => {
      setShowZappingOSD(false);
    }, 3800);
  }, [channel.id]);

  // Channel navigation helpers
  const currentChannelIndex = channels.findIndex((c) => c.id === channel.id);
  const channelNumber = channel.channelNumber || (currentChannelIndex >= 0 ? (currentChannelIndex + 1).toString().padStart(3, '0') : '001');

  const goToPrevChannel = useCallback(() => {
    if (channels.length === 0 || !onSelectChannel) return;
    setLastChannel(channel);
    const prevIndex = currentChannelIndex > 0 ? currentChannelIndex - 1 : channels.length - 1;
    onSelectChannel(channels[prevIndex]);
  }, [channels, currentChannelIndex, channel, onSelectChannel]);

  const goToNextChannel = useCallback(() => {
    if (channels.length === 0 || !onSelectChannel) return;
    setLastChannel(channel);
    const nextIndex = currentChannelIndex < channels.length - 1 ? currentChannelIndex + 1 : 0;
    onSelectChannel(channels[nextIndex]);
  }, [channels, currentChannelIndex, channel, onSelectChannel]);

  const goToLastChannel = useCallback(() => {
    if (lastChannel && onSelectChannel) {
      const target = lastChannel;
      setLastChannel(channel);
      onSelectChannel(target);
    }
  }, [lastChannel, channel, onSelectChannel]);

  // Stream Initialization (HLS / Native / Iframe / YouTube)
  useEffect(() => {
    setError(null);
    setLoading(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;
    if (!video) return;

    if (channel.type === StreamType.HLS) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
          maxBufferLength: 30,
          enableSoftwareAES: true,
        });
        hlsRef.current = hls;
        hls.loadSource(channel.streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          video.volume = volume;
          video.muted = isMuted;
          video.play().then(() => setIsPlaying(true)).catch(() => {
            // Autoplay with sound might be blocked, retry muted
            video.muted = true;
            setIsMuted(true);
            video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          });
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                setError('Sinal HLS temporariamente indisponível para este canal.');
                setLoading(false);
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = channel.streamUrl;
        video.addEventListener('loadedmetadata', () => {
          setLoading(false);
          video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        });
      } else {
        setError('O seu navegador não suporta transmissões HLS.');
        setLoading(false);
      }
    } else if (channel.type === StreamType.YOUTUBE) {
      setLoading(false);
    } else {
      video.src = channel.streamUrl;
      video.play().then(() => {
        setLoading(false);
        setIsPlaying(true);
      }).catch(() => {
        setLoading(false);
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel]);

  // Volume handler
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      if (newVol === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const togglePlay = () => {
    if (channel.type === StreamType.YOUTUBE) return;
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard and Remote D-Pad Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetControlsTimeout();

      // Don't intercept typing in search input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Numeric channel direct jump (0-9)
      if (e.key >= '0' && e.key <= '9') {
        const nextBuffer = (numericBuffer + e.key).slice(-3);
        setNumericBuffer(nextBuffer);
        if (numBufferTimerRef.current) clearTimeout(numBufferTimerRef.current);
        numBufferTimerRef.current = setTimeout(() => {
          const targetNum = parseInt(nextBuffer, 10);
          const found = channels.find(
            (c, idx) => c.channelNumber === nextBuffer || parseInt(c.channelNumber || '', 10) === targetNum || (idx + 1) === targetNum
          );
          if (found && onSelectChannel) {
            setLastChannel(channel);
            onSelectChannel(found);
          }
          setNumericBuffer('');
        }, 1200);
        return;
      }

      switch (e.key) {
        case 'Escape':
        case 'Backspace':
          if (showInfoModal) setShowInfoModal(false);
          else if (showEPGDrawer) setShowEPGDrawer(false);
          else if (showChannelDrawer) setShowChannelDrawer(false);
          else if (showQualityMenu) setShowQualityMenu(false);
          else if (onClose) onClose();
          break;

        case 'ArrowUp':
          e.preventDefault();
          goToPrevChannel();
          break;

        case 'ArrowDown':
          e.preventDefault();
          goToNextChannel();
          break;

        case 'ArrowRight':
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.05));
          break;

        case 'ArrowLeft':
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.05));
          break;

        case ' ':
        case 'Enter':
          e.preventDefault();
          togglePlay();
          break;

        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;

        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;

        case 'c':
        case 'C':
        case 'l':
        case 'L':
          e.preventDefault();
          setShowChannelDrawer((prev) => !prev);
          setShowEPGDrawer(false);
          break;

        case 'e':
        case 'E':
        case 'p':
        case 'P':
          e.preventDefault();
          setShowEPGDrawer((prev) => !prev);
          setShowChannelDrawer(false);
          break;

        case 'i':
        case 'I':
        case 'h':
        case 'H':
          e.preventDefault();
          setShowInfoModal((prev) => !prev);
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    resetControlsTimeout,
    numericBuffer,
    channels,
    channel,
    goToNextChannel,
    goToPrevChannel,
    volume,
    showChannelDrawer,
    showEPGDrawer,
    showInfoModal,
    showQualityMenu,
    onClose,
    onSelectChannel,
  ]);

  // Categories for drawer
  const categories = ['Todos', 'Angola', 'Notícias', 'Desporto', 'Novelas', 'Música', 'Infantil', 'Filmes'];

  const filteredDrawerChannels = channels.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(channelSearchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(channelSearchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCategoryFilter === 'Todos') return true;
    if (selectedCategoryFilter === 'Angola') return c.country?.toLowerCase() === 'angola';
    return c.category?.toLowerCase() === selectedCategoryFilter.toLowerCase();
  });

  const getYouTubeSrc = () => {
    const baseUrl = channel.streamUrl;
    const params = new URLSearchParams({
      autoplay: '1',
      mute: isMuted ? '1' : '0',
      controls: '1',
      rel: '0',
      modestbranding: '1',
      showinfo: '0',
      enablejsapi: '1',
    });
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params.toString()}`;
  };

  return (
    <div 
      className="fixed inset-0 z-[2500] bg-[#050711] text-white flex items-center justify-center overflow-hidden select-none font-sans"
      onMouseMove={resetControlsTimeout}
      onClick={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
    >
      {/* Video Surface */}
      <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
        {channel.type === StreamType.HLS && (
          <video
            ref={videoRef}
            playsInline
            autoPlay
            className={`w-full h-full ${
              aspectRatio === 'contain' ? 'object-contain' : aspectRatio === 'cover' ? 'object-cover' : 'object-fill'
            }`}
          />
        )}

        {channel.type === StreamType.YOUTUBE && (
          <iframe
            src={getYouTubeSrc()}
            title={channel.name}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}

        {channel.type === StreamType.IFRAME && (
          <iframe
            src={channel.streamUrl}
            title={channel.name}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}

        {channel.type === StreamType.EXTERNAL && (
          <div className="flex flex-col items-center justify-center p-8 text-center max-w-lg">
            <div className={`w-24 h-24 rounded-3xl ${channel.logoColor} mb-6 shadow-2xl flex items-center justify-center`}>
              <ExternalLink size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3 text-white">{channel.name}</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Este canal transmite através de um portal externo seguro.
            </p>
            <a
              href={channel.streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#00B5FF] hover:bg-cyan-400 text-slate-950 font-black text-sm px-8 py-3.5 rounded-2xl flex items-center gap-2 shadow-[0_0_30px_rgba(0,181,255,0.4)] transition-all transform hover:scale-105"
            >
              <Play size={18} fill="currentColor" />
              ABRIR TRANSMISSÃO EXTERNA
            </a>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && channel.type !== StreamType.EXTERNAL && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full border-2 border-cyan-500/20 animate-ping absolute" />
            <div className="w-16 h-16 rounded-full border-2 border-[#00B5FF] border-t-transparent animate-spin" />
            <Tv size={24} className="text-[#00B5FF] absolute" />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold font-mono text-[#00B5FF] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              CH #{channelNumber}
            </span>
            <span className="text-lg font-black text-white">{channel.name}</span>
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse mt-1">
            Sintonizando sinal ao vivo...
          </span>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#090b16]/95 backdrop-blur-lg p-6 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-5 text-red-500 shadow-2xl">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Sinal Temporariamente Indisponível</h3>
          <p className="text-sm text-gray-300 max-w-md mb-6 leading-relaxed">
            {error}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                if (videoRef.current) {
                  videoRef.current.load();
                }
              }}
              className="px-6 py-2.5 rounded-xl bg-[#00B5FF] hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
            >
              Tentar Novamente
            </button>
            {channels.length > 1 && (
              <button
                onClick={goToNextChannel}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition-all active:scale-95"
              >
                Próximo Canal (CH+)
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-bold text-xs transition-all active:scale-95"
            >
              Voltar ao Menu
            </button>
          </div>
        </div>
      )}

      {/* Direct Numeric Input OSD (When typing 002 on remote) */}
      {numericBuffer && (
        <div className="absolute top-8 right-8 z-[3500] bg-[#090b16]/90 border-2 border-[#00B5FF] text-white px-6 py-3 rounded-2xl shadow-[0_0_40px_rgba(0,181,255,0.6)] backdrop-blur-xl flex items-center gap-3 animate-in zoom-in-95">
          <div className="w-3 h-3 rounded-full bg-[#00B5FF] animate-ping" />
          <div>
            <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Sintonizar Canal</div>
            <div className="text-2xl font-black font-mono tracking-widest text-white">
              #{numericBuffer.padStart(3, '0')}
            </div>
          </div>
        </div>
      )}

      {/* Zapping OSD Box (TV Banner on channel change) */}
      {showZappingOSD && !showControls && (
        <div className="absolute bottom-10 left-6 right-6 md:left-12 md:right-12 z-40 max-w-5xl mx-auto bg-[#0a0e1c]/90 border border-cyan-500/40 rounded-2xl p-5 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-6 duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl sm:text-4xl font-black text-[#00B5FF] font-mono tracking-tighter">
                #{channelNumber}
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-md ${channel.logoColor}`}>
                {channel.logoImage ? (
                  <img src={channel.logoImage} alt={channel.name} className="h-7 w-auto object-contain" />
                ) : (
                  channel.watermark || channel.name.substring(0, 2)
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">{channel.name}</h2>
                  <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    AO VIVO
                  </span>
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  {channel.category} • {channel.country} • {channel.resolution || '1080p HD'}
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto flex-1 md:max-w-md bg-[#121828]/80 border border-white/10 p-3 rounded-xl">
              <div className="flex items-center justify-between text-[11px] font-bold text-cyan-400 mb-1">
                <span className="truncate">AGORA: {programInfo.currentProgram.title}</span>
                <span className="text-gray-400 shrink-0 font-mono ml-2">
                  {programInfo.currentProgram.startTime} - {programInfo.currentProgram.endTime}
                </span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mb-1.5">
                <div 
                  className="bg-[#00B5FF] h-full rounded-full transition-all duration-300"
                  style={{ width: `${programInfo.progressPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-gray-400 line-clamp-1">
                <strong className="text-gray-300">A Seguir:</strong> {programInfo.nextProgram.title} ({programInfo.nextProgram.startTime})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Full TV Controls Overlay */}
      <div
        className={`absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-6 md:p-8 pointer-events-none transition-all duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/90 via-black/50 to-transparent -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 md:-mx-8 md:-mt-8 p-4 sm:p-6 md:p-8 pb-12">
          {/* Back & Channel Badge */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 bg-[#121828]/80 hover:bg-[#00B5FF] hover:text-slate-950 text-white px-4 py-2.5 rounded-2xl border border-white/15 backdrop-blur-xl shadow-2xl font-bold text-xs transition-all active:scale-95 focus:ring-2 focus:ring-cyan-400"
              title="Voltar ao menu (Escape / Backspace)"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Menu Principal</span>
            </button>

            <div className="flex items-center gap-3 bg-[#121828]/80 border border-white/15 px-3.5 py-2 rounded-2xl backdrop-blur-xl">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white ${channel.logoColor} shadow-md`}>
                {channel.logoImage ? (
                  <img src={channel.logoImage} alt={channel.name} className="h-5 w-auto object-contain" />
                ) : (
                  channel.watermark || channel.name.substring(0, 2)
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#00B5FF]">#{channelNumber}</span>
                  <span className="text-sm font-extrabold text-white tracking-tight">{channel.name}</span>
                </div>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest hidden sm:inline">
                  {channel.category} • {channel.country}
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Status & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 bg-red-950/60 border border-red-500/40 text-red-400 px-3 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-wider shadow-lg">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>AO VIVO</span>
            </div>

            {/* Live Clock */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#121828]/80 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-gray-300 backdrop-blur-xl">
              <span>{currentTimeStr || '14:30'}</span>
            </div>

            {/* Resolution Tag */}
            <span className="hidden md:inline-block text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-xl">
              {channel.resolution || '1080p HD'}
            </span>

            {/* Favorite Toggle */}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(channel.id);
                }}
                className={`p-2.5 rounded-2xl border backdrop-blur-xl transition-all active:scale-90 ${
                  isFavorite
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-rose-500/20 shadow-lg'
                    : 'bg-[#121828]/80 border-white/15 text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
              </button>
            )}

            {/* Quality & Aspect Ratio Menu Toggle */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQualityMenu(!showQualityMenu);
                }}
                className="p-2.5 rounded-2xl bg-[#121828]/80 hover:bg-white/10 border border-white/15 text-gray-300 hover:text-white backdrop-blur-xl transition-all"
                title="Definições e Ajuste de Tela"
              >
                <Sliders size={18} />
              </button>

              {showQualityMenu && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-12 z-50 w-56 bg-[#121828] border border-white/15 rounded-2xl p-3 shadow-2xl backdrop-blur-2xl space-y-3 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="text-[10px] font-black uppercase text-cyan-400 tracking-wider px-1">
                    Ajuste de Tela
                  </div>
                  <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-[11px] font-bold text-center">
                    <button
                      onClick={() => setAspectRatio('contain')}
                      className={`py-1.5 rounded-lg transition-all ${aspectRatio === 'contain' ? 'bg-[#00B5FF] text-slate-950' : 'text-gray-400 hover:text-white'}`}
                    >
                      Padrão
                    </button>
                    <button
                      onClick={() => setAspectRatio('cover')}
                      className={`py-1.5 rounded-lg transition-all ${aspectRatio === 'cover' ? 'bg-[#00B5FF] text-slate-950' : 'text-gray-400 hover:text-white'}`}
                    >
                      Cortar
                    </button>
                    <button
                      onClick={() => setAspectRatio('fill')}
                      className={`py-1.5 rounded-lg transition-all ${aspectRatio === 'fill' ? 'bg-[#00B5FF] text-slate-950' : 'text-gray-400 hover:text-white'}`}
                    >
                      Total
                    </button>
                  </div>

                  <div className="text-[10px] font-black uppercase text-cyan-400 tracking-wider px-1 pt-1 border-t border-white/10">
                    Qualidade de Vídeo
                  </div>
                  <div className="space-y-1 text-xs">
                    {['1080p HD (Automático)', '720p HD', '480p SD'].map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setSelectedQuality(q);
                          setShowQualityMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                          selectedQuality === q ? 'bg-cyan-500/20 text-[#00B5FF]' : 'text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <span>{q}</span>
                        {selectedQuality === q && <span className="w-1.5 h-1.5 rounded-full bg-[#00B5FF]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Quick Skip/Play Remote Overlay for TV */}
        <div className="flex items-center justify-center gap-6 pointer-events-auto">
          {channels.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevChannel();
              }}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/60 hover:bg-[#00B5FF] hover:text-slate-950 text-white border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl active:scale-90 transition-all"
              title="Canal Anterior (CH- / Seta Cima)"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {channel.type !== StreamType.YOUTUBE && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#00B5FF] text-slate-950 flex items-center justify-center shadow-[0_0_35px_rgba(0,181,255,0.5)] hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Pausar (Espaço)' : 'Reproduzir (Espaço)'}
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>
          )}

          {channels.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNextChannel();
              }}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/60 hover:bg-[#00B5FF] hover:text-slate-950 text-white border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl active:scale-90 transition-all"
              title="Próximo Canal (CH+ / Seta Baixo)"
            >
              <ChevronRight size={28} />
            </button>
          )}
        </div>

        {/* Bottom Bar: Program Info & Full Control Deck */}
        <div className="pointer-events-auto bg-gradient-to-t from-black/95 via-black/80 to-transparent -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 md:-mx-8 md:-mb-8 p-4 sm:p-6 md:p-8 pt-12 flex flex-col gap-4">
          {/* Live Program Info Box */}
          <div className="bg-[#0f1526]/90 border border-white/15 rounded-2xl p-4 md:p-5 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-1">
                <span className="flex items-center gap-1.5 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-500/30">
                  <Radio size={12} className="animate-pulse text-[#00B5FF]" />
                  NO AR AGORA
                </span>
                <span className="font-mono text-gray-300">
                  {programInfo.currentProgram.startTime} — {programInfo.currentProgram.endTime}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white truncate">
                {programInfo.currentProgram.title}
              </h3>
              <p className="text-xs text-gray-300 line-clamp-1 mt-0.5">
                {programInfo.currentProgram.description}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-[#00B5FF] h-full rounded-full transition-all duration-500 shadow-[0_0_10px_#00B5FF]"
                  style={{ width: `${programInfo.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Next Program Preview */}
            <div className="w-full md:w-auto shrink-0 bg-white/5 border border-white/10 rounded-xl p-3 flex md:flex-col justify-between items-start gap-1">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">A SEGUIR</span>
              <span className="text-xs font-bold text-white truncate max-w-[200px]">
                {programInfo.nextProgram.title}
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {programInfo.nextProgram.startTime} — {programInfo.nextProgram.endTime}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-white">
            {/* Left Controls: Quick Navigation */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowChannelDrawer(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  showChannelDrawer
                    ? 'bg-[#00B5FF] text-slate-950 border-[#00B5FF]'
                    : 'bg-[#121828]/90 text-white hover:bg-white/10 border-white/15'
                }`}
                title="Abrir Lista de Canais (Tecla C)"
              >
                <List size={16} />
                <span>Canais</span>
              </button>

              <button
                onClick={() => setShowEPGDrawer(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  showEPGDrawer
                    ? 'bg-[#00B5FF] text-slate-950 border-[#00B5FF]'
                    : 'bg-[#121828]/90 text-white hover:bg-white/10 border-white/15'
                }`}
                title="Abrir Guia de Programação (Tecla E)"
              >
                <Calendar size={16} />
                <span>Guia EPG</span>
              </button>

              {lastChannel && (
                <button
                  onClick={goToLastChannel}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#121828]/90 hover:bg-white/10 text-cyan-400 border border-cyan-500/30 transition-all"
                  title={`Voltar para canal anterior (${lastChannel.name})`}
                >
                  <RotateCcw size={14} />
                  <span>Último: {lastChannel.name}</span>
                </button>
              )}

              <button
                onClick={() => setShowInfoModal(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#121828]/90 hover:bg-white/10 text-gray-300 border border-white/15"
                title="Detalhes do Programa (Tecla I)"
              >
                <Info size={15} />
                <span>Sinopse</span>
              </button>
            </div>

            {/* Right Controls: Volume & Fullscreen */}
            <div className="flex items-center gap-3">
              {/* Volume Slider HUD */}
              <div className="flex items-center gap-2 bg-[#121828]/90 border border-white/15 px-3 py-1.5 rounded-xl">
                <button
                  onClick={toggleMute}
                  className="text-gray-300 hover:text-white transition-colors"
                  title={isMuted ? 'Ativar Som (Tecla M)' : 'Desativar Som (Tecla M)'}
                >
                  {isMuted || volume === 0 ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 sm:w-24 h-1.5 accent-[#00B5FF] bg-neutral-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2.5 rounded-xl bg-[#121828]/90 hover:bg-white/10 border border-white/15 text-gray-300 hover:text-white transition-all"
                title={isFullscreen ? 'Sair de Ecrã Inteiro (Tecla F)' : 'Ecrã Inteiro (Tecla F)'}
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-in Channel List Drawer (Sidebar over video) */}
      {showChannelDrawer && (
        <div 
          className="absolute inset-y-0 right-0 z-50 w-full max-w-sm sm:max-w-md bg-[#090d1a]/95 border-l border-cyan-500/30 backdrop-blur-2xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <List size={18} className="text-[#00B5FF]" />
              <h3 className="text-base font-black text-white tracking-wide">Lista de Canais</h3>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
                {filteredDrawerChannels.length}
              </span>
            </div>
            <button
              onClick={() => setShowChannelDrawer(false)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-white/5">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar canal..."
                value={channelSearchTerm}
                onChange={(e) => setChannelSearchTerm(e.target.value)}
                className="w-full bg-[#121828] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="px-3 py-2 border-b border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all ${
                  selectedCategoryFilter === cat
                    ? 'bg-[#00B5FF] text-slate-950'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Channel Rows */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {filteredDrawerChannels.map((c, idx) => {
              const isSelected = c.id === channel.id;
              const num = c.channelNumber || (channels.findIndex((ch) => ch.id === c.id) + 1).toString().padStart(3, '0');
              const cProg = getCurrentAndNextProgram(c);

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    if (onSelectChannel) {
                      setLastChannel(channel);
                      onSelectChannel(c);
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                    isSelected
                      ? 'bg-cyan-950/80 border-[#00B5FF] shadow-[0_0_20px_rgba(0,181,255,0.25)]'
                      : 'bg-[#121828]/60 border-white/5 hover:border-white/20 hover:bg-[#151c2e]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-cyan-400">
                      #{num}
                    </span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md ${c.logoColor}`}>
                      {c.logoImage ? (
                        <img src={c.logoImage} alt={c.name} className="h-6 w-auto object-contain" />
                      ) : (
                        c.watermark || c.name.substring(0, 2)
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#00B5FF]' : 'text-white group-hover:text-cyan-300'}`}>
                          {c.name}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#00B5FF] animate-pulse shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 truncate">
                        {cProg.currentProgram.title}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                      {c.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Slide-in EPG Guide Drawer */}
      {showEPGDrawer && (
        <div
          className="absolute inset-y-0 left-0 z-50 w-full max-w-sm sm:max-w-lg bg-[#090d1a]/95 border-r border-cyan-500/30 backdrop-blur-2xl shadow-2xl flex flex-col animate-in slide-in-from-left duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* EPG Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-md ${channel.logoColor}`}>
                {channel.watermark || channel.name.substring(0, 2)}
              </div>
              <div>
                <h3 className="text-base font-black text-white">{channel.name} — Programação</h3>
                <span className="text-[10px] text-cyan-400 font-semibold">Grelha Oficial de Hoje</span>
              </div>
            </div>
            <button
              onClick={() => setShowEPGDrawer(false)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Schedule List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {fullSchedule.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.isLive
                    ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/60 border-[#00B5FF] shadow-[0_0_20px_rgba(0,181,255,0.2)]'
                    : 'bg-[#121828]/60 border-white/5'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className={`font-mono ${item.isLive ? 'text-[#00B5FF]' : 'text-gray-400'}`}>
                    {item.startTime} — {item.endTime}
                  </span>
                  {item.isLive && (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-red-400 bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      NO AR
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {item.description}
                </p>
                {item.isLive && (
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-3">
                    <div 
                      className="bg-[#00B5FF] h-full rounded-full transition-all duration-300"
                      style={{ width: `${programInfo.progressPercent}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Program Synopsis Modal */}
      {showInfoModal && (
        <div 
          className="fixed inset-0 z-[3200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowInfoModal(false)}
        >
          <div 
            className="bg-[#121828] border border-cyan-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold text-white shadow-md ${channel.logoColor}`}>
                  {channel.watermark || channel.name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{channel.name}</h3>
                  <span className="text-xs text-cyan-400 font-mono">
                    {programInfo.currentProgram.startTime} — {programInfo.currentProgram.endTime}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-md border border-cyan-500/30">
                  {programInfo.currentProgram.category || channel.category}
                </span>
                <span className="text-[10px] font-mono text-gray-400 border border-white/10 px-2 py-0.5 rounded">
                  {channel.resolution || '1080p HD'}
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                {programInfo.currentProgram.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 mt-3 leading-relaxed">
                {programInfo.currentProgram.description}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span>Transmissão Oficial TeIP Digital</span>
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-5 py-2 rounded-xl bg-[#00B5FF] hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
              >
                Continuar a Assistir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
