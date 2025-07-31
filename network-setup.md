# 🌐 Network Setup Guide

This guide will help you set up ToneBridge so both the backend and frontend can be accessed from any device on your local WiFi network.

## 📋 Prerequisites

- Both backend and frontend are installed and working locally
- You're connected to a WiFi network
- Your firewall allows connections on ports 3000 and 5000
- OpenSSL installed (for HTTPS certificates - optional but recommended)

## 🔧 Step 1: Get Your Local IP Address

### Windows
```bash
ipconfig
```
Look for your WiFi adapter and note the "IPv4 Address" (usually starts with 192.168.x.x or 10.0.x.x)

### macOS/Linux
```bash
ifconfig
# or
ip addr show
```
Look for your WiFi interface (usually `wlan0` or `en0`) and note the IP address

## 🔐 Step 2: Generate SSL Certificates (Recommended)

**Why HTTPS?** Browsers require a secure context (HTTPS) to access sensitive APIs like the microphone when accessing from local IP addresses (192.168.x.x). Localhost works with HTTP, but local IPs need HTTPS.

### Option A: Automatic (Recommended)
The startup scripts will automatically generate certificates if they don't exist.

### Option B: Manual Generation
```bash
# Windows
generate-certs.bat

# macOS/Linux
./generate-certs.sh
```

### Install OpenSSL (if needed)
**Windows**: Download from https://slproweb.com/products/Win32OpenSSL.html
**macOS**: `brew install openssl`
**Ubuntu/Debian**: `sudo apt-get install openssl`

## 🚀 Step 3: Start the Backend

The backend needs Flask environment variables to bind to `0.0.0.0` when using `flask run`.

### Option A: Using the Network Script (Recommended)
```bash
# Windows
start-network.bat

# macOS/Linux
./start-network.sh
```

### Option B: Manual Setup
```bash
cd backend

# Set Flask environment variables
export FLASK_RUN_HOST=0.0.0.0
export FLASK_RUN_PORT=5000
export FLASK_APP=app.py
export FLASK_ENV=development

# Start Flask
flask run
```

**Note**: If you're using `python run.py` instead of `flask run`, the backend is already configured to bind to `0.0.0.0`.

## 🎨 Step 4: Start the Frontend

### Option A: Using the Network Script (Recommended)
```bash
cd frontend
npm run dev:network
```

### Option B: Using Vite Directly
```bash
cd frontend
npx vite --host 0.0.0.0
```

The frontend will start on `0.0.0.0:3000` and will be accessible from any device on your network.

## 🔗 Step 5: Configure Frontend API URL

The startup scripts automatically create the `.env` file with the correct API URL.

### Manual Setup
Create a `.env` file in the frontend directory:

```bash
cd frontend
echo "REACT_APP_API_URL=https://YOUR_LOCAL_IP:5000" > .env  # HTTPS (recommended)
# or
echo "REACT_APP_API_URL=http://YOUR_LOCAL_IP:5000" > .env   # HTTP (microphone may not work)
```

Replace `YOUR_LOCAL_IP` with your actual local IP address (e.g., `192.168.1.100`).

## 📱 Step 6: Access from Other Devices

### From Other Computers
- **HTTPS (Recommended)**: `https://YOUR_LOCAL_IP:3000` - Microphone access enabled
- **HTTP**: `http://YOUR_LOCAL_IP:3000` - Microphone may not work
- Backend API: `https://YOUR_LOCAL_IP:5000` or `http://YOUR_LOCAL_IP:5000`

### From Mobile Devices
- **HTTPS (Recommended)**: `https://YOUR_LOCAL_IP:3000` - Microphone access enabled
- **HTTP**: `http://YOUR_LOCAL_IP:3000` - Microphone may not work
- Backend API: `https://YOUR_LOCAL_IP:5000` or `http://YOUR_LOCAL_IP:5000`

## 🔍 Step 7: Test the Setup

