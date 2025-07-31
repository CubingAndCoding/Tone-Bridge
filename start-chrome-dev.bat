@echo off
echo 🌐 Starting Chrome with development flags...
echo ==========================================

REM Get IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    goto :found_ip
)
:found_ip
set IP=%IP: =%

echo ✅ Your local IP address is: %IP%
echo.

REM Launch Chrome with development flags
echo 🚀 Launching Chrome with development flags...
echo    This bypasses Private Network Access restrictions
echo.

start chrome --disable-web-security --disable-features=VizDisplayCompositor --user-data-dir="%TEMP%\chrome-dev" --allow-running-insecure-content --disable-site-isolation-trials --disable-features=PrivateNetworkAccessChecks https://%IP%:8100

echo.
echo ✅ Chrome launched with development flags
echo 📱 Access your app at: https://%IP%:8100
echo.
pause 