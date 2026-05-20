# Nexus Backend Crash Fix - Systemd Watchdog Issue

**Date**: May 20, 2026  
**Status**: ✅ RESOLVED  
**Severity**: CRITICAL (Production service crash every ~60 seconds)

---

## Root Cause Analysis

### Symptoms
- Backend crashed every ~1 minute (precisely at 60 seconds)
- Systemd auto-restarted service but it kept failing
- Logs showed: `Watchdog timeout (limit 1min)!` followed by `SIGABRT`
- Service was killed with `code=dumped, status=6/ABRT`

### Root Cause
The systemd service configuration enabled watchdog monitoring (`WatchdogSec=60`) but the Nexus backend **never implemented watchdog notification**. 

**Systemd watchdog workflow:**
1. Systemd expects the service to send `sd_notify(WATCHDOG=1)` signals periodically
2. If no signal is received within `WatchdogSec` (60 seconds), systemd considers the service frozen
3. Systemd kills the process with `SIGABRT` to force restart

**Why it happened:**
- `/etc/systemd/system/nexus-backend.service` had `WatchdogSec=60` 
- `src/index.ts` had **zero watchdog implementation**
- Bun runtime doesn't auto-handle systemd watchdog
- Result: Service killed every 60 seconds like clockwork

### Secondary Issues Discovered
1. **SQLite database locking** - No busy_timeout set (could cause blocking)
2. **No graceful shutdown** - WebSocket connections not cleaned up properly
3. **No error handlers** - Uncaught exceptions/rejections could crash the service
4. **Stale compilation errors** - Old logs showed import errors from previous code versions

---

## Fix Implementation

### 1. Systemd Watchdog Notification
**File**: `src/index.ts`

Added watchdog heartbeat system:
```typescript
// Notify systemd watchdog to prevent timeout kills
function notifySystemdWatchdog() {
  if (!process.env.WATCHDOG_USEC) return; // Not running under systemd watchdog
  
  try {
    const proc = Bun.spawn(["systemd-notify", "WATCHDOG=1"], {
      stdout: "ignore",
      stderr: "ignore",
    });
    proc.unref(); // Don't wait for completion
  } catch {
    // Silently fail if systemd-notify is not available
  }
}

// Send watchdog notification every 30 seconds (half of WatchdogSec=60)
const watchdogInterval = setInterval(() => {
  notifySystemdWatchdog();
}, 30000);

// Notify on startup
notifySystemdWatchdog();
```

**Why 30 seconds?**  
Systemd best practice: Send notifications at **half the WatchdogSec interval** to provide safety margin.

### 2. Graceful Shutdown Handling
**File**: `src/index.ts`

Added proper shutdown procedure:
```typescript
function shutdown(signal: string) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  // Stop watchdog notifications
  clearInterval(watchdogInterval);
  
  // Notify systemd we're stopping
  try {
    Bun.spawnSync(["systemd-notify", "STOPPING=1"]);
  } catch {}
  
  // Close all WebSocket connections
  for (const ws of wsClients) {
    try {
      ws.close(1000, "Server shutting down");
    } catch {}
  }
  wsClients.clear();
  
  // Give time for connections to close
  setTimeout(() => {
    console.log("Shutdown complete.");
    process.exit(0);
  }, 1000);
}

// Handle shutdown signals
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGABRT", () => shutdown("SIGABRT"));
```

### 3. Error Recovery
**File**: `src/index.ts`

Added uncaught error handlers:
```typescript
// Handle uncaught errors gracefully
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  // Don't exit - let watchdog handle if service is truly broken
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason);
  // Don't exit - log and continue
});
```

### 4. SQLite Database Tuning
**File**: `src/db.ts`

Added busy timeout to prevent lock contention:
```typescript
db.run("PRAGMA journal_mode = WAL");
db.run("PRAGMA synchronous = NORMAL");
db.run("PRAGMA busy_timeout = 5000"); // Wait up to 5s if database is locked
```

---

## Verification Results

### Before Fix
```
May 20 17:26:15 mohit systemd[1]: nexus-backend.service: Watchdog timeout (limit 1min)!
May 20 17:26:15 mohit systemd[1]: nexus-backend.service: Killing process 190341 (bun) with signal SIGABRT.
May 20 17:27:26 mohit systemd[1]: nexus-backend.service: Watchdog timeout (limit 1min)!
May 20 17:27:26 mohit systemd[1]: nexus-backend.service: Killing process 190492 (bun) with signal SIGABRT.
[...repeated every 60 seconds...]
```

### After Fix
```
=== STABILITY TEST ===
[30s] Status: active
[60s] Status: active  ✅ Survived first watchdog check
[90s] Status: active  ✅ Survived second watchdog check
[120s] Status: active
[150s] Status: active
[180s] Status: active ✅ Service stable for 3 minutes
```

