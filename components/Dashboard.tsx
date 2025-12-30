
import React from 'react';
import { SystemStatus, AssistantInsight } from '../types';

interface DashboardProps {
  status: SystemStatus;
  insights: AssistantInsight[];
  onToggle: (key: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ status, insights, onToggle }) => {
  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto pb-24">
      <div className="flex flex-col items-center py-4">
        <div className="relative">
          <div className={`w-24 h-24 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center ${status.backgroundService ? 'animate-[pulse_4s_infinite]' : ''}`}>
            <div className="absolute inset-0 rounded-full border border-blue-400/20 animate-[ping_3s_infinite]" />
            <svg className={`w-12 h-12 ${status.backgroundService ? 'text-blue-400' : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-slate-950 flex items-center justify-center ${status.backgroundService ? 'bg-green-500' : 'bg-red-500'}`}>
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
          </div>
        </div>
        <h1 className="mt-4 text-xl font-bold tracking-tight">OmniAssist AI</h1>
        <p className="text-slate-500 text-sm italic">Kernel Android 12-14 Bridge</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Token Budget</span>
          <div className="flex items-end gap-1 mt-1">
            <span className="text-xl font-black text-blue-400">32.7K</span>
            <span className="text-[9px] text-slate-600 mb-1">PRO-REASONING</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-blue-500 w-4/5 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          </div>
        </div>
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inference Latency</span>
          <div className="flex items-end gap-1 mt-1">
            <span className="text-xl font-black text-purple-400">142</span>
            <span className="text-[9px] text-slate-600 mb-1">MS/KERN</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-purple-500 w-1/3 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
          </div>
        </div>
      </div>

      <section>
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 px-1 italic">Service Node Status</h3>
        <div className="grid grid-cols-1 gap-3">
          <StatusCard 
            title="Background Service" 
            active={status.backgroundService} 
            onToggle={() => onToggle('backgroundService')}
            description="Persistent AI listener & task processor"
          />
          <StatusCard 
            title="Accessibility Agent" 
            active={status.accessibility} 
            onToggle={() => onToggle('accessibility')}
            description="Read UI hierarchy for proactive context"
          />
          <StatusCard 
            title="User CA Cert" 
            active={status.caCert} 
            onToggle={() => onToggle('caCert')}
            description="Required for system-wide OCR/Traffic"
          />
          <StatusCard 
            title="System Overlay" 
            active={status.drawOverApps} 
            onToggle={() => onToggle('drawOverApps')}
            description="Draw over other apps for UI translation"
          />
        </div>
      </section>

      <section className="bg-slate-900/50 rounded-3xl p-5 border border-slate-800 shadow-inner">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Neural Insights</h3>
          <span className="text-[9px] text-slate-600 font-mono">LIVE_KERNEL_LOGS</span>
        </div>
        <div className="space-y-4">
          {insights.map(insight => (
            <div key={insight.id} className="flex gap-4 group">
              <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${insight.type === 'action' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`} />
              <div className="flex-1">
                <p className="text-xs text-slate-300 leading-snug group-hover:text-white transition-colors">{insight.text}</p>
                <span className="text-[9px] text-slate-600 font-mono mt-1 block uppercase tracking-tighter">
                  {insight.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • {insight.type.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const StatusCard: React.FC<{title: string, active: boolean, onToggle: () => void, description: string}> = ({title, active, onToggle, description}) => (
  <div className={`bg-slate-900 border rounded-2xl p-4 flex items-center justify-between transition-all group ${active ? 'border-slate-800 hover:border-blue-500/30' : 'border-slate-800/50 grayscale opacity-60'}`}>
    <div className="flex-1">
      <h3 className="font-bold text-sm tracking-tight group-hover:text-blue-400 transition-colors uppercase italic">{title}</h3>
      <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
    </div>
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-all duration-500 ${active ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-700'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${active ? 'left-7 scale-110' : 'left-1'}`} />
    </button>
  </div>
);

export default Dashboard;
