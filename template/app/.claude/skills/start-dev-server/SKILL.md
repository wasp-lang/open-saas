---
name: start-dev-server
description: Start the Wasp dev server and set up full debugging visibility. This includes running the server (with access to logs), and connecting browser console access so Claude can see client-side errors. Essential for any development or debugging work.
---

## Step 0: Get User Preferences

- [ ] Ask the user if they want Claude to start the dev server(s) as a background task in the current session, or on their own in a separate terminal:
  - Starting as a background task (Claude)
    - Pros: Claude has more autonomy, can respond directly to dev server logs (warnings, errors).
    - Cons: Certain actions can be slower, and the user has less direct control. Server logs are only visibile to the user from within the `background tasks` tab.
  - Starting externally (User)
    - Pros: The user has more direct control over app development and the Wasp CLI commands. Can be advantageous for more advanced users.
    - Cons: Debugging and feature discovery can be slower, as Claude doesn't have direct access to dev server logs (warnings, errors) or Wasp CLI commands.
- [ ] Depending on the user's choice, follow the steps below and run the commands for the user as background tasks, or guide them through running them manually in a separate terminal.

### Step 1: Ensure the Development Database is Running

Grep the `.env.server` file for `DATABASE_URL`. If no line starts with `DATABASE_URL`, continue following this step.
If the user does have their own DATABASE_URL env var set, move on to [Step 2](#step-2-start-dev-server).

Check the `schema.prisma` file in the project root for the `datasource` block to see which database is being used.

#### SQLite
**Skip to [Step 2](#step-2-start-dev-server):** SQLite stores data in a local file, no database server needed.

#### PostgreSQL
Start the managed database container as a background task:
```bash
wasp start db
```

**Docker needs to be installed and running** for the managed Postgres database container (`wasp start db`) to work.

Run this as a background task in the current claude code session.
Wait 5-15 seconds for the database to be ready.


### Step 2: Start Dev Server

Run as a background task:
```bash
wasp start
```

Listen to the output from `wasp start` and if it gives a prisma **db migration warning**, follow the [running-db-migrations.md](./running-db-migrations.md) reference.


### Step 3: Verify Server is Running

Confirm client (`localhost:3000`) and server (`localhost:3001`) are running by checking the background task output.

**If started as background task in current session:** Listen to the output for development and debugging information.
**If started externally:** Instruct the user to check the output of the external terminal and share its output with you.

### Step 4: Connect Browser Console Access (Important!)

**This step is critical for effective development and debugging.** Without browser console access, Claude cannot see client-side errors, warnings, or React issues that occur in the browser.

Ask the user (via the AskUserQuestion tool) which method they'd like to use for giving Claude visibility into the browser console:

| Option | Description |
|--------|-------------|
| **Chrome DevTools MCP (recommended)** | Use the `mcp__plugin_wasp_chrome-devtools` tool (bundled with the plugin) |
| **Built-in Chrome** | Use Claude Code's built-in browser connection (check status with `/chrome` command) |
| **Manual** | User will manually copy/paste console output when needed |
| **Other** | User has another preference |
