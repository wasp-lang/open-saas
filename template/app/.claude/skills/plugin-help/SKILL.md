---
name: plugin-help
description: Shows the Wasp plugin's available features, commands, and skills.
---

Display the [Wasp Plugin for Claude Code](#wasp-plugin-for-claude-code) section to the user exactly as it is below.

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
`/wasp:expert-advice` - Get advice on improvements from a Wasp expert
`/wasp:help` - Show this guide

Skills:
`deploying-app` - Guided deployment to Railway or Fly.io
`start-dev-server` - Start dev environment with full debugging visibility (db -> server -> browser console)

## 💬 Example Prompts

- *"Add another authentication method to my app"*
- *"Set up email sending with SendGrid"*
- *"Solve the errors in the browser using the Chrome DevTools MCP server"*
- *"Why isn't my recurring job working?"*
- *"Deploy my app to Railway"*

## 📖 Documentation Access

The plugin ensures Claude detects your project's Wasp version and references the correct, LLM-friendly documentation.

## 🫂 Community & Contribute

Join the [Wasp Discord](https://discord.gg/rzdnErX) for help and web dev discussion.
Submit issues, feedback, or PRs: [Wasp Claude Code Plugins](https://github.com/wasp-lang/claude-plugins)
