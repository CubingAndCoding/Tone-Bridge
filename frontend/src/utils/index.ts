/**
 * ToneBridge Frontend - Centralized Utility Functions
 * Following DRY principles by providing reusable utilities
 */

import { AppError, ApiResponse, UserSettings, TranscriptionSegment } from '../types';

// API Utilities
export class ApiUtils {
  private static baseUrl = (window as any).__ENV__?.REACT_APP_API_URL || 'http://localhost:5000';
  private static timeout = 30000;

  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw new Error(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async upload<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }
}

// Audio Utilities
export class AudioUtils {
  static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  static async getAudioDuration(blob: Blob): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => resolve(audio.duration);
      audio.src = URL.createObjectURL(blob);
    });
  }

  static validateAudioFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 16 * 1024 * 1024; // 16MB
    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/flac'];

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds 16MB limit' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Unsupported file format' };
    }

    return { isValid: true };
  }
}

// Storage Utilities
export class StorageUtils {
  private static prefix = 'tonebridge_';

  static set(key: string, value: any, expiresIn?: number): void {
    const item = {
      value,
      timestamp: Date.now(),
      expiresAt: expiresIn ? Date.now() + expiresIn : undefined,
    };
    localStorage.setItem(this.prefix + key, JSON.stringify(item));
  }

  static get<T>(key: string): T | null {
    const item = localStorage.getItem(this.prefix + key);
    if (!item) return null;

    try {
      const parsed = JSON.parse(item);
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }
      return parsed.value;
    } catch {
      return null;
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  static clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }

  static getSettings(): UserSettings {
    return this.get<UserSettings>('settings') || {
      theme: 'modern-blue',
      fontSize: 'medium',
      showEmojis: true,
      showTags: true,
      autoSave: true,
      accessibility: {
        reducedMotion: false,
        dyslexiaFriendly: false,
      },
    };
  }

  static saveSettings(settings: UserSettings): void {
    this.set('settings', settings);
  }
}

// Error Utilities
export class ErrorUtils {
  static createError(code: string, message: string, details?: any): AppError {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
    };
  }

  static handleError(error: unknown): AppError {
    if (error instanceof Error) {
      return this.createError('UNKNOWN_ERROR', error.message);
    }
    return this.createError('UNKNOWN_ERROR', 'An unknown error occurred');
  }

  static isNetworkError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes('fetch') || message.includes('network') || message.includes('abort');
  }
}

// Formatting Utilities
export class FormatUtils {
  static formatTimestamp(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static formatConfidence(confidence: number): string {
    return `${Math.round(confidence * 100)}%`;
  }

  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Validation Utilities
export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isNotEmpty(value: string): boolean {
    return value.trim().length > 0;
  }

  static isMinLength(value: string, minLength: number): boolean {
    return value.length >= minLength;
  }

  static isMaxLength(value: string, maxLength: number): boolean {
    return value.length <= maxLength;
  }
}

// Accessibility Utilities
export class AccessibilityUtils {
  static announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }

  static getContrastRatio(color1: string, color2: string): number {
    // Simplified contrast ratio calculation
    // In a real app, you'd use a proper color contrast library
    return 4.5; // Placeholder
  }

