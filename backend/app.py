"""
ToneBridge Backend - Main Application
Real-time speech-to-text with emotion detection
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from config import Config, get_config
from services.transcription_service import TranscriptionService
from services.emotion_service import EmotionService
from utils.logger import setup_logger
from utils.error_handlers import register_error_handlers
from routes.api import api_bp

# Load environment variables
load_dotenv()

# Setup logging
logger = setup_logger(__name__)

def create_app(config_class=None):
    """Application factory pattern for Flask app creation"""
    if config_class is None:
        config_class = get_config()
    
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize CORS with localhost origins only
    allowed_origins = [
        "http://localhost:3000", 
        "http://localhost:8100", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8100"
    ]
    
    # Add environment variable origins if specified
    env_origins = os.getenv('ALLOWED_ORIGINS', '')
    if env_origins:
        allowed_origins.extend([origin.strip() for origin in env_origins.split(',')])
    
    # Log all allowed origins for debugging
    logger.info(f"Configured CORS origins: {allowed_origins}")
    
    CORS(app, resources={
        r"/*": {
            "origins": allowed_origins,
            "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
            "allow_headers": [
                "Content-Type", 
                "Authorization", 
                "X-Requested-With",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
            ],
            "expose_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
            "max_age": 86400  # Cache preflight requests for 24 hours
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
    logger.info(f"CORS allowed origins: {allowed_origins}")
    return app

if __name__ == '__main__':
    app = create_app()
    host = os.getenv('HOST', '127.0.0.1')
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    app.run(
        host=host,
        port=port,
        debug=debug
    ) 