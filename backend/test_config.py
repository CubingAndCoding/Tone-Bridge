#!/usr/bin/env python3
"""
Test script to verify backend configuration
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_config():
    """Test if the backend configuration loads correctly"""
    try:
        print("Testing backend configuration...")
        
        # Test config import
        from config import Config, get_config
        print("✅ Config module imported successfully")
        
        # Test config creation
        config = get_config()
        print(f"✅ Config created: {config.__class__.__name__}")
        print(f"   Host: {config.HOST}")
        print(f"   Port: {config.PORT}")
        print(f"   Debug: {config.DEBUG}")
        
        # Test app creation
        from app import create_app
        print("✅ App module imported successfully")
        
        app = create_app()
        print("✅ Flask app created successfully")
        
        print("\n🎉 All configuration tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Configuration test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_config()
    sys.exit(0 if success else 1)
