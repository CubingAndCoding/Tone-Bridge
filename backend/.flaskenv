# Flask Environment Configuration
FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=True

# Server Configuration
HOST=127.0.0.1
PORT=5000

# Model Configuration
TRANSCRIPTION_MODEL_NAME=openai/whisper-tiny
EMOTION_MODEL=emotion-english-distilroberta-base

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8100,http://127.0.0.1:3000,http://127.0.0.1:8100

# Logging
LOG_LEVEL=DEBUG
DISABLE_LOGGING=False
