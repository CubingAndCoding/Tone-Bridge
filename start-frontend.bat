@echo off
echo 🎨 Starting ToneBridge Frontend...
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

REM Create .env file for frontend
echo VITE_REACT_APP_API_URL=http://%IP%:5000 > frontend\.env
echo 📄 Created frontend\.env file with API URL: http://%IP%:5000
echo.

REM Change to frontend directory and start
cd frontend
echo 🎯 Starting frontend on 0.0.0.0:8100...
echo.

npm run dev:network

pause 