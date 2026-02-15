import React, { useState, useEffect } from 'react';
import { Channel } from '../types';
import { ChevronUp, ChevronDown, Play, Clock } from 'lucide-react';

interface VideoControlsProps {
  currentChannel: Channel;
  allChannels: Channel[];
  onChannelChange: (channel: Channel) => void;
  isVisible: boolean;
  onHide: () => void;
}

interface ProgramInfo {
  title: string;
  time: string;
  endTime?: string;
  isLive?: boolean;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  currentChannel,
  allChannels,
  onChannelChange,
  isVisible,
  onHide
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [programProgress, setProgramProgress] = useState(35); // Simulado: 35% do programa

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Encontrar índice do canal atual
  const currentIndex = allChannels.findIndex(ch => ch.id === currentChannel.id);
  const prevChannel = currentIndex > 0 ? allChannels[currentIndex - 1] : null;
  const nextChannel = currentIndex < allChannels.length - 1 ? allChannels[currentIndex + 1] : null;

  // Simular informações de programação
  const getProgramInfo = (): ProgramInfo[] => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    
    // Programa atual (simulado)
    const currentProgram: ProgramInfo = {
      title: `${currentChannel.name.toUpperCase()} - TRANSMISSÃO AO VIVO`,
      time: `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`,
      isLive: true
    };

    // Próximos programas (simulados)
    const nextHour = (currentHour + 1) % 24;
    const nextProgram: ProgramInfo = {
      title: `PROGRAMAÇÃO ESPECIAL - ${currentChannel.category.toUpperCase()}`,
      time: `${String(nextHour).padStart(2, '0')}:00`,
      endTime: `${String((nextHour + 2) % 24).padStart(2, '0')}:00`
    };

    const nextProgram2: ProgramInfo = {
      title: `DESTAQUES - ${currentChannel.name}`,
      time: `${String((nextHour + 2) % 24).padStart(2, '0')}:00`,
      endTime: `${String((nextHour + 4) % 24).padStart(2, '0')}:00`
    };

    return [currentProgram, nextProgram, nextProgram2];
  };

  const programs = getProgramInfo();

  const formatChannelNumber = (index: number): string => {
    return String(index + 1).padStart(3, '0');
  };

  if (!isVisible) return null;

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/95 via-black/90 to-transparent backdrop-blur-md transition-all duration-300"
      onMouseLeave={onHide}
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Barra superior com número do canal */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-white/80">
              {formatChannelNumber(currentIndex)} {currentChannel.name.toUpperCase()}
            </span>
            <div className="flex items-center gap-2 bg-red-600/90 backdrop-blur-xl text-white text-[10px] font-black px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              AO VIVO
            </div>
          </div>
          <button
            onClick={onHide}
            className="text-white/60 hover:text-white transition-colors"
          >
            <ChevronDown size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Lista de Canais */}
          <div className="lg:col-span-1">
            <div className="bg-black/40 rounded-2xl p-4 border border-white/10">
              <div className="space-y-2">
                {prevChannel && (
                  <button
                    onClick={() => onChannelChange(prevChannel)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <ChevronUp size={16} className="text-white/40 group-hover:text-cyan-400" />
                      <span className="text-sm font-bold text-white/60">
                        {formatChannelNumber(currentIndex - 1)}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-white/70 group-hover:text-white truncate">
                      {prevChannel.name}
                    </span>
                  </button>
                )}

                {/* Canal Atual (Destacado) */}
                <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/20 border-2 border-cyan-500/50">
                  <div className="flex items-center gap-2 min-w-[80px]">
                    <Play size={16} className="text-cyan-400" fill="currentColor" />
                    <span className="text-sm font-black text-cyan-400">
                      {formatChannelNumber(currentIndex)}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-white truncate">
                    {currentChannel.name}
                  </span>
                </div>

                {nextChannel && (
                  <button
                    onClick={() => onChannelChange(nextChannel)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <ChevronDown size={16} className="text-white/40 group-hover:text-cyan-400" />
                      <span className="text-sm font-bold text-white/60">
                        {formatChannelNumber(currentIndex + 1)}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-white/70 group-hover:text-white truncate">
                      {nextChannel.name}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Coluna 2 e 3: Informações de Programação */}
          <div className="lg:col-span-2">
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
              <div className="space-y-4">
                {programs.map((program, index) => (
                  <div key={index} className={index === 0 ? 'border-l-4 border-cyan-400 pl-4' : 'pl-4'}>
                    {index === 0 ? (
                      // Programa Atual com Barra de Progresso
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-xs font-black text-red-400 uppercase tracking-wider">
                              DIRETO
                            </span>
                          </div>
                          <span className="text-xs text-white/40">
                            {program.time}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-3 leading-tight">
                          {program.title}
                        </h3>
                        {/* Barra de Progresso */}
                        <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full transition-all duration-1000"
                            style={{ width: `${programProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      // Próximos Programas
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <Clock size={14} className="text-white/40" />
                          <span className="text-xs font-semibold text-white/60">
                            {program.time}
                            {program.endTime && ` - ${program.endTime}`}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white/80 leading-tight">
                          {program.title}
                        </h4>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

