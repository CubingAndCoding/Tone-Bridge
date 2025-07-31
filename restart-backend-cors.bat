@echo off
echo Restarting ToneBridge Backend with updated CORS configuration...
echo.

cd backend

echo Stopping any running backend processes...
taskkill /f /im python.exe 2>nul
taskkill /f /im python3.exe 2>nul

echo.
echo Starting backend with new CORS settings...
echo Allowed origins now include: https://192.168.1.210:8100
echo.

python app.py

pause 