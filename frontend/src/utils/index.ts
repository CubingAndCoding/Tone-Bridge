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
        highContrast: false,
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
      second: '2-digit',
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

  static applyTheme(theme: 'light' | 'dark' | 'system' | 'modern-blue' | 'warm-sunset' | 'forest-green' | 'ocean-depth' | 'neutral-gray'): void {
    // Remove all existing theme classes
    document.documentElement.classList.remove(
      'theme-modern-blue',
      'theme-warm-sunset', 
      'theme-forest-green',
      'theme-ocean-depth',
      'theme-neutral-gray'
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
    
    // Set data-theme for compatibility
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    
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

  static applyFontSize(fontSize: 'small' | 'medium' | 'large'): void {
    // Remove existing font size classes
    document.documentElement.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    
    // Apply new font size class
    document.documentElement.classList.add(`font-size-${fontSize}`);
    
    // Debug: Log the applied font size
    console.log('Font size applied:', {
      fontSize,
      class: `font-size-${fontSize}`,
      element: document.documentElement,
      classes: document.documentElement.className
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