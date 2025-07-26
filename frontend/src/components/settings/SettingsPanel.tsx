import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonRange,
  IonText,
  IonIcon,
  IonButton,
  IonItemDivider,
  IonCard,
  IonCardContent,
  IonAlert,
} from '@ionic/react';
import {
  settingsOutline,
  accessibilityOutline,
  colorPaletteOutline,
  textOutline,
  eyeOutline,
  speedometerOutline,
  closeOutline,
} from 'ionicons/icons';
import { UserSettings, DisplayMode, TranscriptionSegment } from '../../types';
import { StorageUtils, ThemeUtils } from '../../utils';
import { Button } from '../common';
import ThemeSelector from './ThemeSelector';
import TranscriptionCard from '../transcription/TranscriptionCard';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: UserSettings) => void;
  currentDisplayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  className?: string;
}

/**
 * Modal Settings Panel Component
 * Clean, modern modal design with smooth animations
 */
const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  onSettingsChange,
  currentDisplayMode,
  onDisplayModeChange,
  className = '',
}) => {
  const [settings, setSettings] = useState<UserSettings>(StorageUtils.getSettings());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Set initial toolbar background
  useEffect(() => {
    const toolbar = document.querySelector('ion-toolbar');
    if (!toolbar) return;
    
    // Set initial toolbar background
    toolbar.style.setProperty('--background', 'var(--ion-toolbar-background, var(--ion-color-dark))', 'important');
    toolbar.style.setProperty('background', 'var(--ion-toolbar-background, var(--ion-color-dark))', 'important');
  }, []);

  // Apply font size and accessibility settings on component mount
  React.useEffect(() => {
    ThemeUtils.applyFontSize(settings.fontSize);
    applyAccessibilitySettings(settings.accessibility);
  }, [settings.fontSize, settings.accessibility]);

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

  const applyAccessibilitySettings = (accessibility: UserSettings['accessibility']) => {
    console.log('Applying accessibility settings:', accessibility);
    
    // Apply reduced motion
    if (accessibility.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
      document.body.classList.add('reduced-motion');
      console.log('Added reduced-motion class');
    } else {
      document.documentElement.classList.remove('reduced-motion');
      document.body.classList.remove('reduced-motion');
      console.log('Removed reduced-motion class');
    }
    
    // Apply dyslexia-friendly font
    if (accessibility.dyslexiaFriendly) {
      document.documentElement.classList.add('dyslexia-friendly');
      document.body.classList.add('dyslexia-friendly');
      console.log('Added dyslexia-friendly class');
    } else {
      document.documentElement.classList.remove('dyslexia-friendly');
      document.body.classList.remove('dyslexia-friendly');
      console.log('Removed dyslexia-friendly class');
    }
    
    console.log('Current document classes:', document.documentElement.className);
    console.log('Current body classes:', document.body.className);
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    StorageUtils.saveSettings(updatedSettings);
    onSettingsChange(updatedSettings);
    
    // Only apply theme changes immediately if theme actually changed
    if (newSettings.theme && newSettings.theme !== settings.theme) {
      ThemeUtils.applyTheme(newSettings.theme);
    }
    
    // Apply accessibility settings immediately
    if (newSettings.accessibility) {
      applyAccessibilitySettings(newSettings.accessibility);
    }
  };

  const resetSettings = () => {
    const defaultSettings: UserSettings = {
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
    setSettings(defaultSettings);
    StorageUtils.saveSettings(defaultSettings);
    onSettingsChange(defaultSettings);
    
    // Apply the default theme and accessibility settings immediately
    ThemeUtils.applyTheme(defaultSettings.theme);
    ThemeUtils.applyFontSize(defaultSettings.fontSize);
    applyAccessibilitySettings(defaultSettings.accessibility);
    
    setShowResetConfirm(false);
  };



  const setFontSize = (value: 'small' | 'medium' | 'large' | number | { lower: number; upper: number }) => {
    let fontSize: 'small' | 'medium' | 'large';
    
    if (typeof value === 'string') {
      fontSize = value;
    } else {
      const numericValue = typeof value === 'number' ? value : value.lower;
      fontSize = numericValue === 0 ? 'small' : numericValue === 2 ? 'large' : 'medium';
    }
    
    // Only apply font size directly, don't update settings state
    ThemeUtils.applyFontSize(fontSize);
    
    // Update settings in background without triggering callbacks
    const updatedSettings = { ...settings, fontSize };
    StorageUtils.saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="settings-modal-backdrop"
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
            className="settings-modal-content"
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
                borderBottom: '1px solid var(--ion-color-light-shade)'
              }}
            >
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
                Settings
              </h2>
              <IonButton
                fill="clear"
                size="small"
                onClick={onClose}
              >
                <IonIcon icon={closeOutline} />
              </IonButton>
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
              <IonList style={{ background: 'transparent' }}>
                {/* Display Mode Settings */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                >
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ 
                      marginBottom: '0.5rem', 
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: 'var(--ion-text-color)'
                    }}>
                      <IonIcon 
                        icon={textOutline} 
                        style={{ 
                          marginRight: '0.5rem',
                          verticalAlign: 'middle'
                        }} 
                      />
                      Display Style
                    </h3>
                    <p style={{
                      margin: '0 0 1rem 0',
                      fontSize: '0.9rem',
                      color: 'var(--ion-text-color)'
                    }}>
                      Choose how emotions appear in your transcriptions
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                      {displayModes.map((mode, index) => (
                        <motion.button
                          key={mode.id}
                          className={`display-mode-button ${currentDisplayMode.id === mode.id ? 'selected' : ''}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            delay: 0.05, 
                            duration: 0.1,
                            type: "spring",
                            stiffness: 400
                          }}
                          whileHover={{ 
                            scale: 1.05,
                            transition: { duration: 0.15 }
                          }}
                          whileTap={{ 
                            scale: 0.95,
                            transition: { duration: 0.1 }
                          }}
                          onClick={() => onDisplayModeChange(mode)}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            border: currentDisplayMode.id === mode.id 
                              ? '1px solid var(--ion-color-primary)' 
                              : '1px solid var(--ion-border-color, var(--ion-color-light-shade))',
                            background: currentDisplayMode.id === mode.id 
                              ? (settings.theme === 'high-contrast' 
                                  ? (document.documentElement.classList.contains('dark-mode') ? '#ffffff' : '#000000')
                                  : 'var(--ion-color-primary)')
                              : (settings.theme === 'high-contrast' 
                                  ? (document.documentElement.classList.contains('dark-mode') ? '#000000' : '#ffffff')
                                  : 'var(--ion-color-light)'),
                            color: currentDisplayMode.id === mode.id 
                              ? (settings.theme === 'high-contrast' 
                                  ? (document.documentElement.classList.contains('dark-mode') ? '#000000' : '#ffffff')
                                  : 'white')
                              : (settings.theme === 'high-contrast' 
                                  ? (document.documentElement.classList.contains('dark-mode') ? '#ffffff' : '#000000')
                                  : 'var(--ion-color-dark)'),
                            fontSize: '0.9rem',
                            fontWeight: currentDisplayMode.id === mode.id ? '600' : '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            width: '95%',
                            textAlign: 'left',
                            minHeight: '48px',
                            position: 'relative'
                          }}
                        >
                          <motion.span 
                            style={{ 
                              fontSize: '1.2rem',
                              minWidth: '24px',
                              textAlign: 'center'
                            }}
                            animate={{ 
                              scale: currentDisplayMode.id === mode.id ? 1.1 : 1 
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            {mode.id === 'combined' ? '😊' : mode.id === 'emoji-only' ? '😄' : '🏷️'}
                          </motion.span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                              {mode.name}
                            </div>
                            <div style={{ 
                              fontSize: '0.8rem', 
                              color: currentDisplayMode.id === mode.id 
                                ? (settings.theme === 'high-contrast' 
                                    ? (document.documentElement.classList.contains('dark-mode') ? '#000000' : '#ffffff')
                                    : 'rgba(255, 255, 255, 0.8)')
                                : (settings.theme === 'high-contrast' 
                                    ? (document.documentElement.classList.contains('dark-mode') ? '#ffffff' : '#000000')
                                    : 'var(--ion-text-color)'),
                              lineHeight: '1.3'
                            }}>
                              {mode.description}
                            </div>
                          </div>
                          <div style={{ 
                            width: '24px', 
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <AnimatePresence>
                              {currentDisplayMode.id === mode.id && (
                                <motion.span 
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ 
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30
                                  }}
                                  style={{ 
                                    color: settings.theme === 'high-contrast' 
                                      ? (document.documentElement.classList.contains('dark-mode') ? '#000000' : '#ffffff')
                                      : 'white',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  ✓
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Theme Settings */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                >
                  <ThemeSelector
                    currentTheme={settings.theme}
                    onThemeChange={(themeId) => updateSettings({ theme: themeId })}
                  />
                </motion.div>

                {/* Display Settings */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.2 }}
                >
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ 
                      marginBottom: '0.5rem', 
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: 'var(--ion-text-color)'
                    }}>
                      <IonIcon 
                        icon={eyeOutline} 
                        style={{ 
                          marginRight: '0.5rem',
                          verticalAlign: 'middle'
                        }} 
                      />
                      Display Options
                    </h3>

                    <IonItem style={{ '--background': 'transparent' }}>
                      <IonLabel>Font Size</IonLabel>
                      <div slot="end" style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.5rem', 
                        alignItems: 'center',
                        width: '100%',
                        marginBottom: '1rem'
                      }}>
                        {[
                          { value: 'small', name: 'Small Text', icon: 'Aa' },
                          { value: 'medium', name: 'Medium Text', icon: 'Aa' },
                          { value: 'large', name: 'Large Text', icon: 'Aa' }
                        ].map((option, index) => (
                          <motion.button
                            key={option.value}
                            className={`font-size-button ${settings.fontSize === option.value ? 'selected' : ''}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ 
                              delay: 0.05, 
                              duration: 0.1,
                              type: "spring",
                              stiffness: 400
                            }}
                            whileHover={{ 
                              scale: 1.05,
                              transition: { duration: 0.15 }
                            }}
                            whileTap={{ 
                              scale: 0.95,
                              transition: { duration: 0.1 }
                            }}
                            onClick={() => {
                              setFontSize(option.value as 'small' | 'medium' | 'large');
                              console.log('Font size button clicked:', option.value);
                              console.log('Current document classes:', document.documentElement.className);
                              console.log('Current body classes:', document.body.className);
                              
                              // Test if the font size is actually being applied
                              setTimeout(() => {
                                const testElement = document.querySelector('.font-size-test');
                                if (testElement) {
                                  const computedStyle = window.getComputedStyle(testElement);
                                  console.log('Test element font size:', computedStyle.fontSize);
                                }
                              }, 100);
                            }}
                            style={{
                              padding: '0.75rem 1rem',
                              borderRadius: '8px',
                              border: settings.fontSize === option.value 
                                ? '1px solid var(--ion-color-primary)' 
                                : '1px solid var(--ion-border-color, var(--ion-color-light-shade))',
                              background: settings.fontSize === option.value 
                                ? (settings.theme === 'high-contrast' 
                                    ? (document.documentElement.classList.contains('dark-mode') ? '#ffffff' : '#000000')
                                    : 'var(--ion-color-primary)')
                                : (settings.theme === 'high-contrast' 
                                    ? (document.documentElement.classList.contains('dark-mode') ? '#000000' : '#ffffff')
                                    : 'var(--ion-color-light)'),
                              color: settings.fontSize === option.value 
                                ? (settings.theme === 'high-contrast' 
                                    ? (document.documentElement.classList.contains('dark-mode') ? '#000000' : '#ffffff')
                                    : 'white')
                                : 'var(--ion-color-dark)',
                              fontSize: '0.9rem',
                              fontWeight: settings.fontSize === option.value ? '600' : '400',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              width: '95%',
                              textAlign: 'left',
                              minHeight: '48px',
                              position: 'relative'
                            }}
                          >
                            <motion.span 
                              style={{ 
                                fontSize: option.value === 'small' ? '1rem' : 
                                         option.value === 'medium' ? '1.2rem' : '1.4rem',
                                minWidth: '24px',
                                textAlign: 'center',
                                fontWeight: '600'
                              }}
                              animate={{ 
                                scale: settings.fontSize === option.value ? 1.1 : 1 
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              {option.icon}
                            </motion.span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                                {option.name}
                              </div>
                            </div>
                            <div style={{ 
                              width: '24px', 
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <AnimatePresence>
                                {settings.fontSize === option.value && (
                                  <motion.span 
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ 
                                      type: "spring",
                                      stiffness: 500,
                                      damping: 30
                                    }}
                                    style={{ 
                                      color: settings.theme === 'high-contrast' 
                                        ? (document.documentElement.classList.contains('dark-mode') ? '#000000' : '#ffffff')
                                        : 'white',
                                      fontSize: '1.2rem',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    ✓
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </IonItem>

                    <IonItem style={{ '--background': 'transparent' }}>
                      <IonLabel>Auto-save Transcripts</IonLabel>
                      <IonToggle
                        checked={settings.autoSave}
                        onIonChange={(e) => updateSettings({ autoSave: e.detail.checked })}
                        slot="end"
                      />
                    </IonItem>
                  </div>
                </motion.div>

                {/* Accessibility Settings */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.2 }}
                >
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ 
                      marginBottom: '0.5rem', 
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: 'var(--ion-text-color)'
                    }}>
                      <IonIcon 
                        icon={accessibilityOutline} 
                        style={{ 
                          marginRight: '0.5rem',
                          verticalAlign: 'middle'
                        }} 
                      />
                      Accessibility
                    </h3>



                    <IonItem style={{ '--background': 'transparent' }}>
                      <IonLabel>Reduced Motion</IonLabel>
                      <IonToggle
                        checked={settings.accessibility.reducedMotion}
                        onIonChange={(e) => updateSettings({
                          accessibility: { ...settings.accessibility, reducedMotion: e.detail.checked }
                        })}
                        slot="end"
                      />
                    </IonItem>

                    <IonItem style={{ '--background': 'transparent' }}>
                      <IonLabel>Dyslexia-friendly Font</IonLabel>
                      <IonToggle
                        checked={settings.accessibility.dyslexiaFriendly}
                        onIonChange={(e) => updateSettings({
                          accessibility: { ...settings.accessibility, dyslexiaFriendly: e.detail.checked }
                        })}
                        slot="end"
                      />
                    </IonItem>
                    
                    {/* Accessibility Test Section */}
                    <div style={{ 
                      marginTop: '1rem', 
                      padding: '1rem', 
                      background: 'var(--ion-color-light)', 
                      borderRadius: '8px',
                      border: '1px solid var(--ion-border-color, var(--ion-color-light-shade))'
                    }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: '600' }}>
                        Accessibility Test
                      </h4>

                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem' }}>
                        <strong>Reduced Motion:</strong> {settings.accessibility.reducedMotion ? '✅ Active' : '❌ Inactive'}
                      </p>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem' }}>
                        <strong>Dyslexia Font:</strong> {settings.accessibility.dyslexiaFriendly ? '✅ Active' : '❌ Inactive'}
                      </p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        This text should change based on your accessibility settings.
                      </p>
                    </div>
                  </div>
                </motion.div>



                {/* Reset Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.2 }}
                >
                  <div style={{ padding: '0 1rem', marginTop: '1rem' }}>
                    <IonButton
                      onClick={() => setShowResetConfirm(true)}
                      color="warning"
                      fill="outline"
                      expand="block"
                      className="reset-button action-button"
                      style={{
                        color: 'var(--ion-text-color)',
                        borderColor: settings.theme === 'high-contrast' ? 'var(--ion-text-color)' : 'var(--ion-color-warning)',
                        '--ion-color-warning': 'var(--ion-text-color)',
                        '--ion-color-warning-contrast': 'var(--ion-background-color)',
                        '--border-color': settings.theme === 'high-contrast' ? 'var(--ion-text-color)' : undefined,
                        '--background': settings.theme === 'high-contrast' ? 'transparent' : undefined
                      }}
                    >
                      Reset to Defaults
                    </IonButton>
                  </div>
                </motion.div>

                {/* Live Preview Footer - Fixed Position */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  style={{
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 10,
                    width: '95%',
                    margin: '0 auto',
                    alignContent: 'center',
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                                        {/* Sample Transcript Card - Using Reusable Component */}
                    <TranscriptionCard
                      segment={{
                        id: 'sample-1',
                        text: "Hey! This is a sample transcript to test out how you like the settings. I hope you like what you're seeing!",
                        emotion: 'happy',
                        emoji: '😊',
                        confidence: 0.9,
                        timestamp: new Date()
                      }}
                      displayMode={currentDisplayMode}
                      showTimestamps={true}
                      showConfidence={true}
                      highlightCurrent={true}
                    />
                  </motion.div>

                                {/* Reset Confirmation Alert */}
                <IonAlert
                  isOpen={showResetConfirm}
                  onDidDismiss={() => setShowResetConfirm(false)}
                  header="Reset Settings"
                  message="Are you sure you want to reset all settings to their default values? This action cannot be undone."
                  buttons={[
                    {
                      text: 'Cancel',
                      role: 'cancel',
                      cssClass: 'alert-button-cancel'
                    },
                    {
                      text: 'Reset',
                      role: 'destructive',
                      cssClass: 'alert-button-confirm',
                      handler: resetSettings
                    }
                  ]}
                />
              </IonList>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel; 