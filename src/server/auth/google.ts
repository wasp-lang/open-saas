// More info on auth config: https://wasp-lang.dev/docs/language/features#social-login-providers-oauth-20

export async function getUserFields(_context: unknown, args: any) {
  console.log('args', args.profile)
  const email = args.profile.emails[0].value
  return { email };
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
