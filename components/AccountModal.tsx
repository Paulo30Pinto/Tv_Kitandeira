import React, { useState } from 'react';
import { X, User, Shield, Lock, Check, LogIn, Key, Sparkles, Smartphone } from 'lucide-react';
import { ParentalControlSettings } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentalSettings: ParentalControlSettings;
  onUpdateParental: (settings: ParentalControlSettings) => void;
  onOpenAdmin: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  parentalSettings,
  onUpdateParental,
  onOpenAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'parental'>('profile');
  const [pinEnabled, setPinEnabled] = useState(parentalSettings.isPinEnabled);
  const [pinCode, setPinCode] = useState(parentalSettings.pinCode);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveParental = () => {
    onUpdateParental({
      isPinEnabled: pinEnabled,
      pinCode: pinCode || '0000',
      blockAdultContent: pinEnabled,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[4000] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-[#0f1424] border border-white/10 rounded-t-3xl sm:rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00B5FF] to-blue-600 flex items-center justify-center text-slate-950 font-black">
              <User size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Minha Conta TeIP</h3>
              <p className="text-[11px] text-slate-400">Perfil & Preferências de Transmissão</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/5 bg-[#0a0e1a] p-1.5 gap-1.5 mx-4 my-3 rounded-xl">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-[#141a2c] text-[#00B5FF] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Perfil do Utilizador
          </button>
          <button
            onClick={() => setActiveTab('parental')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'parental'
                ? 'bg-[#141a2c] text-[#00B5FF] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Controlo Parental
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {activeTab === 'profile' ? (
            <div className="space-y-4">
              <div className="bg-[#141a2c] border border-white/5 rounded-2xl p-4 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00B5FF] to-blue-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg">
                  TP
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Assinante TeIP Play</h4>
                  <p className="text-xs text-cyan-400 font-medium">Plano Nacional & Internacional Gratuito</p>
                  <span className="inline-block mt-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                    ● Acesso Ativo
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={() => {
                    onClose();
                    onOpenAdmin();
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#141a2c] hover:bg-[#1b233a] border border-white/5 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-[#00B5FF]" />
                    <div>
                      <h5 className="text-xs font-bold text-white">Painel de Gestão & Canais</h5>
                      <p className="text-[10px] text-slate-400">Adicionar canais personalizados ou listas M3U</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#00B5FF] font-bold">Abrir →</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#141a2c] border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Lock size={18} className="text-[#00B5FF]" />
                    <div>
                      <h4 className="text-xs font-black text-white">Bloqueio por PIN</h4>
                      <p className="text-[10px] text-slate-400">Exigir código PIN de 4 dígitos</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={pinEnabled}
                    onChange={(e) => setPinEnabled(e.target.checked)}
                    className="w-5 h-5 accent-[#00B5FF] rounded cursor-pointer"
                  />
                </div>

                {pinEnabled && (
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <label className="text-[11px] font-bold text-slate-300">Código PIN de 4 dígitos:</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="0000"
                      className="w-full bg-[#0d1220] border border-white/10 rounded-xl px-4 py-2 text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-[#00B5FF]"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleSaveParental}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00B5FF] to-blue-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                {isSaved ? <Check size={16} /> : <Key size={16} />}
                <span>{isSaved ? 'Definições Guardadas!' : 'Guardar Alterações'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
