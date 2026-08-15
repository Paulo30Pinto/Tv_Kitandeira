import React, { useState } from 'react';
import { ParentalControlSettings } from '../types';
import { Settings, Lock, Shield, Sliders, HardDrive, Check, X, Bell } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentalSettings: ParentalControlSettings;
  onUpdateParental: (settings: ParentalControlSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  parentalSettings,
  onUpdateParental,
}) => {
  const [pinEnabled, setPinEnabled] = useState(parentalSettings.isPinEnabled);
  const [pinCode, setPinCode] = useState(parentalSettings.pinCode);
  const [bufferSize, setBufferSize] = useState<'low' | 'medium' | 'high'>('medium');
  const [videoEngine, setVideoEngine] = useState<'hls' | 'native'>('hls');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateParental({
      isPinEnabled: pinEnabled,
      pinCode: pinCode || '0000',
      blockAdultContent: pinEnabled,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[4000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121828] border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5 text-white font-bold text-lg">
            <Settings className="text-[#00B5FF]" size={22} />
            <span>Definições do Sistema</span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-6">
          {/* Parental Control Section */}
          <div className="space-y-3 bg-[#182033]/60 p-4 rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-cyan-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Controlo Parental & PIN</h4>
                  <p className="text-[10px] text-gray-400">Bloquear canais restritos por palavra-passe</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={pinEnabled} 
                  onChange={(e) => setPinEnabled(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00B5FF]" />
              </label>
            </div>

            {pinEnabled && (
              <div className="pt-3 border-t border-white/5">
                <label className="block text-xs font-bold text-gray-300 mb-1">PIN de Acesso (4 dígitos)</label>
                <input 
                  type="password" 
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="0000"
                  className="w-full bg-[#0a0e18] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono tracking-widest text-center focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}
          </div>

          {/* Video Engine & Buffering */}
          <div className="space-y-3 bg-[#182033]/60 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-cyan-400" />
              <div>
                <h4 className="text-xs font-bold text-white">Motor de Reprodução & Buffering</h4>
                <p className="text-[10px] text-gray-400">Otimizar estabilidade e latência de streaming</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Motor HLS</label>
                <select
                  value={videoEngine}
                  onChange={(e) => setVideoEngine(e.target.value as any)}
                  className="w-full bg-[#0a0e18] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="hls">HLS.js Engine (Recomendado)</option>
                  <option value="native">HTML5 Native Video</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Tamanho do Buffer</label>
                <select
                  value={bufferSize}
                  onChange={(e) => setBufferSize(e.target.value as any)}
                  className="w-full bg-[#0a0e18] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="low">Baixa Latência (2s)</option>
                  <option value="medium">Equilibrado (5s)</option>
                  <option value="high">Máxima Estabilidade (10s)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-[10px] text-gray-500 font-mono">TeIP v2.5 IPTV Engine</span>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#00B5FF] hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            {savedSuccess ? (
              <>
                <Check size={16} />
                <span>Guardado!</span>
              </>
            ) : (
              <span>Guardar Definições</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
