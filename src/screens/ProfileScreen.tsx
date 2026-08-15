import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Crown, 
  Download, 
  History, 
  Tv, 
  Globe, 
  Bell, 
  Smartphone, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { user, showToast } = useApp();

  return (
    <div className="w-full pb-24 p-4 animate-fadeIn">
      {/* Profile Header Card */}
      <div className="relative w-full bg-gradient-to-r from-red-950/60 via-neutral-900 to-neutral-900 border border-red-600/30 rounded-3xl p-5 mb-6 shadow-2xl flex items-center gap-4">
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#E50914] shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 bg-[#E50914] text-white p-1 rounded-full shadow-md">
            <Crown size={14} className="fill-white" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-white">{user.name}</h1>
            <span className="bg-[#FFC107] text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              VIP
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">{user.email}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 bg-red-600/20 text-red-400 border border-red-500/30 text-[11px] font-bold px-3 py-1 rounded-xl">
            <ShieldCheck size={14} />
            <span>{user.tier}</span>
          </div>
        </div>
      </div>

      {/* Profile Options Sections */}
      <div className="flex flex-col gap-4">
        {/* VIP Subscription Box */}
        <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Crown size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Assinatura Angoflix VIP</h4>
              <p className="text-xs text-neutral-400">Renovação automática em 15/12/2026</p>
            </div>
          </div>
          <button
            onClick={() => showToast('Sua assinatura VIP está ativa e em dia!')}
            className="text-xs font-bold text-[#E50914] hover:underline"
          >
            Gerenciar
          </button>
        </div>

        {/* Settings Group List */}
        <div className="bg-neutral-900/60 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
          <button
            onClick={() => showToast(`Você possui ${user.downloadsCount} itens baixados`)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Download size={18} className="text-[#1DB954]" />
              <span className="text-xs sm:text-sm font-medium text-white">Downloads e Filmes Offline</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">{user.downloadsCount} arquivos</span>
              <ChevronRight size={16} className="text-neutral-500" />
            </div>
          </button>

          <button
            onClick={() => showToast('Histórico de reprodução atualizado')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <History size={18} className="text-sky-400" />
              <span className="text-xs sm:text-sm font-medium text-white">Histórico de Visualização</span>
            </div>
            <ChevronRight size={16} className="text-neutral-500" />
          </button>

          <button
            onClick={() => showToast('Modo Smart TV D-Pad ativado')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Tv size={18} className="text-purple-400" />
              <span className="text-xs sm:text-sm font-medium text-white">Navegação Smart TV (Controle Remoto)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-md font-bold">Ativado</span>
              <ChevronRight size={16} className="text-neutral-500" />
            </div>
          </button>

          <button
            onClick={() => showToast('Idioma do aplicativo: Português (Angola)')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-emerald-400" />
              <span className="text-xs sm:text-sm font-medium text-white">Idioma do App</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Português (PT-AO)</span>
              <ChevronRight size={16} className="text-neutral-500" />
            </div>
          </button>

          <button
            onClick={() => showToast('Notificações de lançamentos ativas')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-amber-400" />
              <span className="text-xs sm:text-sm font-medium text-white">Notificações e Avisos</span>
            </div>
            <ChevronRight size={16} className="text-neutral-500" />
          </button>

          <button
            onClick={() => showToast('Aplicativo PWA pronto para instalação')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Smartphone size={18} className="text-[#E50914]" />
              <span className="text-xs sm:text-sm font-medium text-white">Instalar PWA / Capacitor CLI</span>
            </div>
            <CheckCircle2 size={16} className="text-[#1DB954]" />
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => showToast('Sessão encerrada com segurança')}
          className="w-full p-4 rounded-2xl bg-red-950/20 border border-red-600/30 text-red-500 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-red-900/30 transition-colors mt-4"
        >
          <LogOut size={18} />
          <span>Sair da Conta</span>
        </button>
      </div>
    </div>
  );
};
