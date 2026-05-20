#!/bin/bash
# Nexus Auto-Stabilizer - Proactive Health Monitor & Auto-Healer
# Monitors Nexus service and automatically fixes issues

set -euo pipefail

# Configuration
NEXUS_PORT=4000
G4F_PORT=4001
HEALTH_CHECK_INTERVAL=30
MAX_MEMORY_MB=500
MAX_CONSECUTIVE_FAILURES=3
LOG_FILE="/var/log/nexus-stabilizer.log"
NEXUS_SERVICE="nexus-backend"
G4F_SERVICE="g4f"

# Counters
CONSECUTIVE_FAILURES=0
RESTART_COUNT=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

# Check if service is running
check_service_status() {
    local service=$1
    systemctl is-active --quiet "$service"
    return $?
}

# Check if port is responding
check_port_health() {
    local port=$1
    local timeout=5
    
    if timeout "$timeout" bash -c "cat < /dev/null > /dev/tcp/localhost/$port" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Check API health with actual request
check_api_health() {
    local response
    response=$(curl -s -m 5 http://localhost:$NEXUS_PORT/api/variants 2>&1)
    
    if echo "$response" | jq -e '.variants' > /dev/null 2>&1; then
        return 0
    else
        log_error "API health check failed: $response"
        return 1
    fi
}

# Check memory usage
check_memory_usage() {
    local pid
    pid=$(systemctl show -p MainPID "$NEXUS_SERVICE" | cut -d= -f2)
    
    if [ "$pid" -eq 0 ]; then
        return 1
    fi
    
    local mem_mb
    mem_mb=$(ps -o rss= -p "$pid" 2>/dev/null | awk '{print int($1/1024)}')
    
    if [ -z "$mem_mb" ]; then
        return 1
    fi
    
    if [ "$mem_mb" -gt "$MAX_MEMORY_MB" ]; then
        log_warning "Memory usage high: ${mem_mb}MB (threshold: ${MAX_MEMORY_MB}MB)"
        return 1
    fi
    
    return 0
}

# Kill zombie processes on port
kill_port_zombies() {
    local port=$1
    local pids
    pids=$(lsof -ti:$port 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        log_warning "Killing zombie processes on port $port: $pids"
        echo "$pids" | xargs -r kill -9
        sleep 2
        return 0
    fi
    
    return 1
}

# Check g4f dependency
check_g4f_health() {
    if ! check_service_status "$G4F_SERVICE"; then
        log_warning "g4f service not running, attempting restart"
        sudo systemctl restart "$G4F_SERVICE"
        sleep 3
        
        if check_service_status "$G4F_SERVICE"; then
            log_success "g4f service restarted successfully"
            return 0
        else
            log_error "Failed to restart g4f service"
            return 1
        fi
    fi
    
    if ! check_port_health "$G4F_PORT"; then
        log_warning "g4f port $G4F_PORT not responding"
        return 1
    fi
    
    return 0
}

# Analyze error logs for common issues
analyze_errors() {
    local log_file="/home/mohit/nexus-ai-v2/logs/nexus-error.log"
    
    if [ ! -f "$log_file" ]; then
        return 0
    fi
    
    local recent_errors
    recent_errors=$(tail -50 "$log_file" 2>/dev/null)
    
    # Check for syntax errors
    if echo "$recent_errors" | grep -q "SyntaxError\|Unexpected token"; then
        log_error "Syntax errors detected in code - manual intervention required"
        return 1
    fi
    
    # Check for port conflicts
    if echo "$recent_errors" | grep -q "EADDRINUSE\|port.*in use"; then
        log_warning "Port conflict detected, attempting cleanup"
        kill_port_zombies "$NEXUS_PORT"
        return 2
    fi
    
    # Check for missing dependencies
    if echo "$recent_errors" | grep -q "Cannot find module\|MODULE_NOT_FOUND"; then
        log_error "Missing dependencies detected - run: cd /home/mohit/nexus-ai-v2 && bun install"
        return 1
    fi
    
    return 0
}

# Attempt self-healing
self_heal() {
    log "Attempting self-healing..."
    
    # Step 1: Check g4f dependency
    if ! check_g4f_health; then
        log_warning "g4f unhealthy, may affect some models"
    fi
    
    # Step 2: Analyze errors
    analyze_errors
    local error_code=$?
    
    if [ $error_code -eq 2 ]; then
        # Port conflict - zombies killed, try restart
        log "Port zombies cleared, restarting service"
        sudo systemctl restart "$NEXUS_SERVICE"
        sleep 5
        return 0
    elif [ $error_code -eq 1 ]; then
        # Fatal error - manual intervention needed
        return 1
    fi
    
    # Step 3: Memory check and restart if needed
    if ! check_memory_usage; then
        log "High memory usage detected, restarting to clear"
        sudo systemctl restart "$NEXUS_SERVICE"
        sleep 5
        return 0
    fi
    
    # Step 4: Simple restart
    log "Performing service restart"
    sudo systemctl restart "$NEXUS_SERVICE"
    sleep 5
    
    return 0
}

# Main health check
perform_health_check() {
    log "=== Health Check Started ==="
    
    # Check 1: Service status
    if ! check_service_status "$NEXUS_SERVICE"; then
        log_error "Service not running"
        CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
        
        if [ $CONSECUTIVE_FAILURES -ge $MAX_CONSECUTIVE_FAILURES ]; then
            log_error "Max consecutive failures reached, attempting self-heal"
            if self_heal; then
                CONSECUTIVE_FAILURES=0
                RESTART_COUNT=$((RESTART_COUNT + 1))
                log_success "Self-heal successful (restart #$RESTART_COUNT)"
            else
                log_error "Self-heal failed - MANUAL INTERVENTION REQUIRED"
                return 1
            fi
        else
            log_warning "Failure $CONSECUTIVE_FAILURES/$MAX_CONSECUTIVE_FAILURES"
        fi
        return 1
    fi
    
    # Check 2: Port responding
    if ! check_port_health "$NEXUS_PORT"; then
        log_error "Port $NEXUS_PORT not responding"
        CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
        
        if [ $CONSECUTIVE_FAILURES -ge $MAX_CONSECUTIVE_FAILURES ]; then
            self_heal
            CONSECUTIVE_FAILURES=0
            RESTART_COUNT=$((RESTART_COUNT + 1))
        fi
        return 1
    fi
    
    # Check 3: API health
    if ! check_api_health; then
        log_error "API health check failed"
        CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
        
        if [ $CONSECUTIVE_FAILURES -ge $MAX_CONSECUTIVE_FAILURES ]; then
            self_heal
            CONSECUTIVE_FAILURES=0
            RESTART_COUNT=$((RESTART_COUNT + 1))
        fi
        return 1
    fi
    
    # Check 4: Memory usage
    if ! check_memory_usage; then
        # Don't fail immediately on high memory, just warn
        log_warning "High memory usage detected, will restart if continues"
    fi
    
    # All checks passed
    CONSECUTIVE_FAILURES=0
    log_success "All health checks passed (restarts: $RESTART_COUNT)"
    return 0
}

# Startup checks
startup_checks() {
    log "=========================================="
    log "Nexus Auto-Stabilizer Starting"
    log "=========================================="
    log "Configuration:"
    log "  - Nexus Port: $NEXUS_PORT"
    log "  - g4f Port: $G4F_PORT"
    log "  - Health Check Interval: ${HEALTH_CHECK_INTERVAL}s"
    log "  - Max Memory: ${MAX_MEMORY_MB}MB"
    log "  - Max Failures Before Heal: $MAX_CONSECUTIVE_FAILURES"
    log "=========================================="
    
    # Initial health check
    if ! perform_health_check; then
        log_warning "Initial health check failed, attempting startup heal"
        self_heal
    fi
}

# Graceful shutdown
cleanup() {
    log "=========================================="
    log "Nexus Auto-Stabilizer Stopping"
    log "Total Restarts Performed: $RESTART_COUNT"
    log "=========================================="
    exit 0
}

trap cleanup SIGINT SIGTERM

# Main loop
startup_checks

while true; do
    perform_health_check
    sleep "$HEALTH_CHECK_INTERVAL"
done
