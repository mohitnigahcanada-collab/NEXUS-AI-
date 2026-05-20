# BuilderBrain v1 — Full Design & Build Plan

## 1. Product Vision

BuilderBrain is a local-first AI knowledge operating system for builders.

Its purpose is to make AI agents stop guessing before coding. Before an AI agent plans, codes, debugs, or refactors, it should ask BuilderBrain for a task-specific context pack.

BuilderBrain combines:

- Pocket Rules
- Mini Book
- Self-Learning Memory
- User Style Memory
- Local Dashboard
- CLI
- API
- MCP tools
- Run logs
- Proposal/confidence/risk engine

Later versions will add:

- GitHub repo ingestion
- Big Bible archive
- Google Drive storage
- Vector search
- Repo scoring
- Living librarian AI
- Multi-agent execution

But v1 must be practical, local, verified, and not overbuilt.

---

## 2. Core Workflow

Bad workflow:

```text
Task -> AI guesses -> AI codes -> bugs happen
```

BuilderBrain workflow:

```text
Task
  -> classify domains
  -> select stack of books
  -> build combined context pack
  -> generate proposal
  -> calculate confidence/risk
  -> ask approval only when needed
  -> execute safely
  -> verify
  -> save lesson
```

---

## 3. v1 Scope

BuilderBrain v1 is:

```text
Local-first librarian dashboard + CLI + API + MCP skeleton + context engine
```

v1 must include:

1. Local markdown knowledge library
2. CLI
3. Local API server
4. Local dashboard
5. Context pack builder
6. Proposal/confidence/risk engine
7. Self-learning memory
8. User-style memory
9. Run logs
10. Basic MCP tools
11. Tests and verification

v1 must NOT include:

1. Automatic GitHub repo cloning
2. Top 100 repo research automation
3. Qdrant/vector DB
4. Google Drive sync
5. Big Bible automation
6. Full multi-agent orchestration
7. Autonomous code execution
8. Cloud deployment
9. Payment/auth integrations
10. Heavy AI model routing

Those are v2+.

---

## 4. Why This Scope

The full dream is large. If v1 includes everything, the agent may create a half-working monster.

v1 should prove the core loop:

```text
Can BuilderBrain retrieve useful local knowledge?
Can it generate good context packs?
Can it propose safe actions?
Can it show risk/confidence?
Can it remember lessons?
Can it be used from CLI, dashboard, API, and MCP?
```

If yes, v2 can add repo ingestion.

---

## 5. Product Name

Use:

```text
BuilderBrain
```

Possible future subtitle:

```text
Local AI Engineering Brain
```

---

## 6. Target Users

Primary user:

- A builder/founder/developer using multiple AI coding tools
- Wants AI agents to work with memory, rules, context, and verification
- Wants fewer repeated questions
- Wants safe approval gates
- Wants local-first control

Future users:

- AI-heavy developers
- agent workflow builders
- solo founders
- small engineering teams
- research-heavy builders

---

## 7. Architecture Overview

```text
BuilderBrain Core
  |
  |-- CLI
  |-- Local API
  |-- Dashboard
  |-- MCP Server
  |
  |-- Knowledge Library
  |     |-- Pocket Rules
  |     |-- Mini Book
  |     |-- Self-Learning
  |     |-- User Style
  |     |-- Runs
  |
  |-- Engines
        |-- Classifier
        |-- Book Router
        |-- Context Pack Builder
        |-- Proposal Engine
        |-- Risk Engine
        |-- Confidence Engine
        |-- Memory Writer
        |-- Logger
        |-- Status Checker
```

---

## 8. Required Folder Structure

```text
builderbrain/
  README.md
  package.json
  tsconfig.json
  vitest.config.ts

  brain-data/
    pocket-rules/
      before-coding.md
      before-debugging.md
      approval-rules.md
      memory-rules.md

    mini-book/
      software-engineering.md
      debugging.md
      testing.md
      ai-agents.md
      security.md
      product-building.md

    self-learning/
      solved-problems.md
      failed-attempts.md
      bug-patterns.md
      architecture-decisions.md
      reusable-fixes.md
      improvement-log.md

    user-style/
      communication-style.md
      decision-style.md
      do-not-ask-rules.md
      safe-memory-only.md

    runs/
      .gitkeep

  apps/
    cli/
      index.ts

    api/
      server.ts
      routes/
        context.ts
        propose.ts
        learn.ts
        library.ts
        runs.ts
        status.ts

    dashboard/
      # simple local web dashboard

    mcp-server/
      index.ts

  packages/
    core/
      classifier.ts
      bookRouter.ts
      contextPack.ts
      proposalEngine.ts
      memoryWriter.ts
      logger.ts
      fileSystem.ts
      status.ts
      libraryExplorer.ts
      runReader.ts

    types/
      index.ts

  tests/
    classifier.test.ts
    bookRouter.test.ts
    proposalEngine.test.ts
    contextPack.test.ts
    memoryWriter.test.ts
    api.test.ts
```

