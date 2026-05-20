# BuilderBrain / LIBRARY-MCP Chat Session Extract

Generated: 2026-05-20T16:51:19

## Important Note

This is a structured extract of the visible conversation and decisions from this chat session. It captures the BuilderBrain idea, architecture, rules, v1/v2 roadmap, repo-push attempt, generated artifact list, and copy-paste instructions.

It is not a private hidden chain-of-thought export. It is a usable session record for continuing the project with another AI/coding agent.

---

# 1. Original Core Idea

The user wants a universal AI knowledge system where coding agents do not blindly guess before coding.

Main idea:

```text
Task comes in
→ AI classifies task
→ AI searches local knowledge
→ AI selects a stack of books
→ AI creates combined context pack
→ AI proposes action with confidence/risk
→ AI asks approval only when risky
→ AI executes safely
→ AI verifies with tests
→ AI saves lessons
```

The system should work across:

- Claude Code
- OpenCode
- Codex
- Antigravity
- ChatGPT where possible
- OpenHands
- local models / Hermes
- future custom MCP clients

The user wants this to become a universal builder brain, not only for PR Hunt.

---

# 2. Key Product Names Discussed

Recommended name:

```text
BuilderBrain
```

Other names:

```text
World Builder Brain
AI Engineering Brain
RepoBrain OS
Universal Builder Brain
```

Final direction:

```text
BuilderBrain = local-first AI engineering brain + librarian dashboard + MCP connector
```

---

# 3. Mini Book + Big Bible Architecture

The user proposed:

```text
Local fast storage = Mini Book
Google Drive / huge archive = Big Bible
```

Final pattern:

```text
Pocket Rules
→ Mini Book
→ Topic Books
→ Self-Learning
→ User Style
→ Big Bible only when needed
```

Core rule:

```text
Mini Book first.
Big Bible only when Mini Book is weak.
After Big Bible solves something, compress the lesson back into Mini Book.
```

---

# 4. Stack of Books Retrieval

The user wanted AI to not open one book only.

Final efficient design:

```text
Task
→ Book Router
→ Stack Selector
→ Parallel Retriever
→ Ranker
→ Compressor
→ Combined Context Pack
→ AI starts work
```

Important command:

```bash
brain context "task here"
```

Internal process:

```text
classify_task(task)
select_book_stack(task)
search_minibook(book_stack)
search_lessons(book_stack)
maybe_search_bible(book_stack)
return_context_pack()
```

---

# 5. Self-Learning and User Style Memory

User requested folders for:

1. AI learns from itself
2. AI learns safe user style/preferences

Final folders:

```text
03-self-learning/
  solved-problems.md
  failed-attempts.md
  bug-patterns.md
  architecture-decisions.md
  useful-prompts.md
  reusable-fixes.md
  test-evidence.md
  agent-mistakes.md
  improvement-log.md

04-user-style/
  communication-style.md
  decision-style.md
  project-preferences.md
  coding-preferences.md
  risk-preferences.md
  do-not-ask-rules.md
  safe-memory-only.md
```

Safe user preferences captured:

- User prefers direct practical answers.
- User wants AI to do 80% of work and user 20%.
- User dislikes too many clarifying questions.
- User wants questions asked once at the beginning.
- User wants AI to infer safe defaults and continue.
- User likes copy-paste prompts and executable steps.
- User wants global reusable systems, not narrow project-only thinking.
- User wants safety warnings for risky actions.
- User wants approval gates for risky execution.
- User wants evidence/verification before “done.”

---

# 6. Limitations and Improvement Areas Discussed

Main limitations:

1. Garbage repos can poison the brain.
2. Too much knowledge can confuse AI.
3. Old repos can be outdated.
4. License risk if copying code.
5. Security risk from cloned repos.
6. AI may save wrong lessons.
7. Google Drive is not a fast database.
8. Maintenance cost.
9. Context packs can become too large.
10. Different agents may behave differently.

Controls:

- repo quality scoring
- license scanning
- read-only repo ingestion
- quarantine folder
- context pack budget
- confidence scoring
- source-of-truth hierarchy
- negative memory
- decision records
- test memory
- safe user-style memory
- after-action review

---

# 7. God-Level Plan

Final advanced system:

```text
World Builder Brain
  ├── MCP Server
  ├── CLI
  ├── HTTP API
  ├── Mini Book
  ├── Big Bible
  ├── Self-Learning
  ├── User Style
  ├── Qdrant Vector DB
  ├── Postgres/SQLite Metadata
  ├── LangGraph Orchestrator
  ├── Approval Engine
  ├── Sandbox Executor
  ├── QA Verifier
  └── Observability Logs
```

Workflow:

```text
Task
→ classify
→ retrieve stack of books
→ build context pack
→ generate proposal
→ show confidence/risk
→ ask approval if needed
→ execute
→ verify
→ learn
→ update Mini Book
```

Important principle:

```text
AI retrieves evidence, calculates confidence, asks approval at the right time, executes safely, verifies, and becomes smarter after every run.
```

---

# 8. V1 Practical Scope Decision

The user wanted to start from scratch and build v1 first.

Final v1 scope:

```text
BuilderBrain v1 = Core + CLI + Local Dashboard + Basic API + MCP skeleton
```

v1 includes:

