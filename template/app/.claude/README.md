# Wasp Skills for AI-assisted Coding

## Skills

The Open SaaS app template comes with the Wasp Skills for AI-assisted Coding pre-installed in this sub-directory.

Although they are within the `.claude` directory, Claude Code, Cursor, VS Code/Copilot, etc., will look for and load skills from this directory as well.

For a full list of tools adopting this Agent Skills standard, see https://agentskills.io/ 

## MCP Server Installation

We also suggest adding the Chrome DevTools MCP server to your IDE's settings.

### Claude Code

For Claude Code users, the `.mcp.json` file is already located in the root of the project.

### Cursor / VS Code

Add the following to your `mcp.json` file:
```json
{
    // ... other MCP servers ...
    "Chrome DevTools": {
      "command": "npx chrome-devtools-mcp@latest",
      "env": {},
      "args": []
    }
}
```
