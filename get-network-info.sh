#!/bin/bash

# ToneBridge Network Setup Script for macOS/Linux
# This script helps you get your local IP address and set up environment variables

echo "🌐 ToneBridge Network Setup"
echo "================================"

# Get the local IP address
if command -v ip &> /dev/null; then
    # Linux with ip command
    IP=$(ip route get 1.1.1.1 | grep -oP 'src \K\S+' | head -n1)
elif command -v ifconfig &> /dev/null; then
    # macOS/Linux with ifconfig
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
    else
        # Linux
        IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
    fi
else
    echo "❌ Could not detect IP address automatically"
    echo "Please run 'ifconfig' or 'ip addr show' and look for your IP address"
    exit 1
fi

if [ -z "$IP" ]; then
    echo "❌ Could not detect IP address"
    echo "Please check your network connection and try again"
    exit 1
fi

echo "✅ Your local IP address is: $IP"
echo ""

# Set environment variables
export REACT_APP_API_URL="http://$IP:5000"
export FLASK_RUN_HOST="0.0.0.0"
export FLASK_RUN_PORT="5000"
export FLASK_APP="app.py"
export FLASK_ENV="development"
export FLASK_DEBUG="1"

echo "🔧 Set environment variables:"
echo "   REACT_APP_API_URL: $REACT_APP_API_URL"
echo "   FLASK_RUN_HOST: $FLASK_RUN_HOST"
echo "   FLASK_RUN_PORT: $FLASK_RUN_PORT"

# Create .env file for frontend
echo "REACT_APP_API_URL=http://$IP:5000" > frontend/.env
echo "📄 Created frontend/.env file"

echo ""
echo "🚀 Next Steps:"
echo "1. Start the backend: cd backend && flask run"
echo "2. Start the frontend: cd frontend && npm run dev:network"
echo "3. Access from other devices:"
echo "   - Frontend: http://$IP:3000"
echo "   - Backend: http://$IP:5000"
echo ""

# Check if ports are available
echo "🔍 Checking if ports are available..."

if command -v lsof &> /dev/null; then
    PORT5000=$(lsof -i :5000 2>/dev/null | wc -l)
    PORT3000=$(lsof -i :3000 2>/dev/null | wc -l)
    
    if [ $PORT5000 -gt 0 ]; then
        echo "⚠️  Port 5000 is already in use"
        echo "   You may need to stop the existing process"
    else
        echo "✅ Port 5000 is available"
    fi
    
    if [ $PORT3000 -gt 0 ]; then
        echo "⚠️  Port 3000 is already in use"
        echo "   You may need to stop the existing process"
    else
        echo "✅ Port 3000 is available"
    fi
else
    echo "ℹ️  Install lsof to check port availability"
fi

echo ""
echo "📚 For more information, see network-setup.md"

# Make the script executable
chmod +x "$0" 