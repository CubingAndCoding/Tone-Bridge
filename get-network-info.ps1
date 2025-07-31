# ToneBridge Network Setup Script for Windows
# This script helps you get your local IP address and set up environment variables

Write-Host "🌐 ToneBridge Network Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Get the local IP address
try {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi" -ErrorAction SilentlyContinue).IPAddress
    if (-not $ip) {
        $ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet" -ErrorAction SilentlyContinue).IPAddress
    }
    if (-not $ip) {
        $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*"} | Select-Object -First 1).IPAddress
    }
} catch {
    Write-Host "❌ Could not automatically detect IP address" -ForegroundColor Red
    Write-Host "Please run 'ipconfig' and look for your IPv4 address" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Your local IP address is: $ip" -ForegroundColor Green
Write-Host ""

# Set environment variables
$env:REACT_APP_API_URL = "http://$ip`:5000"
$env:FLASK_RUN_HOST = "0.0.0.0"
$env:FLASK_RUN_PORT = "5000"
$env:FLASK_APP = "app.py"
$env:FLASK_ENV = "development"
$env:FLASK_DEBUG = "1"

Write-Host "🔧 Set environment variables:" -ForegroundColor Cyan
Write-Host "   REACT_APP_API_URL: $env:REACT_APP_API_URL" -ForegroundColor White
Write-Host "   FLASK_RUN_HOST: $env:FLASK_RUN_HOST" -ForegroundColor White
Write-Host "   FLASK_RUN_PORT: $env:FLASK_RUN_PORT" -ForegroundColor White

# Create .env file for frontend
$envContent = "REACT_APP_API_URL=http://$ip`:5000"
$envContent | Out-File -FilePath "frontend\.env" -Encoding UTF8
Write-Host "📄 Created frontend\.env file" -ForegroundColor Cyan

Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start the backend: cd backend;  flask run" -ForegroundColor White
Write-Host "2. Start the frontend: cd frontend;  npm run dev:network" -ForegroundColor White
Write-Host "3. Access from other devices:" -ForegroundColor White
Write-Host "   - Frontend: http://$ip`:3000" -ForegroundColor Cyan
Write-Host "   - Backend: http://$ip`:5000" -ForegroundColor Cyan
Write-Host ""

# Check if ports are available
Write-Host "🔍 Checking if ports are available..." -ForegroundColor Yellow

$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($port5000) {
    Write-Host "⚠️  Port 5000 is already in use" -ForegroundColor Yellow
    Write-Host "   You may need to stop the existing process" -ForegroundColor White
} else {
    Write-Host "✅ Port 5000 is available" -ForegroundColor Green
}

if ($port3000) {
    Write-Host "⚠️  Port 3000 is already in use" -ForegroundColor Yellow
    Write-Host "   You may need to stop the existing process" -ForegroundColor White
} else {
    Write-Host "✅ Port 3000 is available" -ForegroundColor Green
}

Write-Host ""
Write-Host "📚 For more information, see network-setup.md" -ForegroundColor Cyan 