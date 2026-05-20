# Nexus AI - Vision & Roadmap

> Open-source AI gateway that brands multiple free/cheap providers as "Nexus models".
> One command start. Auto-routing. Beautiful dashboard. Money savings counter.

---

## What It Is

An open-source AI API gateway that:
- Aggregates multiple free/cheap AI providers behind a unified OpenAI-compatible API
- Brands them as "Nexus" models for a premium feel
- Routes intelligently based on task type, cost, speed, and availability
- Shows a beautiful dashboard with live traffic and savings counter
- Starts with one command: `npx nexusai`

**Core value proposition**: Get GPT-4o level quality for free/near-free by intelligently routing across providers.

---

## Branded Models

| Model | Backend Provider | Specialty | Cost |
|-------|-----------------|-----------|------|
| `nexus-flash` | Groq Llama 3.3 70B | Fastest responses | Free |
| `nexus-air` | Gemini 2.5 Flash | Balanced speed/quality | Free |
| `nexus-deep` | SiliconFlow DeepSeek V3 | Deep reasoning | Free |
| `nexus-pro` | Gemini 2.5 Pro | Premium quality | Free (rate limited) |
| `nexus-code` | Poolside Laguna | Code specialist | Free |
| `nexus-core` | NVIDIA NIM Llama | Reliable backup | Free |
| `nexus-lite` | Free tier rotation | Zero cost guaranteed | Free |

### Routing Logic
- Default: `nexus-air` (best all-around)
- Code tasks: auto-route to `nexus-code`
- Complex reasoning: auto-route to `nexus-deep`
- Speed-critical: auto-route to `nexus-flash`
- Quality-critical: auto-route to `nexus-pro`
- Fallback chain: primary -> `nexus-core` -> `nexus-lite`

---

## Working APIs

| Provider | Key Prefix | Storage |
|----------|-----------|---------|
| Gemini | AIzaSy... | GNOME keyring |
| Groq | gsk_Gv1... | GNOME keyring |
| NVIDIA NIM | nvapi-mHc... | GNOME keyring |
| SiliconFlow | sk-uax... | GNOME keyring |
| Poolside | sky_WxF... | GNOME keyring |
| Brave Search | BSAE... | GNOME keyring |

**Security**: All keys stored in OS keyring, never in plaintext files. Runtime retrieval only.

---

## Viral Strategy

### Launch Tactics
1. **Beautiful terminal dashboard** with live traffic visualization
2. **Money saved counter** (vs GPT-4o pricing: show -72% savings)
3. **Auto-benchmark on first run** (test all providers, show results)
4. **`npx nexusai`** zero-config instant start
5. **Post on HN, Reddit, Twitter** with demo GIF showing the dashboard

### Growth Hooks
- "You've saved $28.50 this week" notification
- Shareable benchmark results (auto-generated comparison image)
- One-click deploy to Railway/Fly.io/Render
- VS Code extension (use Nexus models in Copilot Chat)
- CLI with beautiful output (branded responses)

### Content Strategy
- "I replaced GPT-4o with free models and saved $X/month" blog post
- Benchmark comparison chart (automated, always fresh)
- Tutorial: "Add AI to your app for $0/month"
- Video: Live coding with Nexus models vs OpenAI

---

## Next Features (Production Roadmap)

### v0.1 - Core Gateway (Current)
- [x] OpenAI-compatible API endpoint
- [x] Multi-provider routing
- [x] Basic health checks
- [ ] Streaming support with normalized tool_calls
- [ ] Error normalization across providers
- [ ] Request/response logging

### v0.2 - Dashboard & DX
1. React web UI dashboard with provider management
2. Live traffic visualization (WebSocket)
3. Money saved counter with historical graph
4. Provider health status (green/yellow/red)
5. Request explorer (search, filter, replay)

### v0.3 - Provider Management
6. Dropdown: 50 providers pre-configured, user pastes keys
7. Unified API key generation (one key routes to all)
8. Google OAuth for Gemini (only provider supporting OAuth)
9. Provider auto-discovery (detect available free tiers)
10. Custom model aliases (user defines their own brand names)

### v0.4 - Intelligence
11. Token compressor (auto 20-40% savings on input)
12. Smart routing (learn which model performs best per task type)
13. Auto-retry with fallback (circuit breaker pattern)
14. Response caching (exact + semantic dedup)
15. Budget alerts and hard kill-switch

### v0.5 - Quality
16. Auto-benchmark with quality scoring
17. A/B testing between models
18. Response quality scoring (automated)
19. Latency percentile tracking (p50, p95, p99)
20. Provider SLA monitoring

### v1.0 - Production Ready
21. Team management (shared keys, roles)
22. Usage analytics per user/team
23. Webhook notifications
24. Plugin system (custom routing logic)
25. SDKs (Python, TypeScript, Go)

---

## Competitive Edge

