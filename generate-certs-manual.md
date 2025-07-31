# Manual SSL Certificate Generation

To fix the WebSocket connection issues, you need to generate SSL certificates for HTTPS support.

## Current Setup (HTTP - Working)

Your app is currently configured to use HTTP by default:
- **Frontend**: `http://localhost:8100` or `http://YOUR_IP:8100`
- **Backend**: `http://YOUR_IP:5000`
- **API URL**: `http://YOUR_IP:5000`

This should work without SSL certificates and fix the `net::ERR_SSL_PROTOCOL_ERROR`.

## Option 1: Using OpenSSL (Recommended)

1. Open a PowerShell terminal in your project root
2. Run these commands one by one:

```powershell
# Create certs directory
New-Item -ItemType Directory -Path "frontend\certs" -Force

# Generate private key
openssl genrsa -out frontend\certs\localhost-key.pem 2048

# Generate certificate signing request
openssl req -new -key frontend\certs\localhost-key.pem -out frontend\certs\localhost.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Generate self-signed certificate
openssl x509 -req -in frontend\certs\localhost.csr -signkey frontend\certs\localhost-key.pem -out frontend\certs\localhost.pem -days 365

# Clean up CSR file
Remove-Item frontend\certs\localhost.csr
```

## Option 2: Using mkcert (Alternative)

If you have mkcert installed:

```powershell
# Install mkcert if you don't have it
# winget install FiloSottile.mkcert

# Create certs directory
New-Item -ItemType Directory -Path "frontend\certs" -Force

# Generate certificates
mkcert -key-file frontend\certs\localhost-key.pem -cert-file frontend\certs\localhost.pem localhost 127.0.0.1 ::1
```

## After Generating Certificates

### For HTTPS Setup:

1. **Start Backend with HTTPS**:
   ```bash
   start-backend-https.bat
   ```

2. **Start Frontend with HTTPS**:
   ```bash
   start-frontend-https.bat
   ```

3. The WebSocket connection should now work properly with HTTPS
4. You'll be able to access your app via HTTPS

### For HTTP Setup (Current - Recommended):

1. **Start Backend with HTTP**:
   ```bash
   start-backend.bat
   ```

2. **Start Frontend with HTTP**:
   ```bash
   start-frontend.bat
   ```

## Troubleshooting

- If you still get WebSocket errors, try accessing the app via `http://localhost:8100` instead of `https://`
- Make sure your firewall allows connections on ports 8100 and 5000
- Check that the certificates are in the correct location: `frontend/certs/`

## Current Configuration

The Vite config is now set to use `ws` (non-secure WebSocket) by default. Once you generate the certificates, you can update the config to use `wss` (secure WebSocket) by changing the protocol in `frontend/vite.config.ts`:

```typescript
hmr: {
  host: localIP,
  port: 8100,
  protocol: 'wss' // Change from 'ws' to 'wss' after generating certificates
}
```

## Quick Fix for Current Issue

If you want to fix the SSL error immediately without generating certificates:

1. **Stop your current frontend and backend**
2. **Run**: `start-frontend.bat` (uses HTTP)
3. **Run**: `start-backend.bat` (uses HTTP)
4. **Access your app at**: `http://localhost:8100`

This should resolve the `net::ERR_SSL_PROTOCOL_ERROR` immediately. 