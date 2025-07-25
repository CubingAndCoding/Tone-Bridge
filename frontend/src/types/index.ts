/**
 * ToneBridge Frontend - Centralized Type Definitions
 * Following DRY principles by defining reusable types
 */

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: number;
}

export interface TranscriptionResponse {
  transcript: string;
  confidence: number;
  model: string;
  language: string;
  emotion?: string;
  emotion_confidence?: number;
  emotion_emoji?: string;
  emotion_model?: string;
}

export interface EmotionResponse {
  emotion: string;
  confidence: number;
  emoji: string;
  model: string;
  text?: string;
  text_emotion?: EmotionResult;
  audio_emotion?: EmotionResult;
}

export interface EmotionResult {
  emotion: string;
  confidence: number;
  emoji: string;
  model: string;
}

export interface ModelsInfo {
  transcription_models: {
    whisper: boolean;
    speech_recognition: boolean;
  };
  emotion_models: {
    text_classification: boolean;
    audio_features: boolean;
  };
  supported_emotions: string[];
  emotion_emojis: Record<string, string>;
}

// Audio Recording Types
export interface AudioRecording {
  blob: Blob;
  duration: number;
  timestamp: Date;
  format: string;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  error: string | null;
}

// UI Component Props
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';
  size?: 'small' | 'default' | 'large';
  expand?: 'block' | 'full';
  fill?: 'clear' | 'default' | 'outline' | 'solid';
  shape?: 'round';
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerColor?: string;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export interface LoadingProps {
  message?: string;
  spinner?: 'bubbles' | 'circles' | 'circular' | 'crescent' | 'dots' | 'lines' | 'lines-small' | 'lines-sharp' | 'lines-sharp-small';
  duration?: number;
}

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top' | 'bottom' | 'middle';
}

// Settings Types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  showEmojis: boolean;
  showTags: boolean;
  autoSave: boolean;
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    dyslexiaFriendly: boolean;
  };
}

export interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

// Transcription Display Types
export interface TranscriptionSegment {
  id: string;
  text: string;
  emotion?: string;
  emoji?: string;
  confidence: number;
  timestamp: Date;
  isHighlighted?: boolean;
}

export interface DisplayMode {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Navigation Types
export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  title?: string;
  icon?: string;
  showInMenu?: boolean;
}

// API Configuration
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

// Accessibility Types
export interface AccessibilityConfig {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  dyslexiaFriendly: boolean;
}

// Analytics Types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

// Storage Types
export interface StorageItem {
  key: string;
  value: any;
  timestamp: Date;
  expiresAt?: Date;
} 