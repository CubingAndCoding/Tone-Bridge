@echo off
echo 🎨 Starting ToneBridge Frontend with HTTPS...
echo ============================================

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
if exist "frontend\certs\localhost.pem" (
    if exist "frontend\certs\localhost-key.pem" (
        echo ✅ SSL certificates found
        echo.
        
        REM Create .env file for frontend with HTTPS
        echo VITE_REACT_APP_API_URL=https://%IP%:5000 > frontend\.env
        echo 📄 Created frontend\.env file with API URL: https://%IP%:5000
        echo.
        
        REM Change to frontend directory and start
        cd frontend
        echo 🎯 Starting frontend with HTTPS on 0.0.0.0:8100...
        echo.
        
        npm run dev:network
    ) else (
        echo ❌ SSL key file not found: frontend\certs\localhost-key.pem
        echo.
        echo Please run 'generate-certs-simple.ps1' to create SSL certificates.
        echo.
        pause
        exit /b 1
    )
) else (
    echo ❌ SSL certificate file not found: frontend\certs\localhost.pem
    echo.
    echo Please run 'generate-certs-simple.ps1' to create SSL certificates.
    echo.
    pause
    exit /b 1
)

pause 