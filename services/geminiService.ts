
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const performDeepReasoning = async (prompt: string): Promise<{text: string, sources?: any[]}> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: "Eres OmniAssist, un asistente de sistema Android avanzado con acceso a servicios de accesibilidad, certificados CA y superposición de pantalla. Tu objetivo es ayudar al usuario a navegar por su dispositivo, explicar lo que hay en pantalla y automatizar tareas complejas. Utiliza razonamiento profundo para deducir intenciones y proveer soluciones técnicas precisas.",
      thinkingConfig: { thinkingBudget: 32768 },
      tools: [{ googleSearch: {} }]
    },
  });

  return {
    text: response.text || "No response generated.",
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};

export const performOCRAndTranslate = async (imageBase64: string, targetLanguage: string = 'Spanish'): Promise<string> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
        { text: `Extrae todo el texto de esta imagen y tradúcelo a ${targetLanguage}. Devuelve el resultado en un formato markdown limpio y estructurado.` }
      ]
    }
  });
  return response.text || "No text detected.";
};

export const translateScreenFrame = async (imageBase64: string, targetLanguage: string = 'Spanish'): Promise<string> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
        { text: `Esto es una captura de pantalla en tiempo real de Android. Traduce brevemente el texto principal y mensajes visibles a ${targetLanguage}. Si la pantalla está vacía, di "Esperando contenido...". Mantén la respuesta extremadamente corta.` }
      ]
    }
  });
  return response.text || "";
};

export const getDubbingScriptFromFrame = async (imageBase64: string, targetLanguage: string = 'Spanish'): Promise<string> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
        { text: `Analiza este frame de video. Si hay alguien hablando, sugiere un guion de doblaje corto y natural en ${targetLanguage}. Si es una escena sin voces, sugiere una narración descriptiva. Devuelve ÚNICAMENTE el texto del guion.` }
      ]
    }
  });
  return response.text || "";
};

export const generateAudioDub = async (text: string, voice: string = 'Kore'): Promise<string> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });
  
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
};

export const decodeAudio = async (base64: string, ctx: AudioContext): Promise<AudioBuffer> => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const dataInt16 = new Int16Array(bytes.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
};
