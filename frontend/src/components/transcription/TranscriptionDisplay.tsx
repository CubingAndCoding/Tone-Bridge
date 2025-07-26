import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonList, IonItem, IonLabel, IonBadge, IonText, IonIcon, IonCard, IonCardContent } from '@ionic/react';
import { timeOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { TranscriptionSegment, DisplayMode } from '../../types';
import { FormatUtils } from '../../utils';

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
          <span style={{ fontSize: '1.5em', marginRight: '0.5rem' }}>
            {segment.emoji}
          </span>
        ) : null;

      case 'tag-only':
        return segment.emotion ? (
          <IonBadge 
            color="secondary" 
            style={{ 
              fontSize: '0.8rem',
              fontWeight: 'bold',
              padding: '0.25rem 0.5rem'
            }}
          >
            {FormatUtils.capitalizeFirst(segment.emotion)}
          </IonBadge>
        ) : null;

      case 'combined':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {segment.emoji && (
              <span style={{ fontSize: '1.5em' }}>
                {segment.emoji}
              </span>
            )}
            {segment.emotion && (
              <IonBadge 
                color="secondary"
                style={{ 
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  padding: '0.25rem 0.5rem'
                }}
              >
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
      <IonBadge 
        color={confidenceColor} 
        style={{ 
          fontSize: '0.75rem',
          padding: '0.2rem 0.4rem'
        }}
      >
        {FormatUtils.formatConfidence(segment.confidence)}
      </IonBadge>
    );
  };

  const renderTimestamp = (segment: TranscriptionSegment) => {
    if (!showTimestamps) return null;

    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.25rem', 
        fontSize: '0.75rem', 
        color: 'var(--ion-color-medium)',
        marginTop: '0.25rem'
      }}>
        <IonIcon icon={timeOutline} style={{ fontSize: '0.8rem' }} />
        {FormatUtils.formatTimestamp(segment.timestamp)}
      </div>
    );
  };

  if (segments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ion-color-medium)' }}>
        <IonText>
          <p>No transcription available yet. Start recording to see live captions!</p>
        </IonText>
      </div>
    );
  }

  return (
    <div className={className}>
      <AnimatePresence>
        {segments.slice().reverse().map((segment, index) => (
          <motion.div
            key={segment.id}
            initial={{ 
              opacity: 0, 
              x: 50, 
              scale: 0.95,
              y: 20
            }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              scale: 1,
              y: 0
            }}
            exit={{ 
              opacity: 0, 
              x: -50, 
              scale: 0.95,
              y: -20
            }}
            transition={{ 
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.4,
              delay: index === segments.length - 1 ? 0 : 0 // Only animate new items
            }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            whileTap={{ 
              scale: 0.98,
              transition: { duration: 0.1 }
            }}
          >
            <IonCard
              onClick={() => onSegmentClick?.(segment)}
              style={{
                margin: '0.5rem 0',
                cursor: onSegmentClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                border: highlightCurrent && segment === segments[segments.length - 1] 
                  ? '2px solid var(--ion-color-primary)' 
                  : '1px solid var(--ion-color-light-shade)',
                boxShadow: highlightCurrent && segment === segments[segments.length - 1]
                  ? '0 4px 12px rgba(var(--ion-color-primary-rgb), 0.2)'
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
                background: 'var(--ion-card-background)',
                color: 'var(--ion-text-color)'
              }}
            >
              <IonCardContent style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  {/* Emotion Display */}
                  <motion.div 
                    style={{ flexShrink: 0, marginTop: '0.25rem' }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: 0.2,
                      type: "spring",
                      stiffness: 400,
                      damping: 20
                    }}
                  >
                    {renderEmotionDisplay(segment)}
                  </motion.div>
                  
                  {/* Main Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                    >
                      <IonText>
                        <p style={{ 
                          margin: '0 0 0.5rem 0', 
                          fontSize: '1rem',
                          lineHeight: '1.4',
                          wordBreak: 'break-word',
                          color: 'var(--ion-text-color)',
                          fontWeight: '500'
                        }}>
                          {segment.text}
                        </p>
                      </IonText>
                    </motion.div>
                    
                    <motion.div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem', 
                        flexWrap: 'wrap'
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                    >
                      {renderTimestamp(segment)}
                      {renderConfidence(segment)}
                    </motion.div>
                  </div>
                  
                  {/* Confidence Indicator */}
                  <AnimatePresence>
                    {segment.confidence === 1 && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ 
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                          delay: 0.5
                        }}
                        style={{ 
                          flexShrink: 0,
                          marginTop: '0.25rem'
                        }}
                      >
                        <IonIcon 
                          icon={checkmarkCircleOutline} 
                          color="success"
                          style={{ 
                            fontSize: '1.2rem'
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </IonCardContent>
            </IonCard>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TranscriptionDisplay; 