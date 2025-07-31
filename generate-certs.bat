@echo off
echo 🔐 Generating SSL certificates for local HTTPS development...
echo ==========================================================

REM Create certs directory
if not exist "frontend\certs" mkdir frontend\certs
echo 📁 Created frontend\certs directory

REM Check if OpenSSL is available
openssl version >nul 2>&1
if errorlevel 1 (
    echo ❌ OpenSSL is not installed or not in PATH.
    echo.
    echo Please install OpenSSL:
    echo 1. Download from https://slproweb.com/products/Win32OpenSSL.html
    echo 2. Install and add to PATH
    echo 3. Restart your terminal
    echo.
    pause
    exit /b 1
)

echo ✅ OpenSSL found
echo.

echo 🔑 Generating private key...
openssl genrsa -out frontend\certs\localhost-key.pem 2048
if errorlevel 1 (
    echo ❌ Failed to generate private key
    pause
    exit /b 1
)
echo ✅ Private key generated

echo 📝 Generating certificate signing request...
openssl req -new -key frontend\certs\localhost-key.pem -out frontend\certs\localhost.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
if errorlevel 1 (
    echo ❌ Failed to generate CSR
    pause
    exit /b 1
)
echo ✅ Certificate signing request generated

echo 🏷️  Generating self-signed certificate...
openssl x509 -req -in frontend\certs\localhost.csr -signkey frontend\certs\localhost-key.pem -out frontend\certs\localhost.pem -days 365
if errorlevel 1 (
    echo ❌ Failed to generate certificate
    pause
    exit /b 1
)
echo ✅ Self-signed certificate generated

REM Clean up CSR file
del frontend\certs\localhost.csr
echo 🧹 Cleaned up temporary CSR file

echo.
echo ✅ SSL certificates generated successfully!
echo 📁 Certificates saved to: frontend\certs\
echo.
echo 🔒 Now you can access your app via HTTPS:
echo    - Frontend: https://YOUR_IP:8100
echo    - Backend: https://YOUR_IP:5000
echo.
echo 📱 This will allow microphone access from local IP addresses.
echo.
echo ⚠️  Note: You'll need to accept the self-signed certificate in your browser.
echo    Click 'Advanced' and 'Proceed to localhost (unsafe)' when prompted.
echo.
echo 🚀 To start with HTTPS, use:
echo    - start-backend-https.bat
echo    - start-frontend-https.bat
echo.
pause 