import React, { useEffect, useRef, useState } from 'react';
import { Channel, StreamType } from '../types';
import { AlertTriangle, ExternalLink, Loader2, Youtube } from 'lucide-react';
import { VideoControls } from './VideoControls';

interface VideoPlayerProps {
  channel: Channel;
  allChannels?: Channel[];
  onChannelChange?: (channel: Channel) => void;
}

declare global {
  interface Window {
    Hls: any;
  }
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, allChannels = [], onChannelChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Gerenciar visibilidade dos controles
  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 5000);
  };

  useEffect(() => {
    setError(null);
    setLoading(true);
    setShowFallback(false);
    setShowControls(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (channel.type === StreamType.HLS) {
      handleHLS();
    } else if (channel.type === StreamType.YOUTUBE) {
      // YouTube: Loading timeout
      const timer = setTimeout(() => setShowFallback(true), 7000);
      setLoading(false);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [channel]);

  const handleHLS = () => {
    const video = videoRef.current;
    if (!video) return;

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 30,
        backBufferLength: 60,
        // Suporte para fMP4 HLS (moderno)
        enableSoftwareAES: true
      });
      hlsRef.current = hls;
      hls.loadSource(channel.streamUrl);
      hls.attachMedia(video);
      
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        video.play().catch(() => {
          // Mute auto-play fallback
          video.muted = true;
          video.play();
        });
      });

      hls.on(window.Hls.Events.ERROR, (_event: any, data: any) => {
        if (data.fatal) {
          setError("Sinal HLS temporariamente indisponível.");
          setLoading(false);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari support
      video.src = channel.streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        video.play().catch(() => {
          video.muted = true;
          video.play();
        });
      });
    } else {
      setError("Seu navegador não suporta transmissões nativas HLS.");
      setLoading(false);
    }
  };

  const getYouTubeSrc = () => {
    const baseUrl = channel.streamUrl;
    const origin = window.location.origin;
    
    // Passo C: Parâmetros e regras oficiais do player embutido
    // Adicionamos mute=1 para garantir autoplay imediato em browsers modernos
    const params = new URLSearchParams({
      autoplay: '1',
      mute: '1', 
      controls: '1',
      modestbranding: '1',
      rel: '0',
      enablejsapi: '1',
      origin: origin,
      widget_referrer: origin
    });

    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params.toString()}`;
  };

  if (channel.type === StreamType.EXTERNAL) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#050505] text-white p-12 text-center">
        <div className={`w-24 h-24 rounded-3xl ${channel.logoColor} mb-8 shadow-2xl flex items-center justify-center`}>
          <ExternalLink size={40} />
        </div>
        <h2 className="text-3xl font-bold mb-4">{channel.name}</h2>
        <p className="text-gray-400 mb-8 max-w-md">Para assistir a este canal, utilize o player oficial da emissora externa.</p>
        <a href={channel.streamUrl} target="_blank" rel="noopener noreferrer" 
           className="bg-white text-black px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110 shadow-xl">
          SINTONIZAR AGORA
        </a>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full bg-black flex items-center justify-center group"
      onMouseMove={showControlsTemporarily}
      onClick={showControlsTemporarily}
    >
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={56} />
          <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">A sintonizar sinal...</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 z-20 p-8 text-center">
          <AlertTriangle className="text-red-500 mb-6" size={64} />
          <h3 className="text-2xl font-bold text-white mb-2">Falha Técnica</h3>
          <p className="text-gray-400 mb-8 max-w-md">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gray-800 hover:bg-white hover:text-black text-white px-8 py-3 rounded-full font-bold transition-all border border-gray-700"
          >
            Recarregar Player
          </button>
        </div>
      )}

      {/* Fallback YouTube Helper */}
      {channel.type === StreamType.YOUTUBE && showFallback && !error && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <a 
            href={channel.streamUrl.replace('embed/', 'watch?v=').replace('live_stream?channel=', 'channel/')} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-full text-sm font-black shadow-2xl hover:bg-red-700 transition-all border-2 border-white/20"
          >
            <Youtube size={20} />
            ABRIR NO YOUTUBE (MODO DIRETO)
          </a>
        </div>
      )}

      {channel.type === StreamType.HLS && (
        <video 
          ref={videoRef} 
          className="w-full h-full object-contain" 
          controls 
          autoPlay 
          playsInline 
          crossOrigin="anonymous"
          onMouseMove={showControlsTemporarily}
          onClick={showControlsTemporarily}
        />
      )}

      {channel.type === StreamType.YOUTUBE && (
        <iframe
          src={getYouTubeSrc()}
          title={channel.name}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
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

      {/* Painel de Controles Melhorado */}
      {allChannels.length > 0 && onChannelChange && (
        <VideoControls
          currentChannel={channel}
          allChannels={allChannels}
          onChannelChange={onChannelChange}
          isVisible={showControls && !loading && !error}
          onHide={() => setShowControls(false)}
        />
      )}
    </div>
  );
};