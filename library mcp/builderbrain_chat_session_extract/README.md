# BuilderBrain Chat Session Extract ZIP

This ZIP contains:

- `session/BUILDERBRAIN_CHAT_SESSION_EXTRACT.md` — structured extract of the chat session.
- `session/session_summary.json` — machine-readable summary.
- `artifacts/` — generated prompt/design/rulebook files.
- `repo-ready/` — files prepared for the LIBRARY-MCP GitHub repo, if available.

Use the repo-ready folder to push files into:

`mohitnigahcanada-collab/LIBRARY-MCP`

Recommended push command:

```bash
gh repo clone mohitnigahcanada-collab/LIBRARY-MCP
cd LIBRARY-MCP
cp -R /path/to/repo-ready/LIBRARY-MCP-builderbrain-files/* .
git add README.md docs prompts
git commit -m "Add BuilderBrain v1 planning and agent rulebook"
git push origin main
```
