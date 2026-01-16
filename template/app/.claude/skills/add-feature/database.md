# Database Setup

Configure a database for your Wasp app.

## Prerequisites

- Fetch the list of available databases from the [Wasp docs](https://wasp.sh/llms.txt)

## Steps

1. **Display the full list** of available databases to the user.

2. Using the `AskUserQuestion` tool, ask the user which database they'd like to use:
   - Use the most popular/common options (e.g., PostgreSQL, SQLite) as the selectable choices (limited to 2-4 options)
   - Remind users they can select "Other" to specify any option from the full list

3. If the selected database can be managed locally by Wasp (e.g., PostgreSQL), using the `AskUserQuestion` tool, ask the user: "Would you like me to guide you through the local database setup process?"
   - If yes, guide the user through the managed database setup process according to the individual database docs
   - If no, inform the user that they'll need to set the proper env vars after setting up the database themselves
