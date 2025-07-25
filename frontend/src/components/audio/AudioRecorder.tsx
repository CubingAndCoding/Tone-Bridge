import React, { useState, useRef, useCallback } from 'react';
import { IonButton, IonIcon, IonText } from '@ionic/react';
import { mic, micOutline, stop, pause, play } from 'ionicons/icons';
import { AudioRecording, RecordingState } from '../../types';
import { AudioUtils } from '../../utils';
import { Button } from '../common';

interface AudioRecorderProps {
  onRecordingComplete: (recording: AudioRecording) => void;
  onRecordingError: (error: string) => void;
  disabled?: boolean;
  maxDuration?: number; // in seconds
  className?: string;
}

/**
 * Reusable Audio Recorder Component
 * Following DRY principles by providing consistent audio recording functionality
 */
const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onRecordingError,
  disabled = false,
  maxDuration = 300, // 5 minutes default
  className = '',
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const duration = (Date.now() - startTimeRef.current) / 1000;
        
        const recording: AudioRecording = {
          blob: audioBlob,
          duration,
          timestamp: new Date(),
          format: 'webm',
        };

        onRecordingComplete(recording);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
      };

      mediaRecorder.start();
      setRecordingState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        error: null,
      });

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setRecordingState(prev => ({
          ...prev,
          duration: (Date.now() - startTimeRef.current) / 1000,
        }));
      }, 100);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';
      setRecordingState(prev => ({ ...prev, error: errorMessage }));
      onRecordingError(errorMessage);
    }
  }, [onRecordingComplete, onRecordingError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop();
      setRecordingState(prev => ({ ...prev, isRecording: false }));
    }
  }, [recordingState.isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.pause();
      setRecordingState(prev => ({ ...prev, isPaused: true }));
    }
  }, [recordingState.isRecording]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isPaused) {
      mediaRecorderRef.current.resume();
      setRecordingState(prev => ({ ...prev, isPaused: false }));
    }
  }, [recordingState.isPaused]);

  // Auto-stop if max duration reached
  React.useEffect(() => {
    if (recordingState.isRecording && recordingState.duration >= maxDuration) {
      stopRecording();
    }
  }, [recordingState.duration, maxDuration, stopRecording]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const getRecordingButton = () => {
    if (recordingState.isRecording) {
      return recordingState.isPaused ? (
        <Button
          onClick={resumeRecording}
          color="success"
          size="large"
          className={className}
        >
          <IonIcon icon={play} />
          Resume
        </Button>
      ) : (
        <Button
          onClick={pauseRecording}
          color="warning"
          size="large"
          className={className}
        >
          <IonIcon icon={pause} />
          Pause
        </Button>
      );
    }

    return (
      <Button
        onClick={startRecording}
        disabled={disabled}
        color="primary"
        size="large"
        className={className}
      >
        <IonIcon icon={recordingState.isRecording ? mic : micOutline} />
        {recordingState.isRecording ? 'Recording...' : 'Start Recording'}
      </Button>
    );
  };

  return (
    <div className="audio-recorder">
      <div className="recording-controls">
        {getRecordingButton()}
        
        {recordingState.isRecording && (
          <Button
            onClick={stopRecording}
            color="danger"
            size="large"
            className={className}
          >
            <IonIcon icon={stop} />
            Stop
          </Button>
        )}
      </div>

      {recordingState.isRecording && (
        <div className="recording-info">
          <IonText>
            <p>Recording: {AudioUtils.formatDuration(recordingState.duration)}</p>
          </IonText>
        </div>
      )}

      {recordingState.error && (
        <div className="recording-error">
          <IonText color="danger">
            <p>Error: {recordingState.error}</p>
          </IonText>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder; 