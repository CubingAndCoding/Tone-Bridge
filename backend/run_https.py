#!/usr/bin/env python3
"""
ToneBridge Backend HTTPS Server
Runs the Flask app with SSL certificates for local network access.
"""

import os
import sys
import ssl
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from config import DevelopmentConfig

def main():
    """Start the Flask app with HTTPS support."""
    
    project_root = Path(__file__).parent.parent
    cert_path = project_root / "frontend" / "certs" / "localhost.pem"
    key_path = project_root / "frontend" / "certs" / "localhost-key.pem"
    
    # Check if SSL certificates exist
    if not cert_path.exists():
        print(f"❌ SSL certificate not found: {cert_path}")
        print("Please run 'generate-certs-simple.ps1' to create SSL certificates.")
        sys.exit(1)
    
    if not key_path.exists():
        print(f"❌ SSL key file not found: {key_path}")
        print("Please run 'generate-certs-simple.ps1' to create SSL certificates.")
        sys.exit(1)
    
    print(f"✅ SSL certificates found")
    print(f"📄 Certificate: {cert_path}")
    print(f"🔑 Key file: {key_path}")
    
    # Create SSL context
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(str(cert_path), str(key_path))
    
    # Create Flask app with development config
    app = create_app(DevelopmentConfig)
    
    print("🚀 Starting ToneBridge Backend with HTTPS...")
    print("🌐 Access your app at: https://localhost:5000")
    print("📱 Network access: https://YOUR_IP:5000")
    print("🔒 HTTPS enabled with self-signed certificates")
    print("⚠️  You may need to accept the certificate in your browser")
    print()
    
    # Start the app with HTTPS
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        ssl_context=context
    )

if __name__ == '__main__':
    main() 