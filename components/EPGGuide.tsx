import React, { useEffect, useState } from 'react';
import { Channel, EPGProgram } from '../types';
import { MOCK_EPG_SHOWS } from '../constants';
import { loadIptvOrgEpg } from '../src/services/iptvEpg';
import { Calendar, Play, Clock, Tv, Info, Sparkles } from 'lucide-react';

interface EPGGuideProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
}

export const EPGGuide: React.FC<EPGGuideProps> = ({ channels, onSelectChannel }) => {
  const [selectedShow, setSelectedShow] = useState<{ channel: Channel; show: EPGProgram } | null>(null);
  const [officialPrograms, setOfficialPrograms] = useState<EPGProgram[]>([]);
  const [epgUpdatedAt, setEpgUpdatedAt] = useState(0);

  useEffect(() => {
    loadIptvOrgEpg().then(({ programs, updatedAt }) => {
      setOfficialPrograms(programs);
      setEpgUpdatedAt(updatedAt);
    });
  }, []);

  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const programsForChannel = (channel: Channel) => {
    const name = normalize(channel.name);
    return officialPrograms
      .filter((program) => normalize(program.channelId).includes(name) || normalize(program.channelId).includes(normalize(channel.id)))
      .slice(0, 6);
  };

  const hours = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-8 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Calendar size={16} />
            <span>Guia Eletrónico de Programação</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Programação ao Vivo (EPG)
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Consulte a grelha de emissão em tempo real e assista com um toque.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#121929] border border-white/10 px-3 py-1.5 rounded-xl text-xs text-gray-300">
          <Clock size={14} className="text-cyan-400" />
          <span>Hora Atual: <strong className="text-white">14:25</strong></span>
        </div>
      </div>

      {/* Timeline Grid Container */}
      <div className="bg-[#0f1524] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Timeline Hours Header */}
        <div className="flex items-center border-b border-white/10 bg-[#0a0e18] sticky top-0 z-20 overflow-x-auto no-scrollbar">
          <div className="w-48 md:w-64 shrink-0 px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest border-r border-white/10 bg-[#0a0e18]">
            Canal
          </div>
          <div className="flex-1 flex min-w-[600px]">
            {hours.map((hour, idx) => (
              <div key={idx} className="flex-1 px-4 py-3 text-center text-xs font-bold text-gray-300 border-r border-white/5 bg-[#0d1220]">
                {hour}
              </div>
            ))}
          </div>
        </div>

        {/* Channels Rows */}
        <div className="divide-y divide-white/5 overflow-x-auto">
          {channels.slice(0, 15).map((channel) => {
            const officialShows = programsForChannel(channel);
            const shows = officialShows.length > 0 ? officialShows : MOCK_EPG_SHOWS[channel.id] || [
              {
                id: `p-def-${channel.id}`,
                channelId: channel.id,
                title: `${channel.name} Emissão Contínua HD`,
                description: `Transmissão ao vivo de ${channel.name} em alta definição.`,
                startTime: '14:00',
                endTime: '18:00',
                category: channel.category,
                progressPercent: 45,
                isLive: true,
              }
            ];

            return (
              <div key={channel.id} className="flex items-center min-w-[780px] hover:bg-white/[0.02] transition-colors group">
                {/* Channel Label */}
                <div 
                  onClick={() => onSelectChannel(channel)}
                  className="w-48 md:w-64 shrink-0 p-3 flex items-center gap-3 border-r border-white/10 cursor-pointer hover:bg-white/5 transition-all"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-md ${channel.logoColor}`}>
                    {channel.logoImage ? (
                      <img src={channel.logoImage} alt={channel.name} className="h-5 w-auto object-contain" />
                    ) : (
                      channel.watermark || channel.name.substring(0, 2)
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                      {channel.name}
                    </span>
                    <span className="text-[10px] text-gray-400 truncate">
                      #{channel.channelNumber || '000'} • {channel.category}
                    </span>
                  </div>
                  <Play size={14} className="ml-auto text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Show Items Row */}
                <div className="flex-1 flex p-2 gap-2">
                  {shows.map((show) => (
                    <div 
                      key={show.id}
                      onClick={() => setSelectedShow({ channel, show })}
                      className={`flex-1 p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[72px]
                        ${show.isLive 
                          ? 'bg-gradient-to-r from-cyan-950/60 to-blue-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(0,181,255,0.15)] hover:border-cyan-400' 
                          : 'bg-[#151c2e]/60 border-white/5 hover:border-white/20'
                        }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 text-[10px] text-cyan-400 font-bold mb-1">
                          <span className="flex items-center gap-1">
                            {show.isLive && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />}
                            {show.startTime} - {show.endTime}
                          </span>
                          <span className="text-gray-400 bg-white/5 px-1.5 py-0.5 rounded text-[9px]">
                            {show.category}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">
                          {show.title}
                        </h4>
                      </div>

                      {/* Live Progress Bar */}
                      {show.isLive && (
                        <div className="w-full bg-slate-800 rounded-full h-1 mt-2 overflow-hidden">
                          <div 
                            className="bg-[#00B5FF] h-full rounded-full transition-all duration-500" 
                            style={{ width: `${show.progressPercent || 50}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Show Info Modal */}
      {selectedShow && (
        <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121828] border border-cyan-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${selectedShow.channel.logoColor}`}>
                  {selectedShow.channel.watermark || 'TV'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedShow.channel.name}</h3>
                  <span className="text-[10px] text-cyan-400 font-semibold">{selectedShow.show.startTime} - {selectedShow.show.endTime}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedShow(null)}
                className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded bg-white/5"
              >
                ✕ Fechar
              </button>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#00B5FF] bg-cyan-500/10 px-2 py-0.5 rounded-md uppercase">
                {selectedShow.show.category}
              </span>
              <h2 className="text-lg font-bold text-white mt-2">
                {selectedShow.show.title}
              </h2>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                {selectedShow.show.description}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedShow(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  onSelectChannel(selectedShow.channel);
                  setSelectedShow(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00B5FF] hover:bg-cyan-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Play size={14} />
                Assistir Canal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
