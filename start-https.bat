@echo off
echo 🔒 ToneBridge HTTPS Setup
echo ================================

REM Get IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    goto :found_ip
)
:found_ip
set IP=%IP: =%

echo ✅ Your local IP address is: %IP%
echo.

REM Check if SSL certificates exist
if not exist "frontend\certs\localhost.pem" (
    echo ❌ SSL certificates not found!
    echo    Generating certificates for HTTPS access...
    call generate-certs.bat
    if errorlevel 1 (
        echo ❌ Failed to generate certificates. Cannot start HTTPS.
        pause
        exit /b 1
    )
)

echo ✅ SSL certificates found. Starting with HTTPS...
echo.

REM Set environment variables for HTTPS
set VITE_REACT_APP_API_URL=https://%IP%:5000
set FLASK_RUN_HOST=0.0.0.0
set FLASK_RUN_PORT=5000
set FLASK_APP=app.py
set FLASK_ENV=development
set FLASK_DEBUG=1

echo 🔧 Set environment variables:
echo    VITE_REACT_APP_API_URL=%VITE_REACT_APP_API_URL%
echo    FLASK_RUN_HOST=%FLASK_RUN_HOST%
echo    FLASK_RUN_PORT=%FLASK_RUN_PORT%

REM Create .env file for frontend
echo VITE_REACT_APP_API_URL=https://%IP%:5000 > frontend\.env
echo 📄 Created frontend\.env file

echo.
echo 🚀 Starting ToneBridge with HTTPS...
echo.

REM Start backend with HTTPS in a new window
start "ToneBridge Backend (HTTPS)" cmd /k "cd backend && set FLASK_RUN_HOST=0.0.0.0 && set FLASK_RUN_PORT=5000 && set FLASK_APP=app.py && set FLASK_ENV=development && set FLASK_DEBUG=1 && python run_https.py"

REM Wait a moment for backend to start
timeout /t 5 /nobreak > nul

REM Start frontend in a new window
start "ToneBridge Frontend (HTTPS)" cmd /k "cd frontend && npm run dev:network"

echo.
echo ✅ Both services are starting with HTTPS...
echo.
echo 📱 Access from other devices:
echo    - Frontend: https://%IP%:8100 (HTTPS - microphone enabled)
echo    - Backend: https://%IP%:5000 (HTTPS)
echo.
echo ⚠️  Note: You'll need to accept the self-signed certificate in your browser.
echo    Click 'Advanced' and 'Proceed to localhost (unsafe)' when prompted.
echo.
pause 