If the agent wants a simpler first implementation, it may use `src/` instead of `apps/` and `packages/`, but the architecture should remain separable.

---

## 9. Tech Stack

Recommended v1 stack:

- TypeScript
- Node.js
- Vitest
- Markdown files
- JSON run logs
- Local API with Express/Fastify/Hono
- Simple dashboard with React/Vite or Next.js
- Basic MCP server using TypeScript MCP SDK

Avoid:

- database for v1 unless simple SQLite is added carefully
- vector DB
- cloud deployment
- heavy authentication
- complex model routing

Local-first means it should run on the user’s machine.

---

## 10. CLI Requirements

Create a CLI command:

```bash
brain
```

Required commands:

```bash
brain context "<task>"
brain propose "<task>"
brain learn "<lesson>"
brain status
brain books
brain runs
```

Optional:

```bash
brain init
brain serve
brain dashboard
```

### 10.1 brain context

Purpose:

Generate a combined context pack for a task.

Must:

1. Classify task domains
2. Select multiple relevant books
3. Read Pocket Rules
4. Read User Style
5. Read Mini Book
6. Read relevant Self-Learning
7. Build one combined context pack
8. Save run log

Output sections:

```text
TASK
DETECTED DOMAINS
BOOK STACK USED
KEY RULES
RELEVANT KNOWLEDGE
KNOWN LESSONS
ANTI-PATTERNS
RECOMMENDED PLAN
TESTING CHECKLIST
APPROVAL WARNING
```

### 10.2 brain propose

Purpose:

Generate action proposal with confidence/risk/approval.

Must include:

```text
Task summary
Detected domains
Confidence
Risk
Approval required
Reason
Evidence used
Planned actions
Likely files to inspect/change
Rollback plan
Testing plan
Final recommendation
```

### 10.3 brain learn

Purpose:

Save lessons into Self-Learning Memory.

Must write to:

- solved-problems.md
- improvement-log.md

Also write to:

- bug-patterns.md if bug/fix/error/issue words exist
- failed-attempts.md if failure words exist
- reusable-fixes.md if reusable/fix/pattern words exist
- architecture-decisions.md if architecture/decision/design words exist

### 10.4 brain status

Purpose:

Check health of the brain.

Must show:

- required folders exist
- file counts
- run log count
- missing files
- health status
- warnings

### 10.5 brain books

Purpose:

Show book library tree.

Must show:

- Pocket Rules
- Mini Book
- Self-Learning
- User Style
- Run count

### 10.6 brain runs

Purpose:

List recent runs.

Must show:

- timestamp
- command
- task/lesson
- detected domains
- risk/confidence if relevant

---

## 11. API Requirements

Create local API server.

Recommended base URL:

```text
http://localhost:7777
```

Required endpoints:

```http
POST /context
POST /propose
POST /learn
GET /status
GET /books
GET /library
GET /runs
GET /runs/:id
GET /book?path=<path>
```

### 11.1 POST /context

Input:

```json
{
  "task": "fix login redirect bug",
  "mode": "normal"
}
```

Output:

```json
{
  "task": "...",
  "detectedDomains": [],
  "bookStack": [],
  "contextPack": "...",
  "approvalWarning": null,
  "runId": "..."
}
```

### 11.2 POST /propose

Input:

```json
{
  "task": "change auth routing"
}
```

Output:

```json
{
  "task": "...",
  "risk": "High",
  "confidence": {
    "label": "Medium",
    "score": 72
  },
  "approvalRequired": true,
  "proposal": "...",
  "runId": "..."
}
```

### 11.3 POST /learn

Input:

```json
{
  "lesson": "Auth loop fixed by waiting for session hydration."
}
```

Output:

```json
{
  "saved": true,
  "filesUpdated": [],
  "tags": [],
  "runId": "..."
}
```

---

## 12. Dashboard Requirements

v1 dashboard should be simple but real.

It should be a local web app.

### 12.1 Dashboard Layout

```text
Left sidebar:
- Pocket Rules
- Mini Book
- Self-Learning
- User Style
- Runs
- Future: Big Bible
- Future: Repos

Main panel:
- Chat/search bar
- Context pack result
- Proposal result
- Book viewer
- Run viewer

Right panel:
- Detected domains
- Books used
- Confidence
- Risk
- Approval required
- Related lessons
```

