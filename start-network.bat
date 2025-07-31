@echo off
echo 🌐 ToneBridge Network Setup
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

REM Set environment variables
set VITE_REACT_APP_API_URL=http://%IP%:5000
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
echo VITE_REACT_APP_API_URL=http://%IP%:5000 > frontend\.env
echo 📄 Created frontend\.env file

REM Check if SSL certificates exist
if not exist "frontend\certs\localhost.pem" (
    echo.
    echo 🔐 SSL certificates not found. Generating for HTTPS access...
    echo    This allows microphone access from local IP addresses.
    call generate-certs.bat
    if errorlevel 1 (
        echo ❌ Failed to generate certificates. Continuing with HTTP...
        echo    Microphone may not work from local IP addresses.
    ) else (
        echo ✅ Certificates generated. HTTPS will be available.
        set VITE_REACT_APP_API_URL=https://%IP%:5000
        echo VITE_REACT_APP_API_URL=https://%IP%:5000 > frontend\.env
    )
) else (
    echo ✅ SSL certificates found. HTTPS will be available.
    set VITE_REACT_APP_API_URL=https://%IP%:5000
    echo VITE_REACT_APP_API_URL=https://%IP%:5000 > frontend\.env
)

echo.
echo 🚀 Starting ToneBridge for network access...
echo.

REM Start backend in a new window with proper environment variables
start "ToneBridge Backend" cmd /k "cd backend && set FLASK_RUN_HOST=0.0.0.0 && set FLASK_RUN_PORT=5000 && set FLASK_APP=app.py && set FLASK_ENV=development && set FLASK_DEBUG=1 && python run.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in a new window
start "ToneBridge Frontend" cmd /k "cd frontend && npm run dev:network"

echo.
echo ✅ Both services are starting...
echo.
echo 📱 Access from other devices:
if exist "frontend\certs\localhost.pem" (
    echo    - Frontend: https://%IP%:8100 (HTTPS - microphone enabled)
    echo    - Backend: https://%IP%:5000 (HTTPS)
) else (
    echo    - Frontend: http://%IP%:8100 (HTTP - microphone may not work)
    echo    - Backend: http://%IP%:5000 (HTTP)
)
echo.
echo 📚 For more information, see network-setup.md
echo.
pause 