**API Health Check**: `curl http://localhost:4000/health` → `{"status":"ok"}`

---

## Prevention Strategy

### For Future Development

1. **Watchdog Monitoring**
   - Keep `WatchdogSec=60` in systemd config (it's valuable for detecting true hangs)
   - Always maintain watchdog notification every 30s
   - Monitor logs for `Watchdog timeout` messages

2. **Error Handling**
   - Always add `process.on('uncaughtException')` handlers
   - Always add `process.on('unhandledRejection')` handlers
   - Log errors but don't crash on non-critical failures

3. **Database Safety**
   - Use `PRAGMA busy_timeout` for SQLite
   - Use WAL mode for concurrent access
   - Set reasonable timeouts (5-10 seconds)

4. **Graceful Shutdown**
   - Handle SIGTERM, SIGINT, SIGABRT signals
   - Clean up resources (WebSockets, database, timers)
   - Notify systemd with `STOPPING=1` before exit

5. **Testing Protocol**
   - After any systemd config change, run stability test:
     ```bash
     # Monitor for at least 3 minutes
     watch -n 10 'systemctl status nexus-backend'
     ```
   - Check logs for watchdog messages:
     ```bash
     journalctl -u nexus-backend -f | grep -i watchdog
     ```

### Code Change Checklist

Before deploying systemd-managed services:

- [ ] Implement watchdog notification if `WatchdogSec` is set
- [ ] Add graceful shutdown handlers for all signals
- [ ] Add uncaughtException and unhandledRejection handlers
- [ ] Set database/resource timeouts appropriately
- [ ] Test service survives >2x WatchdogSec duration
- [ ] Verify API is functional after restart

---

## Verification Commands

### Check Service Status
```bash
systemctl status nexus-backend
```

### Monitor Logs for Issues
```bash
journalctl -u nexus-backend -f
```

### Test API Health
```bash
curl http://localhost:4000/health
```

### Verify Watchdog Notifications
```bash
# Check if systemd is receiving watchdog pings
systemctl show nexus-backend | grep -i watchdog
```

### Long-term Stability Test
```bash
# Run for 10 minutes
for i in {1..20}; do 
  sleep 30
  echo "[$i*30s] $(systemctl is-active nexus-backend)"
done
```

---

## Technical Details

### Systemd Watchdog Protocol

1. **Environment Variables**:
   - `WATCHDOG_USEC`: Watchdog interval in microseconds (set by systemd)
   - `WATCHDOG_PID`: Expected PID (optional, for validation)

2. **Notification Method**:
   - Send `sd_notify(WATCHDOG=1)` via Unix socket
   - In Bun/Node: Use `systemd-notify` command or native binding

3. **Timing Requirements**:
   - Must send notification within `WatchdogSec` seconds
   - Best practice: Send at **half the interval**
   - Example: `WatchdogSec=60` → send every 30 seconds

4. **Failure Handling**:
   - If missed: Systemd kills process with SIGABRT
   - Systemd then restarts per `Restart=always` policy
   - Too many restarts: Hit `StartLimitBurst` limit

### Bun-Specific Considerations

1. **No native systemd binding**: Must use `systemd-notify` command
2. **Spawn overhead**: Use `unref()` to avoid blocking event loop
3. **Error tolerance**: Wrap in try-catch for non-systemd environments

---

## Files Modified

1. **src/index.ts** (Lines 345-370, EOF)
   - Added watchdog notification system
   - Added graceful shutdown handlers
   - Added error recovery handlers

2. **src/db.ts** (Line 18)
   - Added `PRAGMA busy_timeout = 5000`

---

## Commit Message

```
fix(backend): implement systemd watchdog to prevent 60s timeout crashes

Root cause: Service configured with WatchdogSec=60 but no watchdog
notification implemented, causing systemd to kill process every 60s.

Changes:
- Add systemd watchdog heartbeat (30s interval)
- Add graceful shutdown handlers (SIGTERM/SIGINT/SIGABRT)
- Add uncaught exception/rejection handlers
- Add SQLite busy_timeout (5s) to prevent lock contention

Verified: Service stable for 3+ minutes without crashes

Fixes: Production crash loop (watchdog timeout)
```

---

## Production Deployment Notes

1. **No configuration changes needed** - fix is code-only
2. **No breaking changes** - backward compatible
3. **Safe rollback** - can revert commits if issues arise
4. **Zero downtime** - `systemctl restart` handles gracefully

**Deploy command**:
```bash
cd /home/mohit/nexus-ai-v2
git pull  # if using git
sudo systemctl restart nexus-backend
systemctl status nexus-backend  # verify
```

---

**Author**: OpenCode AI Agent  
**Verified**: May 20, 2026 at 17:40 EDT  
**Status**: ✅ Production-ready
