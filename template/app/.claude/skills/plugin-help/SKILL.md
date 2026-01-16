---
name: plugin-help
description: Shows the Wasp plugin's available features, commands, and skills.
---

1. run the [check-wasp-init hook](../../hooks/check-wasp-init.js) using the Bash tool with `node` command to see if Wasp knowledge has been initialized.
2. let the user know if the Wasp plugin has been initialized or not.
3. if the Wasp plugin has not been initialized, let the user know they should take care of this first by running `/wasp:init`:
```markdown
⚠️
The Wasp plugin hasn't been initialized for the current project.
Run `/wasp:init` to get the plugin's full functionality.
```
4. display the [Wasp Plugin for Claude Code](#wasp-plugin-for-claude-code) section to the user exactly as it is below.

--- --- 🐝 🐝 🐝 --- ---

# 🐝 Wasp Plugin for Claude Code

## What This Plugin Does

This plugin makes Claude Code work better with Wasp by:

1. **Using the right documentation** — Automatically fetches the correct Wasp docs for your project's version
2. **Avoiding common mistakes** — Provides Wasp-specific tips, patterns, and best practices so Claude doesn't hallucinate or use outdated approaches
3. **Guided workflows** — Skills and commands so Claude can walk you through setting up Wasp's batteries-included features (auth, email, database, styling) and deploying
4. **Full debugging visibility** — Start managed databases, dev servers, and connect browser console access so Claude has full development and debugging visibility across the entire stack

The result: Claude actually understands Wasp instead of guessing.


## Quick Reference

Slash Commands:
`/wasp:init` - Initialize plugin for your project
`/wasp:expert-advice` - Get advice on improvements from a Wasp expert
`/wasp:help` - Show this guide

Skills:
`add-feature` - Add Wasp's built-in features (auth, email, database, styling)
`deploying-app` - Guided deployment to Railway or Fly.io
`start-dev-server` - Start dev environment with full debugging visibility (db -> server -> browser console)

## 💬 Example Prompts

- *"Add Google authentication to my app"*
- *"Help me add ShadCN UI to my app"*
- *"Migrate the database from SQLite to PostgreSQL and start it for me"*
- *"Set up email sending with SendGrid"*
- *"Solve the errors in the browser using the Chrome DevTools MCP server"*
- *"Why isn't my recurring job working?"*
- *"Deploy my app to Railway"*


## 📖 Documentation Access

The plugin ensures Claude detects your project's Wasp version and references the correct documentation:

- **Latest:** `https://wasp.sh/llms.txt`
- **Versioned:** `https://wasp.sh/llms-{version}.txt` (e.g., `llms-0.15.txt`)


## 🫂 Community & Contribute

Join the [Wasp Discord](https://discord.gg/rzdnErX) for help and web dev discussion.
Submit issues, feedback, or PRs: [Wasp Claude Code Plugins](https://github.com/wasp-lang/claude-plugins)
