# 🌐 Quick Network Setup Guide

## 🚀 Quick Start

### Windows
```bash
# Option 1: Use the batch file (easiest)
start-network.bat

# Option 2: Manual setup
get-network-info.ps1
cd backend && flask run
cd frontend && npm run dev:network
```

### macOS/Linux
```bash
# Option 1: Use the shell script (easiest)
./start-network.sh

# Option 2: Manual setup
./get-network-info.sh
cd backend && flask run
cd frontend && npm run dev:network
```

## 🔐 HTTPS Setup (Required for Microphone)

**Why HTTPS?** Browsers require HTTPS to access the microphone from local IP addresses (192.168.x.x).

### Generate SSL Certificates
```bash
# Windows
generate-certs.bat

# macOS/Linux
./generate-certs.sh
```

**Note**: The startup scripts automatically generate certificates if they don't exist.

### Install OpenSSL (if needed)
**Windows**: Download from https://slproweb.com/products/Win32OpenSSL.html  
**macOS**: `brew install openssl`  
**Ubuntu/Debian**: `sudo apt-get install openssl`

## 🔧 Flask Environment Variables

If using `flask run`, these environment variables are automatically set by the scripts:

```bash
FLASK_RUN_HOST=0.0.0.0
FLASK_RUN_PORT=5000
FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=1
```

**Note**: If using `python run.py`, these variables are not needed as the backend is already configured for network access.

## 📱 Access URLs

Once running, access from any device on your network:

### HTTPS (Recommended - Microphone Enabled)
- **Frontend**: `https://YOUR_IP:3000`
- **Backend**: `https://YOUR_IP:5000`

### HTTP (Microphone May Not Work)
- **Frontend**: `http://YOUR_IP:3000`
- **Backend**: `http://YOUR_IP:5000`

## ⚠️ Accept Self-Signed Certificate

When accessing HTTPS for the first time:
1. Click "Advanced" or "Show Details"
2. Click "Proceed to localhost (unsafe)"
3. Site will load normally

## 🔧 Configuration Files Created

- `frontend/.env` - Contains API URL for network access
- `frontend/certs/` - SSL certificates for HTTPS
- Flask environment variables are set in the session

## 🛠️ Troubleshooting

1. **Port already in use**: Kill existing processes
2. **Firewall issues**: Allow ports 3000 and 5000
3. **CORS errors**: Update `ALLOWED_ORIGINS` in backend `.env`
4. **Flask not binding to 0.0.0.0**: Check `FLASK_RUN_HOST` environment variable
5. **Microphone not working**: Use HTTPS URLs and accept self-signed certificate

## 📚 Full Documentation

See `network-setup.md` for detailed instructions and troubleshooting. 