### 12.2 Dashboard Features

Required:

1. Search/chat input
2. Ask BuilderBrain button
3. Generate context pack
4. Generate proposal
5. View library tree
6. Open/read book files
7. View recent runs
8. Add lesson manually
9. Show risk/confidence

Optional:

1. Plus button
2. Add note
3. Add book/chapter
4. Add manual link metadata
5. Add manual research summary

### 12.3 Plus Button

v1 plus button should support safe actions only:

```text
+ Add note
+ Add book/chapter
+ Add lesson
+ Add link metadata
+ Add manual research summary
```

v2 plus button will support:

```text
+ Add GitHub repo
+ Add URL and crawl
+ Add folder
+ Add Google Drive Bible
```

---

## 13. MCP Requirements

v1 should include a small MCP server.

Do not overbuild it.

Required MCP tools:

```text
brain_context_pack
brain_propose
brain_save_lesson
brain_status
```

### 13.1 brain_context_pack

Input:

```json
{
  "task": "fix login bug",
  "mode": "normal"
}
```

Output:

```json
{
  "detectedDomains": [],
  "bookStack": [],
  "contextPack": "...",
  "approvalWarning": "..."
}
```

### 13.2 brain_propose

Input:

```json
{
  "task": "change auth flow"
}
```

Output:

```json
{
  "risk": "High",
  "confidence": 72,
  "approvalRequired": true,
  "proposal": "..."
}
```

### 13.3 brain_save_lesson

Input:

```json
{
  "lesson": "..."
}
```

Output:

```json
{
  "saved": true,
  "filesUpdated": []
}
```

### 13.4 brain_status

Input:

```json
{}
```

Output:

```json
{
  "healthy": true,
  "counts": {}
}
```

---

## 14. Knowledge System

### 14.1 Pocket Rules

Always-read small rules.

Files:

```text
before-coding.md
before-debugging.md
approval-rules.md
memory-rules.md
```

Purpose:

- control behavior
- prevent blind coding
- enforce verification
- define approval gates

### 14.2 Mini Book

Fast local summaries.

Files:

```text
software-engineering.md
debugging.md
testing.md
ai-agents.md
security.md
product-building.md
```

Purpose:

- reusable wisdom
- patterns
- anti-patterns
- testing checklists

### 14.3 Self-Learning

AI’s own experience memory.

Files:

```text
solved-problems.md
failed-attempts.md
bug-patterns.md
architecture-decisions.md
reusable-fixes.md
improvement-log.md
```

Purpose:

- learn from solved tasks
- remember failures
- avoid repeated mistakes
- improve over time

### 14.4 User Style

Safe preference memory.

Files:

```text
communication-style.md
decision-style.md
do-not-ask-rules.md
safe-memory-only.md
```

Purpose:

- fewer unnecessary questions
- direct answers
- 80/20 execution mindset
- approval only for risky tasks

Must not store sensitive personal data.

---

## 15. Classifier

Use keyword-based classifier in v1.

Domains:

```text
auth
database
payments
security
testing
debugging
frontend
backend
ai-agents
product
deployment
files
browser-automation
documentation
```

Example mappings:

```text
auth:
login, logout, oauth, session, redirect, protected route, supabase auth, nextauth

database:
sql, postgres, supabase, migration, schema, rls, table, query

payments:
stripe, billing, subscription, checkout, webhook, invoice, plan

security:
secret, key, token, permission, vulnerability, auth, exploit, xss, csrf

testing:
test, verify, playwright, vitest, jest, cypress, qa

debugging:
bug, error, crash, broken, loop, stuck, failing, timeout

ai-agents:
agent, mcp, tool, memory, rag, vector, langchain, openhands

frontend:
react, vite, ui, component, page, css, tailwind

backend:
api, server, edge function, endpoint, worker, queue

product:
feature, user flow, pricing, onboarding, dashboard

deployment:
cloudflare, vercel, netlify, docker, deploy, production

files:
upload, pdf, docx, storage, parse, document

browser-automation:
extension, chrome, playwright, puppeteer, browser, scraping

documentation:
readme, docs, guide, instructions
```

---

## 16. Book Router

Always include:

```text
pocket-rules/before-coding.md
user-style/do-not-ask-rules.md
user-style/safe-memory-only.md
self-learning/solved-problems.md
self-learning/improvement-log.md
```

If debugging:

```text
pocket-rules/before-debugging.md
mini-book/debugging.md
self-learning/bug-patterns.md
self-learning/failed-attempts.md
```

If testing:

```text
mini-book/testing.md
```

