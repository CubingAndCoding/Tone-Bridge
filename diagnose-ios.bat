@echo off
echo ========================================
echo iOS Recording Issue Diagnosis Tool
echo ========================================
echo.

echo Checking network configuration...
echo.

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "IP=%%a"
    set "IP=!IP: =!"
    goto :found_ip
)
:found_ip

echo Your computer's IP address: %IP%
echo.

echo Testing backend connectivity...
echo.

REM Test if backend is running
curl -k -s https://%IP%:5000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is accessible at https://%IP%:5000
) else (
    echo ❌ Backend is NOT accessible at https://%IP%:5000
    echo    Make sure the backend is running with HTTPS
)

echo.

echo Testing frontend connectivity...
echo.

REM Test if frontend is running
curl -k -s https://%IP%:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is accessible at https://%IP%:3000
) else (
    echo ❌ Frontend is NOT accessible at https://%IP%:3000
    echo    Make sure the frontend is running with HTTPS
)

echo.

echo ========================================
echo iOS Troubleshooting Steps:
echo ========================================
echo.
echo 1. On your iPhone, open Safari
echo 2. Go to: https://%IP%:3000
echo 3. Accept the security certificate when prompted
echo 4. Allow microphone access when asked
echo 5. Try recording audio
echo.
echo If recording fails:
echo - Check that both devices are on the same WiFi
echo - Try clearing Safari website data
echo - Restart Safari and try again
echo - Check iOS version (iOS 14+ recommended)
echo.
echo For detailed troubleshooting, see: iOS-TROUBLESHOOTING.md
echo.

pause 