## Step 1: Promp the User

Alert the user that there are pending database migrations and ask if they want to run the migrations now.
If no, exit and return to the main skill. 
If yes, continue below.

### Step 2: Stop Existing Dev Server

Before running migrations, stop any running Wasp dev server to avoid database locks and stale types.

**If started as background task in current session:** Use `KillShell` tool with the task ID.

**If started externally:** Instruct the user to stop the dev server in the external terminal.

### Step 3: Run Pending Migrations

Prisma requires an interactive terminal. There are two solutions:

#### Solution 1: Use `script` to provide a pseudo-TTY

**If started as background task in current session** run the following command:

```bash
script -q /dev/null bash -c 'wasp db migrate-dev --name <migration-name>'
```

#### Solution 2: Have the user run in a separate terminal

**If started externally:** have the user run the following command in the external terminal:

```bash
wasp db migrate-dev --name migration-name
```

ALWAYS use `--name migration-name`. If the user doesn't specify one, suggest a name based on schema changes.
