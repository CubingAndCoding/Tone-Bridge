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
} from '@ionic/react';
import {
  settingsOutline,
  downloadOutline,
  shareOutline,
  micOutline,
  heartOutline,
} from 'ionicons/icons';
import { AudioRecording, TranscriptionSegment, DisplayMode, UserSettings } from '../types';
import { ApiUtils, AudioUtils, StorageUtils, AnalyticsUtils, ErrorUtils } from '../utils';
import { DebugUtils } from '../utils/debug';
import { Button, Loading, Toast } from '../components/common';
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
  }, []);

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
        <IonToolbar>
          <IonTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IonIcon icon={heartOutline} />
              ToneBridge
              <IonBadge color="primary" style={{ marginLeft: '0.5rem' }}>
                {transcriptionSegments.length} segments
              </IonBadge>
            </div>
          </IonTitle>
          <IonIcon
            icon={settingsOutline}
            slot="end"
            style={{ fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem' }}
            onClick={() => setShowSettings(true)}
          />
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Main recording area */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2>Hear Beyond Words</h2>
          <p>Real-time speech-to-text with emotion detection for accessibility</p>
          
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            onRecordingError={handleRecordingError}
            disabled={isProcessing}
            maxDuration={300}
          />
        </div>

        {/* Display mode selector */}
        <div style={{ marginBottom: '1rem' }}>
          <h3>Display Mode</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {displayModes.map(mode => (
              <Button
                key={mode.id}
                onClick={() => setCurrentDisplayMode(mode)}
                color={currentDisplayMode.id === mode.id ? 'primary' : 'medium'}
                fill={currentDisplayMode.id === mode.id ? 'solid' : 'outline'}
                size="small"
              >
                {mode.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Transcription display */}
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

        {/* Action buttons */}
        {transcriptionSegments.length > 0 && (
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Button
              onClick={downloadTranscript}
              color="success"
              fill="outline"
            >
              <IonIcon icon={downloadOutline} />
              Download
            </Button>
            
            <Button
              onClick={shareTranscript}
              color="secondary"
              fill="outline"
            >
              <IonIcon icon={shareOutline} />
              Share
            </Button>
            
            <Button
              onClick={clearTranscript}
              color="danger"
              fill="outline"
            >
              Clear
            </Button>
          </div>
        )}

        {/* Settings Panel */}
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSettingsChange={handleSettingsChange}
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
