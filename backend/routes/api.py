"""
API routes for ToneBridge Backend
"""

import time
import base64
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os

from services.transcription_service import transcription_service
from services.emotion_service import emotion_service
from utils.logger import setup_logger, log_request
from utils.error_handlers import ValidationError, validate_audio_file
from config import Config

logger = setup_logger(__name__)

# Create blueprint
api_bp = Blueprint('api', __name__)

def create_success_response(data: dict, message: str = "Success") -> dict:
    """
    Create standardized success response
    
    Args:
        data: Response data
        message: Success message
    
    Returns:
        Standardized response dictionary
    """
    return {
        'success': True,
        'message': message,
        'data': data,
        'timestamp': time.time()
    }

@api_bp.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """
    Transcribe audio and detect emotion
    
    Expected request:
    - audio: base64 encoded audio data
    - format: audio format (optional, defaults to 'wav')
    - include_emotion: boolean (optional, defaults to True)
    """
    start_time = time.time()
    
    try:
        # Get request data
        data = request.get_json()
        if not data:
            raise ValidationError("No JSON data provided")
        
        # Extract parameters
        audio_b64 = data.get('audio')
        audio_format = data.get('format', 'wav')
        include_emotion = data.get('include_emotion', True)
        
        if not audio_b64:
            raise ValidationError("No audio data provided")
        
        # Decode base64 audio
        try:
            audio_data = base64.b64decode(audio_b64)
            logger.info(f"Audio data decoded successfully: {len(audio_data)} bytes, format: {audio_format}")
            
            # Validate audio data
            if len(audio_data) == 0:
                raise ValidationError("Audio data is empty after base64 decoding")
            if len(audio_data) < 100:  # Very small audio files are suspicious
                logger.warning(f"Audio data seems very small: {len(audio_data)} bytes")
                
        except Exception as e:
            logger.error(f"Base64 decoding failed: {str(e)}")
            raise ValidationError(f"Invalid base64 audio data: {str(e)}")
        
        # Transcribe audio
        transcription_result = transcription_service.transcribe_audio(audio_data, audio_format)
        
        # Initialize response
        response_data = {
            'transcript': transcription_result['text'],
            'confidence': transcription_result['confidence'],
            'model': transcription_result['model'],
            'language': transcription_result.get('language', 'en')
        }
        
        # Detect emotion if requested
        if include_emotion and transcription_result['text'].strip():
            emotion_result = emotion_service.detect_emotion_from_text(transcription_result['text'])
            
            response_data.update({
                'emotion': emotion_result['emotion'],
                'emotion_confidence': emotion_result['confidence'],
                'emotion_emoji': emotion_result['emoji'],
                'emotion_model': emotion_result['model']
            })
        
        # Log request
        duration = time.time() - start_time
        log_request(logger, {
            'audio_length': len(audio_data),
            'format': audio_format,
            'include_emotion': include_emotion
        }, response_data, duration)
        
        return jsonify(create_success_response(response_data, "Transcription completed"))
        
    except Exception as e:
        logger.error(f"Transcription endpoint error: {str(e)}")
        raise

@api_bp.route('/emotion', methods=['POST'])
def detect_emotion():
    """
    Detect emotion from text or audio
    
    Expected request:
    - text: text to analyze (optional if audio provided)
    - audio: base64 encoded audio data (optional if text provided)
    - format: audio format (optional, defaults to 'wav')
    - method: 'text', 'audio', or 'combined' (optional, defaults to 'combined')
    """
    start_time = time.time()
    
    try:
        # Get request data
        data = request.get_json()
        if not data:
            raise ValidationError("No JSON data provided")
        
        # Extract parameters
        text = data.get('text', '').strip()
        audio_b64 = data.get('audio')
        audio_format = data.get('format', 'wav')
        method = data.get('method', 'combined')
        
        if not text and not audio_b64:
            raise ValidationError("Either text or audio must be provided")
        
        # Detect emotion based on method
        if method == 'text':
            if not text:
                raise ValidationError("Text is required for text-only emotion detection")
            emotion_result = emotion_service.detect_emotion_from_text(text)
            
        elif method == 'audio':
            if not audio_b64:
                raise ValidationError("Audio is required for audio-only emotion detection")
            
            audio_data = base64.b64decode(audio_b64)
            emotion_result = emotion_service.detect_emotion_from_audio(audio_data, audio_format)
            
        else:  # combined
            audio_data = None
            if audio_b64:
                audio_data = base64.b64decode(audio_b64)
            
            emotion_result = emotion_service.detect_emotion_combined(text, audio_data, audio_format)
        
        # Prepare response
        response_data = {
            'emotion': emotion_result['emotion'],
            'confidence': emotion_result['confidence'],
            'emoji': emotion_result['emoji'],
            'model': emotion_result['model']
        }
        
        # Add additional data if available
        if 'original_text' in emotion_result:
            response_data['text'] = emotion_result['original_text']
        
        if 'text_emotion' in emotion_result:
            response_data['text_emotion'] = emotion_result['text_emotion']
        
        if 'audio_emotion' in emotion_result:
            response_data['audio_emotion'] = emotion_result['audio_emotion']
        
        # Log request
        duration = time.time() - start_time
        log_request(logger, {
            'text_length': len(text),
            'audio_length': len(audio_b64) if audio_b64 else 0,
            'method': method
        }, response_data, duration)
        
        return jsonify(create_success_response(response_data, "Emotion detection completed"))
        
    except Exception as e:
        logger.error(f"Emotion detection endpoint error: {str(e)}")
        raise

