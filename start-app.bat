@echo off
echo 🚀 ToneBridge App Starter
echo ========================
echo.
echo Choose your startup option:
echo.
echo 1. HTTP (Recommended - No certificates needed)
echo    - Frontend: http://localhost:8100
echo    - Backend: http://localhost:5000
echo    - Good for development
echo.
echo 2. HTTPS (Requires SSL certificates)
echo    - Frontend: https://localhost:8100
echo    - Backend: https://localhost:5000
echo    - Good for microphone access from other devices
echo.
echo 3. Generate SSL certificates first
echo    - Creates certificates needed for HTTPS
echo.
set /p choice="Enter your choice (1, 2, or 3): "

if "%choice%"=="1" (
    echo.
    echo 🎯 Starting with HTTP...
    echo.
    echo Starting backend...
    start "ToneBridge Backend" cmd /k "start-backend.bat"
    timeout /t 3 /nobreak >nul
    echo Starting frontend...
    start "ToneBridge Frontend" cmd /k "start-frontend.bat"
    echo.
    echo ✅ Both services started with HTTP
    echo 🌐 Access your app at: http://localhost:8100
    echo.
) else if "%choice%"=="2" (
    echo.
    echo 🔒 Starting with HTTPS...
    echo.
    if not exist "frontend\certs\localhost.pem" (
        echo ❌ SSL certificates not found!
        echo Please run option 3 first to generate certificates.
        echo.
        pause
        exit /b 1
    )
    echo Starting backend with HTTPS...
    start "ToneBridge Backend HTTPS" cmd /k "start-backend-https.bat"
    timeout /t 3 /nobreak >nul
    echo Starting frontend with HTTPS...
    start "ToneBridge Frontend HTTPS" cmd /k "start-frontend-https.bat"
    echo.
    echo ✅ Both services started with HTTPS
    echo 🌐 Access your app at: https://localhost:8100
    echo.
) else if "%choice%"=="3" (
    echo.
    echo 🔐 Generating SSL certificates...
    echo.
    call generate-certs.bat
    echo.
    echo ✅ Certificates generated! You can now use option 2.
    echo.
) else (
    echo.
    echo ❌ Invalid choice. Please enter 1, 2, or 3.
    echo.
)

pause 