import React from 'react';
import { IonList, IonItem, IonLabel, IonBadge, IonText, IonIcon } from '@ionic/react';
import { timeOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { TranscriptionSegment, DisplayMode } from '../../types';
import { FormatUtils } from '../../utils';
import { Card } from '../common';

interface TranscriptionDisplayProps {
  segments: TranscriptionSegment[];
  displayMode: DisplayMode;
  showTimestamps?: boolean;
  showConfidence?: boolean;
  highlightCurrent?: boolean;
  onSegmentClick?: (segment: TranscriptionSegment) => void;
  className?: string;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  segments,
  displayMode,
  showTimestamps = true,
  showConfidence = false,
  highlightCurrent = false,
  onSegmentClick,
  className = '',
}) => {
  const renderEmotionDisplay = (segment: TranscriptionSegment) => {
    if (!segment.emotion) return null;

    switch (displayMode.id) {
      case 'emoji-only':
        return segment.emoji ? (
          <IonBadge color="primary" style={{ fontSize: '1.2em' }}>
            {segment.emoji}
          </IonBadge>
        ) : null;

      case 'tag-only':
        return segment.emotion ? (
          <IonBadge color="secondary">
            {FormatUtils.capitalizeFirst(segment.emotion)}
          </IonBadge>
        ) : null;

      case 'combined':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {segment.emoji && (
              <IonBadge color="primary" style={{ fontSize: '1.2em' }}>
                {segment.emoji}
              </IonBadge>
            )}
            {segment.emotion && (
              <IonBadge color="secondary">
                {FormatUtils.capitalizeFirst(segment.emotion)}
              </IonBadge>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderConfidence = (segment: TranscriptionSegment) => {
    if (!showConfidence) return null;

    const confidenceColor = segment.confidence > 0.8 ? 'success' : 
                           segment.confidence > 0.6 ? 'warning' : 'danger';

    return (
      <IonBadge color={confidenceColor} slot="end">
        {FormatUtils.formatConfidence(segment.confidence)}
      </IonBadge>
    );
  };

  const renderTimestamp = (segment: TranscriptionSegment) => {
    if (!showTimestamps) return null;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8em', color: 'var(--ion-color-medium)' }}>
        <IonIcon icon={timeOutline} />
        {FormatUtils.formatTimestamp(segment.timestamp)}
      </div>
    );
  };

  const getSegmentStyle = (segment: TranscriptionSegment) => {
    const baseStyle: React.CSSProperties = {
      cursor: onSegmentClick ? 'pointer' : 'default',
      transition: 'background-color 0.2s ease',
    };

    if (segment.isHighlighted || (highlightCurrent && segment === segments[segments.length - 1])) {
      baseStyle.backgroundColor = 'var(--ion-color-primary-tint)';
      baseStyle.borderLeft = '4px solid var(--ion-color-primary)';
    }

    return baseStyle;
  };

  if (segments.length === 0) {
    return (
      <Card title="Transcription" className={className}>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ion-color-medium)' }}>
          <IonText>
            <p>No transcription available yet. Start recording to see live captions!</p>
          </IonText>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Live Transcription" className={className}>
      <IonList>
        {segments.map((segment, index) => (
          <IonItem
            key={segment.id}
            onClick={() => onSegmentClick?.(segment)}
            style={getSegmentStyle(segment)}
            lines="full"
          >
            <IonLabel>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <IonText>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
                      {segment.text}
                    </p>
                  </IonText>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {renderEmotionDisplay(segment)}
                    {renderTimestamp(segment)}
                  </div>
                </div>
                
                {segment.confidence === 1 && (
                  <IonIcon 
                    icon={checkmarkCircleOutline} 
                    color="success"
                    style={{ marginTop: '0.25rem' }}
                  />
                )}
              </div>
            </IonLabel>
            
            {renderConfidence(segment)}
          </IonItem>
        ))}
      </IonList>
    </Card>
  );
};

export default TranscriptionDisplay; 