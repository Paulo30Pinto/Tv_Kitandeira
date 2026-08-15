import React, { useState } from 'react';
import { Channel, Category, Country, StreamType, PlaylistSource } from '../types';
import { DEFAULT_PLAYLISTS } from '../constants';
import { ShieldCheck, Plus, Trash2, RefreshCw, Upload, Radio, Server, CheckCircle2, AlertCircle, Layers, FileCode } from 'lucide-react';

interface AdminPanelProps {
  channels: Channel[];
  onAddChannel: (channel: Channel) => void;
  onDeleteChannel: (id: string) => void;
  onAddPlaylist: (playlist: PlaylistSource) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  channels, 
  onAddChannel, 
  onDeleteChannel,
  onAddPlaylist 
}) => {
  const [activeTab, setActiveTab] = useState<'channels' | 'playlists' | 'stats'>('channels');
  
  // New channel form state
  const [name, setName] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [category, setCategory] = useState<Category>(Category.GENERAL);
  const [country, setCountry] = useState<Country>(Country.ANGOLA);
  const [watermark, setWatermark] = useState('');
  const [description, setDescription] = useState('');

  // Playlist form state
  const [playlistName, setPlaylistName] = useState('');
  const [playlistUrl, setPlaylistUrl] = useState('');

  const [playlists, setPlaylists] = useState<PlaylistSource[]>(DEFAULT_PLAYLISTS);

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !streamUrl) return;

    const newChan: Channel = {
      id: `custom-${Date.now()}`,
      channelNumber: (channels.length + 1).toString().padStart(3, '0'),
      name,
      description: description || `Canal ${name} transmitido em direto na plataforma TeIP.`,
      logoColor: 'bg-gradient-to-br from-[#00B5FF] to-blue-800',
      watermark: watermark || name.substring(0, 2).toUpperCase(),
      streamUrl,
      type: streamUrl.includes('youtube') ? StreamType.YOUTUBE : StreamType.HLS,
      country,
      category,
      resolution: '1080p',
      status: 'ONLINE'
    };

    onAddChannel(newChan);
    setName('');
    setStreamUrl('');
    setWatermark('');
    setDescription('');
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName || !playlistUrl) return;

    const newPl: PlaylistSource = {
      id: `pl-${Date.now()}`,
      name: playlistName,
      url: playlistUrl,
      channelsCount: 50,
      lastUpdated: 'Agora mesmo',
      isActive: true
    };

    setPlaylists([newPl, ...playlists]);
    onAddPlaylist(newPl);
    setPlaylistName('');
    setPlaylistUrl('');
  };

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-8 overflow-y-auto custom-scrollbar">
      {/* Admin Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck size={16} />
            <span>Gestão de Conteúdos & IPTV</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Painel de Administração
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Gestão de emissões M3U, novos canais ao vivo e diagnósticos de rede.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-[#101624] p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('channels')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'channels' 
                ? 'bg-[#00B5FF] text-slate-950 shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Canais ({channels.length})
          </button>
          <button
            onClick={() => setActiveTab('playlists')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'playlists' 
                ? 'bg-[#00B5FF] text-slate-950 shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Listas M3U ({playlists.length})
          </button>
        </div>
      </div>

      {/* Analytics Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#121828] border border-white/10 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Radio size={24} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Canais Ativos</span>
            <h3 className="text-xl font-bold text-white">{channels.length}</h3>
          </div>
        </div>

        <div className="bg-[#121828] border border-white/10 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Status Emissão</span>
            <h3 className="text-xl font-bold text-white">100% Online</h3>
          </div>
        </div>

        <div className="bg-[#121828] border border-white/10 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Layers size={24} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Categorias</span>
            <h3 className="text-xl font-bold text-white">{Object.keys(Category).length}</h3>
          </div>
        </div>

        <div className="bg-[#121828] border border-white/10 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Server size={24} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Servidor HLS</span>
            <h3 className="text-xl font-bold text-white">Cloud CDN</h3>
          </div>
        </div>
      </div>

      {activeTab === 'channels' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Channel Form */}
          <div className="bg-[#101625] border border-white/10 rounded-2xl p-6 h-fit space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-base border-b border-white/10 pb-3">
              <Plus size={18} className="text-cyan-400" />
              <span>Adicionar Novo Canal</span>
            </div>

            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Nome do Canal</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: TPA 3 HD" 
                  required
                  className="w-full bg-[#182033] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">URL de Emissão (HLS / M3U8 / MP4 / YouTube)</label>
                <input 
                  type="url" 
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="https://servidor.com/stream.m3u8" 
                  required
                  className="w-full bg-[#182033] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full bg-[#182033] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {Object.values(Category).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">País de Origem</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value as Country)}
                    className="w-full bg-[#182033] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {Object.values(Country).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Marca d'água (Marca d'água 2 letras)</label>
                <input 
                  type="text" 
                  value={watermark}
                  onChange={(e) => setWatermark(e.target.value.toUpperCase())}
                  maxLength={4}
                  placeholder="Ex: TP" 
                  className="w-full bg-[#182033] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 uppercase font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#00B5FF] hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <Plus size={16} />
                <span>Cadastrar Canal no Sistema</span>
              </button>
            </form>
          </div>

          {/* Channels Catalog Table */}
          <div className="lg:col-span-2 bg-[#101625] border border-white/10 rounded-2xl p-6 flex flex-col">
            <h3 className="text-sm font-bold text-white mb-4">Canais Cadastrados</h3>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#182033] text-gray-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Canal</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">País</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {channels.map((chan) => (
                    <tr key={chan.id} className="hover:bg-white/5">
                      <td className="p-3 font-mono text-cyan-400 font-bold">{chan.channelNumber || '000'}</td>
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white ${chan.logoColor}`}>
                          {chan.watermark || 'TV'}
                        </div>
                        {chan.name}
                      </td>
                      <td className="p-3">{chan.category}</td>
                      <td className="p-3">{chan.country}</td>
                      <td className="p-3">
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                          ONLINE
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onDeleteChannel(chan.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Remover canal"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'playlists' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Import M3U Form */}
          <div className="bg-[#101625] border border-white/10 rounded-2xl p-6 h-fit space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-base border-b border-white/10 pb-3">
              <Upload size={18} className="text-cyan-400" />
              <span>Importar Lista M3U / M3U8</span>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Nome da Lista</label>
                <input 
                  type="text" 
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="Ex: IPTV Angola Premium 2026" 
                  required
                  className="w-full bg-[#182033] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">URL M3U Externa</label>
                <input 
                  type="url" 
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="https://exemplo.com/minha-lista.m3u" 
                  required
                  className="w-full bg-[#182033] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#00B5FF] hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <FileCode size={16} />
                <span>Sincronizar Lista M3U</span>
              </button>
            </form>
          </div>

          {/* List of M3U Playlists */}
          <div className="lg:col-span-2 bg-[#101625] border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Listas Sincronizadas</h3>
            
            <div className="space-y-3">
              {playlists.map((pl) => (
                <div key={pl.id} className="p-4 rounded-xl bg-[#182033] border border-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{pl.name}</h4>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{pl.url}</p>
                    <span className="text-[10px] text-cyan-400 font-semibold mt-1 inline-block">
                      {pl.channelsCount} canais carregados • Atualizado: {pl.lastUpdated}
                    </span>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold">
                    Ativa
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
