#!/bin/bash

echo "========================================"
echo "iOS Recording Issue Diagnosis Tool"
echo "========================================"
echo

echo "Checking network configuration..."
echo

# Get local IP address
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)

if [ -z "$IP" ]; then
    echo "❌ Could not determine your IP address"
    echo "   Make sure you're connected to WiFi"
    exit 1
fi

echo "Your computer's IP address: $IP"
echo

echo "Testing backend connectivity..."
echo

# Test if backend is running
if curl -k -s "https://$IP:5000/health" > /dev/null 2>&1; then
    echo "✅ Backend is accessible at https://$IP:5000"
else
    echo "❌ Backend is NOT accessible at https://$IP:5000"
    echo "   Make sure the backend is running with HTTPS"
fi

echo

echo "Testing frontend connectivity..."
echo

# Test if frontend is running
if curl -k -s "https://$IP:3000" > /dev/null 2>&1; then
    echo "✅ Frontend is accessible at https://$IP:3000"
else
    echo "❌ Frontend is NOT accessible at https://$IP:3000"
    echo "   Make sure the frontend is running with HTTPS"
fi

echo

echo "========================================"
echo "iOS Troubleshooting Steps:"
echo "========================================"
echo
echo "1. On your iPhone, open Safari"
echo "2. Go to: https://$IP:3000"
echo "3. Accept the security certificate when prompted"
echo "4. Allow microphone access when asked"
echo "5. Try recording audio"
echo
echo "If recording fails:"
echo "- Check that both devices are on the same WiFi"
echo "- Try clearing Safari website data"
echo "- Restart Safari and try again"
echo "- Check iOS version (iOS 14+ recommended)"
echo
echo "For detailed troubleshooting, see: iOS-TROUBLESHOOTING.md"
echo

read -p "Press Enter to continue..." 