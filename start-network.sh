#!/bin/bash

# ToneBridge Network Setup Script for macOS/Linux
# This script starts both backend and frontend for network access

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
echo "   REACT_APP_API_URL=$REACT_APP_API_URL"
echo "   FLASK_RUN_HOST=$FLASK_RUN_HOST"
echo "   FLASK_RUN_PORT=$FLASK_RUN_PORT"

# Create .env file for frontend
echo "REACT_APP_API_URL=http://$IP:5000" > frontend/.env
echo "📄 Created frontend/.env file"

# Check if SSL certificates exist
if [ ! -f "frontend/certs/localhost.pem" ]; then
    echo ""
    echo "🔐 SSL certificates not found. Generating for HTTPS access..."
    echo "   This allows microphone access from local IP addresses."
    
    if ./generate-certs.sh; then
        echo "✅ Certificates generated. HTTPS will be available."
        export REACT_APP_API_URL="https://$IP:5000"
        echo "REACT_APP_API_URL=https://$IP:5000" > frontend/.env
    else
        echo "❌ Failed to generate certificates. Continuing with HTTP..."
        echo "   Microphone may not work from local IP addresses."
    fi
else
    echo "✅ SSL certificates found. HTTPS will be available."
    export REACT_APP_API_URL="https://$IP:5000"
    echo "REACT_APP_API_URL=https://$IP:5000" > frontend/.env
fi

echo ""
echo "🚀 Starting ToneBridge for network access..."
echo ""

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping ToneBridge services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend in background
echo "🔧 Starting backend..."
cd backend
FLASK_RUN_HOST=0.0.0.0 FLASK_RUN_PORT=5000 FLASK_APP=app.py FLASK_ENV=development flask run &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🎨 Starting frontend..."
cd frontend
npm run dev:network &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both services are starting..."
echo ""
echo "📱 Access from other devices:"
if [ -f "frontend/certs/localhost.pem" ]; then
    echo "   - Frontend: https://$IP:3000 (HTTPS - microphone enabled)"
    echo "   - Backend: https://$IP:5000 (HTTPS)"
else
    echo "   - Frontend: http://$IP:3000 (HTTP - microphone may not work)"
    echo "   - Backend: http://$IP:5000 (HTTP)"
fi
echo ""
echo "📚 For more information, see network-setup.md"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Wait for user to stop
wait 