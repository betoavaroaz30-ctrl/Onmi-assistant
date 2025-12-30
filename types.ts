
export enum AppTab {
  DASHBOARD = 'dashboard',
  OCR = 'ocr',
  OVERLAY = 'overlay',
  CHAT = 'chat',
  DUBBING = 'dubbing',
  SETTINGS = 'settings',
  ANDROID_GUIDE = 'guide'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface AssistantInsight {
  id: string;
  type: 'action' | 'info' | 'warning';
  text: string;
  timestamp: Date;
}

export interface SystemStatus {
  accessibility: boolean;
  caCert: boolean;
  backgroundService: boolean;
  overlayActive: boolean;
  wakeWordDetection: boolean;
  voiceSynthesis: boolean;
  drawOverApps: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
}
