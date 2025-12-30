
import React, { useState, useEffect } from 'react';
import { AppTab, SystemStatus, AssistantInsight } from './types';
import Dashboard from './components/Dashboard';
import OCRModule from './components/OCRModule';
import OverlaySimulator from './components/OverlaySimulator';
import ChatInterface from './components/ChatInterface';
import DubbingModule from './components/DubbingModule';
import Settings from './components/Settings';
import FloatingAssistant from './components/FloatingAssistant';
import AndroidGuide from './components/AndroidGuide';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [status, setStatus] = useState<SystemStatus>({
    accessibility: true,
    caCert: true,
    backgroundService: true,
    overlayActive: false,
    wakeWordDetection: true,
    voiceSynthesis: true,
    drawOverApps: true
  });

  const [insights, setInsights] = useState<AssistantInsight[]>([
    { id: '1', type: 'info', text: 'Kernel de IA sincronizado con servicios de accesibilidad.', timestamp: new Date() },
    { id: '2', type: 'action', text: 'Certificado CA detectado y verificado en Android 14.', timestamp: new Date() }
  ]);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD: return <Dashboard status={status} insights={insights} onToggle={(key) => setStatus(prev => ({...prev, [key]: !prev[key as keyof SystemStatus]}))} />;
      case AppTab.OCR: return <OCRModule />;
      case AppTab.OVERLAY: return <OverlaySimulator />;
      case AppTab.CHAT: return <ChatInterface voiceSynthesis={status.voiceSynthesis} />;
      case AppTab.DUBBING: return <DubbingModule />;
      case AppTab.SETTINGS: return <Settings status={status} onToggle={(key) => setStatus(prev => ({...prev, [key]: !prev[key as keyof SystemStatus]}))} />;
      case AppTab.ANDROID_GUIDE: return <AndroidGuide />;
      default: return <Dashboard status={status} insights={insights} onToggle={() => {}} />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-slate-800">
      {/* System Status Bar */}
      <div className="h-8 bg-slate-900/80 backdrop-blur flex items-center justify-between px-6 text-[10px] font-bold text-slate-400 select-none z-50">
        <div className="flex gap-2">
          <span className="text-blue-500">SYSTEM-OS</span>
          <div className="flex gap-1 items-center">
            <div className={`w-1.5 h-1.5 rounded-full ${status.backgroundService ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="opacity-70 text-[8px]">{status.backgroundService ? 'SERVICES RUNNING' : 'SYSTEM IDLE'}</span>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={() => setActiveTab(AppTab.ANDROID_GUIDE)} className="text-slate-500 hover:text-white transition-colors">SDK INFO</button>
          <span className="mono">API 34</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {renderContent()}
        
        {/* Persistent Floating Assistant Overlay */}
        {status.backgroundService && (
          <FloatingAssistant 
            onTriggerChat={() => setActiveTab(AppTab.CHAT)} 
            onTriggerVision={() => setActiveTab(AppTab.OCR)}
            isActive={status.wakeWordDetection}
          />
        )}
      </div>

      {/* Navigation Bar */}
      <nav className="h-16 bg-slate-900 border-t border-slate-800 flex justify-around items-center px-2 z-50">
        <NavButton active={activeTab === AppTab.DASHBOARD} onClick={() => setActiveTab(AppTab.DASHBOARD)} label="Status" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        <NavButton active={activeTab === AppTab.OCR} onClick={() => setActiveTab(AppTab.OCR)} label="Vision" icon="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <NavButton active={activeTab === AppTab.OVERLAY} onClick={() => setActiveTab(AppTab.OVERLAY)} label="Overlay" icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        <NavButton active={activeTab === AppTab.CHAT} onClick={() => setActiveTab(AppTab.CHAT)} label="Chat" icon="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        <NavButton active={activeTab === AppTab.SETTINGS} onClick={() => setActiveTab(AppTab.SETTINGS)} label="Config" icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{active: boolean, onClick: () => void, label: string, icon: string}> = ({active, onClick, label, icon}) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${active ? 'text-blue-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
    </svg>
    <span className="text-[10px] font-medium uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
