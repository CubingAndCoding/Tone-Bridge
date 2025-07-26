import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonActionSheet,
  IonToast,
  IonBadge,
  IonButton,
} from '@ionic/react';
import {
  settingsOutline,
  downloadOutline,
  shareOutline,
  micOutline,
  heartOutline,
  optionsOutline,
  trashOutline,
  sunnyOutline,
  moonOutline,
} from 'ionicons/icons';
import { AudioRecording, TranscriptionSegment, DisplayMode, UserSettings } from '../types';
import { ApiUtils, AudioUtils, StorageUtils, AnalyticsUtils, ErrorUtils, ThemeUtils } from '../utils';
import { DebugUtils } from '../utils/debug';
import { Button, Loading, Toast } from '../components/common';
import AudioRecorder from '../components/audio/AudioRecorder';
import TranscriptionDisplay from '../components/transcription/TranscriptionDisplay';
import SettingsPanel from '../components/settings/SettingsPanel';
import { motion, AnimatePresence } from 'framer-motion';

const Home: React.FC = () => {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionSegments, setTranscriptionSegments] = useState<TranscriptionSegment[]>([]);
  const [currentDisplayMode, setCurrentDisplayMode] = useState<DisplayMode>({
    id: 'combined',
    name: 'Combined',
    description: 'Show both emojis and tags',
    icon: 'heartOutline',
  });
  const [settings, setSettings] = useState<UserSettings>(StorageUtils.getSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Display modes
  const displayModes: DisplayMode[] = [
    {
      id: 'combined',
      name: 'Combined',
      description: 'Show both emojis and tags',
      icon: 'heartOutline',
    },
    {
      id: 'emoji-only',
      name: 'Emojis Only',
      description: 'Show only emotion emojis',
      icon: 'happyOutline',
    },
    {
      id: 'tag-only',
      name: 'Tags Only',
      description: 'Show only emotion tags',
      icon: 'textOutline',
    },
  ];

  // Initialize app
  useEffect(() => {
    AnalyticsUtils.trackEvent('page_view', { page: 'home' });
    
    // Apply saved theme
    const savedSettings = StorageUtils.getSettings();
    setSettings(savedSettings);
    ThemeUtils.applyTheme(savedSettings.theme);
    
    // Detect current color scheme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    
    // Listen for system theme changes
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  // Toggle light/dark mode
  const toggleColorScheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Get current theme
    const currentTheme = settings.theme;
    
    // Define light and dark mode variables for each theme
    const themeVariables = {
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
          '--ion-color-dark-tint': '#44403c',
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
          '--ion-background-color': '#1c1917',
          '--ion-background-color-rgb': '28, 25, 23',
          '--ion-text-color': '#fef7ed',
          '--ion-text-color-rgb': '254, 247, 237',
          '--ion-toolbar-background': '#292524',
          '--ion-card-background': '#292524',
          '--ion-modal-background': '#292524',
          '--ion-item-background': '#44403c',
          '--ion-border-color': '#fb923c',
          '--ion-outline-color': '#fdba74',
          '--ion-color-light': '#292524',
          '--ion-color-light-rgb': '41, 37, 36',
          '--ion-color-light-contrast': '#ffffff',
          '--ion-color-light-shade': '#1c1917',
          '--ion-color-light-tint': '#44403c',
          '--ion-color-dark': '#fef7ed',
          '--ion-color-dark-rgb': '254, 247, 237',
          '--ion-color-dark-contrast': '#000000',
          '--ion-color-dark-shade': '#fde68a',
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
          '--ion-text-color': '#064e3b',
          '--ion-text-color-rgb': '6, 78, 59',
          '--ion-toolbar-background': '#ffffff',
          '--ion-card-background': '#ffffff',
          '--ion-modal-background': '#ffffff',
          '--ion-item-background': '#dcfce7',
          '--ion-border-color': '#059669',
          '--ion-outline-color': '#047857',
          '--ion-color-light': '#f0fdf4',
          '--ion-color-light-rgb': '240, 253, 244',
          '--ion-color-light-contrast': '#000000',
          '--ion-color-light-shade': '#bbf7d0',
          '--ion-color-light-tint': '#dcfce7',
          '--ion-color-dark': '#064e3b',
          '--ion-color-dark-rgb': '6, 78, 59',
          '--ion-color-dark-contrast': '#ffffff',
          '--ion-color-dark-shade': '#022c22',
          '--ion-color-dark-tint': '#065f46',
          '--ion-color-medium': '#047857',
          '--ion-color-medium-rgb': '4, 120, 87',
          '--ion-color-medium-contrast': '#ffffff',
          '--ion-color-medium-shade': '#065f46',
          '--ion-color-medium-tint': '#10b981'
        },
        dark: {
          '--ion-color-primary': '#10b981',
          '--ion-color-primary-rgb': '16, 185, 129',
          '--ion-color-primary-contrast': '#000000',
          '--ion-color-primary-shade': '#059669',
          '--ion-color-primary-tint': '#34d399',
          '--ion-background-color': '#022c22',
          '--ion-background-color-rgb': '2, 44, 34',
          '--ion-text-color': '#ecfdf5',
          '--ion-text-color-rgb': '236, 253, 245',
          '--ion-toolbar-background': '#064e3b',
          '--ion-card-background': '#064e3b',
          '--ion-modal-background': '#064e3b',
          '--ion-item-background': '#065f46',
          '--ion-border-color': '#10b981',
          '--ion-outline-color': '#34d399',
          '--ion-color-light': '#064e3b',
          '--ion-color-light-rgb': '6, 78, 59',
          '--ion-color-light-contrast': '#ffffff',
          '--ion-color-light-shade': '#022c22',
          '--ion-color-light-tint': '#065f46',
          '--ion-color-dark': '#ecfdf5',
          '--ion-color-dark-rgb': '236, 253, 245',
          '--ion-color-dark-contrast': '#000000',
          '--ion-color-dark-shade': '#d1fae5',
          '--ion-color-dark-tint': '#ffffff',
          '--ion-color-medium': '#34d399',
          '--ion-color-medium-rgb': '52, 211, 153',
          '--ion-color-medium-contrast': '#000000',
          '--ion-color-medium-shade': '#6ee7b7',
          '--ion-color-medium-tint': '#a7f3d0'
        }
      },
      'ocean-depth': {
        light: {
          '--ion-color-primary': '#0891b2',
          '--ion-color-primary-rgb': '8, 145, 178',
          '--ion-color-primary-contrast': '#ffffff',
          '--ion-color-primary-shade': '#0e7490',
          '--ion-color-primary-tint': '#06b6d4',
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
          '--ion-color-light-shade': '#bae6fd',
          '--ion-color-light-tint': '#e0f2fe',
          '--ion-color-dark': '#0c4a6e',
          '--ion-color-dark-rgb': '12, 74, 110',
          '--ion-color-dark-contrast': '#ffffff',
          '--ion-color-dark-shade': '#082f49',
          '--ion-color-dark-tint': '#155e75',
          '--ion-color-medium': '#0e7490',
          '--ion-color-medium-rgb': '14, 116, 144',
          '--ion-color-medium-contrast': '#ffffff',
          '--ion-color-medium-shade': '#155e75',
          '--ion-color-medium-tint': '#06b6d4'
        },
        dark: {
          '--ion-color-primary': '#06b6d4',
          '--ion-color-primary-rgb': '6, 182, 212',
          '--ion-color-primary-contrast': '#000000',
          '--ion-color-primary-shade': '#0891b2',
          '--ion-color-primary-tint': '#22d3ee',
          '--ion-background-color': '#082f49',
          '--ion-background-color-rgb': '8, 47, 73',
          '--ion-text-color': '#f0f9ff',
          '--ion-text-color-rgb': '240, 249, 255',
          '--ion-toolbar-background': '#0c4a6e',
          '--ion-card-background': '#0c4a6e',
          '--ion-modal-background': '#0c4a6e',
          '--ion-item-background': '#155e75',
          '--ion-border-color': '#06b6d4',
          '--ion-outline-color': '#22d3ee',
          '--ion-color-light': '#0c4a6e',
          '--ion-color-light-rgb': '12, 74, 110',
          '--ion-color-light-contrast': '#ffffff',
          '--ion-color-light-shade': '#082f49',
          '--ion-color-light-tint': '#155e75',
          '--ion-color-dark': '#f0f9ff',
          '--ion-color-dark-rgb': '240, 249, 255',
          '--ion-color-dark-contrast': '#000000',
          '--ion-color-dark-shade': '#bae6fd',
          '--ion-color-dark-tint': '#ffffff',
          '--ion-color-medium': '#22d3ee',
          '--ion-color-medium-rgb': '34, 211, 238',
          '--ion-color-medium-contrast': '#000000',
          '--ion-color-medium-shade': '#67e8f9',
          '--ion-color-medium-tint': '#a5f3fc'
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
          '--ion-text-color': '#111827',
          '--ion-text-color-rgb': '17, 24, 39',
          '--ion-toolbar-background': '#ffffff',
          '--ion-card-background': '#ffffff',
          '--ion-modal-background': '#ffffff',
          '--ion-item-background': '#f3f4f6',
          '--ion-border-color': '#6b7280',
          '--ion-outline-color': '#4b5563',
          '--ion-color-light': '#f9fafb',
          '--ion-color-light-rgb': '249, 250, 251',
          '--ion-color-light-contrast': '#000000',
          '--ion-color-light-shade': '#d1d5db',
          '--ion-color-light-tint': '#f3f4f6',
          '--ion-color-dark': '#111827',
          '--ion-color-dark-rgb': '17, 24, 39',
          '--ion-color-dark-contrast': '#ffffff',
          '--ion-color-dark-shade': '#000000',
          '--ion-color-dark-tint': '#374151',
          '--ion-color-medium': '#4b5563',
          '--ion-color-medium-rgb': '75, 85, 99',
          '--ion-color-medium-contrast': '#ffffff',
          '--ion-color-medium-shade': '#374151',
          '--ion-color-medium-tint': '#6b7280'
        },
        dark: {
          '--ion-color-primary': '#9ca3af',
          '--ion-color-primary-rgb': '156, 163, 175',
          '--ion-color-primary-contrast': '#000000',
          '--ion-color-primary-shade': '#6b7280',
          '--ion-color-primary-tint': '#d1d5db',
          '--ion-background-color': '#111827',
          '--ion-background-color-rgb': '17, 24, 39',
          '--ion-text-color': '#f9fafb',
          '--ion-text-color-rgb': '249, 250, 251',
          '--ion-toolbar-background': '#1f2937',
          '--ion-card-background': '#1f2937',
          '--ion-modal-background': '#1f2937',
          '--ion-item-background': '#374151',
          '--ion-border-color': '#9ca3af',
          '--ion-outline-color': '#d1d5db',
          '--ion-color-light': '#1f2937',
          '--ion-color-light-rgb': '31, 41, 55',
          '--ion-color-light-contrast': '#ffffff',
          '--ion-color-light-shade': '#111827',
          '--ion-color-light-tint': '#374151',
          '--ion-color-dark': '#f9fafb',
          '--ion-color-dark-rgb': '249, 250, 251',
          '--ion-color-dark-contrast': '#000000',
          '--ion-color-dark-shade': '#d1d5db',
          '--ion-color-dark-tint': '#ffffff',
          '--ion-color-medium': '#d1d5db',
          '--ion-color-medium-rgb': '209, 213, 219',
          '--ion-color-medium-contrast': '#000000',
          '--ion-color-medium-shade': '#9ca3af',
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
          '--ion-item-background': '#f0f0f0',
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
          '--ion-color-medium-tint': '#333333',
          '--ion-color-secondary': '#000000',
          '--ion-color-secondary-rgb': '0, 0, 0',
          '--ion-color-secondary-contrast': '#ffffff',
          '--ion-color-secondary-shade': '#000000',
          '--ion-color-secondary-tint': '#333333'
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
          '--ion-color-medium-tint': '#cccccc',
          '--ion-color-secondary': '#ffffff',
          '--ion-color-secondary-rgb': '255, 255, 255',
          '--ion-color-secondary-contrast': '#000000',
          '--ion-color-secondary-shade': '#ffffff',
          '--ion-color-secondary-tint': '#cccccc'
        }
      }
    };
    
    // Get the variables for current theme and mode
    const variables = themeVariables[currentTheme as keyof typeof themeVariables];
    if (variables) {
      const modeVariables = newDarkMode ? variables.dark : variables.light;
      
      // Apply all variables to document root
      Object.entries(modeVariables).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value, 'important');
      });
    }
    
    // Update classes
    document.documentElement.classList.remove('light-mode', 'dark-mode');
    document.documentElement.classList.add(newDarkMode ? 'dark-mode' : 'light-mode');
  };

  // Handle recording completion
  const handleRecordingComplete = async (recording: AudioRecording) => {
    setIsProcessing(true);
    setIsRecording(false);

    try {
      // Debug: Test audio data first
      await DebugUtils.testAudioData(recording.blob, recording.format);
      
      // Convert audio to base64
      const audioBase64 = await AudioUtils.blobToBase64(recording.blob);

      // Send to backend
      const response = await ApiUtils.post<any>('/api/transcribe', {
        audio: audioBase64,
        format: recording.format,
        include_emotion: true,
      });

      if (response.success) {
        const newSegment: TranscriptionSegment = {
          id: Date.now().toString(),
          text: response.data.transcript,
          emotion: response.data.emotion,
          emoji: response.data.emotion_emoji,
          confidence: response.data.confidence,
          timestamp: new Date(),
        };

        setTranscriptionSegments(prev => [...prev, newSegment]);
        
        // Track analytics
        AnalyticsUtils.trackTranscription(newSegment);
        
        // Show success message
        showToast('Transcription completed successfully!', 'success');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const appError = ErrorUtils.handleError(error);
      showToast(`Transcription failed: ${appError.message}`, 'error');
      AnalyticsUtils.trackError(appError);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle recording error
  const handleRecordingError = (error: string) => {
    showToast(`Recording error: ${error}`, 'error');
    setIsRecording(false);
  };

  // Handle settings change
  const handleSettingsChange = (newSettings: UserSettings) => {
    setSettings(newSettings);
    showToast('Settings updated', 'success');
  };

  // Show toast message
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
  };

  // Download transcript
  const downloadTranscript = () => {
    if (transcriptionSegments.length === 0) {
      showToast('No transcript to download', 'warning');
      return;
    }

    const transcriptText = transcriptionSegments
      .map(segment => {
        const timestamp = segment.timestamp.toLocaleTimeString();
        const emotion = segment.emotion ? ` [${segment.emotion}]` : '';
        return `[${timestamp}]${emotion}: ${segment.text}`;
      })
      .join('\n\n');

    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tonebridge-transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Transcript downloaded successfully!', 'success');
    AnalyticsUtils.trackEvent('transcript_downloaded', {
      segmentCount: transcriptionSegments.length,
    });
  };

  // Clear transcript
  const clearTranscript = () => {
    setTranscriptionSegments([]);
    showToast('Transcript cleared', 'info');
  };

  // Share transcript
  const shareTranscript = async () => {
    if (transcriptionSegments.length === 0) {
      showToast('No transcript to share', 'warning');
      return;
    }

    const transcriptText = transcriptionSegments
      .map(segment => {
        const emotion = segment.emoji ? `${segment.emoji} ` : '';
        return `${emotion}${segment.text}`;
      })
      .join('\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ToneBridge Transcript',
          text: transcriptText,
        });
        showToast('Transcript shared successfully!', 'success');
      } catch (error) {
        showToast('Failed to share transcript', 'error');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(transcriptText);
        showToast('Transcript copied to clipboard!', 'success');
      } catch (error) {
        showToast('Failed to copy transcript', 'error');
      }
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{
          background: 'var(--ion-background-color)',
          '--background': 'var(--ion-background-color)',
          '--color': 'var(--ion-text-color)',
          ...(document.documentElement.classList.contains('theme-high-contrast') && 
               document.documentElement.classList.contains('dark-mode') && {
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 2px 8px rgba(255, 255, 255, 0.1)'
          })
        }}>
          <IonTitle style={{
            color: 'var(--ion-text-color)',
            '--color': 'var(--ion-text-color)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: 'var(--ion-text-color)'
            }}>
              <IonIcon icon={heartOutline} style={{ color: 'var(--ion-text-color)' }} />
              <span style={{ color: 'var(--ion-text-color)' }}>ToneBridge</span>
            </div>
          </IonTitle>
          <IonButton
            fill="clear"
            slot="end"
            onClick={toggleColorScheme}
            style={{ 
              marginRight: '0.5rem',
              color: 'var(--ion-text-color)',
              '--color': 'var(--ion-text-color)'
            }}
          >
            <IonIcon icon={isDarkMode ? moonOutline : sunnyOutline} style={{ color: 'var(--ion-text-color)' }} />
          </IonButton>
          <IonButton
            fill="clear"
            slot="end"
            onClick={() => setShowSettings(!showSettings)}
            style={{ 
              marginRight: '0.5rem',
              color: 'var(--ion-text-color)',
              '--color': 'var(--ion-text-color)'
            }}
          >
            <IonIcon icon={settingsOutline} style={{ color: 'var(--ion-text-color)' }} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Hero Section */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          padding: '1.5rem 1rem'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            background: 'linear-gradient(45deg, var(--ion-color-primary), var(--ion-color-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Hear Beyond Words
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            color: 'var(--ion-text-color)',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem auto'
          }}>
            Real-time speech-to-text with emotion detection for accessibility
          </p>
          
          {/* Main Recording Button */}
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            onRecordingError={handleRecordingError}
            disabled={isProcessing}
            maxDuration={300}
          />
        </div>

        {/* Transcription Display */}
        {transcriptionSegments.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '0.75rem'
            }}>
              <h3 style={{ 
                fontSize: '1.2rem',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                Live Transcript
                <IonBadge 
                  color="primary" 
                  style={{ 
                    fontSize: '0.8rem',
                    padding: '0.25rem 0.5rem'
                  }}
                >
                  {transcriptionSegments.length}
                </IonBadge>
              </h3>
            </div>
            <TranscriptionDisplay
              segments={transcriptionSegments}
              displayMode={currentDisplayMode}
              showTimestamps={true}
              showConfidence={settings.showTags}
              highlightCurrent={true}
              onSegmentClick={(segment) => {
                showToast(`Clicked: ${segment.text}`, 'info');
              }}
            />
          </div>
        )}

        {/* Action Buttons */}
        {transcriptionSegments.length > 0 && (
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            padding: '1rem',
            background: 'var(--ion-color-light)',
            borderRadius: '12px',
            marginTop: '1rem',
            width: '100%'
          }}>
            <IonButton
              onClick={downloadTranscript}
              color="success"
              fill="outline"
              size="default"
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                minWidth: window.innerWidth <= 460 ? 'auto' : undefined,
                padding: window.innerWidth <= 460 ? '0.5rem' : undefined
              }}
            >
              <IonIcon icon={downloadOutline} />
              {window.innerWidth > 460 && 'Download'}
            </IonButton>
            
            <IonButton
              onClick={shareTranscript}
              color="secondary"
              fill="outline"
              size="default"
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                minWidth: window.innerWidth <= 460 ? 'auto' : undefined,
                padding: window.innerWidth <= 460 ? '0.5rem' : undefined
              }}
            >
              <IonIcon icon={shareOutline} />
              {window.innerWidth > 460 && 'Share'}
            </IonButton>
            
            <IonButton
              onClick={clearTranscript}
              color="danger"
              fill="outline"
              size="default"
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                minWidth: window.innerWidth <= 460 ? 'auto' : undefined,
                padding: window.innerWidth <= 460 ? '0.5rem' : undefined
              }}
            >
              <IonIcon icon={trashOutline} />
              {window.innerWidth > 460 && 'Clear All'}
            </IonButton>
          </div>
        )}

        {/* Empty State */}
        {transcriptionSegments.length === 0 && !isProcessing && (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem 1rem',
            color: 'var(--ion-text-color)'
          }}>
            <IonIcon 
              icon={micOutline} 
              style={{ 
                fontSize: '4rem', 
                marginBottom: '1rem',
                opacity: 0.5
              }} 
            />
            <h3 style={{ marginBottom: '0.5rem' }}>Ready to Record</h3>
            <p style={{ margin: '0', fontSize: '0.9rem' }}>
              Tap the microphone button above to start your first recording
            </p>
          </div>
        )}

        {/* Settings Panel */}
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSettingsChange={handleSettingsChange}
          currentDisplayMode={currentDisplayMode}
          onDisplayModeChange={setCurrentDisplayMode}
        />

        {/* Loading overlay */}
        {isProcessing && (
          <Loading
            message="Processing audio..."
            spinner="bubbles"
          />
        )}

        {/* Toast notifications */}
        <Toast
          message={toastMessage}
          type={toastType}
          duration={3000}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;