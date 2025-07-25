#!/usr/bin/env python3
"""
ToneBridge Backend Runner Script
"""

import os
import sys
from app import create_app

def main():
    """Main entry point for the application"""
    try:
        # Create the Flask app
        app = create_app()
        
        # Get configuration
        host = os.getenv('HOST', '0.0.0.0')
        port = int(os.getenv('PORT', 5000))
        debug = os.getenv('FLASK_ENV') == 'development'
        
        print(f"🚀 Starting ToneBridge Backend...")
        print(f"📍 Server: {host}:{port}")
        print(f"🔧 Debug Mode: {debug}")
        print(f"🌐 Health Check: http://{host}:{port}/health")
        print(f"📚 API Docs: http://{host}:{port}/")
        print("=" * 50)
        
        # Run the application
        app.run(
            host=host,
            port=port,
            debug=debug
        )
        
    except KeyboardInterrupt:
        print("\n🛑 Shutting down ToneBridge Backend...")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error starting ToneBridge Backend: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main() 