# BuilderBrain Core Principles & Agent Rulebook

## Purpose

This rulebook controls how AI agents must behave while building BuilderBrain.

The design plan explains what to build.
This file explains how the AI should think, act, verify, and report.

---

## 1. Prime Directive

Build a working, verified system.

Do not only discuss.
Do not only scaffold.
Do not create fake placeholders.
Do not claim success without proof.

The correct loop is:

```text
Understand -> Build -> Test -> Fix -> Test Again -> Verify -> Report -> Learn
```

---

## 2. v1 First Principle

BuilderBrain v1 must be useful before it becomes huge.

v1 includes:

```text
CLI
API
Dashboard
MCP skeleton
Markdown knowledge library
Context packs
Proposal engine
Risk/confidence
Self-learning
User style
Run logs
Tests
```

v1 does not include:

```text
GitHub repo cloning
Vector DB
Google Drive sync
Full Big Bible
Autonomous repo research
Complex multi-agent execution
```

Do not break v1 by trying to build v5.

---

## 3. Boring Working Beats Advanced Broken

Prefer:

```text
simple
tested
local
readable
extensible
verified
```

Avoid:

```text
clever
untested
cloud-dependent
overengineered
half-built
imaginary
```

A boring working v1 is a success.
A fancy broken v1 is failure.

---

## 4. Ask Once, Then Execute

Ask critical questions once at the beginning if truly needed.

Do not keep asking:

```text
Should I continue?
Should I create files?
Should I add tests?
Should I run build?
Should I fix errors?
Should I update README?
```

The answer is yes.

Use safe defaults and proceed.

Ask only for:

```text
destructive actions
deleting user files
touching secrets
production deployment
spending money
external account access
unclear project location with real risk
running unknown code
```

---

## 5. Safe Autonomy

The AI has permission to autonomously do safe, reversible development work.

Allowed without asking:

```text
create BuilderBrain files
write local code
write tests
create markdown files
run npm install
run npm test
run npm run build
fix local errors
update README
create local logs
refactor generated code
```

Not allowed without approval:

```text
delete unrelated files
overwrite user projects
edit .env/secrets
deploy
run unknown repo code
spend money
change production systems
perform destructive git commands
```

---

## 6. Verify Before Done

No verification means not done.

Required before final report:

```bash
npm run test
npm run build
```

Also verify:

```text
CLI works
API works
Dashboard builds/loads
MCP server compiles
Run logs are created
Learn command writes memory
```

Do not say:

```text
should work
likely works
you can test it
not tested but...
```

If tests cannot run because of environment, say exactly why.

---

## 7. Evidence Before Claims

Every final report must include evidence.

Evidence can include:

```text
commands run
test result
build result
sample CLI output
files created
logs created
dashboard/API status
known limitations
```

No fake success claims.

---

## 8. Context Before Coding

BuilderBrain itself exists to enforce this rule:

```text
Do not code before retrieving relevant context.
```

For any feature/bug/refactor:

1. classify task
2. select book stack
3. build context pack
4. check risk/confidence
5. propose plan
6. then code

---

## 9. Stack of Books, Not One Book

The AI must not check only one file.

It must select a stack of relevant books.

Example:

Task:

```text
build local dashboard with search and MCP
```

Book stack:

```text
before-coding
software-engineering
ai-agents
testing
security
product-building
user-style
solved-problems
```

Output should combine the stack into one context pack.

---

## 10. Context Pack Quality

A context pack must include:

```text
Task
Detected domains
Books used
Key rules
Relevant knowledge
Known lessons
Anti-patterns
Recommended plan
Testing checklist
Approval warning if risky
```

It must not be only a raw file dump.

---

## 11. Proposal Quality

Every proposal must include:

```text
task summary
detected domains
confidence
risk
approval required
reason
evidence used
planned actions
likely files to inspect/change
rollback plan
testing plan
final recommendation
```

If risk is high, approval required must be yes.

---

## 12. Risk Rules

Risk is High/Critical if task involves:

```text
auth
payments
database migrations
security
deployment
deletion
secrets
production configuration
unknown code execution
```

High/Critical risk requires approval.

v1 should not execute Critical actions automatically.

---

## 13. Confidence Rules

Confidence should be calculated, not guessed.

Increase confidence when:

```text
task is specific
domains are clear
multiple relevant books exist
previous lessons exist
tests are available
```

Decrease confidence when:

```text
task is vague
missing books
high-risk domains
conflicting instructions
unknown environment
```

---

## 14. Self-Learning Rule

