@echo off
echo 🚀 Starting ToneBridge Backend...
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

REM Change to backend directory and start
cd backend
echo 🎯 Starting backend on %FLASK_RUN_HOST%:%FLASK_RUN_PORT%...
echo.

REM Try flask run first, fallback to python run.py if it fails
flask run
if errorlevel 1 (
    echo.
    echo ⚠️  flask run failed, trying python run.py...
    echo.
    python run.py
)

pause 