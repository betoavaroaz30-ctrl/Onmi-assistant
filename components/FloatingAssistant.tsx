
import React, { useState } from 'react';

interface FloatingAssistantProps {
  onTriggerChat: () => void;
  onTriggerVision: () => void;
  isActive: boolean;
}

const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ onTriggerChat, onTriggerVision, isActive }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-20 right-4 z-[100] flex flex-col items-end gap-3">
      {/* Menu Options */}
      {isOpen && (
        <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <ActionButton onClick={() => { onTriggerVision(); setIsOpen(false); }} label="AI VISION" icon="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <ActionButton onClick={() => { onTriggerChat(); setIsOpen(false); }} label="NEURAL CHAT" icon="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </div>
      )}

      {/* Main Assistant Orb */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 group shadow-2xl ${
          isOpen ? 'bg-slate-100 scale-90' : 'bg-blue-600 hover:scale-105 active:scale-95'
        }`}
      >
        {!isOpen && (
           <div className={`absolute inset-0 rounded-full border-2 border-blue-400/50 ${isActive ? 'animate-[ping_3s_infinite]' : ''}`} />
        )}
        
        {isOpen ? (
          <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
            <svg className="w-8 h-8 text-white animate-[pulse_2s_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        )}
      </button>
    </div>
  );
};

const ActionButton: React.FC<{onClick: () => void, label: string, icon: string}> = ({ onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 py-2 px-4 rounded-full shadow-xl hover:bg-blue-600 hover:border-blue-400 group transition-all"
  >
    <span className="text-[10px] font-black text-slate-300 group-hover:text-white uppercase tracking-widest">{label}</span>
    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
    </div>
  </button>
);

export default FloatingAssistant;
