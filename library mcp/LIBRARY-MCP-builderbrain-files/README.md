# LIBRARY-MCP

This repository is the planning and rule foundation for **BuilderBrain / World Builder Brain**.

BuilderBrain is a local-first AI engineering brain that lets coding agents retrieve context before they plan, code, debug, or refactor. The goal is to build once and connect it later through CLI, API, MCP, dashboards, and AI coding tools.

## Core files

- [`docs/BUILDERBRAIN_V1_DESIGN_PLAN.md`](docs/BUILDERBRAIN_V1_DESIGN_PLAN.md) — full v1 design, architecture, dashboard/API/CLI/MCP scope, and roadmap.
- [`docs/BUILDERBRAIN_CORE_PRINCIPLES_RULEBOOK.md`](docs/BUILDERBRAIN_CORE_PRINCIPLES_RULEBOOK.md) — agent behavior rules: ask once, build, verify, test, do not fake done.
- [`prompts/BUILDERBRAIN_V1_MASTER_BUILD_PROMPT.md`](prompts/BUILDERBRAIN_V1_MASTER_BUILD_PROMPT.md) — short master build instruction for an AI coding agent.
- [`prompts/builderbrain_master_build_prompt.txt`](prompts/builderbrain_master_build_prompt.txt) — earlier detailed v0.1 bootstrap prompt.
- [`prompts/builderbrain_agent_rulebook.md`](prompts/builderbrain_agent_rulebook.md) — earlier execution rulebook focused on verification and anti-laziness.

## Intended v1 scope

BuilderBrain v1 should include:

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

BuilderBrain v1 should **not** include repo cloning, vector DB, Google Drive sync, or Big Bible automation yet. Those are v2+.

## Build instruction

Give an AI coding agent these files and say:

```text
Read these files fully:

1. docs/BUILDERBRAIN_V1_DESIGN_PLAN.md
2. docs/BUILDERBRAIN_CORE_PRINCIPLES_RULEBOOK.md
3. prompts/BUILDERBRAIN_V1_MASTER_BUILD_PROMPT.md

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

## Principle

Boring, working, verified v1 beats advanced, broken, imaginary v5.