- local CLI
- local API
- local dashboard
- small MCP server
- markdown knowledge library
- context pack builder
- proposal/confidence/risk engine
- self-learning memory
- user-style memory
- run logs
- tests and verification

v1 does NOT include:

- automatic GitHub cloning
- vector DB
- Qdrant
- Google Drive sync
- Big Bible automation
- top 100 repo research
- multi-agent orchestration
- cloud deployment

Reason:

```text
Boring, working, verified v1 beats advanced, broken, imaginary v5.
```

---

# 9. V2 Practical Scope

v2 is mainly repo intelligence:

- GitHub repo ingestion
- repo scoring
- license scanner
- read-only repo quarantine
- Repomix digest generation
- manual plus-button repo add
- Big Bible folders
- Google Drive archive option
- basic search over repo digests

---

# 10. Dashboard / Living Librarian Idea

User asked if BuilderBrain can have a local hosted app like ChatGPT dashboard.

Final dashboard idea:

```text
Left sidebar:
- Pocket Rules
- Mini Book
- Self-Learning
- User Style
- Runs
- Future: Big Bible
- Future: Repos

Main area:
- Chat/search bar
- Ask BuilderBrain
- Context Pack result
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

Plus button v1 actions:

```text
+ Add note
+ Add book/chapter
+ Add lesson
+ Add link metadata
+ Add manual research summary
```

Plus button v2 actions:

```text
+ Add GitHub repo
+ Add URL and crawl
+ Add folder
+ Add Google Drive Bible
```

---

# 11. Recommended Model Split

Recommended use of models:

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

Recommended sequence:

```text
1. Claude reviews/designs spec
2. Codex implements
3. Gemini reviews gaps/UI
4. Codex fixes tests
5. Claude final review
```

---

# 12. Generated Files During Session

Files generated in this session:

```text
builderbrain_master_build_prompt.txt
builderbrain_agent_rulebook.md
BUILDERBRAIN_V1_DESIGN_PLAN.md
BUILDERBRAIN_CORE_PRINCIPLES_RULEBOOK.md
BUILDERBRAIN_V1_MASTER_BUILD_PROMPT.md
LIBRARY-MCP-builderbrain-files.zip
```

Primary final files:

```text
docs/BUILDERBRAIN_V1_DESIGN_PLAN.md
docs/BUILDERBRAIN_CORE_PRINCIPLES_RULEBOOK.md
prompts/BUILDERBRAIN_V1_MASTER_BUILD_PROMPT.md
```

Supporting earlier files:

```text
prompts/builderbrain_master_build_prompt.txt
prompts/builderbrain_agent_rulebook.md
```

---

# 13. GitHub Repo Push Attempt

User requested:

```bash
gh repo clone mohitnigahcanada-collab/LIBRARY-MCP
PUSH ALL THE MAIN STUFF TO THIS REPO
```

Repo checked:

```text
mohitnigahcanada-collab/LIBRARY-MCP
default branch: main
visibility: public
README.md existed with:
# LIBRARY-MCP
LIBRARY MCP
```

GitHub connector could read repo, but write calls failed with:

```text
403 Resource not accessible by integration
```

This happened for:

- update README/file
- create issue

So a ready-to-push ZIP was created instead:

```text
LIBRARY-MCP-builderbrain-files.zip
```

Command given:

```bash
gh repo clone mohitnigahcanada-collab/LIBRARY-MCP
cd LIBRARY-MCP

unzip /path/to/LIBRARY-MCP-builderbrain-files.zip -d /tmp/library-mcp-files
cp -R /tmp/library-mcp-files/LIBRARY-MCP-builderbrain-files/* .

git add README.md docs prompts
git commit -m "Add BuilderBrain v1 planning and agent rulebook"
git push origin main
```

---

# 14. Core Commands for Future BuilderBrain

Planned CLI:

```bash
brain context "<task>"
brain propose "<task>"
brain learn "<lesson>"
brain status
brain books
brain runs
```

Planned local API:

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

Planned MCP tools:

```text
brain_context_pack
brain_propose
brain_save_lesson
brain_status
```

---

# 15. Final Instructions for AI Coding Agent

Give the AI these files:

```text
1. docs/BUILDERBRAIN_V1_DESIGN_PLAN.md
2. docs/BUILDERBRAIN_CORE_PRINCIPLES_RULEBOOK.md
3. prompts/BUILDERBRAIN_V1_MASTER_BUILD_PROMPT.md
```

Then tell it:

```text
Read these files fully.

Follow them exactly.

Ask critical questions once at the beginning only if truly required.
Then build BuilderBrain v1 completely.
Do not stop after skeleton.
Do not add repo cloning yet.
Run tests.
Run build.
Fix failures.
Verify everything.
Then give final report.
```

---

# 16. Final Constitution

```text
1. Build, do not only discuss.
2. Ask once, then execute.
3. Use safe defaults.
4. Do not ask permission for normal coding.
5. Ask approval for risky actions.
6. Retrieve context before coding.
7. Use a stack of books, not one file.
8. Verify before done.
9. Fix failures before reporting.
10. Save lessons.
11. Keep v1 simple.
12. Do not add repo cloning until v2.
13. Be honest about limitations.
14. Boring working beats advanced broken.
```
