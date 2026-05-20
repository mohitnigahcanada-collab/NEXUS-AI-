#!/usr/bin/env bash
# g4f Persistent Server with Auto-Restart
# This script ensures g4f server stays running

set -e

# Configuration
G4F_PORT=4001
G4F_HOST="127.0.0.1"
PYTHON_VENV="/home/mohit/ai-agents/venv"
LOG_FILE="/tmp/g4f-server.log"
PID_FILE="/tmp/g4f-server.pid"
MAX_RETRIES=999999  # Infinite retries
RETRY_DELAY=5       # Wait 5 seconds between restarts

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARN:${NC} $1" | tee -a "$LOG_FILE"
}

# Kill existing g4f processes
cleanup() {
    log "Cleaning up existing g4f processes..."
    pkill -9 -f "g4f" 2>/dev/null || true
    pkill -9 -f "uvicorn" 2>/dev/null || true
    rm -f "$PID_FILE"
    sleep 2
}

# Check if port is in use
check_port() {
    if lsof -Pi :$G4F_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Start g4f server
start_g4f() {
    log "Starting g4f API server on $G4F_HOST:$G4F_PORT..."
    
    # Activate venv and start server in background
    cd "$PYTHON_VENV"
    source bin/activate
    
    # Start with nohup and redirect output
    nohup python -c "
import sys
import signal
from g4f.api import run_api

def signal_handler(sig, frame):
    print('\\ng4f server stopping...')
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

print('🚀 g4f server starting...')
print(f'📡 Listening on http://$G4F_HOST:$G4F_PORT')
print('💡 Press Ctrl+C to stop')

try:
    run_api(host='$G4F_HOST', port=$G4F_PORT, debug=False, use_colors=False)
except Exception as e:
    print(f'❌ Error: {e}')
    sys.exit(1)
" >> "$LOG_FILE" 2>&1 &
    
    local pid=$!
    echo $pid > "$PID_FILE"
    
    log "g4f server started with PID: $pid"
    sleep 3
}

# Check if server is responding
check_health() {
    if curl -s --max-time 2 "http://$G4F_HOST:$G4F_PORT/" >/dev/null 2>&1; then
        return 0  # Healthy
    else
        return 1  # Not responding
    fi
}

# Monitor and restart loop
monitor_loop() {
    local retry_count=0
    
    log "🔄 Starting g4f monitor loop (infinite retries)..."
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        # Check if process is running
        if [ -f "$PID_FILE" ]; then
            local pid=$(cat "$PID_FILE")
            if ! ps -p $pid > /dev/null 2>&1; then
                warn "g4f process died (PID: $pid). Restarting..."
                cleanup
                start_g4f
                retry_count=$((retry_count + 1))
                sleep $RETRY_DELAY
                continue
            fi
        else
            warn "PID file missing. Starting g4f..."
            cleanup
            start_g4f
            retry_count=$((retry_count + 1))
            sleep $RETRY_DELAY
            continue
        fi
        
        # Check health every 10 seconds
        sleep 10
        
        if ! check_health; then
            warn "g4f health check failed. Restarting..."
            cleanup
            start_g4f
            retry_count=$((retry_count + 1))
            sleep $RETRY_DELAY
        fi
    done
}

# Main execution
main() {
    log "═══════════════════════════════════════════════════"
    log "🚀 g4f Persistent Server Manager"
    log "═══════════════════════════════════════════════════"
    log "Port: $G4F_PORT"
    log "Host: $G4F_HOST"
    log "Log: $LOG_FILE"
    log "═══════════════════════════════════════════════════"
    echo ""
    
    # Initial cleanup
    cleanup
    
    # Start server
    start_g4f
    
    # Wait for startup
    sleep 5
    
    # Check if it started successfully
    if check_health; then
        log "✅ g4f server is running and healthy!"
        log "🎯 Access at: http://$G4F_HOST:$G4F_PORT"
    else
        error "❌ g4f server failed to start properly"
        error "Check logs at: $LOG_FILE"
        exit 1
    fi
    
    # Start monitoring (runs forever)
    monitor_loop
}

# Handle script termination
trap cleanup EXIT

# Run main
main
