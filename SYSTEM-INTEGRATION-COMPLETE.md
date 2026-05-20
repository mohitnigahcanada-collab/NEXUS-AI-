# Nexus AI V2 - System Integration Complete

## ✅ Services Configured (UNKILLABLE + HIGH PRIORITY)

### 1. **Nexus Backend** (`nexus-backend.service`)
- **Status**: ✅ Running on `http://localhost:4000`
- **Priority**: Nice=-10, OOMScoreAdjust=-900 (almost unkillable)
- **Auto-start**: Enabled on boot
- **Restart**: Always, 1 second delay, unlimited attempts
- **Logs**: 
  - Journal: `sudo journalctl -u nexus-backend -f`
  - File: `/home/mohit/nexus-ai-v2/logs/nexus.log`
  - Errors: `/home/mohit/nexus-ai-v2/logs/nexus-error.log`

### 2. **g4f Server** (`g4f.service`)
- **Status**: ✅ Running on `http://localhost:4001`
- **Priority**: Nice=-10, OOMScoreAdjust=-900 (almost unkillable)
- **Auto-start**: Enabled on boot
- **Restart**: Always, 1 second delay, unlimited attempts
- **Note**: Some providers require authentication (GPT-4o, Claude need OAuth)

---

## ✅ AI Tools Configured

### 1. **OpenCode** (`~/.config/opencode/opencode.jsonc`)
**Provider Added**: `nexus-ai`
**Base URL**: `http://localhost:4000/v1`
**Models Available**:
- `auto` - Intelligent routing (recommended)
- `nexus-code-ultra` - GPT-4o (via g4f, needs auth)
- `nexus-code-pro` - Claude 3.5 Sonnet (via g4f, needs auth)
- `nexus-code-deep` - DeepSeek Coder V3 ✅ WORKING
- `nexus-brain-deep` - DeepSeek-V4-Pro 🏆 Champion
- `nexus-brain-max` - Gemini 3.1 Pro Thinking
- `nexus-brain-pro` - Gemini 2.5 Pro ✅ WORKING
- `nexus-work-fast` - Llama 3.3-70B ✅ WORKING
- `nexus-chat-instant` - Llama 3.1-8B ⚡ WORKING

**Usage**: Select `nexus-ai/auto` as your model in OpenCode

---

### 2. **Continue.dev** (`~/.continue/config.yaml`)
**Provider**: `openai` with custom `apiBase`
**Base URL**: `http://localhost:4000/v1`
**API Key**: `nexus-local` (dummy key)
**Models Configured**:
- Nexus Auto (Intelligent Routing) 🚀 - `roles: [chat, edit, apply]`
- Nexus Code Ultra (GPT-4o) 🏆 - `roles: [chat, edit]`
- Nexus Code Deep (DeepSeek Coder V3) - `roles: [chat, edit]`
- Nexus Brain Deep (DeepSeek-V4-Pro) 🧠 - `roles: [chat]`
- Nexus Brain Max (Gemini 3.1 Pro Thinking) - `roles: [chat]`
- Nexus Work Fast (Llama 3.3-70B) - `roles: [chat, autocomplete]`
- Nexus Chat Instant (Llama 3.1-8B) ⚡ - `roles: [chat, autocomplete]`

**Usage**: Select Nexus models from Continue's model picker in VS Code

---

### 3. **Cline** (`~/.cline/data/settings/providers.json`)
**Provider**: `openai-compatible`
**Base URL**: `http://localhost:4000/v1`
**Current Model**: `auto` (intelligent routing)
**Status**: ✅ Already configured

**Usage**: 
```bash
# Use Nexus in Cline CLI
cline -P openai-compatible -m auto "Your task here"

# Or use specific models
cline -P openai-compatible -m nexus-code-deep "Write code"
cline -P openai-compatible -m nexus-brain-deep "Explain concept"
cline -P openai-compatible -m nexus-chat-instant "Quick question"
```

---

## 📊 Model Status

### ✅ Working Models (10/16 - 62.5%)

