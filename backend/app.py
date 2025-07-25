"""
ToneBridge Backend - Main Application
Real-time speech-to-text with emotion detection
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from config import Config
from services.transcription_service import TranscriptionService
from services.emotion_service import EmotionService
from utils.logger import setup_logger
from utils.error_handlers import register_error_handlers
from routes.api import api_bp

# Load environment variables
load_dotenv()

# Setup logging
logger = setup_logger(__name__)

def create_app(config_class=Config):
    """Application factory pattern for Flask app creation"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://localhost:8100", "https://tonebridge.vercel.app"],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Register error handlers
    register_error_handlers(app)
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'ToneBridge Backend',
            'version': '1.0.0'
        })
    
    # Root endpoint
    @app.route('/')
    def root():
        return jsonify({
            'message': 'ToneBridge Backend API',
            'endpoints': {
                'health': '/health',
                'transcribe': '/api/transcribe',
                'emotion': '/api/emotion'
            }
        })
    
    logger.info("ToneBridge Backend initialized successfully")
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(
        host=os.getenv('HOST', '0.0.0.0'),
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('FLASK_ENV') == 'development'
    ) 