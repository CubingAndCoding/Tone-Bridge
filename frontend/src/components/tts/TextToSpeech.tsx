import React, { useState, useRef, useEffect } from 'react';
import {
  IonButton,
  IonIcon,
  IonTextarea,
  IonRange,
  IonLabel,
  IonItem,
  IonFabButton,
} from '@ionic/react';
import { 
  playOutline, 
  pauseOutline, 
  stopOutline, 
  volumeHighOutline,
  chevronDownOutline,
  chevronUpOutline
} from 'ionicons/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceOption, TTSRequest, TTSResponse } from '../../types';
import { ApiUtils } from '../../utils';

interface TextToSpeechProps {
  isOpen: boolean;
  onClose: () => void;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ isOpen, onClose }) => {
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

  // Load available voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      if (window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        const englishVoices = voices
          .filter(voice => voice.lang.startsWith('en'))
          .map((voice, index) => {
            // Better gender detection based on voice name patterns
            const voiceName = voice.name.toLowerCase();
            let gender: 'female' | 'male' | 'neutral' = 'neutral';
            
            // Check for explicit gender indicators
            if (voiceName.includes('female') || voiceName.includes('woman') || voiceName.includes('girl')) {
              gender = 'female';
            } else if (voiceName.includes('male') || voiceName.includes('man') || voiceName.includes('boy')) {
              gender = 'male';
            } else {
              // For voices without explicit gender, try to infer from common patterns
              // Google voices often have gender in the name
              if (voiceName.includes('google')) {
                if (voiceName.includes('female') || voiceName.includes('woman')) {
                  gender = 'female';
                } else if (voiceName.includes('male') || voiceName.includes('man')) {
                  gender = 'male';
                }
              }
              // Microsoft voices often have gender indicators
              else if (voiceName.includes('microsoft')) {
                if (voiceName.includes('female') || voiceName.includes('zira')) {
                  gender = 'female';
                } else if (voiceName.includes('male') || voiceName.includes('david')) {
                  gender = 'male';
                }
              }
              // Apple voices
              else if (voiceName.includes('samantha') || voiceName.includes('victoria')) {
                gender = 'female';
              } else if (voiceName.includes('alex') || voiceName.includes('daniel')) {
                gender = 'male';
              }
            }

            // Create a better description
            let description = `${voice.lang} voice`;
            if (voiceName.includes('google')) {
              description = `Google ${voice.lang} voice`;
            } else if (voiceName.includes('microsoft')) {
              description = `Microsoft ${voice.lang} voice`;
            } else if (voiceName.includes('apple') || voiceName.includes('siri')) {
              description = `Apple ${voice.lang} voice`;
            }

            return {
              id: voice.name,
              name: voice.name,
              language: voice.lang,
              gender,
              description
            };
          });

        setVoiceOptions(englishVoices);
        
        // Set default voice if none selected
        if (!selectedVoice && englishVoices.length > 0) {
          setSelectedVoice(englishVoices[0].id);
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
      const utterance = new SpeechSynthesisUtterance("Hello, this is a sample of my voice. How do I sound?");
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
            background: (() => {
              // Check if we're in high contrast theme
              const isHighContrast = document.documentElement.classList.contains('theme-high-contrast');
              const isDarkMode = document.documentElement.classList.contains('dark-mode');
              
              if (isHighContrast) {
                // High contrast theme: use opposite color for backdrop
                if (isDarkMode) {
                  return 'rgba(255, 255, 255, 0.3)'; // White overlay on black
                } else {
                  return 'rgba(0, 0, 0, 0.7)'; // Black overlay on white
                }
              } else {
                // Regular themes: use standard dark overlay
                return 'rgba(0, 0, 0, 0.7)';
              }
            })(),
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
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1.5rem 1.5rem 1rem 1.5rem',
                borderBottom: '1px solid var(--ion-color-light-shade)'
              }}
            >
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
                Text to Speech
              </h2>
            </motion.div>

            {/* Content */}
            <div style={{ 
              flex: 1, 
              overflow: 'auto', 
              padding: '1rem 1.5rem', 
              paddingLeft: '2rem', 
              paddingRight: '2rem',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
              {/* Note for deaf users */}
              <motion.div
                style={{
                  background: 'var(--ion-color-warning-tint)',
                  color: 'var(--ion-color-warning-contrast)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '0.9rem'
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                                 <strong>Note for Deaf Users:</strong> You may need assistance from a friend or family member to choose the best voice for your needs. Click the play button on each voice option to preview how it sounds. Voice gender labels are automatically detected and may not always be accurate.
              </motion.div>

              {/* Text input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                style={{ marginBottom: '1.5rem' }}
              >
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
              </motion.div>

              {/* Convert to Speech Button - Moved to top for accessibility */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.2 }}
                style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  justifyContent: 'center',
                  marginBottom: '1.5rem'
                }}
              >
                <IonButton
                  color="primary"
                  onClick={handleTextToSpeech}
                  disabled={!text.trim() || isProcessing}
                  style={{ flex: 1 }}
                >
                  {isProcessing ? 'Processing...' : 'Convert to Speech'}
                </IonButton>
              </motion.div>

              {/* Volume control */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.2 }}
                style={{ marginBottom: '1.5rem' }}
              >
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
              </motion.div>

              {/* Voice selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.2 }}
                style={{ marginBottom: '1.5rem' }}
              >
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
                     <motion.div
                       key={voice.id}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ 
                         delay: 0,
                         duration: 0.3
                       }}
                       style={{
                         width: '95%',
                         position: 'relative',
                         margin: '0 auto'
                       }}
                     >
                                               <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.9 }}
                          className={`voice-selector-button ${selectedVoice === voice.id ? 'selected' : ''}`}
                          style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            height: 'auto',
                            padding: '0.75rem',
                            border: selectedVoice === voice.id 
                              ? '1px solid var(--ion-color-primary) !important' 
                              : '1px solid var(--ion-border-color, var(--ion-color-light-shade)) !important',
                            borderRadius: '12px',
                            background: selectedVoice === voice.id 
                              ? 'var(--ion-color-primary) !important' 
                              : 'var(--ion-color-light-shade) !important',
                            color: selectedVoice === voice.id 
                              ? 'var(--ion-color-light-shade)'
                              : 'var(--ion-color-primary)',
                            textTransform: 'none',
                            fontWeight: '500',
                            boxSizing: 'border-box',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            outline: '2px solid transparent',
                            outlineOffset: '2px',
                            transition: 'all 0.2s ease'
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
                              marginBottom: '0.25rem',
                              color: (selectedVoice === voice.id 
                                    ? 'var(--ion-color-primary-contrast)'
                                    : 'var(--ion-color-primary)')
                            }}>
                              {voice.name}
                            </div>
                                                        <div style={{ 
                               fontSize: '0.875rem',
                               opacity: 0.8,
                               color: (selectedVoice === voice.id 
                                     ? 'var(--ion-color-primary-contrast)'
                                     : 'var(--ion-color-primary)')
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
                              color: (selectedVoice === voice.id 
                                    ? 'var(--ion-color-primary-contrast)'
                                    : 'var(--ion-color-primary)'),
                              marginTop: '0.25rem'
                            }}>
                              {voice.description}
                            </div>
                          </div>
                        </motion.button>
                        
                        {/* Preview button - positioned as a floating action button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            previewVoice(voice.id);
                          }}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--ion-color-success)',
                            border: '2px solid var(--ion-background-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.3)',
                            zIndex: 10,
                            transition: 'all 0.2s ease'
                          }}
                          title="Preview this voice"
                        >
                          <IonIcon 
                            icon={playOutline} 
                            style={{ 
                              fontSize: '14px',
                              color: 'white'
                            }} 
                          />
                        </motion.button>
                     </motion.div>
                   ))}
                </div>
              </motion.div>

              {/* Advanced Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.2 }}
                style={{ marginBottom: '1.5rem' }}
              >
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
                
                <AnimatePresence>
                  {showAdvancedSettings && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>



              {/* Audio controls */}
              {audioUrl && (
                <motion.div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
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
                </motion.div>
              )}


            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TextToSpeech; 