| Model ID | Tier | Provider | Status |
|----------|------|----------|--------|
| nexus-code-deep | Complex Coding | SiliconFlow | ✅ DeepSeek Coder V3 |
| nexus-code-stable | Complex Coding | SiliconFlow | ✅ DeepSeek Coder V2.5 |
| nexus-brain-deep | Reasoning | SiliconFlow | ✅ DeepSeek-V4-Pro 🏆 |
| nexus-brain-pro | Reasoning | Google | ✅ Gemini 2.5 Pro |
| nexus-work-fast | Heavy Lifting | GROQ | ✅ Llama 3.3-70B |
| nexus-work-balanced | Heavy Lifting | SiliconFlow | ✅ Qwen2.5-Coder-32B |
| nexus-work-flex | Heavy Lifting | SiliconFlow | ✅ Yi-Coder-9B |
| nexus-chat-instant | Chat | GROQ | ✅ Llama 3.1-8B ⚡ |
| nexus-chat-smart | Chat | SiliconFlow | ✅ Qwen2.5-Coder-7B |
| nexus-chat-flex | Chat | SiliconFlow | ✅ Gemma 2-9B |

### ⚠️ Need Configuration (6/16 - 37.5%)

| Model ID | Tier | Provider | Issue |
|----------|------|----------|-------|
| nexus-code-ultra | Complex Coding | g4f | ❌ GPT-4o needs OAuth |
| nexus-code-pro | Complex Coding | g4f | ❌ Claude needs OAuth |
| nexus-brain-ultra | Reasoning | g4f | ❌ GPT-4o needs OAuth |
| nexus-brain-max | Reasoning | Google | ❌ Gemini API key invalid |
| nexus-work-smart | Heavy Lifting | Google | ❌ Gemini API key invalid |
| nexus-chat-quick | Chat | g4f | ❌ Gemini via g4f needs config |

---

## 🔧 Service Management

### Check Status
```bash
systemctl status nexus-backend g4f
```

### View Logs
```bash
# Real-time logs (journald)
sudo journalctl -u nexus-backend -f
sudo journalctl -u g4f -f

# File logs
tail -f /home/mohit/nexus-ai-v2/logs/nexus.log
tail -f /home/mohit/nexus-ai-v2/logs/nexus-error.log
```

### Restart Services
```bash
sudo systemctl restart nexus-backend g4f
```

### Stop Services (Not Recommended)
```bash
sudo systemctl stop nexus-backend g4f
```

### Disable Auto-Start (Not Recommended)
```bash
sudo systemctl disable nexus-backend g4f
```

---

## 🧪 Testing Nexus

### Test Auto Mode
```bash
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 50
  }'
```

### Test Specific Model
```bash
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nexus-chat-instant",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 50
  }'
```

### Check Model Status
```bash
curl http://localhost:4000/api/models | python3 -m json.tool
```

### Check Statistics
```bash
curl http://localhost:4000/api/stats | python3 -m json.tool
```

---

## 🎯 Next Steps (Optional)

1. **Fix Gemini API Keys**: Get new keys from https://ai.google.dev/
2. **Configure g4f OAuth**: Run `g4f auth github-copilot` for GPT-4o/Claude access
3. **Test in each tool**: Verify Nexus works in OpenCode, Continue, and Cline
4. **Monitor performance**: Watch logs and stats to ensure models are routing correctly

---

## 📍 File Locations

- **Nexus V2**: `/home/mohit/nexus-ai-v2/`
- **Logs**: `/home/mohit/nexus-ai-v2/logs/`
- **Services**: `/etc/systemd/system/nexus-backend.service`, `/etc/systemd/system/g4f.service`
- **OpenCode Config**: `~/.config/opencode/opencode.jsonc`
- **Continue Config**: `~/.continue/config.yaml`
- **Cline Config**: `~/.cline/data/settings/providers.json`
- **API Keys Backup**: `~/.nexus-secure/api-keys-backup.txt` (600 permissions)

---

## ✅ Summary

- ✅ Nexus backend auto-starts on boot with highest priority
- ✅ g4f server auto-starts on boot with highest priority
- ✅ Both services are UNKILLABLE (Nice=-10, OOMScore=-900)
- ✅ Logs are saved to files + journald
- ✅ OpenCode configured with 9 Nexus models
- ✅ Continue.dev configured with 7 Nexus models
- ✅ Cline configured with auto mode
- ✅ 10/16 models working (62.5%)
- ✅ Fixed auto mode router to handle multimodal messages

**Nexus AI V2 is now fully integrated with your system!** 🚀
