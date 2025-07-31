@echo off
echo 🔧 ToneBridge Network Troubleshooting
echo =====================================

REM Get IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    goto :found_ip
)
:found_ip
set IP=%IP: =%

echo ✅ Your local IP address is: %IP%
echo.

echo 📋 Checking network setup...
echo.

REM Check if certificates exist
if exist "frontend\certs\localhost.pem" (
    echo ✅ SSL certificates found
) else (
    echo ❌ SSL certificates missing
    echo    Run: generate-certs-simple.ps1
    echo.
)

REM Check if backend is running
netstat -an | findstr :5000 > nul
if %errorlevel% equ 0 (
    echo ✅ Backend is running on port 5000
) else (
    echo ❌ Backend is not running on port 5000
    echo    Run: start-backend-https.bat
    echo.
)

REM Check if frontend is running
netstat -an | findstr :8100 > nul
if %errorlevel% equ 0 (
    echo ✅ Frontend is running on port 8100
) else (
    echo ❌ Frontend is not running on port 8100
    echo    Run: start-frontend-https.bat
    echo.
)

echo.
echo 🌐 Network Access URLs:
echo    Frontend: https://%IP%:8100
echo    Backend:  https://%IP%:5000
echo.

echo 🔧 Solutions for Private Network Access Error:
echo    1. Use HTTPS URLs (recommended)
echo    2. Run: start-chrome-dev.bat (bypasses restrictions)
echo    3. Accept self-signed certificates in browser
echo    4. Try accessing from localhost instead of IP
echo.

echo 📱 Test URLs:
echo    Local:  https://localhost:8100
echo    Network: https://%IP%:8100
echo.

pause 