| Feature | Nexus AI | LiteLLM | OpenRouter | Portkey | TensorZero |
|---------|----------|---------|------------|---------|------------|
| Runtime | Bun (fast) | Python (slow) | Cloud only | Cloud only | Rust |
| Setup | `npx nexusai` | pip + config | Sign up | Sign up | GitOps + config |
| Self-hosted | Yes, free | Yes | No | No | Yes |
| Markup | 0% (self) / 1% (cloud) | 0% | 5.5% | Variable | 0% |
| Data privacy | 100% local | Local possible | Proxied | Proxied | Local |
| Dashboard | Built-in (beautiful) | Basic | Web only | Web only | None |
| Free tier models | First-class | Supported | No | No | No |
| Code size | ~2000 lines | 50k+ lines | Proprietary | Proprietary | Complex |
| Supply chain risk | Minimal deps | Heavy deps | N/A | N/A | Moderate |

### Why Nexus Wins
- **vs LiteLLM**: 10x faster (Bun vs Python), 25x less code, no supply chain bloat
- **vs OpenRouter**: Free/self-hosted, 1% vs 5.5% markup, no data leaves your machine
- **vs Portkey**: Simpler, open-source, instant start, no vendor lock-in
- **vs TensorZero**: No GitOps required, plug and play, beautiful UX

---

## Tech Stack

### Core
- **Runtime**: Bun (fastest JS runtime, native TypeScript)
- **Framework**: Hono (fastest JS web framework, 14KB)
- **Database**: SQLite via `bun:sqlite` (zero external deps)
- **Package**: npm (published as `nexusai`)

### Dashboard (v0.2+)
- **Frontend**: React 19 + TanStack Router
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Charts**: Recharts or Tremor
- **Real-time**: WebSocket (native Bun)

### Infrastructure
- **Config**: YAML + environment variables
- **Secrets**: OS keyring (cross-platform)
- **Logging**: Structured JSON (pino-compatible)
- **Metrics**: Built-in (no external deps)

---

## Revenue Model

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Self-hosted, unlimited requests, all features |
| **Cloud** | 1% markup | Managed hosting, auto-scaling, no setup |
| **Pro** | $29/mo | Dashboards, alerts, team (5 seats), priority support |
| **Enterprise** | $199/mo | SOC2, SLA (99.9%), SSO, audit logs, unlimited seats |

### Monetization Strategy
1. Free self-hosted builds community and trust
2. Cloud tier for lazy/non-technical users (1% is nothing vs 5.5% OpenRouter)
3. Pro tier for teams who want managed dashboards
4. Enterprise for companies needing compliance

---

## Design Specification

### Dashboard UI

**Color Scheme:**
- Background: deep navy blue `#0a0a1a`
- Cards: glassmorphism (semi-transparent `rgba(255,255,255,0.05)`)
- Primary accent: electric blue `#3b82f6`
- Success/savings: green `#10b981`
- Warning: amber `#f59e0b`
- Error: red `#ef4444`
- Text primary: white `#ffffff`
- Text secondary: `#94a3b8`

**Layout:**
- Left sidebar: model list with status indicators
- Main area: live request traffic (colored bars showing latency)
- Top-right: savings counter "$28.50 saved this week"
- Bottom: benchmark table (speed/quality/cost per model)

**Style:**
- Glassmorphism cards with subtle backdrop blur
- Subtle gradients on interactive elements
- Monospace font for data (JetBrains Mono)
- Sans-serif for labels (Inter)
- Smooth animations (60fps, motion library)
- Dark mode only (matches developer aesthetic)

**Logo:**
- "NEXUS" in bold geometric font
- Small AI circuit icon integrated into the "X"
- Electric blue on dark background
- Minimal, memorable, technical

### Design Prompt for Gemini Image Generation

```
Generate a modern, dark-themed dashboard UI mockup for "Nexus AI" - an AI API gateway. Show:
- Left sidebar with model list (nexus-flash, nexus-air, nexus-deep, nexus-pro, nexus-code)
- Main area with live request traffic (colored bars showing latency)
- Top-right corner with savings counter "$28.50 saved this week"
- Bottom section with benchmark table showing speed/quality/cost per model
- Color scheme: deep navy blue (#0a0a1a) background, electric blue (#3b82f6) accents, green for savings
- Style: glassmorphism cards, subtle gradients, monospace font for data
- Logo: "NEXUS" in bold geometric font with a small AI circuit icon
```

---

## Success Metrics

### Week 1
- [ ] 100+ GitHub stars
- [ ] 50+ `npx nexusai` installs
- [ ] 1 HN front page appearance

### Month 1
- [ ] 1,000+ GitHub stars
- [ ] 500+ weekly active users
- [ ] 5+ community contributors
- [ ] Dashboard v0.2 shipped

### Month 3
- [ ] 5,000+ GitHub stars
- [ ] Cloud tier launched
- [ ] 10+ paying Pro customers
- [ ] Featured in AI newsletters

### Month 6
- [ ] 10,000+ GitHub stars
- [ ] $5K MRR
- [ ] Enterprise pilot customers
- [ ] Plugin ecosystem started

---

## Philosophy

1. **Free first**: The self-hosted version is always free and full-featured
2. **Beautiful by default**: Developer tools should look amazing
3. **Zero config**: Works out of the box, customize later
4. **Transparent**: Show exactly where requests go and what they cost
5. **Fast**: Bun + Hono = fastest possible gateway layer
6. **Simple**: <2000 lines of core code, anyone can read and understand
7. **Private**: Your data never touches our servers (self-hosted)
8. **Honest**: No fake benchmarks, no misleading marketing
