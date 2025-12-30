
import React from 'react';
import { SystemStatus } from '../types';

interface SettingsProps {
  status: SystemStatus;
  onToggle: (key: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ status, onToggle }) => {
  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto pb-20">
      <h2 className="text-xl font-black tracking-tighter text-slate-100 uppercase">System Config</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Neural Assistant</h3>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800/50 shadow-2xl">
            <ToggleSetting 
              label="Voice Synthesis" 
              sub="Assistant talks back using Kore voice engine"
              active={status.voiceSynthesis}
              onToggle={() => onToggle('voiceSynthesis')}
            />
            <ToggleSetting 
              label="Wake-Word Detection" 
              sub="Listen for 'Omni' to activate"
              active={status.wakeWordDetection}
              onToggle={() => onToggle('wakeWordDetection')}
            />
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Security Infrastructure</h3>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            <SettingItem 
              label="User CA Certificate" 
              sub="Verified Root Certificate installed" 
              icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              status={status.caCert ? "Verified" : "Missing"}
            />
            <SettingItem 
              label="Foreground Permissions" 
              sub="Overlay and Camera access granted" 
              icon="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              status="Active"
            />
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Model Performance</h3>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-500 uppercase tracking-widest">Reasoning Depth</span>
                <span className="text-blue-400">32,768 TOKENS</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] border-t border-slate-800 pt-4">
              <span className="text-slate-500 uppercase tracking-widest font-bold">Model Engine</span>
              <span className="text-slate-200 font-mono bg-slate-950 px-2 py-1 rounded">gemini-3-pro-preview</span>
            </div>
          </div>
        </section>

        <section className="mt-4">
          <button className="w-full bg-red-500/5 hover:bg-red-500/10 text-red-500 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] border border-red-500/20 transition-all active:scale-95">
            Purge Neural Cache
          </button>
        </section>
      </div>
    </div>
  );
};

const ToggleSetting: React.FC<{label: string, sub: string, active: boolean, onToggle: () => void}> = ({ label, sub, active, onToggle }) => (
  <div className="p-5 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
    <div className="pr-4">
      <h4 className="text-sm font-bold text-slate-100">{label}</h4>
      <p className="text-[10px] text-slate-500 mt-1">{sub}</p>
    </div>
    <button 
      onClick={onToggle}
      className={`w-10 h-5 rounded-full relative transition-all duration-300 flex-shrink-0 ${active ? 'bg-blue-600' : 'bg-slate-800'}`}
    >
      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${active ? 'left-6' : 'left-1'}`} />
    </button>
  </div>
);

const SettingItem: React.FC<{label: string, sub: string, icon: string, status: string}> = ({label, sub, icon, status}) => (
  <div className="p-5 flex items-center justify-between border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 cursor-pointer transition-colors">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
        </svg>
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-200 tracking-tight">{label}</h4>
        <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>
      </div>
    </div>
    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${status === 'Verified' || status === 'Active' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5'}`}>
      {status}
    </span>
  </div>
);

export default Settings;
