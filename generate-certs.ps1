# Generate SSL certificates for local HTTPS development
Write-Host "🔐 Generating SSL certificates for local HTTPS development..." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

# Create certs directory
if (!(Test-Path "frontend\certs")) {
    New-Item -ItemType Directory -Path "frontend\certs" -Force | Out-Null
    Write-Host "📁 Created frontend\certs directory" -ForegroundColor Yellow
}

# Check if OpenSSL is available
try {
    $opensslVersion = & openssl version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "OpenSSL not found"
    }
    Write-Host "✅ OpenSSL found: $opensslVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ OpenSSL is not installed or not in PATH." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install OpenSSL:" -ForegroundColor Yellow
    Write-Host "1. Download from https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Yellow
    Write-Host "2. Install and add to PATH" -ForegroundColor Yellow
    Write-Host "3. Restart your terminal" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "🔑 Generating private key..." -ForegroundColor Yellow
& openssl genrsa -out "frontend\certs\localhost-key.pem" 2048
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate private key" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Private key generated" -ForegroundColor Green

Write-Host "📝 Generating certificate signing request..." -ForegroundColor Yellow
& openssl req -new -key "frontend\certs\localhost-key.pem" -out "frontend\certs\localhost.csr" -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" -nodes
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate CSR" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Certificate signing request generated" -ForegroundColor Green

Write-Host "🏷️  Generating self-signed certificate..." -ForegroundColor Yellow
& openssl x509 -req -in "frontend\certs\localhost.csr" -signkey "frontend\certs\localhost-key.pem" -out "frontend\certs\localhost.pem" -days 365
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate certificate" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Self-signed certificate generated" -ForegroundColor Green

# Clean up CSR file
if (Test-Path "frontend\certs\localhost.csr") {
    Remove-Item "frontend\certs\localhost.csr" -Force
    Write-Host "🧹 Cleaned up temporary CSR file" -ForegroundColor Yellow
}

# Verify certificates were created
if ((Test-Path "frontend\certs\localhost.pem") -and (Test-Path "frontend\certs\localhost-key.pem")) {
    Write-Host ""
    Write-Host "✅ SSL certificates generated successfully!" -ForegroundColor Green
    Write-Host "📁 Certificates saved to: frontend\certs\" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔒 Now you can access your app via HTTPS:" -ForegroundColor Cyan
    Write-Host "   - Frontend: https://YOUR_IP:8100" -ForegroundColor White
    Write-Host "   - Backend: https://YOUR_IP:5000" -ForegroundColor White
    Write-Host ""
    Write-Host "📱 This will allow microphone access from local IP addresses." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  Note: You'll need to accept the self-signed certificate in your browser." -ForegroundColor Yellow
    Write-Host "   Click 'Advanced' and 'Proceed to localhost (unsafe)' when prompted." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🚀 To start with HTTPS, use:" -ForegroundColor Green
    Write-Host "   - start-backend-https.bat" -ForegroundColor White
    Write-Host "   - start-frontend-https.bat" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ Certificate files were not created properly" -ForegroundColor Red
    exit 1
} 