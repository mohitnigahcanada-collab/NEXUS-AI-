#!/usr/bin/env bash
set -euo pipefail

# Run from inside a cloned LIBRARY-MCP repo root.
# Example:
# gh repo clone mohitnigahcanada-collab/LIBRARY-MCP
# cd LIBRARY-MCP
# unzip /path/to/LIBRARY-MCP-builderbrain-files.zip -d /tmp/library-mcp-files
# cp -R /tmp/library-mcp-files/LIBRARY-MCP-builderbrain-files/* .
# git add README.md docs prompts
# git commit -m "Add BuilderBrain v1 planning and agent rulebook"
# git push origin main

git add README.md docs prompts
git commit -m "Add BuilderBrain v1 planning and agent rulebook"
git push origin main
