---
name: validating-pre-deployment
description: validate configuration and test production build before deploying.
---

# validating-pre-deployment

Pre-deployment validation checks that catch common issues before deploying with the [deploying-app skill](../deploying-app/SKILL.md).

## Before Starting

1. verify user is in the app directory (check for `main.wasp` or `main.wasp.ts`)
2. ask: "Would you like me to run pre-deployment checks on your app?"

## Validation Steps

Run these checks in order. Report all issues found, then ask the user if they want to proceed or fix issues first.

### Step 1: Wasp Config Metadata

1. Check the wasp config file (`main.wasp` or `main.wasp.ts`) for placeholder values:
   - URLs are actual live URLs, not placeholder values set during the setup wizard.
   - Email provider and default from address are actual live email addresses

Report format:
```
## Configuration Issues Found

### Critical (must fix):
- [ ] issue description

### Warnings (recommended to fix):
- [ ] issue description

### Passed:
- [x] check that passed
```

### Step 2: Environment Variables

Based on the wasp config file and the app's features, generate a checklist of required env variables, found in the "Env Variables" section of the docs, for the user to verify.

Note that the following env vars are auto-set by Wasp when using `wasp deploy` to deploy to Railway or Fly.io automatically:
- `DATABASE_URL`
- `WASP_WEB_CLIENT_URL`
- `WASP_SERVER_URL`
- `JWT_SECRET`
- `PORT`

### Step 4: Database Migrations

Check for pending migrations:
```bash
# List migration files
ls -la migrations/
```

Remind user:
- Production automatically applies pending migrations on server start
- Ensure migrations are committed to version control
- Test migrations work locally before deploying

### Step 5: Production Build Test

Ask user: "Would you like to test the production build locally? This catches environment-specific issues."

If yes, guide them through the "Testing the build locally" section of the docs.

### Step 6: Final Checklist

Present summary:

```
## Pre-Deployment Summary

### Configuration Status:
- App Name: [name]
- App Title: [title]
- Email Provider: [provider]
- Auth Methods: [list]
- Other integrations: [list]

### Issues to Resolve:
[list any issues from steps 1-4]

### Before Deploying:
- [ ] All configuration placeholders replaced
- [ ] Production email provider configured
- [ ] Required env vars ready for deployment
- [ ] Production build tested locally (optional but recommended)
- [ ] Database migrations committed

### Ready to Deploy?
```

## Completion

If all checks pass or user chooses to proceed:
- Summarize what was validated
- Ask: "Would you like to proceed with deployment? I can guide you through deploying to providers like Railway or Fly.io automatically with Wasp's CLI commands."
- If yes, transition to [deploying-app skill](../deploying-app/SKILL.md)
