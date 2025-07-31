@echo off
echo 🧪 Testing Backend Startup (Minimal)
echo ===================================

cd backend

echo 🔧 Setting minimal environment...
set FLASK_APP=app.py
set FLASK_ENV=development

echo.
echo 🎯 Testing basic Flask import...
python -c "from app import create_app; print('✅ Flask app import successful')"
if errorlevel 1 (
    echo ❌ Flask app import failed
    pause
    exit /b 1
)

echo.
echo 🎯 Testing app creation...
python -c "from app import create_app; app = create_app(); print('✅ Flask app creation successful')"
if errorlevel 1 (
    echo ❌ Flask app creation failed
    pause
    exit /b 1
)

echo.
echo 🎯 Testing socket binding...
python -c "import socket; s = socket.socket(); s.bind(('0.0.0.0', 5000)); print('✅ Socket binding successful'); s.close()"
if errorlevel 1 (
    echo ❌ Socket binding failed
    pause
    exit /b 1
)

echo.
echo 🚀 Starting backend with minimal config...
echo.

REM Try the simplest possible startup
python -c "from app import create_app; app = create_app(); app.run(host='0.0.0.0', port=5000, debug=True)"

pause 