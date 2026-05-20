#!/usr/bin/env python3
"""
Persistent g4f API Server for Nexus AI V2
Provides GPT-4o and Claude 3.5 Sonnet access via gpt4free
"""

import sys
import signal
from g4f.api import run_api

def signal_handler(sig, frame):
    print('\n🛑 g4f server shutting down gracefully...')
    sys.exit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("=" * 60)
    print("🚀 Starting g4f API Server for Nexus AI V2")
    print("=" * 60)
    print(f"📡 Listening on: http://127.0.0.1:4001")
    print(f"🎯 Models available: GPT-4o, Claude 3.5 Sonnet, GPT-3.5")
    print(f"💡 OpenAI-compatible API endpoints")
    print("=" * 60)
    print()
    
    try:
        run_api(
            host='127.0.0.1',
            port=4001,
            debug=False,
            use_colors=True
        )
    except KeyboardInterrupt:
        print("\n✅ Server stopped")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
