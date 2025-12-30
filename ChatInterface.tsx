
import React, { useState, useRef, useEffect } from 'react';
import { performDeepReasoning, generateAudioDub, decodeAudio } from '../services/geminiService';
import { ChatMessage, GroundingSource } from '../types';

interface ChatInterfaceProps {
  voiceSynthesis: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ voiceSynthesis }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const speakText = async (text: string) => {
    if (!voiceSynthesis) return;
    try {
      const audioData = await generateAudioDub(text.substring(0, 300), 'Kore'); // limit for TTS preview
      if (audioData) {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const buffer = await decodeAudio(audioData, audioCtxRef.current);
        const source = audioCtxRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtxRef.current.destination);
        source.start();
      }
    } catch (e) {
      console.warn("Speech synthesis failed", e);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setSources([]);

    try {
      const result = await performDeepReasoning(input);
      const modelMsg: ChatMessage = { role: 'model', text: result.text };
      setMessages(prev => [...prev, modelMsg]);
      
      if (voiceSynthesis) {
        speakText(result.text);
      }

      if (result.sources) {
        const formattedSources = result.sources.map((c: any) => ({
          title: c.web?.title || 'Resource',
          uri: c.web?.uri || '#'
        })).filter((s: any) => s.uri !== '#');
        setSources(formattedSources);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Service error. Please verify network status." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="p-4 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tighter text-slate-100 uppercase">Omni Assistant</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Neural Logic Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
           <button className={`p-2 rounded-lg border border-slate-800 ${voiceSynthesis ? 'text-blue-400 bg-blue-400/10' : 'text-slate-600'}`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-8 text-slate-500 max-w-xs mx-auto">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
              <svg className="w-16 h-16 text-slate-800 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="text-slate-200 font-bold mb-2 uppercase tracking-widest text-[11px]">Neural Bridge Ready</h4>
            <p className="text-xs leading-relaxed">System-wide assistant active. Ask me to translate, explain, or automate tasks based on your current screen context.</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[90%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/10 font-medium' 
                : 'bg-slate-900/50 border border-slate-800 text-slate-200'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4 max-w-[85%] flex flex-col gap-3">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
              </div>
              <span className="text-[9px] font-black text-blue-500/60 uppercase tracking-[0.2em] animate-pulse">Processing Deep Reasoning</span>
            </div>
          </div>
        )}

        {sources.length > 0 && (
          <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50 animate-in fade-in slide-in-from-bottom-4">
            <h4 className="text-[9px] font-black text-slate-600 uppercase mb-3 tracking-widest">Grounded Sources</h4>
            <div className="flex flex-wrap gap-2">
              {sources.map((s, i) => (
                <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-slate-800 hover:bg-slate-700 hover:text-white px-3 py-1.5 rounded-lg text-blue-400 transition-all border border-slate-700/50 font-medium">
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        )}
        <div ref={scrollRef} className="h-4" />
      </div>

      <div className="p-5 bg-slate-900/50 border-t border-slate-800/50 backdrop-blur-xl">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Type assistant command..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-3xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500/50 resize-none pr-14 transition-all placeholder:text-slate-700 shadow-inner"
            rows={2}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`absolute right-3 bottom-3 p-3 rounded-2xl transition-all ${
              !input.trim() || loading ? 'text-slate-800' : 'text-blue-500 hover:bg-blue-500/10 active:scale-95'
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
