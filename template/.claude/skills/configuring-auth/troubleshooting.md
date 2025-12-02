# Troubleshooting - Authentication

## Email Issues

**No verification email (dev):** check server console for URL, or set `SKIP_EMAIL_VERIFICATION_IN_DEV=true`

**No verification email (prod):** verify email provider configured (not `Dummy`), check env vars, verify sender address matches provider settings

**Password reset fails:** verify `passwordReset.clientRoute` points to valid route

## OAuth Issues

**Button not appearing:** uncomment provider in main.wasp, restart server

**redirect_uri_mismatch:** URL must match exactly:
- Port is `3001` (server), not `3000`
- Provider name lowercase (e.g., `github`)
- No trailing slash

**Missing user data:** check `userSignupFields` in `src/auth/userSignupFields.ts`, verify OAuth scopes

**Flow hangs:** check `onAuthSucceededRedirectTo` in main.wasp, clear cookies

## Production Issues

- Verify production env vars are set
- Use production OAuth credentials (not dev)
- Ensure redirect URLs use production domain
- Email provider must not be `Dummy`

## More Help

Refer to [Wasp auth docs](https://wasp.sh/llms.txt)
