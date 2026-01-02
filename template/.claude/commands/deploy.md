---
description: Run pre-deployment checks then deploy to Railway or Fly.io.
---

# Deploy Open SaaS App

This command guides you through validating your app configuration and deploying to production.

## Process

1. **Pre-Deployment Validation** - Run the [pre-deployment skill](../skills/pre-deployment/SKILL.md) to check:
   - Wasp config metadata (app name, OG tags, analytics)
   - Environment variables
   - Database migrations
   - Optional: production build test

2. **Deployment** - If validation passes, run the [deploying-app skill](../skills/deploying-app/SKILL.md) to deploy to Railway or Fly.io.

Begin with: "I'll help you deploy your Open SaaS app. First, let me run some pre-deployment checks to catch any issues."

Then execute the pre-deployment skill. After it completes successfully, ask the user if they want to proceed with deployment and execute the deploying-app skill.
