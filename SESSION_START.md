# Nexus AI - Session Start Prompt

## Copy-paste this to start a new session:

---

Read these files to get full context of the project:

1. `/home/mohit/nexus-ai/docs/RESEARCH.md` - Knowledge extracted from 53+ GitHub repos
2. `/home/mohit/nexus-ai/docs/VISION.md` - Product vision, roadmap, competitive analysis
3. `/home/mohit/nexus-ai/src/` - Current MVP code (Bun + Hono, working)

## What is Nexus AI?

Open-source AI gateway that brands multiple free/cheap LLM providers as our own "Nexus models" (nexus-flash, nexus-air, nexus-deep, nexus-pro, nexus-code, nexus-lite). Auto-routes requests to the best model based on task. One command start (`npx nexusai`). Beautiful dashboard. Money savings counter.

## Current State (MVP working):
- Server runs on `localhost:4000`
- OpenAI-compatible API at `/v1/chat/completions`
- 6 providers connected: Gemini, Groq, NVIDIA NIM, SiliconFlow, Poolside, g4f
- Auto-routing by task keywords (<1ms, no LLM call)
- Circuit breaker + failover
- Budget enforcement
- API keys stored in GNOME Keyring (secret-tool)

## What to build next:
1. **React web UI dashboard** (not plain text) - live traffic, savings counter, benchmark
2. **Provider management UI** - dropdown of 50 providers, user pastes keys
3. **Unified API key** - system generates one key that routes across all user's providers
4. **Streaming support** with normalized tool_calls across providers
5. **Token compressor** (20-40% savings automatic)
6. **Google OAuth** for Gemini (only provider that supports OAuth for API)
7. **Auto-benchmark** on first run
8. **npm package** - publishable as `npx nexusai`

## Key Design Decisions:
- Provider names NEVER shown to users (branded as nexus-flash, nexus-air, etc.)
- Task detection is keyword-based regex (<1ms), NOT an LLM call
- Users can choose "auto" (we pick) or manual (they pick nexus-flash/pro/code)
- Free self-hosted, 1% markup for cloud version
- Built with Bun + Hono (fastest possible)

## How to run:
```bash
export BUN_INSTALL="$HOME/.bun" && export PATH="$BUN_INSTALL/bin:$PATH"
cd /home/mohit/nexus-ai && setsid bun run src/index.ts </dev/null >/tmp/nexus.log 2>&1 &
```

## Credentials (all in GNOME Keyring):
```bash
secret-tool lookup application llmsession credential groq_api_key
secret-tool lookup application llmsession credential gemini_api_key
secret-tool lookup application llmsession credential siliconflow_api_key
secret-tool lookup application llmsession credential nvidia_api_key
secret-tool lookup application llmsession credential poolside_api_key
secret-tool lookup application llmsession credential brave_api_key
```

## Goal: Make this viral on HackerNews/Reddit/ProductHunt
- Beautiful terminal + web dashboard
- "vs GPT-4o direct: -72% cost" savings hook
- One command install, zero config
- Open source, self-hosted, no vendor lock-in

---