If security/auth/payments/database/deployment:

```text
mini-book/security.md
pocket-rules/approval-rules.md
```

If ai-agents:

```text
mini-book/ai-agents.md
pocket-rules/memory-rules.md
```

If product:

```text
mini-book/product-building.md
```

If general coding:

```text
mini-book/software-engineering.md
```

---

## 17. Risk Engine

Risk levels:

```text
Low
Medium
High
Critical
```

Increase risk for:

```text
auth
payments
database
security
deployment
deletion
secrets
production
unknown code execution
```

Approval required if:

```text
risk = High or Critical
```

Critical actions should not execute automatically in v1.

---

## 18. Confidence Engine

Confidence levels:

```text
Low
Medium
High
```

Score 0-100.

Increase confidence if:

- clear domains detected
- multiple relevant books found
- previous lessons exist
- task is specific
- safe/routine task

Decrease confidence if:

- vague task
- no matching books
- high-risk domains
- conflicting signals
- missing files

---

## 19. Run Logs

Every CLI/API/MCP action should create JSON log.

Folder:

```text
brain-data/runs/
```

Filename pattern:

```text
2026-05-20T12-30-00-context.json
```

Log fields:

```json
{
  "id": "...",
  "timestamp": "...",
  "command": "context",
  "input": "...",
  "detectedDomains": [],
  "booksUsed": [],
  "risk": null,
  "confidence": null,
  "summary": "..."
}
```

---

## 20. Verification Requirements

v1 is complete only if:

```text
npm run test passes
npm run build passes
CLI commands work
API endpoints work
Dashboard loads
MCP server compiles
Run logs are created
README explains usage
```

Required tests:

1. Classifier detects domains
2. Book router selects multiple books
3. Proposal engine flags risky tasks
4. Context pack includes multiple knowledge sources
5. Learn command writes lessons
6. Status detects folders/files
7. API context endpoint works
8. Dashboard build passes
9. MCP tool handlers compile

---

## 21. v2 Scope

v2 should add repo intelligence.

v2 includes:

```text
GitHub repo ingestion
Repo scoring
License scanning
Read-only repo quarantine
Repomix digest generation
Manual plus-button repo add
Big Bible folders
Google Drive archive option
Basic search over repo digests
```

v2 does not need full vector DB yet unless v1/v2 core is stable.

---

## 22. v3 Scope

v3 adds speed and scale.

```text
SQLite index
Qdrant or LanceDB
Hybrid search
Chunking
Embeddings
Google Drive Big Bible archive
Advanced dashboard search
Book stack recommender
```

---

## 23. v4 Scope

v4 adds advanced agent governance.

```text
multi-agent review
Verifier Agent
execution approval workflow
run replay
policy enforcement
agent scorecards
Claude/Gemini/Codex review flows
```

---

## 24. v5 Scope

v5 becomes Universal Builder OS.

```text
full MCP ecosystem
CLI + API + Dashboard
repo hunter
Big Bible
Mini Book compression
living librarian AI
multi-model routing
project-specific brains
team mode
cloud sync optional
```

---

## 25. Practical Model Usage

Recommended workflow using multiple models:

```text
Claude Opus/latest:
Architecture, rule review, final critique

Codex:
Implementation, TypeScript, tests, CLI/API fixes

Gemini latest:
Broad review, dashboard/UI, large-context inspection

ChatGPT:
Product/design/prompt/rulebook review
```

Do not let all models edit at once.

Use sequence:

```text
1. Claude reviews/designs spec
2. Codex implements
3. Gemini reviews gaps/UI
4. Codex fixes tests
5. Claude final review
```

---

## 26. Practical Critique

This idea is strong but has risks.

Main risks:

1. v1 scope creep
2. fake MCP implementation
3. dashboard without working core
4. tests skipped
5. local library becomes messy
6. AI asks too many questions
7. AI claims done without proof
8. repo cloning added too early
9. security risks from unknown code
10. no clear learning loop

Controls:

1. v1 must stay local and verified
2. no repo cloning until v2
3. use rulebook
4. enforce tests/build
5. log every run
6. keep MCP tool surface small
7. use approval gates
8. save lessons
9. dashboard uses same core engine
10. API/CLI/MCP must share logic

---

## 27. Final v1 Definition

BuilderBrain v1 is complete when:

```text
A user can run the local app,
ask BuilderBrain for task context,
see the selected book stack,
view confidence/risk,
get an action proposal,
save lessons,
browse the library in a dashboard,
call it from CLI/API/MCP,
and verify everything with tests/build.
```

That is the correct v1.

Do not build v2 until this works.
