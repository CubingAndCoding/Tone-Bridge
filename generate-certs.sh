#!/bin/bash

# Generate SSL certificates for local HTTPS development
# This allows microphone access from local IP addresses

echo "🔐 Generating SSL certificates for local HTTPS development..."
echo "=========================================================="

# Create certs directory
mkdir -p frontend/certs

# Check if OpenSSL is available
if ! command -v openssl &> /dev/null; then
    echo "❌ OpenSSL is not installed. Please install OpenSSL first."
    echo ""
    echo "Ubuntu/Debian: sudo apt-get install openssl"
    echo "macOS: brew install openssl"
    echo "Windows: Download from https://slproweb.com/products/Win32OpenSSL.html"
    exit 1
fi

# Generate private key
echo "🔑 Generating private key..."
openssl genrsa -out frontend/certs/localhost-key.pem 2048

# Generate certificate signing request
echo "📝 Generating certificate signing request..."
openssl req -new -key frontend/certs/localhost-key.pem -out frontend/certs/localhost.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Generate self-signed certificate
echo "🏷️  Generating self-signed certificate..."
openssl x509 -req -in frontend/certs/localhost.csr -signkey frontend/certs/localhost-key.pem -out frontend/certs/localhost.pem -days 365

# Clean up CSR file
rm frontend/certs/localhost.csr

echo ""
echo "✅ SSL certificates generated successfully!"
echo "📁 Certificates saved to: frontend/certs/"
echo ""
echo "🔒 Now you can access your app via HTTPS:"
echo "   - Frontend: https://YOUR_IP:3000"
echo "   - Backend: https://YOUR_IP:5000"
echo ""
echo "📱 This will allow microphone access from local IP addresses."
echo ""
echo "⚠️  Note: You'll need to accept the self-signed certificate in your browser."
echo "   Click 'Advanced' and 'Proceed to localhost (unsafe)' when prompted." 