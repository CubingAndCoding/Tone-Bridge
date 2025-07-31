@echo off
echo 🔍 Debugging ToneBridge Backend Startup
echo ======================================

REM Get IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    goto :found_ip
)
:found_ip
set IP=%IP: =%

echo ✅ Your local IP address is: %IP%
echo.

REM Check if port 5000 is in use
netstat -ano | findstr :5000 > nul
if not errorlevel 1 (
    echo ❌ Port 5000 is already in use!
    echo    Please stop any existing services on port 5000
    pause
    exit /b 1
) else (
    echo ✅ Port 5000 is available
)

echo.
echo 🔧 Setting Flask environment variables...
set FLASK_RUN_HOST=0.0.0.0
set FLASK_RUN_PORT=5000
set FLASK_APP=app.py
set FLASK_ENV=development
set FLASK_DEBUG=1

echo    FLASK_RUN_HOST=%FLASK_RUN_HOST%
echo    FLASK_RUN_PORT=%FLASK_RUN_PORT%
echo    FLASK_APP=%FLASK_APP%
echo    FLASK_ENV=%FLASK_ENV%
echo    FLASK_DEBUG=%FLASK_DEBUG%
echo.

REM Change to backend directory
cd backend

echo 🎯 Testing network binding...
echo.

REM Try to start with more verbose output
echo Attempting to start backend...
python -c "import socket; s = socket.socket(); s.bind(('0.0.0.0', 5000)); print('Socket binding test: SUCCESS'); s.close()"
if errorlevel 1 (
    echo ❌ Socket binding test failed
    pause
    exit /b 1
)

echo.
echo 🚀 Starting backend with python run.py...
echo.

REM Start the backend with error handling
python run.py
if errorlevel 1 (
    echo.
    echo ❌ Backend failed to start
    echo.
    echo 🔍 Trying alternative startup method...
    echo.
    set HOST=0.0.0.0
    set PORT=5000
    python -c "from app import create_app; app = create_app(); app.run(host='0.0.0.0', port=5000, debug=True)"
)

pause 