@echo off
echo 🚀 Starting ToneBridge Backend with HTTPS...
echo ===========================================

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
        
        REM Set Flask environment variables
        set FLASK_RUN_HOST=0.0.0.0
        set FLASK_RUN_PORT=5000
        set FLASK_APP=app.py
        set FLASK_ENV=development
        set FLASK_DEBUG=1
        
        echo 🔧 Flask environment variables set:
        echo    FLASK_RUN_HOST=%FLASK_RUN_HOST%
        echo    FLASK_RUN_PORT=%FLASK_RUN_PORT%
        echo    FLASK_APP=%FLASK_APP%
        echo    FLASK_ENV=%FLASK_ENV%
        echo    FLASK_DEBUG=%FLASK_DEBUG%
        echo.
        
        REM Change to backend directory and start with HTTPS
        cd backend
        echo 🎯 Starting backend with HTTPS on %FLASK_RUN_HOST%:%FLASK_RUN_PORT%...
        echo.
        
        python run_https.py
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