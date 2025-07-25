import React, { useState } from 'react';
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
} from '@ionic/react';
import {
  settingsOutline,
  accessibilityOutline,
  colorPaletteOutline,
  textOutline,
  eyeOutline,
  speedometerOutline,
} from 'ionicons/icons';
import { UserSettings } from '../../types';
import { StorageUtils, ThemeUtils } from '../../utils';
import { Card, Button } from '../common';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: UserSettings) => void;
  className?: string;
}

/**
 * Reusable Settings Panel Component
 * Following DRY principles by providing consistent settings management
 */
const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  onSettingsChange,
  className = '',
}) => {
  const [settings, setSettings] = useState<UserSettings>(StorageUtils.getSettings());

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    StorageUtils.saveSettings(updatedSettings);
    onSettingsChange(updatedSettings);
    
    // Apply theme changes immediately
    if (newSettings.theme) {
      ThemeUtils.applyTheme(newSettings.theme);
    }
  };

  const resetSettings = () => {
    const defaultSettings: UserSettings = {
      theme: 'system',
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
  };

  const getFontSizeValue = () => {
    switch (settings.fontSize) {
      case 'small': return 0;
      case 'large': return 2;
      default: return 1;
    }
  };

  const setFontSize = (value: number | { lower: number; upper: number }) => {
    const numericValue = typeof value === 'number' ? value : value.lower;
    const fontSize = numericValue === 0 ? 'small' : numericValue === 2 ? 'large' : 'medium';
    updateSettings({ fontSize });
  };

  if (!isOpen) return null;

  return (
    <div className={`settings-panel ${className}`}>
      <Card title="Settings" headerColor="var(--ion-color-primary)">
        <IonList>
          {/* Theme Settings */}
          <IonItemDivider>
            <IonLabel>
              <IonIcon icon={colorPaletteOutline} />
              <span style={{ marginLeft: '0.5rem' }}>Appearance</span>
            </IonLabel>
          </IonItemDivider>

          <IonItem>
            <IonLabel>Theme</IonLabel>
            <IonSelect
              value={settings.theme}
              onIonChange={(e) => updateSettings({ theme: e.detail.value })}
              interface="popover"
            >
              <IonSelectOption value="light">Light</IonSelectOption>
              <IonSelectOption value="dark">Dark</IonSelectOption>
              <IonSelectOption value="system">System</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel>Font Size</IonLabel>
            <IonRange
              min={0}
              max={2}
              step={1}
              value={getFontSizeValue()}
              onIonChange={(e) => setFontSize(e.detail.value)}
              snaps
              pin
            >
              <IonLabel slot="start">Small</IonLabel>
              <IonLabel slot="end">Large</IonLabel>
            </IonRange>
          </IonItem>

          {/* Display Settings */}
          <IonItemDivider>
            <IonLabel>
              <IonIcon icon={textOutline} />
              <span style={{ marginLeft: '0.5rem' }}>Display</span>
            </IonLabel>
          </IonItemDivider>

          <IonItem>
            <IonLabel>Show Emotion Emojis</IonLabel>
            <IonToggle
              checked={settings.showEmojis}
              onIonChange={(e) => updateSettings({ showEmojis: e.detail.checked })}
            />
          </IonItem>

          <IonItem>
            <IonLabel>Show Emotion Tags</IonLabel>
            <IonToggle
              checked={settings.showTags}
              onIonChange={(e) => updateSettings({ showTags: e.detail.checked })}
            />
          </IonItem>

          <IonItem>
            <IonLabel>Auto-save Transcripts</IonLabel>
            <IonToggle
              checked={settings.autoSave}
              onIonChange={(e) => updateSettings({ autoSave: e.detail.checked })}
            />
          </IonItem>

          {/* Accessibility Settings */}
          <IonItemDivider>
            <IonLabel>
              <IonIcon icon={accessibilityOutline} />
              <span style={{ marginLeft: '0.5rem' }}>Accessibility</span>
            </IonLabel>
          </IonItemDivider>

          <IonItem>
            <IonLabel>High Contrast Mode</IonLabel>
            <IonToggle
              checked={settings.accessibility.highContrast}
              onIonChange={(e) => updateSettings({
                accessibility: { ...settings.accessibility, highContrast: e.detail.checked }
              })}
            />
          </IonItem>

          <IonItem>
            <IonLabel>Reduced Motion</IonLabel>
            <IonToggle
              checked={settings.accessibility.reducedMotion}
              onIonChange={(e) => updateSettings({
                accessibility: { ...settings.accessibility, reducedMotion: e.detail.checked }
              })}
            />
          </IonItem>

          <IonItem>
            <IonLabel>Dyslexia-friendly Font</IonLabel>
            <IonToggle
              checked={settings.accessibility.dyslexiaFriendly}
              onIonChange={(e) => updateSettings({
                accessibility: { ...settings.accessibility, dyslexiaFriendly: e.detail.checked }
              })}
            />
          </IonItem>

          {/* Performance Settings */}
          <IonItemDivider>
            <IonLabel>
              <IonIcon icon={speedometerOutline} />
              <span style={{ marginLeft: '0.5rem' }}>Performance</span>
            </IonLabel>
          </IonItemDivider>

          <IonItem>
            <IonLabel>Real-time Processing</IonLabel>
            <IonToggle checked={true} disabled />
            <IonText color="medium" slot="end">
              <small>Always enabled</small>
            </IonText>
          </IonItem>

          {/* Reset Button */}
          <IonItemDivider>
            <IonLabel>
              <IonIcon icon={settingsOutline} />
              <span style={{ marginLeft: '0.5rem' }}>Actions</span>
            </IonLabel>
          </IonItemDivider>

          <IonItem>
            <Button
              onClick={resetSettings}
              color="warning"
              fill="outline"
              expand="block"
            >
              Reset to Defaults
            </Button>
          </IonItem>

          <IonItem>
            <Button
              onClick={onClose}
              color="primary"
              expand="block"
            >
              Close Settings
            </Button>
          </IonItem>
        </IonList>
      </Card>
    </div>
  );
};

export default SettingsPanel; 