@api_bp.route('/upload', methods=['POST'])
def upload_audio():
    """
    Upload audio file for processing
    
    Expected request:
    - file: audio file (multipart/form-data)
    - include_emotion: boolean (optional, defaults to True)
    """
    start_time = time.time()
    
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            raise ValidationError("No file uploaded")
        
        file = request.files['file']
        
        # Validate file
        validate_audio_file(file)
        
        # Get parameters
        include_emotion = request.form.get('include_emotion', 'true').lower() == 'true'
        
        # Read file data
        audio_data = file.read()
        audio_format = file.filename.split('.')[-1].lower()
        
        # Transcribe audio
        transcription_result = transcription_service.transcribe_audio(audio_data, audio_format)
        
        # Initialize response
        response_data = {
            'transcript': transcription_result['text'],
            'confidence': transcription_result['confidence'],
            'model': transcription_result['model'],
            'language': transcription_result.get('language', 'en'),
            'filename': secure_filename(file.filename)
        }
        
        # Detect emotion if requested
        if include_emotion and transcription_result['text'].strip():
            emotion_result = emotion_service.detect_emotion_from_text(transcription_result['text'])
            
            response_data.update({
                'emotion': emotion_result['emotion'],
                'emotion_confidence': emotion_result['confidence'],
                'emotion_emoji': emotion_result['emoji'],
                'emotion_model': emotion_result['model']
            })
        
        # Log request
        duration = time.time() - start_time
        log_request(logger, {
            'filename': file.filename,
            'file_size': len(audio_data),
            'include_emotion': include_emotion
        }, response_data, duration)
        
        return jsonify(create_success_response(response_data, "File processed successfully"))
        
    except Exception as e:
        logger.error(f"Upload endpoint error: {str(e)}")
        raise

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ToneBridge API',
        'version': '1.0.0',
        'timestamp': time.time()
    })

@api_bp.route('/debug/audio', methods=['POST'])
def debug_audio():
    """Debug endpoint to test audio data"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        audio_b64 = data.get('audio')
        audio_format = data.get('format', 'wav')
        
        if not audio_b64:
            return jsonify({'error': 'No audio data provided'}), 400
        
        # Decode base64
        try:
            audio_data = base64.b64decode(audio_b64)
        except Exception as e:
            return jsonify({'error': f'Invalid base64: {str(e)}'}), 400
        
        # Return debug info
        return jsonify({
            'success': True,
            'audio_length': len(audio_data),
            'format': audio_format,
            'base64_length': len(audio_b64),
            'first_100_chars': audio_b64[:100] if len(audio_b64) > 100 else audio_b64
        })
        
    except Exception as e:
        return jsonify({'error': f'Debug failed: {str(e)}'}), 500

@api_bp.route('/models', methods=['GET'])
def get_models():
    """Get available models and their status"""
    return jsonify(create_success_response({
        'transcription_models': {
            'whisper': transcription_service.whisper_pipeline is not None,
            'speech_recognition': True
        },
        'emotion_models': {
            'text_classification': emotion_service.text_emotion_pipeline is not None,
            'audio_features': True
        },
        'supported_emotions': Config.SUPPORTED_EMOTIONS,
        'emotion_emojis': Config.EMOTION_EMOJIS
    }, "Model information retrieved")) 