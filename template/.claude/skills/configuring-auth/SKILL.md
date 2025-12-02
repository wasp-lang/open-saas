---
name: configuring-auth
description: configure authentication for Open SaaS (email/password and OAuth providers).
---

# configuring-auth

All authentication guide URLs, including provider-specific guide URLs, are available in the [Wasp LLM-optimized documentation](https://wasp.sh/llms.txt)

## Check Current Status

1. read [`../../../app/main.wasp`](../../../app/main.wasp) auth section
2. report enabled methods to user (email is enabled by default)

## Email Authentication

Email auth is enabled by default. For production:
1. configure email provider in main.wasp (SendGrid, Mailgun, or SMTP)
2. set provider env vars in `.env.server`
3. customize templates in `src/auth/email-and-pass/emails.ts` if needed

**Dev testing:** use `Dummy` provider, find verification URLs in server console, or set `SKIP_EMAIL_VERIFICATION_IN_DEV=true`

## OAuth Providers

1. **Enable:** uncomment provider in main.wasp auth methods. Note: Additional providers can be found in the [Wasp LLM-optimized documentation](https://wasp.sh/llms.txt).
2. **Credentials:** set `<PROVIDER>_CLIENT_ID` and `<PROVIDER>_CLIENT_SECRET` in `.env.server`
3. **Redirect URL:** configure in provider dashboard:
   - Dev: `http://localhost:3001/auth/<provider>/callback`
   - Prod: `https://your-domain.com/auth/<provider>/callback`
4. **Verify:** restart wasp, test login flow, check `wasp db studio`

## Disabling Auth

Comment out method in main.wasp, restart server.

## Troubleshooting

see [troubleshooting](./troubleshooting.md)
