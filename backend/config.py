"""
Configuration settings for ToneBridge Backend
"""

import os
from typing import Dict, Any

class Config:
    """Base configuration class"""
    
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_ENV') == 'development'
    
    # API settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    
    # Audio processing settings
    AUDIO_SAMPLE_RATE = 16000
    AUDIO_CHANNELS = 1
    AUDIO_FORMAT = 'wav'
    MAX_AUDIO_DURATION = 30  # seconds
    
    # Model settings
    EMOTION_MODEL_NAME = os.getenv('EMOTION_MODEL_NAME', 'SamLowe/roberta-base-go_emotions')
    TRANSCRIPTION_MODEL_NAME = os.getenv('TRANSCRIPTION_MODEL_NAME', 'openai/whisper-base')
    
    # Supported emotions
    SUPPORTED_EMOTIONS = [
        'happy', 'sad', 'angry', 'fear', 'surprise', 'disgust',
        'neutral', 'sarcastic', 'excited', 'calm', 'frustrated'
    ]
    
    # Emotion emoji mapping
    EMOTION_EMOJIS = {
        'happy': '😊',
        'sad': '😢',
        'angry': '😠',
        'fear': '😨',
        'surprise': '😲',
        'disgust': '🤢',
        'neutral': '😐',
        'sarcastic': '😏',
        'excited': '🤩',
        'calm': '😌',
        'frustrated': '😤'
    }
    
    # Confidence thresholds
    MIN_CONFIDENCE_THRESHOLD = 0.5
    HIGH_CONFIDENCE_THRESHOLD = 0.8
    
    # Caching settings
    CACHE_TIMEOUT = 300  # 5 minutes
    MODEL_CACHE_SIZE = 100
    
    @classmethod
    def get_emotion_emoji(cls, emotion: str) -> str:
        """Get emoji for emotion, fallback to neutral if not found"""
        return cls.EMOTION_EMOJIS.get(emotion.lower(), '😐')
    
    @classmethod
    def is_valid_emotion(cls, emotion: str) -> bool:
        """Check if emotion is supported"""
        return emotion.lower() in cls.SUPPORTED_EMOTIONS

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    
    def __init__(self):
        # Override with production settings
        self.SECRET_KEY = os.getenv('SECRET_KEY')
        if not self.SECRET_KEY:
            raise ValueError("SECRET_KEY must be set in production")

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    WTF_CSRF_ENABLED = False

# Configuration mapping
config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
} 