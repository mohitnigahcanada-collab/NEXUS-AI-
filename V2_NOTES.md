# Nexus AI V2 - Development Copy

This is a working copy of Nexus AI for implementing new features.

## Project Structure

```
/home/mohit/
├── nexus-ai/       ← Original working version (v1, backed up with git)
└── nexus-ai-v2/    ← Development version (v2, current working directory)
```

## Setup Status

- ✅ V1 backed up with git commit (hash: 38c7423)
- ✅ V2 cloned from V1
- ✅ Server running on http://localhost:4000 (PID: 148713)
- ✅ Dashboard accessible at http://localhost:4000
- ✅ API endpoints working: `/v1/chat/completions`, `/v1/models`, `/api/stats`
- ✅ 7 providers configured (GROQ, Gemini, SiliconFlow, NVIDIA, Poolside)
- ✅ All tests passing (60/60)

## Current State

**Database:**
- 27 active API keys (25 test keys to be cleaned up)
- 118 total requests logged
- Statistics tracking working

**Providers:**
- All 7 models operational
- Provider keys stored in `.env`
- No DB-based provider key management yet (planned feature)

## Planned V2 Features

### Phase 1: Cleanup ✅ (Ready to implement)
1. Remove test API keys (keep 1-2 production keys)
2. Add "Revoke All Test Keys" button in Keys page

### Phase 2: Provider Key Management (To Do)
1. **Encryption System**
   - AES-256-GCM encryption for provider keys
   - Generate `NEXUS_SECRET_KEY` in `.env`
   
2. **API Endpoints**
   ```
   GET    /api/providers          List configured providers
   POST   /api/providers          Add/update provider key
   DELETE /api/providers/:id      Remove provider key
   POST   /api/providers/:id/test Test connectivity
   ```

3. **UI: Provider Configuration**
   - New Settings section for provider management
   - Add/edit/delete provider keys via dashboard
   - Test provider connectivity
   - Key masking (show only first 4 + last 3 chars)
   - Similar UX to OpenAI/Cline/Continue provider setup

4. **Migration**
   - Auto-import current `.env` keys to DB on first run
   - Fallback to `.env` if DB empty (backward compatibility)

## Development Commands

```bash
# Start server
cd /home/mohit/nexus-ai-v2
bun run start

# Run tests
bun test

# Type check
bun run typecheck

# Build CSS
bun run build:css
```

## Server Info

- **Base URL**: http://localhost:4000
- **Gateway**: http://localhost:4000/v1
- **Dashboard**: http://localhost:4000
- **WebSocket**: ws://localhost:4000/ws
- **Process ID**: 148713 (check with `ps aux | grep 148713`)

## API Key for Testing

Current production key: `nxs_sIZk9CYkkLrdGkIMWCPwYWvl1ua0CsgWsoC73oOy2GVuUOER`

**Usage:**
```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer nxs_sIZk9CYkkLrdGkIMWCPwYWvl1ua0CsgWsoC73oOy2GVuUOER" \
  -H "Content-Type: application/json" \
  -d '{"model":"auto","messages":[{"role":"user","content":"Hello"}]}'
```

## Git Status

- **V1 Branch**: `main` (commit: 38c7423)
- **V2 Branch**: `main` (cloned from V1, ready for feature branches)

## Next Steps

1. ✅ Backup V1 (DONE)
2. ✅ Clone to V2 (DONE)
3. ✅ Start V2 server (DONE)
4. ⏳ Implement test key cleanup
5. ⏳ Implement provider key management UI
6. ⏳ Add encryption system
7. ⏳ Test all features
8. ⏳ Merge back to V1 when stable

## Notes

- Provider keys should be rotated after development (exposed during keyring inspection)
- Database path: `/home/mohit/nexus-ai-v2/data/nexus.db`
- `.env` permissions: `600` (secure)
- All changes in V2 are isolated from production V1

---

**Created**: May 20, 2026
**Last Updated**: May 20, 2026 14:11