  static isHighContrastMode(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  static isReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

// Analytics Utilities
export class AnalyticsUtils {
  static trackEvent(name: string, properties?: Record<string, any>): void {
    // In a real app, you'd integrate with Google Analytics, Mixpanel, etc.
    console.log('Analytics Event:', { name, properties, timestamp: new Date() });
  }

  static trackError(error: AppError): void {
    this.trackEvent('error', {
      code: error.code,
      message: error.message,
      details: error.details,
    });
  }

  static trackTranscription(segment: TranscriptionSegment): void {
    this.trackEvent('transcription_segment', {
      textLength: segment.text.length,
      emotion: segment.emotion,
      confidence: segment.confidence,
    });
  }
}

// Theme Utilities
export class ThemeUtils {
  static getSystemTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  static applyTheme(theme: 'light' | 'dark' | 'system' | 'modern-blue' | 'warm-sunset' | 'forest-green' | 'ocean-depth' | 'neutral-gray' | 'high-contrast'): void {
    // Remove all existing theme classes
    document.documentElement.classList.remove(
      'theme-modern-blue',
      'theme-warm-sunset', 
      'theme-forest-green',
      'theme-ocean-depth',
      'theme-neutral-gray',
      'theme-high-contrast'
    );

    // Handle legacy light/dark/system themes
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      const actualTheme = theme === 'system' ? this.getSystemTheme() : theme;
      document.documentElement.setAttribute('data-theme', actualTheme);
      return;
    }

    // Apply new color palette themes
    const themeClass = `theme-${theme}`;
    document.documentElement.classList.add(themeClass);
    
    // Preserve current light/dark mode state instead of using system preference
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    
    // Apply CSS variables immediately for instant theme change
    this.applyThemeVariables(theme, isDarkMode);
    
    // Debug: Log the applied theme
    console.log('Theme applied:', {
      theme,
      themeClass,
      isDarkMode,
      dataTheme: isDarkMode ? 'dark' : 'light',
      element: document.documentElement,
      classes: document.documentElement.className,
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--ion-background-color')
    });
  }

  private static applyThemeVariables(theme: string, isDarkMode: boolean): void {
    // Define theme variables (same as in Home.tsx toggleColorScheme)
    const themeVariables: Record<string, Record<string, Record<string, string>>> = {
      'modern-blue': {
        light: {
          '--ion-color-primary': '#2563eb',
          '--ion-color-primary-rgb': '37, 99, 235',
          '--ion-color-primary-contrast': '#ffffff',
          '--ion-color-primary-shade': '#1e40af',
          '--ion-color-primary-tint': '#3b82f6',
          '--ion-background-color': '#f8fafc',
          '--ion-background-color-rgb': '248, 250, 252',
          '--ion-text-color': '#1e293b',
          '--ion-text-color-rgb': '30, 41, 59',
          '--ion-toolbar-background': '#ffffff',
          '--ion-card-background': '#ffffff',
          '--ion-modal-background': '#ffffff',
          '--ion-item-background': '#f1f5f9',
          '--ion-border-color': '#2563eb',
          '--ion-outline-color': '#1e40af',
          '--ion-color-light': '#f8fafc',
          '--ion-color-light-rgb': '248, 250, 252',
          '--ion-color-light-contrast': '#000000',
          '--ion-color-light-shade': '#e2e8f0',
          '--ion-color-light-tint': '#f1f5f9',
          '--ion-color-dark': '#1e293b',
          '--ion-color-dark-rgb': '30, 41, 59',
          '--ion-color-dark-contrast': '#ffffff',
          '--ion-color-dark-shade': '#0f172a',
          '--ion-color-dark-tint': '#334155',
          '--ion-color-medium': '#64748b',
          '--ion-color-medium-rgb': '100, 116, 139',
          '--ion-color-medium-contrast': '#ffffff',
          '--ion-color-medium-shade': '#475569',
          '--ion-color-medium-tint': '#94a3b8'
        },
        dark: {
          '--ion-color-primary': '#3b82f6',
          '--ion-color-primary-rgb': '59, 130, 246',
          '--ion-color-primary-contrast': '#ffffff',
          '--ion-color-primary-shade': '#2563eb',
          '--ion-color-primary-tint': '#60a5fa',
          '--ion-background-color': '#0f172a',
          '--ion-background-color-rgb': '15, 23, 42',
          '--ion-text-color': '#f1f5f9',
          '--ion-text-color-rgb': '241, 245, 249',
          '--ion-toolbar-background': '#1e293b',
          '--ion-card-background': '#1e293b',
          '--ion-modal-background': '#1e293b',
          '--ion-item-background': '#334155',
          '--ion-border-color': '#3b82f6',
          '--ion-outline-color': '#60a5fa',
          '--ion-color-light': '#1e293b',
          '--ion-color-light-rgb': '30, 41, 59',
          '--ion-color-light-contrast': '#ffffff',
          '--ion-color-light-shade': '#0f172a',
          '--ion-color-light-tint': '#334155',
          '--ion-color-dark': '#f1f5f9',
          '--ion-color-dark-rgb': '241, 245, 249',
          '--ion-color-dark-contrast': '#000000',
          '--ion-color-dark-shade': '#e2e8f0',
          '--ion-color-dark-tint': '#ffffff',
          '--ion-color-medium': '#94a3b8',
          '--ion-color-medium-rgb': '148, 163, 184',
          '--ion-color-medium-contrast': '#000000',
          '--ion-color-medium-shade': '#cbd5e1',
          '--ion-color-medium-tint': '#e2e8f0'
        }
      },
      'warm-sunset': {
        light: {
          '--ion-color-primary': '#f97316',
          '--ion-color-primary-rgb': '249, 115, 22',
          '--ion-color-primary-contrast': '#ffffff',
          '--ion-color-primary-shade': '#ea580c',
          '--ion-color-primary-tint': '#fb923c',
          '--ion-background-color': '#fef7ed',
          '--ion-background-color-rgb': '254, 247, 237',
          '--ion-text-color': '#292524',
          '--ion-text-color-rgb': '41, 37, 36',
          '--ion-toolbar-background': '#ffffff',
          '--ion-card-background': '#ffffff',
          '--ion-modal-background': '#ffffff',
          '--ion-item-background': '#ffedd5',
          '--ion-border-color': '#f97316',
          '--ion-outline-color': '#ea580c',
          '--ion-color-light': '#fef7ed',
          '--ion-color-light-rgb': '254, 247, 237',
          '--ion-color-light-contrast': '#000000',
          '--ion-color-light-shade': '#fed7aa',
          '--ion-color-light-tint': '#ffedd5',
          '--ion-color-dark': '#292524',
          '--ion-color-dark-rgb': '41, 37, 36',
          '--ion-color-dark-contrast': '#ffffff',
          '--ion-color-dark-shade': '#1c1917',
          '--ion-color-dark-tint': '#57534e',
          '--ion-color-medium': '#78716c',
          '--ion-color-medium-rgb': '120, 113, 108',
          '--ion-color-medium-contrast': '#ffffff',
          '--ion-color-medium-shade': '#57534e',
          '--ion-color-medium-tint': '#a8a29e'
        },
        dark: {
          '--ion-color-primary': '#fb923c',
          '--ion-color-primary-rgb': '251, 146, 60',
          '--ion-color-primary-contrast': '#000000',
          '--ion-color-primary-shade': '#f97316',
          '--ion-color-primary-tint': '#fdba74',
          '--ion-background-color': '#292524',
          '--ion-background-color-rgb': '41, 37, 36',
          '--ion-text-color': '#fef7ed',
          '--ion-text-color-rgb': '254, 247, 237',
          '--ion-toolbar-background': '#1c1917',
          '--ion-card-background': '#1c1917',
          '--ion-modal-background': '#1c1917',
          '--ion-item-background': '#57534e',
          '--ion-border-color': '#fb923c',
          '--ion-outline-color': '#fdba74',
          '--ion-color-light': '#292524',
          '--ion-color-light-rgb': '41, 37, 36',
          '--ion-color-light-contrast': '#ffffff',
          '--ion-color-light-shade': '#1c1917',
          '--ion-color-light-tint': '#57534e',
          '--ion-color-dark': '#fef7ed',
          '--ion-color-dark-rgb': '254, 247, 237',
          '--ion-color-dark-contrast': '#000000',
          '--ion-color-dark-shade': '#fed7aa',
          '--ion-color-dark-tint': '#ffffff',
          '--ion-color-medium': '#a8a29e',
          '--ion-color-medium-rgb': '168, 162, 158',
          '--ion-color-medium-contrast': '#000000',
          '--ion-color-medium-shade': '#d6d3d1',
          '--ion-color-medium-tint': '#e7e5e4'
        }
      },
      'forest-green': {
        light: {
          '--ion-color-primary': '#059669',
          '--ion-color-primary-rgb': '5, 150, 105',
          '--ion-color-primary-contrast': '#ffffff',
          '--ion-color-primary-shade': '#047857',
          '--ion-color-primary-tint': '#10b981',
          '--ion-background-color': '#f0fdf4',
          '--ion-background-color-rgb': '240, 253, 244',
          '--ion-text-color': '#14532d',
          '--ion-text-color-rgb': '20, 83, 45',
          '--ion-toolbar-background': '#ffffff',
          '--ion-card-background': '#ffffff',
          '--ion-modal-background': '#ffffff',
          '--ion-item-background': '#dcfce7',
          '--ion-border-color': '#059669',
          '--ion-outline-color': '#047857',
          '--ion-color-light': '#f0fdf4',
          '--ion-color-light-rgb': '240, 253, 244',
          '--ion-color-light-contrast': '#000000',
          '--ion-color-light-shade': '#dcfce7',
          '--ion-color-light-tint': '#f7fee7',
          '--ion-color-dark': '#14532d',
          '--ion-color-dark-rgb': '20, 83, 45',
          '--ion-color-dark-contrast': '#ffffff',
          '--ion-color-dark-shade': '#052e16',
          '--ion-color-dark-tint': '#166534',
          '--ion-color-medium': '#6b7280',
          '--ion-color-medium-rgb': '107, 114, 128',
          '--ion-color-medium-contrast': '#ffffff',
          '--ion-color-medium-shade': '#4b5563',
          '--ion-color-medium-tint': '#9ca3af'
        },
        dark: {
          '--ion-color-primary': '#10b981',
          '--ion-color-primary-rgb': '16, 185, 129',
          '--ion-color-primary-contrast': '#000000',
          '--ion-color-primary-shade': '#059669',
          '--ion-color-primary-tint': '#34d399',
          '--ion-background-color': '#052e16',
          '--ion-background-color-rgb': '5, 46, 22',
          '--ion-text-color': '#f0fdf4',
          '--ion-text-color-rgb': '240, 253, 244',
          '--ion-toolbar-background': '#14532d',
          '--ion-card-background': '#14532d',
          '--ion-modal-background': '#14532d',
          '--ion-item-background': '#166534',
          '--ion-border-color': '#10b981',
          '--ion-outline-color': '#34d399',
          '--ion-color-light': '#14532d',
          '--ion-color-light-rgb': '20, 83, 45',
          '--ion-color-light-contrast': '#ffffff',
          '--ion-color-light-shade': '#052e16',
          '--ion-color-light-tint': '#166534',
          '--ion-color-dark': '#f0fdf4',
          '--ion-color-dark-rgb': '240, 253, 244',
          '--ion-color-dark-contrast': '#000000',
          '--ion-color-dark-shade': '#dcfce7',
          '--ion-color-dark-tint': '#ffffff',
          '--ion-color-medium': '#9ca3af',
          '--ion-color-medium-rgb': '156, 163, 175',
          '--ion-color-medium-contrast': '#000000',
          '--ion-color-medium-shade': '#d1d5db',
          '--ion-color-medium-tint': '#e5e7eb'
        }
      },
      'ocean-depth': {
        light: {
          '--ion-color-primary': '#0891b2',
          '--ion-color-primary-rgb': '8, 145, 178',
          '--ion-color-primary-contrast': '#ffffff',
          '--ion-color-primary-shade': '#0e7490',
          '--ion-color-primary-tint': '#22d3ee',
          '--ion-background-color': '#f0f9ff',
          '--ion-background-color-rgb': '240, 249, 255',
          '--ion-text-color': '#0c4a6e',
          '--ion-text-color-rgb': '12, 74, 110',
          '--ion-toolbar-background': '#ffffff',
          '--ion-card-background': '#ffffff',
          '--ion-modal-background': '#ffffff',
          '--ion-item-background': '#e0f2fe',
          '--ion-border-color': '#0891b2',
          '--ion-outline-color': '#0e7490',
          '--ion-color-light': '#f0f9ff',
          '--ion-color-light-rgb': '240, 249, 255',
          '--ion-color-light-contrast': '#000000',
          '--ion-color-light-shade': '#e0f2fe',
          '--ion-color-light-tint': '#f8fafc',
          '--ion-color-dark': '#0c4a6e',
          '--ion-color-dark-rgb': '12, 74, 110',
          '--ion-color-dark-contrast': '#ffffff',
          '--ion-color-dark-shade': '#082f49',
          '--ion-color-dark-tint': '#0369a1',
          '--ion-color-medium': '#64748b',
          '--ion-color-medium-rgb': '100, 116, 139',
          '--ion-color-medium-contrast': '#ffffff',
          '--ion-color-medium-shade': '#475569',
          '--ion-color-medium-tint': '#94a3b8'
        },
        dark: {
          '--ion-color-primary': '#22d3ee',
          '--ion-color-primary-rgb': '34, 211, 238',
          '--ion-color-primary-contrast': '#000000',
          '--ion-color-primary-shade': '#0891b2',
          '--ion-color-primary-tint': '#67e8f9',
          '--ion-background-color': '#082f49',
          '--ion-background-color-rgb': '8, 47, 73',
          '--ion-text-color': '#f0f9ff',
          '--ion-text-color-rgb': '240, 249, 255',
          '--ion-toolbar-background': '#0c4a6e',
          '--ion-card-background': '#0c4a6e',
          '--ion-modal-background': '#0c4a6e',
          '--ion-item-background': '#0369a1',
          '--ion-border-color': '#22d3ee',
          '--ion-outline-color': '#67e8f9',
          '--ion-color-light': '#0c4a6e',
          '--ion-color-light-rgb': '12, 74, 110',
          '--ion-color-light-contrast': '#ffffff',
          '--ion-color-light-shade': '#082f49',
          '--ion-color-light-tint': '#0369a1',
          '--ion-color-dark': '#f0f9ff',
          '--ion-color-dark-rgb': '240, 249, 255',
          '--ion-color-dark-contrast': '#000000',
          '--ion-color-dark-shade': '#e0f2fe',
          '--ion-color-dark-tint': '#ffffff',
          '--ion-color-medium': '#94a3b8',
          '--ion-color-medium-rgb': '148, 163, 184',
          '--ion-color-medium-contrast': '#000000',
          '--ion-color-medium-shade': '#cbd5e1',
          '--ion-color-medium-tint': '#e2e8f0'
        }
      },
      'neutral-gray': {
        light: {
          '--ion-color-primary': '#6b7280',
          '--ion-color-primary-rgb': '107, 114, 128',
          '--ion-color-primary-contrast': '#ffffff',
          '--ion-color-primary-shade': '#4b5563',
          '--ion-color-primary-tint': '#9ca3af',
          '--ion-background-color': '#f9fafb',
          '--ion-background-color-rgb': '249, 250, 251',
          '--ion-text-color': '#374151',
          '--ion-text-color-rgb': '55, 65, 81',
          '--ion-toolbar-background': '#ffffff',
          '--ion-card-background': '#ffffff',
          '--ion-modal-background': '#ffffff',
          '--ion-item-background': '#f3f4f6',
          '--ion-border-color': '#6b7280',
          '--ion-outline-color': '#4b5563',
          '--ion-color-light': '#f9fafb',
          '--ion-color-light-rgb': '249, 250, 251',
          '--ion-color-light-contrast': '#000000',
          '--ion-color-light-shade': '#f3f4f6',
          '--ion-color-light-tint': '#ffffff',
          '--ion-color-dark': '#374151',
          '--ion-color-dark-rgb': '55, 65, 81',
          '--ion-color-dark-contrast': '#ffffff',
          '--ion-color-dark-shade': '#1f2937',
          '--ion-color-dark-tint': '#6b7280',
          '--ion-color-medium': '#6b7280',
          '--ion-color-medium-rgb': '107, 114, 128',
          '--ion-color-medium-contrast': '#ffffff',
          '--ion-color-medium-shade': '#4b5563',
          '--ion-color-medium-tint': '#9ca3af'
        },
        dark: {
          '--ion-color-primary': '#9ca3af',
          '--ion-color-primary-rgb': '156, 163, 175',
          '--ion-color-primary-contrast': '#000000',
          '--ion-color-primary-shade': '#6b7280',
          '--ion-color-primary-tint': '#d1d5db',
          '--ion-background-color': '#1f2937',
          '--ion-background-color-rgb': '31, 41, 55',
          '--ion-text-color': '#f9fafb',
          '--ion-text-color-rgb': '249, 250, 251',
          '--ion-toolbar-background': '#374151',
          '--ion-card-background': '#374151',
          '--ion-modal-background': '#374151',
          '--ion-item-background': '#6b7280',
          '--ion-border-color': '#9ca3af',
          '--ion-outline-color': '#d1d5db',
          '--ion-color-light': '#374151',
          '--ion-color-light-rgb': '55, 65, 81',
          '--ion-color-light-contrast': '#ffffff',
          '--ion-color-light-shade': '#1f2937',
          '--ion-color-light-tint': '#6b7280',
          '--ion-color-dark': '#f9fafb',
          '--ion-color-dark-rgb': '249, 250, 251',
          '--ion-color-dark-contrast': '#000000',
          '--ion-color-dark-shade': '#f3f4f6',
          '--ion-color-dark-tint': '#ffffff',
          '--ion-color-medium': '#9ca3af',
          '--ion-color-medium-rgb': '156, 163, 175',
          '--ion-color-medium-contrast': '#000000',
          '--ion-color-medium-shade': '#d1d5db',
          '--ion-color-medium-tint': '#e5e7eb'
        }
      },
      'high-contrast': {
        light: {
          '--ion-color-primary': '#000000',
          '--ion-color-primary-rgb': '0, 0, 0',
          '--ion-color-primary-contrast': '#ffffff',
          '--ion-color-primary-shade': '#000000',
          '--ion-color-primary-tint': '#333333',
          '--ion-background-color': '#ffffff',
          '--ion-background-color-rgb': '255, 255, 255',
          '--ion-text-color': '#000000',
          '--ion-text-color-rgb': '0, 0, 0',
          '--ion-toolbar-background': '#ffffff',
          '--ion-card-background': '#ffffff',
          '--ion-modal-background': '#ffffff',
          '--ion-item-background': '#ffffff',
          '--ion-border-color': '#000000',
          '--ion-outline-color': '#000000',
          '--ion-color-light': '#ffffff',
          '--ion-color-light-rgb': '255, 255, 255',
          '--ion-color-light-contrast': '#000000',
          '--ion-color-light-shade': '#f0f0f0',
          '--ion-color-light-tint': '#ffffff',
          '--ion-color-dark': '#000000',
          '--ion-color-dark-rgb': '0, 0, 0',
          '--ion-color-dark-contrast': '#ffffff',
          '--ion-color-dark-shade': '#000000',
          '--ion-color-dark-tint': '#333333',
          '--ion-color-medium': '#000000',
          '--ion-color-medium-rgb': '0, 0, 0',
          '--ion-color-medium-contrast': '#ffffff',
          '--ion-color-medium-shade': '#000000',
          '--ion-color-medium-tint': '#333333'
        },
        dark: {
          '--ion-color-primary': '#ffffff',
          '--ion-color-primary-rgb': '255, 255, 255',
          '--ion-color-primary-contrast': '#000000',
          '--ion-color-primary-shade': '#ffffff',
          '--ion-color-primary-tint': '#cccccc',
          '--ion-background-color': '#000000',
          '--ion-background-color-rgb': '0, 0, 0',
          '--ion-text-color': '#ffffff',
          '--ion-text-color-rgb': '255, 255, 255',
          '--ion-toolbar-background': '#000000',
          '--ion-card-background': '#000000',
          '--ion-modal-background': '#000000',
          '--ion-item-background': '#000000',
          '--ion-border-color': '#ffffff',
          '--ion-outline-color': '#ffffff',
          '--ion-color-light': '#000000',
          '--ion-color-light-rgb': '0, 0, 0',
          '--ion-color-light-contrast': '#ffffff',
          '--ion-color-light-shade': '#000000',
          '--ion-color-light-tint': '#333333',
          '--ion-color-dark': '#ffffff',
          '--ion-color-dark-rgb': '255, 255, 255',
          '--ion-color-dark-contrast': '#000000',
          '--ion-color-dark-shade': '#ffffff',
          '--ion-color-dark-tint': '#cccccc',
          '--ion-color-medium': '#ffffff',
          '--ion-color-medium-rgb': '255, 255, 255',
          '--ion-color-medium-contrast': '#000000',
          '--ion-color-medium-shade': '#ffffff',
          '--ion-color-medium-tint': '#cccccc'
        }
      }
    };

    // Apply the theme variables
    const mode = isDarkMode ? 'dark' : 'light';
    const variables = themeVariables[theme]?.[mode];
    
    if (variables) {
      Object.entries(variables).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value, 'important');
      });
    }
  }

  static applyFontSize(fontSize: 'small' | 'medium' | 'large'): void {
    // Remove existing font size classes from both html and body
    document.documentElement.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    
    // Apply new font size class to both html and body
    document.documentElement.classList.add(`font-size-${fontSize}`);
    document.body.classList.add(`font-size-${fontSize}`);
    
    // Also apply to the root element
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
      rootElement.classList.add(`font-size-${fontSize}`);
    }
    
    // Set CSS custom property on root for global access
    const fontSizeValue = fontSize === 'small' ? '0.875rem' : fontSize === 'medium' ? '1rem' : '1.25rem';
    document.documentElement.style.setProperty('--app-font-size', fontSizeValue);
    document.body.style.setProperty('--app-font-size', fontSizeValue);
    if (rootElement) {
      rootElement.style.setProperty('--app-font-size', fontSizeValue);
    }
    
    // Apply font size directly to body and root for immediate effect
    document.body.style.fontSize = fontSizeValue;
    if (rootElement) {
      rootElement.style.fontSize = fontSizeValue;
    }
    
    // Debug: Log the applied font size
    console.log('Font size applied:', {
      fontSize,
      class: `font-size-${fontSize}`,
      fontSizeValue,
      htmlClasses: document.documentElement.className,
      bodyClasses: document.body.className,
      rootClasses: rootElement?.className,
      customProperty: getComputedStyle(document.documentElement).getPropertyValue('--app-font-size'),
      bodyFontSize: getComputedStyle(document.body).fontSize,
      rootFontSize: rootElement ? getComputedStyle(rootElement).fontSize : 'N/A'
    });
  }

  static getThemeColors(): Record<string, string> {
    const style = getComputedStyle(document.documentElement);
    return {
      primary: style.getPropertyValue('--ion-color-primary').trim(),
      secondary: style.getPropertyValue('--ion-color-secondary').trim(),
      background: style.getPropertyValue('--ion-background-color').trim(),
      surface: style.getPropertyValue('--ion-color-light').trim(),
      text: style.getPropertyValue('--ion-text-color').trim(),
    };
  }
} 