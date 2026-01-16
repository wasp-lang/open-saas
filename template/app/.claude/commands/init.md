---
description: Add Wasp knowledge to your project's CLAUDE.md
---

0. inform the user that this process will give Claude access to info on Wasp's features, commands, workflows, and best practices by copying the `general-wasp-knowledge.md` file into the project directory and importing it into the user's CLAUDE.md file. Use the AskUserQuestion tool to ask the user if they want to continue.
1. copy the file `${CLAUDE_PLUGIN_ROOT}/general-wasp-knowledge.md` from within the plugin's installation directory to the user's project `.claude/wasp/knowledge` directory using the Bash tool with `cp` command.
2. append it to the user's CLAUDE.md file as an import:
```markdown
# Wasp Knowledge

Wasp knowledge can be found at @.claude/wasp/knowledge/general-wasp-knowledge.md
```
3. inform the user that process is complete and they can run `/wasp:help` to see the plugin's available commands and skills.
4. recommend the user do the following for the best Wasp development experience with Claude:
   - **Start the dev server**: Tell claude to run the 'start-dev-server' skill to start the Wasp app and give Claude access to server logs, build errors, and Wasp CLI commands
   - **Enable Chrome DevTools**: Prompt Claude to *`use the Chrome DevTools MCP server`* to give Claude visibility into browser console logs, network requests, and runtime errors

   Explain that together these provide end-to-end insight (backend + frontend) for faster debugging and development.
