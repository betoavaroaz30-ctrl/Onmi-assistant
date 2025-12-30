
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
        { text: `Extract all text from this image and translate it to ${targetLanguage}. Return the result in a clean markdown format.` }
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
        { text: `This is a real-time screen capture. Briefly translate the main visible text and messages to ${targetLanguage}. If the screen is mostly empty, say "Waiting for content...". Keep it very short.` }
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
        { text: `Analyze this video frame. If there's a person speaking, suggest a short, natural-sounding dubbing script in ${targetLanguage} that matches the mood. If it's a scene without speakers, suggest a descriptive narration script. Return ONLY the script text.` }
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
