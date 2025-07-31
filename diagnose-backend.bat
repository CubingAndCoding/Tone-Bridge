@echo off
echo 🔍 Comprehensive Backend Diagnosis
echo ==================================

echo.
echo 📋 System Information:
echo    OS: %OS%
echo    Python Version:
python --version
echo.

echo 📋 Checking Python Environment:
python -c "import sys; print('Python Path:', sys.executable)"
python -c "import sys; print('Python Version:', sys.version)"

echo.
echo 📋 Checking Required Packages:
python -c "import flask; print('✅ Flask:', flask.__version__)"
python -c "import flask_cors; print('✅ Flask-CORS:', flask_cors.__version__)"
python -c "import dotenv; print('✅ python-dotenv:', dotenv.__version__)"

echo.
echo 📋 Checking Network Interfaces:
ipconfig | findstr "IPv4"

echo.
echo 📋 Checking Port Availability:
netstat -ano | findstr :5000

echo.
echo 📋 Testing Socket Binding:
python -c "import socket; s = socket.socket(); s.bind(('0.0.0.0', 5000)); print('✅ Socket binding test: PASSED'); s.close()"

echo.
echo 📋 Testing Flask App Import:
cd backend
python -c "from app import create_app; print('✅ Flask app import: PASSED')"

echo.
echo 📋 Testing Flask App Creation:
python -c "from app import create_app; app = create_app(); print('✅ Flask app creation: PASSED')"

echo.
echo 📋 Testing Flask App Configuration:
python -c "from app import create_app; app = create_app(); print('✅ Flask app config: PASSED'); print('   Debug mode:', app.debug); print('   Host:', app.config.get('HOST', 'Not set'))"

echo.
echo 🚀 Attempting Backend Startup...
echo.

REM Try to start the backend with detailed error output
python run.py 2>&1

echo.
echo 📋 Diagnosis Complete
pause 