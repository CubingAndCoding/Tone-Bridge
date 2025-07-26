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
import { UserSettings, DisplayMode } from '../../types';
import { StorageUtils, ThemeUtils } from '../../utils';
import { Button } from '../common';
import ThemeSelector from './ThemeSelector';

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
  
  // Monitor navbar color changes and revert them
  useEffect(() => {
    const toolbar = document.querySelector('ion-toolbar');
    if (!toolbar) return;
    
    console.log('Setting up navbar monitoring...');
    console.log('Initial toolbar styles:', toolbar.getAttribute('style'));
    console.log('Initial toolbar computed styles:', window.getComputedStyle(toolbar).background);
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        console.log('Navbar mutation detected:', mutation);
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          console.log('Style change detected, reverting...');
          console.log('New style:', toolbar.getAttribute('style'));
          // Force the correct background color
          toolbar.style.setProperty('--background', 'var(--ion-toolbar-background, var(--ion-color-dark))', 'important');
          toolbar.style.setProperty('background', 'var(--ion-toolbar-background, var(--ion-color-dark))', 'important');
          console.log('Reverted style:', toolbar.getAttribute('style'));
        }
      });
    });
    
    observer.observe(toolbar, { 
      attributes: true, 
      attributeFilter: ['style', 'class'],
      childList: true,
      subtree: true
    });
    
    return () => observer.disconnect();
  }, []);

  // Apply font size on component mount
  React.useEffect(() => {
    ThemeUtils.applyFontSize(settings.fontSize);
  }, [settings.fontSize]);

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

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    StorageUtils.saveSettings(updatedSettings);
    onSettingsChange(updatedSettings);
    
    // Only apply theme changes immediately if theme actually changed
    if (newSettings.theme && newSettings.theme !== settings.theme) {
      ThemeUtils.applyTheme(newSettings.theme);
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
        highContrast: false,
        reducedMotion: false,
        dyslexiaFriendly: false,
      },
    };
    setSettings(defaultSettings);
    StorageUtils.saveSettings(defaultSettings);
    onSettingsChange(defaultSettings);
    
    // Apply the default theme immediately
    ThemeUtils.applyTheme(defaultSettings.theme);
    ThemeUtils.applyFontSize(defaultSettings.fontSize);
    
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
                      color: 'var(--ion-color-medium)'
                    }}>
                      Choose how emotions appear in your transcriptions
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                      {displayModes.map((mode, index) => (
                        <motion.button
                          key={mode.id}
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
                              ? '2px solid var(--ion-color-primary)' 
                              : '1px solid var(--ion-color-light-shade)',
                            background: currentDisplayMode.id === mode.id 
                              ? 'var(--ion-color-primary)' 
                              : 'var(--ion-color-light)',
                            color: currentDisplayMode.id === mode.id 
                              ? 'white' 
                              : 'var(--ion-color-dark)',
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
                                ? 'rgba(255, 255, 255, 0.8)' 
                                : 'var(--ion-color-medium)',
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
                                    color: 'white',
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
                        gap: '0.5rem'
                      }}>
                        {[
                          { value: 'small', label: 'Small' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'large', label: 'Large' }
                        ].map((option, index) => (
                          <motion.button
                            key={option.value}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ 
                              delay: 0.05, 
                              duration: 0.2,
                              type: "spring",
                              stiffness: 400,
                              damping: 20
                            }}
                            whileHover={{ 
                              scale: 1.05,
                              transition: { duration: 0.05 }
                            }}
                            whileTap={{ 
                              scale: 0.95,
                              transition: { duration: 0.05 }
                            }}
                            onClick={() => setFontSize(option.value as 'small' | 'medium' | 'large')}
                            style={{
                              padding: '0.5rem 0.75rem',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              width: '80px',
                              height: '32px',
                              borderRadius: '6px',
                              border: settings.fontSize === option.value ? '2px solid var(--ion-color-primary)' : '1px solid var(--ion-border-color, var(--ion-color-light-shade))',
                              background: settings.fontSize === option.value ? 'var(--ion-color-primary)' : 'transparent',
                              color: settings.fontSize === option.value ? 'var(--ion-color-primary-contrast)' : 'var(--ion-text-color)',
                              cursor: 'pointer',
                              outline: 'none',
                              fontFamily: 'inherit'
                            }}
                          >
                            {option.label}
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
                      <IonLabel>High Contrast Mode</IonLabel>
                      <IonToggle
                        checked={settings.accessibility.highContrast}
                        onIonChange={(e) => updateSettings({
                          accessibility: { ...settings.accessibility, highContrast: e.detail.checked }
                        })}
                        slot="end"
                      />
                    </IonItem>

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
                  </div>
                </motion.div>



                {/* Reset Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.2 }}
                >
                  <div style={{ padding: '0 1rem', marginTop: '1rem' }}>
                    <Button
                      onClick={() => setShowResetConfirm(true)}
                      color="warning"
                      fill="outline"
                      expand="block"
                    >
                      Reset to Defaults
                    </Button>
                  </div>
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