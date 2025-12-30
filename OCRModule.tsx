
import React, { useState, useRef } from 'react';
import { performOCRAndTranslate } from '../services/geminiService';

const OCRModule: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        processImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64: string) => {
    setLoading(true);
    try {
      const base64Data = base64.split(',')[1];
      const text = await performOCRAndTranslate(base64Data);
      setResult(text);
    } catch (err) {
      setResult("Error processing image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col gap-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">AI Vision Engine</h2>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
        >
          UPLOAD IMAGE
        </button>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />

      <div className="aspect-video bg-slate-900 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center overflow-hidden relative group">
        {image ? (
          <img src={image} className="w-full h-full object-cover" alt="Captured" />
        ) : (
          <div className="text-slate-500 flex flex-col items-center">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">No image selected</span>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold animate-pulse">EXTRACTING TEXT...</span>
          </div>
        )}
      </div>

      <div className="flex-1 bg-slate-900/50 rounded-2xl p-4 border border-slate-800 overflow-y-auto">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Translation Output</h3>
        </div>
        {result ? (
          <div className="text-sm leading-relaxed text-slate-200 prose prose-invert max-w-none">
            {result}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-600 italic text-sm">
            Waiting for visual input...
          </div>
        )}
      </div>
    </div>
  );
};

export default OCRModule;
