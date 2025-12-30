
import React, { useState, useRef, useEffect } from 'react';
import { translateScreenFrame } from '../services/geminiService';

type OverlayMode = 'screen' | 'camera';

const LANGUAGES = [
  { code: 'Spanish', name: 'Español', flag: '🇪🇸' },
  { code: 'English', name: 'English', flag: '🇺🇸' },
  { code: 'French', name: 'Français', flag: '🇫🇷' },
  { code: 'German', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'Japanese', name: '日本語', flag: '🇯🇵' },
  { code: 'Chinese', name: '中文', flag: '🇨🇳' },
  { code: 'Portuguese', name: 'Português', flag: '🇧🇷' }
];

const OverlaySimulator: React.FC = () => {
  const [active, setActive] = useState(false);
  const [mode, setMode] = useState<OverlayMode>('screen');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [translation, setTranslation] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [captureQuality, setCaptureQuality] = useState(0.7);
  const [showConfig, setShowConfig] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<number | null>(null);

  const startOverlay = async () => {
    setErrorMessage(null);
    try {
      let mediaStream: MediaStream;
      
      if (mode === 'screen') {
        if (!navigator.mediaDevices || typeof navigator.mediaDevices.getDisplayMedia !== 'function') {
          throw new Error("Screen capture (getDisplayMedia) is not supported in this browser or environment. Note: This feature requires a secure context (HTTPS).");
        }
        mediaStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" } as any,
          audio: false
        });
      } else {
        if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
          throw new Error("Camera access (getUserMedia) is not supported in this browser.");
        }
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
      }
      
      setStream(mediaStream);
      setActive(true);
      setTranslation(autoTranslate ? 'Initializing neural auto-link...' : 'Service active. Manual scan ready.');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      if (autoTranslate) {
        startTranslationLoop();
      }
      
      mediaStream.getVideoTracks()[0].onended = () => {
        stopOverlay();
      };
    } catch (err: any) {
      console.error(`Initialization failed:`, err);
      setErrorMessage(err.message || "Failed to initialize capture service.");
      setActive(false);
    }
  };

  const stopOverlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setActive(false);
    setTranslation('');
    setErrorMessage(null);
  };

  const captureAndTranslate = async () => {
    if (!videoRef.current || !canvasRef.current || isTranslating) return;

    setIsTranslating(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx && video.readyState >= 2) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const base64Image = canvas.toDataURL('image/jpeg', captureQuality).split(',')[1];
      
      try {
        const result = await translateScreenFrame(base64Image, targetLanguage);
        setTranslation(result);
      } catch (err) {
        console.error("Neural processing error:", err);
      } finally {
        setIsTranslating(false);
      }
    } else {
        setIsTranslating(false);
    }
  };

  const startTranslationLoop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    // Immediate first pass
    setTimeout(captureAndTranslate, 500);
    // Cycle every 6 seconds for optimal responsiveness/quota balance
    intervalRef.current = window.setInterval(captureAndTranslate, 6000);
  };

  const stopTranslationLoop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (active) {
      if (autoTranslate) {
        startTranslationLoop();
      } else {
        stopTranslationLoop();
      }
    }
  }, [autoTranslate, active]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  const currentLang = LANGUAGES.find(l => l.code === targetLanguage) || LANGUAGES[0];

  return (
    <div className="h-full relative bg-slate-950 flex flex-col overflow-hidden">
      {/* Configuration Header */}
      <div className="p-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50 flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-sm font-black tracking-tighter text-slate-100 uppercase">System Overlay v4</h2>
          <div className="flex items-center gap-3 mt-1">
             <button 
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-2 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-700 hover:border-blue-500/50 transition-all text-[9px] font-bold text-slate-400"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${autoTranslate ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`} />
              CONFIG: {mode.toUpperCase()} / {currentLang.name.toUpperCase()}
            </button>
          </div>
        </div>

        <button 
          onClick={active ? stopOverlay : startOverlay}
          className={`px-5 py-2.5 rounded-xl font-black text-[10px] tracking-widest transition-all shadow-2xl uppercase ${
            active 
              ? 'bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
          }`}
        >
          {active ? 'TERMINATE SERVICE' : 'START OVERLAY'}
        </button>
      </div>

      {/* Config Dropdown */}
      {showConfig && !active && (
        <div className="absolute top-16 left-4 right-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Auto-Translation</p>
              <p className="text-[9px] text-slate-500">Automatically process visual frames</p>
            </div>
            <button 
              onClick={() => setAutoTranslate(!autoTranslate)}
              className={`w-10 h-5 rounded-full relative transition-colors ${autoTranslate ? 'bg-blue-600' : 'bg-slate-800'}`}
            >
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${autoTranslate ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div>
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Capture Source</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setMode('screen')}
                className={`py-2 rounded-lg text-xs font-bold border transition-all ${mode === 'screen' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
              >
                SCREEN CAST
              </button>
              <button 
                onClick={() => setMode('camera')}
                className={`py-2 rounded-lg text-xs font-bold border transition-all ${mode === 'camera' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
              >
                LIVE CAMERA
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Visual Fidelity</label>
              <span className="text-[9px] font-mono text-blue-400">{(captureQuality * 100).toFixed(0)}% Detail</span>
            </div>
            <input 
              type="range" 
              min="0.1" 
              max="1.0" 
              step="0.1"
              value={captureQuality}
              onChange={(e) => setCaptureQuality(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div>
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Target Language</label>
            <div className="grid grid-cols-3 gap-1">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setTargetLanguage(lang.code)}
                  className={`py-1.5 rounded-md text-[10px] font-bold border transition-all ${targetLanguage === lang.code ? 'bg-slate-100 border-white text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={() => setShowConfig(false)}
            className="w-full py-2 bg-slate-800 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest"
          >
            SAVE CONFIGURATION
          </button>
        </div>
      )}

      {/* Viewport Area */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover transition-all duration-1000 ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-105 grayscale'}`} 
        />
        <canvas ref={canvasRef} className="hidden" />

        {errorMessage && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl max-w-sm text-center animate-in zoom-in-95">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-red-400 font-bold mb-2 uppercase tracking-widest text-[11px]">Capability Error</h4>
              <p className="text-slate-300 text-xs leading-relaxed mb-4">{errorMessage}</p>
              <button 
                onClick={() => setErrorMessage(null)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {!active && !errorMessage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm z-10 p-12 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center animate-[spin_20s_linear_infinite]">
                <div className="w-12 h-12 rounded-full border border-blue-500/30" />
              </div>
              <svg className="w-8 h-8 text-slate-700 absolute inset-0 m-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-slate-100 font-bold mb-2">Neural Link Disconnected</h3>
            <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed">
              Activate the overlay to begin real-time OCR and contextual translation of your workspace.
            </p>
          </div>
        )}

        {/* Active HUD Overlay */}
        {active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
            {/* Scanning Laser - Only if autoTranslate is active */}
            {autoTranslate && (
              <div className="absolute inset-x-0 top-0 h-1 bg-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.9)] animate-[scan_4s_linear_infinite]" />
            )}
            
            {/* Corner HUD Markers */}
            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-blue-500/50" />
            <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-blue-500/50" />
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-blue-500/50" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-blue-500/50" />

            {/* Translation Output Card */}
            <div className="absolute bottom-12 w-[90%] max-w-sm bg-slate-950/85 backdrop-blur-2xl border border-blue-500/30 p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform animate-in slide-in-from-bottom-8 duration-500 pointer-events-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isTranslating ? 'bg-blue-400 animate-ping' : autoTranslate ? 'bg-green-500' : 'bg-slate-600'}`} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {mode} Stream: {targetLanguage}
                  </span>
                </div>
                
                {/* Manual Scan Button / Auto Indicator */}
                <div className="flex items-center gap-2">
                   {!autoTranslate && (
                    <button 
                      onClick={captureAndTranslate}
                      disabled={isTranslating}
                      className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 rounded text-[9px] font-black text-white transition-all uppercase"
                    >
                      {isTranslating ? 'Scanning...' : 'Scan Now'}
                    </button>
                   )}
                   <button 
                    onClick={() => setAutoTranslate(!autoTranslate)}
                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase transition-all ${autoTranslate ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}
                   >
                     {autoTranslate ? 'Auto: ON' : 'Auto: OFF'}
                   </button>
                </div>
              </div>
              
              <div className="min-h-[80px] flex items-start">
                {isTranslating && !translation ? (
                  <div className="flex flex-col gap-2 w-full">
                    <div className="h-3 w-full bg-slate-800 rounded-full animate-pulse" />
                    <div className="h-3 w-4/5 bg-slate-800 rounded-full animate-pulse" />
                  </div>
                ) : (
                  <p className="text-sm text-slate-100 font-medium leading-relaxed">
                    {translation || (autoTranslate ? "Acquiring visual context..." : "Ready for manual scan...")}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-between items-center">
                <div className="flex gap-1.5">
                    <div className="w-1 h-3 bg-blue-500/20" />
                    <div className="w-1 h-3 bg-blue-500/40" />
                    <div className="w-1 h-3 bg-blue-500/60" />
                </div>
                <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Neural Logic v4.2</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: -5%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 105%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default OverlaySimulator;