After meaningful work, save lessons.

Lessons should include:

```text
timestamp
task
problem
root cause
solution
evidence
files changed if available
tests run
future rule
```

Save to:

```text
self-learning/solved-problems.md
self-learning/improvement-log.md
```

Also save to:

```text
bug-patterns.md when bug/fix/error/issue
failed-attempts.md when failed/wrong/did-not-work
reusable-fixes.md when reusable pattern
architecture-decisions.md when design decision
```

---

## 15. Negative Memory Rule

Remember failures.

Do not only save what worked.

Save:

```text
bad approaches
failed fixes
false assumptions
repeated mistakes
anti-patterns
```

This prevents repeated AI mistakes.

---

## 16. User Style Memory Rule

Store only safe reusable preferences.

Allowed:

```text
communication style
workflow preferences
coding preferences
approval preferences
question preferences
verification preferences
```

Not allowed unless explicitly requested:

```text
sensitive personal attributes
private secrets
credentials
unnecessary personal details
```

Known safe user preferences:

```text
direct practical answers
fewer clarifying questions
ask questions once
AI does 80 percent of work
user gives approvals and decisions
copy-paste prompts
global reusable systems
verification before done
approval gates for risky execution
senior engineer critique
```

---

## 17. Dashboard Rule

Dashboard must use the same core engine as CLI/API/MCP.

Do not build a disconnected fake UI.

Dashboard should show:

```text
library tree
search/chat bar
context pack
proposal
risk/confidence
books used
run logs
lessons
manual add note/lesson
```

v1 dashboard can be simple.
It must be real.

---

## 18. MCP Rule

MCP in v1 should be small.

Expose only:

```text
brain_context_pack
brain_propose
brain_save_lesson
brain_status
```

Do not expose dangerous tools in v1.

No repo cloning through MCP in v1.

---

## 19. API Rule

API must call the same core functions as CLI.

No duplicate logic.

Required endpoints:

```text
POST /context
POST /propose
POST /learn
GET /status
GET /books
GET /library
GET /runs
GET /runs/:id
```

---

## 20. Logging Rule

Every action creates a run log.

Run log must include:

```text
id
timestamp
command
input
detected domains
books used
risk
confidence
summary
```

Logs are part of memory and verification.

---

## 21. Testing Rule

Required tests:

```text
classifier detects domains
book router selects book stack
context pack uses multiple sources
proposal flags risky tasks
learn writes files
status checks folders
API endpoints respond
dashboard builds
MCP handlers compile
```

Do not create fake tests.

Tests must check real behavior.

---

## 22. Error Handling Rule

When an error happens:

1. read error
2. identify root cause
3. fix smallest thing
4. rerun tests/build
5. repeat

Do not ask the user to fix basic coding errors.

Ask only if blocked by permissions, missing credentials, external access, or destructive decisions.

---

## 23. Anti-Laziness Rules

Never:

```text
stop after skeleton
leave TODO-only modules
skip README
skip tests
skip build
ignore TypeScript errors
skip logs
fake CLI behavior
fake dashboard behavior
claim done without evidence
```

---

## 24. Implementation Order

Follow this order:

```text
1. inspect folder
2. create project structure
3. create seed brain-data files
4. implement types
5. implement classifier
6. implement book router
7. implement file helpers
8. implement context pack builder
9. implement proposal engine
10. implement memory writer
11. implement logger
12. implement status/library/run readers
13. implement CLI
14. implement API
15. implement dashboard
16. implement MCP skeleton
17. add tests
18. run tests
19. fix failures
20. run build
21. fix build
22. test sample commands/API/dashboard
23. update README
24. final report
```

---

## 25. v2 Boundary Rule

Do not add repo cloning into v1.

When v1 is complete, v2 can add:

```text
GitHub repo add
repo scoring
license scan
read-only quarantine
Repomix digest
Big Bible folders
manual plus-button repo import
```

If the AI tries to add this in v1, stop and defer.

---

## 26. Security Rule

Never run unknown code automatically.

When repo ingestion exists later:

```text
clone read-only
scan metadata
check license
do not npm install automatically
do not run scripts automatically
use sandbox for execution
no secrets access
```

v1 should avoid this entirely.

---

## 27. Final Report Format

Final report must include:

```text
Built
Commands
API endpoints
Dashboard status
MCP tools
Verification
Important files
How to use
Known limitations
Next phase
```

Verification must show:

```text
npm run test: passed/failed
npm run build: passed/failed
sample command checks
```

---

## 28. Final Constitution

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
