#!/usr/bin/env bash
# Start both Nexus AI and g4f servers together

NEXUS_DIR="/home/mohit/nexus-ai-v2"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🚀 Starting NEXUS AI V2 + g4f Server Stack              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -9 -f "g4f" 2>/dev/null || true
pkill -9 -f "bun.*nexus" 2>/dev/null || true
sleep 2

# Start g4f server in background with persistent manager
echo "🔧 Starting g4f persistent server..."
cd "$NEXUS_DIR"
nohup bash g4f-persistent-manager.sh > /tmp/g4f-manager.log 2>&1 &
G4F_PID=$!
echo "   g4f manager PID: $G4F_PID"

# Wait for g4f to be ready
echo "⏳ Waiting for g4f server to start..."
sleep 8

# Check g4f health
if curl -s --max-time 3 "http://127.0.0.1:4001/" >/dev/null 2>&1; then
    echo "   ✅ g4f server is running!"
else
    echo "   ⚠️  g4f server not responding (may still be starting)"
fi

# Start Nexus server
echo ""
echo "🎯 Starting Nexus AI V2 server..."
cd "$NEXUS_DIR"
nohup bun src/index.ts > /tmp/nexus-server.log 2>&1 &
NEXUS_PID=$!
echo "   Nexus PID: $NEXUS_PID"

# Wait for Nexus to start
echo "⏳ Waiting for Nexus server to start..."
sleep 5

# Check Nexus health
if curl -s --max-time 3 "http://localhost:4000/" >/dev/null 2>&1; then
    echo "   ✅ Nexus server is running!"
else
    echo "   ⚠️  Nexus server not responding yet"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   ✅ STACK STARTED                                         ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║   🎯 Nexus Dashboard:  http://localhost:4000              ║"
echo "║   🔧 g4f API:          http://localhost:4001              ║"
echo "║                                                            ║"
echo "║   📋 Logs:                                                 ║"
echo "║      Nexus:  tail -f /tmp/nexus-server.log                ║"
echo "║      g4f:    tail -f /tmp/g4f-server.log                  ║"
echo "║      Manager: tail -f /tmp/g4f-manager.log                ║"
echo "║                                                            ║"
echo "║   📊 Status:                                               ║"
echo "║      ps aux | grep 'bun\|g4f'                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🎉 All services started! Use Ctrl+C to stop monitoring."
echo ""

# Monitor both processes
echo "📡 Monitoring services (press Ctrl+C to stop)..."
while true; do
    sleep 30
    
    # Check Nexus
    if ! ps -p $NEXUS_PID > /dev/null 2>&1; then
        echo "⚠️  [$(date)] Nexus server died! Restarting..."
        cd "$NEXUS_DIR"
        nohup bun src/index.ts > /tmp/nexus-server.log 2>&1 &
        NEXUS_PID=$!
    fi
    
    # g4f is managed by its own persistent script
    echo "✅ [$(date)] Services running (Nexus: $NEXUS_PID, g4f manager: $G4F_PID)"
done