1. **Test Backend**: Visit `https://YOUR_LOCAL_IP:5000/health` or `http://YOUR_LOCAL_IP:5000/health`
2. **Test Frontend**: Visit `https://YOUR_LOCAL_IP:3000` or `http://YOUR_LOCAL_IP:3000`
3. **Test Microphone**: Try recording audio - should work with HTTPS
4. **Test from Mobile**: Open the frontend URL on your phone

## ⚠️ Accepting Self-Signed Certificates

When accessing HTTPS URLs for the first time, your browser will show a security warning:

1. Click "Advanced" or "Show Details"
2. Click "Proceed to localhost (unsafe)" or "Accept the Risk and Continue"
3. The site will load normally

This is safe for local development - the certificates are only for your local network.

## 🛠️ Troubleshooting

### Port Already in Use
If you get "port already in use" errors:

**Backend (Port 5000)**:
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

**Frontend (Port 3000)**:
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Firewall Issues
Make sure your firewall allows connections on ports 3000 and 5000.

**Windows**:
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Add Python and Node.js to the allowed apps

**macOS**:
```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/bin/python3
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
```

**Linux**:
```bash
sudo ufw allow 3000
sudo ufw allow 5000
```

### CORS Issues
If you get CORS errors, make sure the backend's `ALLOWED_ORIGINS` includes your local IP:

In `backend/.env`:
```
ALLOWED_ORIGINS=http://localhost:3000,https://localhost:3000,http://YOUR_LOCAL_IP:3000,https://YOUR_LOCAL_IP:3000
```

### Flask Environment Variables
If using `flask run`, make sure these environment variables are set:
```bash
export FLASK_RUN_HOST=0.0.0.0
export FLASK_RUN_PORT=5000
export FLASK_APP=app.py
export FLASK_ENV=development
```

### Microphone Not Working
If the microphone doesn't work from local IP addresses:

1. **Use HTTPS**: Make sure you're accessing via `https://YOUR_IP:3000`
2. **Check Certificates**: Ensure SSL certificates are generated
3. **Browser Permissions**: Check if the browser is asking for microphone permission
4. **Accept Certificate**: Make sure you've accepted the self-signed certificate

## 📝 Quick Start Scripts

### Windows (PowerShell)
```powershell
# Get IP address
$ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi").IPAddress
Write-Host "Your IP address is: $ip"

# Set environment variables
$env:REACT_APP_API_URL = "https://$ip`:5000"
$env:FLASK_RUN_HOST = "0.0.0.0"
$env:FLASK_RUN_PORT = "5000"
$env:FLASK_APP = "app.py"
$env:FLASK_ENV = "development"

# Generate certificates (if needed)
if (!(Test-Path "frontend\certs\localhost.pem")) {
    .\generate-certs.bat
}

# Start backend (in one terminal)
cd backend
flask run

# Start frontend (in another terminal)
cd frontend
npm run dev:network
```

### macOS/Linux
```bash
# Get IP address
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
echo "Your IP address is: $IP"

# Set environment variables
export REACT_APP_API_URL="https://$IP:5000"
export FLASK_RUN_HOST="0.0.0.0"
export FLASK_RUN_PORT="5000"
export FLASK_APP="app.py"
export FLASK_ENV="development"

# Generate certificates (if needed)
if [ ! -f "frontend/certs/localhost.pem" ]; then
    ./generate-certs.sh
fi

# Start backend (in one terminal)
cd backend
flask run

# Start frontend (in another terminal)
cd frontend
npm run dev:network
```

## 🔒 Security Notes

- This setup is for local development only
- Don't expose these ports to the internet
- Use a strong firewall when testing on public networks
- Self-signed certificates are only for local development
- Consider using HTTPS for production deployments

## 📞 Support

If you encounter issues:
1. Check that both services are running
2. Verify your IP address is correct
3. Test connectivity with `ping YOUR_LOCAL_IP`
4. Check firewall settings
5. Ensure CORS is properly configured
6. Verify Flask environment variables are set (if using `flask run`)
7. Generate SSL certificates for microphone access
8. Accept self-signed certificates in your browser 