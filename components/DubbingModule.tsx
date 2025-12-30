
import React, { useState, useRef, useEffect } from 'react';
import { generateAudioDub, decodeAudio, getDubbingScriptFromFrame } from '../services/geminiService';

const DubbingModule: React.FC = () => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [voice, setVoice] = useState('Kore');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [dubbedVideoUrl, setDubbedVideoUrl] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recordCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setDubbedVideoUrl(null);
      setAudioBuffer(null);
    }
  };

  const handleAnalyzeVideo = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        const script = await getDubbingScriptFromFrame(base64);
        setText(script);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDub = async () => {
    if (!text.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const audioData = await generateAudioDub(text, voice);
      if (audioData) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        const buffer = await decodeAudio(audioData, ctx);
        setAudioBuffer(buffer);
        
        // Playback preview
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const createDubbedVideo = async () => {
    if (!videoRef.current || !audioBuffer || isMerging) return;
    
    setIsMerging(true);
    const video = videoRef.current;
    const canvas = recordCanvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const dest = audioCtx.createMediaStreamDestination();
    
    // AI Voice Source
    const aiVoiceSource = audioCtx.createBufferSource();
    aiVoiceSource.buffer = audioBuffer;
    aiVoiceSource.connect(dest);

    // Video Audio Source (Lowered/Ducked)
    const videoSource = audioCtx.createMediaElementSource(video);
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.2; // Duck original audio
    videoSource.connect(gainNode);
    gainNode.connect(dest);

    // Combine Streams
    const canvasStream = canvas.captureStream(30);
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...dest.stream.getAudioTracks()
    ]);

    const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp8,opus' });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setDubbedVideoUrl(URL.createObjectURL(blob));
      setIsMerging(false);
      video.pause();
    };

    // Start Recording
    video.currentTime = 0;
    recorder.start();
    aiVoiceSource.start();
    video.play();

    // Drawing Loop
    const drawFrame = () => {
      if (video.paused || video.ended) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      requestAnimationFrame(drawFrame);
    };
    drawFrame();

    video.onended = () => {
      recorder.stop();
      aiVoiceSource.stop();
    };
  };

  const handleShare = async () => {
    if (!dubbedVideoUrl) return;
    try {
      const response = await fetch(dubbedVideoUrl);
      const blob = await response.blob();
      const file = new File([blob], 'dubbed_video.mp4', { type: 'video/mp4' });
      
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'OmniAssist Dubbed Video',
          text: 'Generated with OmniAssist AI Virtual Assistant.',
        });
      }
    } catch (err) {
      console.error("Sharing failed:", err);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col gap-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Media Dubbing</h2>
        <div className="flex gap-1.5">
          {['Kore', 'Puck', 'Charon'].map(v => (
            <button 
              key={v}
              onClick={() => setVoice(v)}
              className={`text-[9px] px-2.5 py-1 rounded-full font-bold transition-all ${voice === v ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 text-slate-400 hover:text-slate-300'}`}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source Material</label>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
          >
            {videoUrl ? 'REPLACE VIDEO' : 'UPLOAD VIDEO'}
          </button>
        </div>

        <input type="file" ref={fileInputRef} onChange={handleVideoChange} className="hidden" accept="video/*" />

        <div className="aspect-video bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center group">
          {videoUrl ? (
            <>
              <video 
                ref={videoRef} 
                src={videoUrl} 
                crossOrigin="anonymous"
                className="w-full h-full object-contain"
                onPlay={() => dubbedVideoUrl && setDubbedVideoUrl(null)}
              />
              <button 
                onClick={handleAnalyzeVideo}
                disabled={isAnalyzing}
                className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-[9px] font-black text-blue-400 hover:bg-slate-900 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
              >
                {isAnalyzing ? 'ANALYZING...' : 'AI SCRIPT GENERATOR'}
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-600">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-[11px] font-medium italic">Upload video for context-aware dubbing</span>
            </div>
          )}
          
          {(isAnalyzing || isMerging) && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-black tracking-widest text-blue-400 animate-pulse uppercase">
                {isAnalyzing ? 'Extracting Scene Context' : 'Merging Neural Tracks'}
              </span>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={recordCanvasRef} className="hidden" />

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dubbing Script</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or generate script based on video..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 resize-none placeholder:text-slate-700 min-h-[100px]"
        />
        
        <div className="flex gap-2">
          <button 
            onClick={handleDub}
            disabled={!text.trim() || isProcessing || isMerging}
            className={`flex-1 py-3.5 rounded-xl font-black text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${
              isProcessing ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)]'
            }`}
          >
            {isProcessing ? 'SYNTHESIZING...' : 'GENERATE VOICE'}
          </button>

          {audioBuffer && (
            <button 
              onClick={createDubbedVideo}
              disabled={isMerging}
              className={`flex-1 py-3.5 rounded-xl font-black text-xs tracking-widest transition-all flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white shadow-[0_8px_20px_rgba(147,51,234,0.3)] disabled:bg-slate-800`}
            >
              {isMerging ? 'MERGING...' : 'CREATE DUBBED VIDEO'}
            </button>
          )}
        </div>
      </div>

      {dubbedVideoUrl && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100 uppercase">Dubbing Ready</p>
                <p className="text-[10px] text-slate-500 italic">Neural synthesis complete</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <a 
                href={dubbedVideoUrl} 
                download="dubbed_output.webm"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-widest flex items-center gap-2 border border-slate-700"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Save
              </a>
              <button 
                onClick={handleShare}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-widest flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {!dubbedVideoUrl && (
        <div className="flex-1 min-h-[120px] flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl p-8 text-center">
          <svg className="w-8 h-8 text-slate-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.691.346a6 6 0 01-3.86.517l-2.387-.477a2 2 0 00-1.022.547l-1.162 1.163a2 2 0 00.597 3.301l1.565.483a2 2 0 001.242-.041l2.313-.772a2 2 0 011.242-.041l1.565.483a2 2 0 002.51-1.46l.163-.548a2 2 0 011.242-1.343l2.313-.772a2 2 0 001.242-1.343l.163-.548a2 2 0 00-.597-2.138l-1.162-1.162z" />
          </svg>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
            Generate voice synthesis to unlock neural video merging
          </p>
        </div>
      )}
    </div>
  );
};

export default DubbingModule;
