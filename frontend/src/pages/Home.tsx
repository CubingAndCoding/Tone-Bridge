import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonBadge,
  IonButton,
} from '@ionic/react';
import {
  settingsOutline,
  downloadOutline,
  shareOutline,
  micOutline,
  heartOutline,
  trashOutline,
  sunnyOutline,
  moonOutline,
} from 'ionicons/icons';
import { AudioRecording, TranscriptionSegment, DisplayMode, UserSettings } from '../types';
import { ApiUtils, AudioUtils, StorageUtils, AnalyticsUtils, ErrorUtils, ThemeUtils } from '../utils';
import { DebugUtils } from '../utils/debug';
import { Loading, Toast } from '../components/common';
import AudioRecorder from '../components/audio/AudioRecorder';
import TranscriptionDisplay from '../components/transcription/TranscriptionDisplay';
import SettingsPanel from '../components/settings/SettingsPanel';

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
    
    // Update classes
    document.documentElement.classList.remove('light-mode', 'dark-mode');
    document.documentElement.classList.add(newDarkMode ? 'dark-mode' : 'light-mode');
    
    // Re-apply current theme to ensure proper variables
    ThemeUtils.applyTheme(settings.theme);
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
          background: 'var(--ion-toolbar-background)',
          '--background': 'var(--ion-toolbar-background)',
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
          <div 
            className="action-buttons-container"
            style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              padding: '1rem',
              background: 'var(--ion-card-background)',
              borderRadius: '12px',
              marginTop: '1rem',
              width: '100%',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >

            <IonButton
              onClick={downloadTranscript}
              color={settings.theme === 'high-contrast' && !isDarkMode ? 'dark' : 'success'}
              fill="outline"
              size="default"
              className="action-button"
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
              <span style={{ marginLeft: '0.5rem' }}>Download</span>
            </IonButton>
            
            <IonButton
              onClick={shareTranscript}
              color={settings.theme === 'high-contrast' && !isDarkMode ? 'dark' : 'warning'}
              fill="outline"
              size="default"
              className="action-button"
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
              <span style={{ marginLeft: '0.5rem' }}>Share</span>
            </IonButton>

            <IonButton
              onClick={clearTranscript}
              color={settings.theme === 'high-contrast' && !isDarkMode ? 'dark' : 'danger'}
              fill="outline"
              size="default"
              className="action-button"
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
              <span style={{ marginLeft: '0.5rem' }}>Clear All</span>
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