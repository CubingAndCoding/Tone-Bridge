import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IonButton,
  IonIcon,
  IonTextarea,
  IonRange,
  IonLabel,
  IonItem,
  IonFabButton,
  IonContent,
  IonCard,
  IonCardContent,
  IonList,
  IonItemGroup,
  IonChip,
  IonBadge,
} from '@ionic/react';
import { 
  playOutline, 
  pauseOutline, 
  stopOutline, 
  volumeHighOutline,
  chevronDownOutline,
  chevronUpOutline,
  closeOutline
} from 'ionicons/icons';
import { VoiceOption, TTSRequest, TTSResponse } from '../../types';
import { ApiUtils } from '../../utils';

interface TextToSpeechProps {
  isOpen: boolean;
  onClose: () => void;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ isOpen, onClose }) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const [presentingElement, setPresentingElement] = useState<HTMLElement | null>(null);
  
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [volume, setVolume] = useState(0.8);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [voiceOptions, setVoiceOptions] = useState<VoiceOption[]>([]);

  // Set presenting element for card modal
  useEffect(() => {
    setPresentingElement(document.querySelector('ion-router-outlet') || document.body);
  }, []);

  // Load available voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      if (window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        const professionalVoices = voices
          .filter(voice => voice.lang.startsWith('en'))
          .filter(voice => {
            const voiceName = voice.name.toLowerCase();
            // Block novelty voices but allow professional ones
            const isNovelty = voiceName.includes('funny') || 
                             voiceName.includes('joke') || 
                             voiceName.includes('cartoon') ||
                             voiceName.includes('robot') ||
                             voiceName.includes('alien') ||
                             voiceName.includes('monster') ||
                             voiceName.includes('baby') ||
                             voiceName.includes('child') ||
                             voiceName.includes('whisper') ||
                             voiceName.includes('singing') ||
                             voiceName.includes('echo') ||
                             voiceName.includes('chorus') ||
                             voiceName.includes('rocko') ||
                             voiceName.includes('shelley') ||
                             voiceName.includes('grandma') ||
                             voiceName.includes('grandpa') ||
                             voiceName.includes('flo') ||
                             voiceName.includes('eddy') ||
                             voiceName.includes('reed') ||
                             voiceName.includes('sandy') ||
                             voiceName.includes('bahh') ||
                             voiceName.includes('albert') ||
                             voiceName.includes('jester') ||
                             voiceName.includes('organ') ||
                             voiceName.includes('cellos') ||
                             voiceName.includes('zarvox') ||
                             voiceName.includes('bells') ||
                             voiceName.includes('trinoids') ||
                             voiceName.includes('boing') ||
                             voiceName.includes('good news') ||
                             voiceName.includes('wobble') ||
                             voiceName.includes('bad news') ||
                             voiceName.includes('bubbles') ||
                             voiceName.includes('tessa');
            
            // Allow all voices except novelty ones
            return !isNovelty;
          })
          .map((voice) => {
            const voiceName = voice.name.toLowerCase();
            let gender: 'female' | 'male' | 'neutral' = 'neutral';
            
            // Professional gender detection based on voice name patterns
            if (voiceName.includes('female') || voiceName.includes('woman') || voiceName.includes('zira') || voiceName.includes('samantha') || voiceName.includes('victoria')) {
              gender = 'female';
            } else if (voiceName.includes('male') || voiceName.includes('man') || voiceName.includes('david') || voiceName.includes('alex') || voiceName.includes('daniel')) {
              gender = 'male';
            }

            // Create professional description based on actual voice characteristics
            let description = '';
            if (voiceName.includes('google')) {
              description = `Google's high-quality ${voice.lang} voice`;
            } else if (voiceName.includes('microsoft')) {
              description = `Microsoft's professional ${voice.lang} voice`;
            } else if (voiceName.includes('apple') || voiceName.includes('siri')) {
              description = `Apple's natural ${voice.lang} voice`;
            } else if (voiceName.includes('amazon') || voiceName.includes('alexa')) {
              description = `Amazon's clear ${voice.lang} voice`;
            } else {
              description = `Professional ${voice.lang} voice`;
            }

            return {
              id: voice.name,
              name: voice.name,
              language: voice.lang,
              gender,
              description
            };
          })
          // Remove duplicates based on voice name
          .filter((voice, index, self) => 
            index === self.findIndex(v => v.name === voice.name)
          );

        setVoiceOptions(professionalVoices);
        
        // Set default voice if none selected
        if (!selectedVoice && professionalVoices.length > 0) {
          setSelectedVoice(professionalVoices[0].id);
        }
      }
    };

    // Load voices immediately if available
    loadVoices();

    // Also load voices when they become available (some browsers load them asynchronously)
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedVoice]);

  const handleTextToSpeech = async () => {
    if (!text.trim()) return;

    setIsProcessing(true);
    try {
      // Check if speech synthesis is supported
      if (!window.speechSynthesis) {
        throw new Error('Speech synthesis not supported in this browser');
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text.trim());
      
      // Set voice if available
      const voices = window.speechSynthesis.getVoices();
      const selectedVoiceObj = voices.find(v => v.name === selectedVoice);
      
      if (selectedVoiceObj) {
        utterance.voice = selectedVoiceObj;
      }

      // Set speech parameters
      utterance.rate = speed;
      utterance.pitch = pitch;
      utterance.volume = volume;

      // Set event handlers
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsProcessing(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        setIsProcessing(false);
      };

      // Start speaking
      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error('TTS Error:', error);
      setIsProcessing(false);
    }
  };

  // Function to preview a specific voice
  const previewVoice = (voiceId: string) => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices();
    const voiceObj = voices.find(v => v.name === voiceId);
    
    if (voiceObj) {
      const utterance = new SpeechSynthesisUtterance("This is a preview of this voice for accessibility purposes.");
      utterance.voice = voiceObj;
      utterance.rate = speed;
      utterance.pitch = pitch;
      utterance.volume = volume;
      
      utterance.onend = () => {
        // Voice preview completed
      };
      
      utterance.onerror = (event) => {
        console.error('Voice preview error:', event);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePlay = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

      return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            paddingTop: '4rem'
          }}
          onClick={onClose} // Close when clicking backdrop
        >
          <motion.div
            initial={{ 
              opacity: 0, 
              scale: 0.85, 
              y: 30,
              rotateX: -15
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              rotateX: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.85, 
              y: 30,
              rotateX: 15
            }}
            transition={{ 
              type: "spring",
              damping: 20,
              stiffness: 400,
              duration: 0.25
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
            style={{
              background: 'var(--ion-background-color)',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--ion-color-light-shade)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.2 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem 1.5rem 1rem 1.5rem',
                borderBottom: '1px solid var(--ion-color-light-shade)',
                position: 'relative'
              }}
            >
              <h2 style={{ 
                margin: 0, 
                fontSize: '1.5rem', 
                fontWeight: '600',
                color: 'var(--ion-text-color)'
              }}>
                Text to Speech (Beta)
              </h2>
              
              {/* Close button positioned absolutely */}
              <IonButton
                fill="clear"
                size="small"
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  '--padding-start': '8px',
                  '--padding-end': '8px',
                  minWidth: 'auto',
                  height: '40px',
                  width: '40px',
                  borderRadius: '50%',
                  background: 'var(--ion-color-light)',
                  color: 'var(--ion-color-medium)',
                  zIndex: 1000
                }}
              >
                <IonIcon icon={closeOutline} size="small" />
              </IonButton>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '1rem 1.5rem',
                paddingLeft: '2rem', 
                paddingRight: '2rem',
                maxWidth: '500px',
                margin: '0 auto'
              }}
            >
              {/* Beta Testing Notice */}
              <div
                style={{
                  background: 'var(--ion-color-primary-tint)',
                  color: 'var(--ion-color-primary-contrast)',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  fontSize: '0.9rem',
                  border: '1px solid var(--ion-color-primary-shade)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  textAlign: 'center'
                }}
              >
                <IonIcon 
                  icon={volumeHighOutline} 
                  style={{ 
                    fontSize: '1.5rem',
                    marginBottom: '8px',
                    display: 'block',
                    margin: '0 auto 8px auto'
                  }} 
                />
                <div>
                  <strong style={{ display: 'block', marginBottom: '6px', fontSize: '1rem' }}>
                    Beta Testing
                  </strong>
                  <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                    Voice options may vary by device. Deaf users may need family/friends to help choose a suitable voice.
                  </div>
                </div>
              </div>

          {/* Text input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ 
              marginBottom: '0.5rem', 
              fontSize: '1.1rem',
              fontWeight: '600',
              color: 'var(--ion-text-color)'
            }}>
              Text to Convert
            </h3>
            <IonItem style={{ 
              background: 'transparent',
              '--border-color': 'var(--ion-color-light-shade)',
              '--border-radius': '8px',
              '--padding-start': '0',
              '--padding-end': '0',
              '--inner-padding-start': '0',
              '--inner-padding-end': '0'
            }}>
              <IonTextarea
                value={text}
                onIonInput={(e) => setText(e.detail.value || '')}
                placeholder="Enter text to convert to speech..."
                rows={4}
                style={{ 
                  fontSize: '1rem',
                  '--border-radius': '8px',
                  '--border-color': 'var(--ion-color-medium)',
                  '--border-style': 'solid',
                  '--border-width': '1px',
                  '--padding-start': '12px',
                  '--padding-end': '12px',
                  '--padding-top': '12px',
                  '--padding-bottom': '12px'
                }}
              />
            </IonItem>
          </div>

          {/* Convert to Speech Button - Moved to top for accessibility */}
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <IonButton
              color="primary"
              onClick={handleTextToSpeech}
              disabled={!text.trim() || isProcessing}
              style={{ flex: 1 }}
            >
              {isProcessing ? 'Processing...' : 'Convert to Speech'}
            </IonButton>
          </div>

          {/* Volume control */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ 
              marginBottom: '0.5rem', 
              fontSize: '1.1rem',
              fontWeight: '600',
              color: 'var(--ion-text-color)'
            }}>
              Volume
            </h3>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem'
            }}>
              <IonRange
                value={volume}
                onIonInput={(e) => setVolume(e.detail.value as number)}
                min={0}
                max={1}
                step={0.1}
                style={{ flex: 1 }}
              />
              <span style={{ 
                minWidth: '3rem',
                textAlign: 'center',
                color: 'var(--ion-text-color)'
              }}>
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>

          {/* Voice selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ 
              marginBottom: '1rem', 
              fontSize: '1.1rem',
              fontWeight: '600',
              color: 'var(--ion-text-color)'
            }}>
              Voice Selection
            </h3>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '0.75rem',
              width: '100%',
              alignItems: 'center'
            }}>
              {voiceOptions.map((voice) => (
                <div
                  key={voice.id}
                  style={{
                    width: '95%',
                    position: 'relative',
                    margin: '0 auto'
                  }}
                >
                  <IonButton
                    fill={selectedVoice === voice.id ? 'solid' : 'outline'}
                    color={selectedVoice === voice.id ? 'primary' : 'primary'}
                    style={{
                      width: '100%',
                      height: 'auto',
                      padding: '0.75rem',
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: '500',
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                      outline: '2px solid transparent',
                      outlineOffset: '2px',
                      transition: 'all 0.2s ease',
                      '--border-radius': '12px',
                      '--padding-start': '0.75rem',
                      '--padding-end': '0.75rem',
                      '--padding-top': '0.75rem',
                      '--padding-bottom': '0.75rem'
                    }}
                    onClick={() => setSelectedVoice(voice.id)}
                    onFocus={(e) => {
                      e.target.style.outlineColor = 'var(--ion-outline-color, var(--ion-color-primary))';
                    }}
                    onBlur={(e) => {
                      e.target.style.outlineColor = 'transparent';
                    }}
                  >
                    <div style={{ 
                      width: '100%',
                      textAlign: 'center'
                    }}>
                      <div style={{ 
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '0.25rem'
                      }}>
                        {voice.name}
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem',
                        opacity: 0.8
                      }}>
                        {voice.language} • {voice.gender}
                        {voice.gender === 'neutral' && (
                          <span style={{ 
                            fontSize: '0.7rem',
                            opacity: 0.6,
                            marginLeft: '0.25rem'
                          }}>
                            (auto-detected)
                          </span>
                        )}
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem',
                        opacity: 0.7,
                        marginTop: '0.25rem'
                      }}>
                        {voice.description}
                      </div>
                    </div>
                  </IonButton>
                  
                                      {/* Preview button - positioned as a floating action button */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.3)',
                        zIndex: 10,
                        transition: 'all 0.2s ease',
                        background: 'var(--ion-color-success)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        previewVoice(voice.id);
                      }}
                      title="Preview this voice"
                    >
                      <IonIcon 
                        icon={playOutline} 
                        style={{ 
                          fontSize: '14px',
                          color: 'var(--ion-color-success-contrast)'
                        }} 
                      />
                    </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <h3 style={{ 
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'var(--ion-text-color)'
              }}>
                Advanced Settings
              </h3>
              <IonButton
                fill="clear"
                size="small"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                style={{ 
                  color: 'var(--ion-color-primary)',
                  padding: '0.5rem'
                }}
              >
                <IonIcon 
                  icon={showAdvancedSettings ? chevronUpOutline : chevronDownOutline}
                  style={{ fontSize: '1rem' }}
                />
              </IonButton>
            </div>
            
            {showAdvancedSettings && (
              <div
                style={{
                  overflow: 'hidden',
                  border: '1px solid var(--ion-border-color)',
                  borderRadius: '8px',
                  padding: '1rem',
                  background: 'var(--ion-color-light-shade)',
                  marginTop: '0.5rem'
                }}
              >
                {/* Speed control */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <IonLabel style={{ color: 'var(--ion-text-color)' }}>
                      Speed
                    </IonLabel>
                    <span style={{ 
                      color: 'var(--ion-text-color)',
                      fontSize: '0.875rem'
                    }}>
                      {speed}x
                    </span>
                  </div>
                  <IonRange
                    value={speed}
                    onIonInput={(e) => setSpeed(e.detail.value as number)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Pitch control */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <IonLabel style={{ color: 'var(--ion-text-color)' }}>
                      Pitch
                    </IonLabel>
                    <span style={{ 
                      color: 'var(--ion-text-color)',
                      fontSize: '0.875rem'
                    }}>
                      {pitch}x
                    </span>
                  </div>
                  <IonRange
                    value={pitch}
                    onIonInput={(e) => setPitch(e.detail.value as number)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Audio controls */}
          {audioUrl && (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              {isPlaying ? (
                <IonButton
                  color="warning"
                  onClick={handlePause}
                  style={{ flex: 1 }}
                >
                  <IonIcon icon={pauseOutline} slot="start" />
                  Pause
                </IonButton>
              ) : (
                <IonButton
                  color="success"
                  onClick={handlePlay}
                  style={{ flex: 1 }}
                >
                  <IonIcon icon={playOutline} slot="start" />
                  Play
                </IonButton>
              )}
              <IonButton
                color="danger"
                onClick={handleStop}
                style={{ flex: 1 }}
              >
                <IonIcon icon={stopOutline} slot="start" />
                Stop
              </IonButton>
            </div>
          )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TextToSpeech; 