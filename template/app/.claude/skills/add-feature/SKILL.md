---
name: add-feature
description: Add Wasp's built-in features to your app — auth, email, jobs, and more. These are full-stack, batteries-included features that Wasp handles for you. Use when the user wants to add meta tags, authentication (email, social auth providers), email sending, database setup, styling (tailwind, shadcn), or other Wasp-powered functionality.
---

# add-feature

Add Wasp's batteries-included features to your app. Each invocation focuses on one feature at a time.

## Before Starting

1. Verify user is in the app directory (check for wasp config file: `main.wasp` or `main.wasp.ts`)

## Available Wasp Features

Present these features to the user and let them choose ONE to configure:

| Feature | Description |
|---------|-------------|
| **App Branding** | Set your app's name, description, and meta tags |
| **Authentication** | Add login methods (Email, Google, GitHub, etc.) |
| **Email Provider** | Configure email sending (SendGrid, Mailgun, etc.) |
| **Database** | Set up your database (PostgreSQL, SQLite, etc.) |
| **Styling (CSS, UI)** | Add Tailwind CSS or ShadCN UI (on top of Tailwind CSS) |
| **Verify Setup** | Test that your app compiles and runs correctly |

## Feature Selection

Using the `AskUserQuestion` tool, ask the user which Wasp feature they'd like to configure:
- Use the most relevant options as selectable choices (limited to 2-4 options)
- Remind users they can select "Other" to choose from additional features

## Execute Selected Feature

Based on the user's selection, follow the corresponding guides below.
ALWAYS follow the feature guide's corresponding raw text documentation URLs and use it as the basis for assisting the user.

- **App Branding** → [app-branding.md](./app-branding.md)
- **Authentication** → [authentication.md](./authentication.md)
- **Email Provider** → [email-provider.md](./email-provider.md)
- **Database** → [database.md](./database.md)
- **Styling (CSS, UI)** → [styling.md](./styling.md)
- **Verify Setup** → [verify-setup.md](./verify-setup.md)

## Guidelines for Using AskUserQuestion with Lists

When asking the user to choose from fetched lists (e.g., auth methods, email providers):

1. **Always display the full list** to the user before asking them to choose, so they know all available options.
2. **Use the most popular/common options** as the selectable choices in `AskUserQuestion` (limited to 2-4 options).
3. **Remind users** they can select "Other" to specify any option from the full list that isn't shown in the quick-select options.
4. **Example format:**
   ```
   Available auth methods: Username & Password, Email, Google, GitHub, Discord, Keycloak, Slack

   [AskUserQuestion with 3-4 most common options]

   Note: Select "Other" to choose from additional options like Discord, Keycloak, or Slack.
   ```

## After Feature Completion

After completing a feature configuration:
1. Summarize the changes made
2. If applicable, let them know if there are any environment variables they need to set and ask them if they need guidance on how to set them
  - if so, fetch the raw github doc file URL for the environment variables and guide the user through the process
3. Ask if the user would like to configure another feature
3. If yes, return to Feature Selection
4. If no, suggest running "Verify Setup" if they haven't already
