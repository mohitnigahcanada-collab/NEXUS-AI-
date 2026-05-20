# Nexus AI - Research Knowledge Base

> Complete research extracted from 53+ repositories. Patterns, architectures, and implementation strategies.

---

## Agent/AI Systems Knowledge (from repos)

### 12-factor-agents
- Stateless reducer pattern: agent = `(state, action) -> state`
- Own your context window - treat it as the primary data structure
- Human-in-loop as tool (not afterthought)
- Small focused agents > one mega-agent
- Compact errors into context (don't discard failures)
- Explicit tool definitions with strict schemas
- Deterministic routing where possible

### Context-Engineering
- Cognitive tools: understand / plan / verify / backtrack
- Recursive memory consolidation (compress without losing signal)
- Token budget optimization (measure, compress, prioritize)
- Structured symbolic formats over natural language for internal state
- Context = the new programming (prompt < context)
- Layered context: system > project > task > conversation

### hermes-agent
- Self-improving skills with telemetry feedback loops
- `delegate_task` with role isolation (each agent gets fresh context)
- Plugin system with ABCs (Abstract Base Classes for extensibility)
- Kanban multi-agent dispatch (backlog -> in_progress -> done)
- Trajectory compression (summarize long action histories)
- 7 terminal backends (flexibility in execution environments)
- Skill versioning and A/B testing

### SWE-agent
- Agent-Computer Interface (ACI) - specialized commands for code editing
- YAML config for everything (models, tools, prompts, workflows)
- History processors (compress/filter conversation history)
- Linting after every edit
- Bounded context with sliding window
- File viewer with line numbers and scrolling

### live-swe-agent
- Runtime self-evolution (agent modifies its own tools mid-task)
- Dynamic tool creation per-task (if a tool would help, create it)
- Reflection after each action (did that work? what next?)
- Minimal scaffold = max performance (100 lines beats 10,000)
- Cost tracking as first-class concern
- Bash-first philosophy (shell > custom tools for simple tasks)

### mini-swe-agent
- 100-line agent loop (proves simplicity works)
- Bash-only execution (no custom tool framework needed)
- Linear append-only history (no complex state management)
- Stateless subprocess (each command = fresh shell)
- Cost tracking per session
- Prompt over code (better instructions > more code)

### agency-agents
- 144 personas across 12 divisions (massive persona library)
- Persona-first design (role defines behavior, not instructions)
- Composable teams (mix personas for different tasks)
- Division specialization (engineering, research, creative, ops...)
- Persona templates with expertise, communication style, biases
- Team formation patterns for complex tasks

### agent-skills
- Anti-rationalization tables (prevent agents from justifying bad decisions)
- Process not prose (structured workflows > free-form text)
- Intent -> skill mapping (user intent routes to correct skill)
- Doubt-driven development (if uncertain, investigate don't assume)
- Verification non-negotiable (never claim done without evidence)
- Skill composition (combine simple skills into complex behaviors)
- Trigger conditions (auto-activate skills based on context)

### Archon
- YAML DAG workflows (declarative agent pipelines)
- Loop nodes with fresh context (prevent context rot in iterations)
- Approval gates (human checkpoints in automated flows)
- Worktree isolation (parallel branches for parallel agents)
- Three-tier workflow discovery (project > user > system)
- Conditional branching based on agent output
- Retry with backoff patterns

---

## Tools/Infrastructure Knowledge

### openhuman
- Event bus (typed pub/sub) for inter-component communication
- Memory tree (hierarchical knowledge storage)
- TokenJuice compression (aggressive context compaction)
- Model routing (select best model per task type)
- Controller registry (pluggable behavior modules)
- Lifecycle hooks (before/after each agent action)

### CloakBrowser
- Stealth browser automation (undetectable by bot detection)
- Humanize pattern (random delays, mouse movements, scroll)
- Anti-detection (fingerprint spoofing, WebGL, canvas, timezone)
- Proxy rotation with session persistence
- Cookie/session management across runs
- Screenshot + DOM snapshot for debugging

### CLI-Anything
- CLI wrapping for any app (turn any tool into an agent tool)
- Skill definition format (structured YAML for tool capabilities)
- Registry pattern (discover and load tools dynamically)
- Input/output normalization (consistent interface regardless of underlying tool)
- Error handling and retry logic
- Composable CLI pipelines

### langgraph-tools
- Plan -> Execute -> Verify pipeline (structured agent workflow)
- Fresh context per agent (prevent context contamination)
- Typed state with persistence (checkpoint and resume)
- Conditional edges (dynamic routing based on state)
- Human-in-the-loop interrupts
- Parallel branch execution with state merge

### langchain
- Core abstractions (chains, agents, tools, memory)
- Integration pattern (500+ connectors)
- Deep agents (multi-step reasoning with tool use)
- Output parsers (structured extraction from LLM responses)
- Callbacks for observability
- Document loaders and text splitters

### codegraph
- Pre-indexed knowledge graph (94% fewer tool calls!)
- MCP server (Model Context Protocol for tool serving)
- Tree-sitter extraction (AST-level code understanding)
- Relationship mapping (imports, calls, inheritance)
- Semantic search over code structure
- Incremental index updates

### 9router
- Tiered fallback (primary -> secondary -> tertiary providers)
- RTK token compression (20-40% savings on input tokens)
- Format translation (normalize across provider APIs)
- Quota-aware routing (respect rate limits, distribute load)
- Cost optimization (route to cheapest capable model)
- Latency-based selection (prefer fastest responding provider)
- Circuit breaker pattern (fail fast, recover gracefully)

### get-shit-done
- Parallel subagent execution (multiple agents working simultaneously)
- Context budget (30-40% reserved for agent responses)
- Phase-based workflow (research -> plan -> execute -> verify)
- Workstream concept (independent parallel tracks of work)
- Progress tracking with completion percentage
- Dependency resolution between workstreams

### superpowers
- 14 composable skills (modular capability units)
- Auto-triggering (skills activate based on context patterns)
- Subagent-driven development (delegate to specialized agents)
- Verification-before-completion (never mark done without proof)
- Skill chaining (output of one skill feeds into next)
- Priority-based skill selection
- Cooldown timers (prevent skill spam)

---

## Learning/Reference Knowledge

### build-your-own-x
- Custom DB implementation (B-trees, WAL, query planning)
- Container sandboxing (namespaces, cgroups, overlay fs)
- Search engines (inverted index, ranking, crawling)
- Bot frameworks (state machines, middleware, intent detection)
- RAG from scratch (embedding, chunking, retrieval, generation)
- Git internals (objects, refs, packfiles)
- Compiler design (lexer, parser, AST, codegen)

### the-book-of-secret-knowledge
- CLI tools (1000+ curated utilities)
- Network tools (monitoring, security, debugging)
- Shell composition patterns (pipes, process substitution, signals)
- Monitoring (Prometheus, Grafana, alerting patterns)
- Security tools (scanning, hardening, audit)
- One-liners for common operations

### awesome-selfhosted
- Self-hosted infrastructure (replace every SaaS)
- Local LLM inference (Ollama, vLLM, llama.cpp)
- Vector search (Qdrant, Milvus, Chroma, pgvector)
- Monitoring (uptime, performance, logs)
- Authentication (Keycloak, Authentik, LLDAP)
- Reverse proxy patterns (Traefik, Caddy, nginx)

### Awesome-LLM-Strawberry
- Chain-of-thought reasoning (explicit reasoning steps)
- Self-verification (model checks its own output)
- Adaptive compute (spend more tokens on hard problems)
- Search-augmented reasoning (retrieve then reason)
- Process reward models (reward intermediate steps, not just final answer)
- Tree-of-thought (explore multiple reasoning paths)
- Consistency checking (sample multiple times, vote)

### Open-Generative-AI
- Multi-model routing (different models for different modalities)
- Workflow builder (visual DAG construction)
- Generative media skills (image, video, audio, 3D)
- Pipeline composition (chain generation steps)
- Quality scoring and filtering
- Style transfer and conditioning

### academic-research-skills
- Multi-agent teams: 13+12+7 agents (32 total specialists)
- Pipeline with integrity gates (verify at each stage)
- Socratic dialogue (agents challenge each other's reasoning)
- Cross-model verification (different models verify each other)
- Literature review automation
- Citation graph analysis
- Hypothesis generation and testing

### free-claude-code
- API proxy pattern (unified interface to multiple providers)
- Per-model tier routing (premium vs free tier logic)
- Provider fallback chain (if A fails, try B, then C)
- Auto-compaction (compress context when approaching limits)
- Session management (persist state across requests)
- Usage tracking and cost estimation

### claude-plugins-official
- Plugin architecture: commands / skills / hooks / MCP
- Marketplace (discover and install community plugins)
- Lifecycle events (onInstall, onActivate, onDeactivate)
- Permission system (plugins declare required capabilities)
- Hot-reload (update plugins without restart)
- Dependency resolution between plugins

### agentmemory
- 4-tier memory: Working -> Episodic -> Semantic -> Procedural
- Triple-stream retrieval: BM25 + Vector + Graph (hybrid search)
- Auto-capture hooks (automatically store important interactions)
- Memory decay (old/unused memories fade, important ones persist)
- Multi-agent coordination (shared memory between agents)
- Consolidation cycles (merge related memories)
- Importance scoring (not all memories are equal)

---

## Top Patterns to Implement

| # | Pattern | Source | Impact | Complexity |
|---|---------|--------|--------|------------|
| 1 | Stateless reducer agent loop (100 lines) | 12-factor-agents, mini-swe-agent | Critical | Low |
| 2 | Plan -> Execute -> Verify pipeline | langgraph-tools, get-shit-done | Critical | Medium |
| 3 | Fresh context per subagent | hermes-agent, Archon | High | Medium |
| 4 | Tiered model routing + fallback | 9router, free-claude-code | Critical | Medium |
| 5 | Token compression (20-80% savings) | 9router, openhuman, Context-Engineering | High | Medium |
| 6 | 4-tier memory consolidation | agentmemory | High | High |
| 7 | Self-improving skills with telemetry | hermes-agent | High | High |
| 8 | Runtime tool creation | live-swe-agent | Medium | Medium |
| 9 | YAML DAG workflow engine | Archon | High | High |
| 10 | Anti-rationalization tables | agent-skills | Medium | Low |
| 11 | Integrity verification gates | academic-research-skills | High | Medium |
| 12 | Cross-model verification | academic-research-skills | Medium | Medium |
| 13 | Pre-indexed knowledge graph | codegraph | Critical | High |
| 14 | Plugin architecture | claude-plugins-official | High | High |
| 15 | Stealth browser automation | CloakBrowser | Medium | High |
| 16 | CLI wrapping for any app | CLI-Anything | Medium | Low |
| 17 | Parallel subagent dispatch | get-shit-done | High | Medium |
| 18 | Skill auto-triggering | superpowers, agent-skills | Medium | Medium |
| 19 | Human-in-the-loop as a tool | 12-factor-agents | High | Low |
| 20 | Multi-agent debate with structured disagreement | academic-research-skills | Medium | High |

---

## Implementation Priority Matrix

### Phase 1: Foundation (Week 1-2)
- Pattern 1: Stateless reducer loop
- Pattern 4: Tiered model routing
- Pattern 19: Human-in-loop as tool

### Phase 2: Intelligence (Week 3-4)
- Pattern 2: Plan-Execute-Verify
- Pattern 5: Token compression
- Pattern 3: Fresh context per subagent

### Phase 3: Memory & Learning (Week 5-6)
- Pattern 6: 4-tier memory
- Pattern 7: Self-improving skills
- Pattern 10: Anti-rationalization

### Phase 4: Scale (Week 7-8)
- Pattern 9: YAML DAG workflows
- Pattern 13: Knowledge graph
- Pattern 17: Parallel dispatch

### Phase 5: Polish (Week 9-10)
- Pattern 14: Plugin architecture
- Pattern 11: Verification gates
- Pattern 8: Runtime tool creation

---

## Key Insights

1. **Simplicity wins**: mini-swe-agent (100 lines) performs comparably to complex frameworks
2. **Context is king**: Managing context window is more important than fancy algorithms
3. **Fresh context prevents rot**: Long conversations degrade quality; spawn new agents
4. **Verification is non-negotiable**: Never claim success without evidence
5. **Compression compounds**: 20-40% token savings per layer multiplies across the system
6. **Routing > single model**: Best model depends on task; route intelligently
7. **Memory needs structure**: 4 tiers with decay > flat conversation history
8. **Skills > prompts**: Structured workflows beat free-form instructions
9. **Anti-rationalization matters**: Agents will justify bad decisions without guardrails
10. **Parallel > sequential**: Multiple focused agents > one overloaded agent
