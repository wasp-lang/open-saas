// More info on auth config: https://wasp-lang.dev/docs/language/features#social-login-providers-oauth-20

export async function getUserFields(_context: unknown, args: any) {
  const email = args.profile.emails[0].value
  const username = args.profile.displayName
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  const isAdmin = adminEmails.includes(email)
  return { email, username, isAdmin };
}

export function config() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return {
    clientID, // look up from env or elsewhere,
    clientSecret, // look up from env or elsewhere,
    scope: ['profile', 'email'], // must include at least 'profile' for Google
  };
}
