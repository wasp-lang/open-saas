import { GetUserFieldsFn } from '@wasp/types';

// More info on auth config: https://wasp-lang.dev/docs/language/features#social-login-providers-oauth-20

export const getGitHubUserFields: GetUserFieldsFn = async (_context, args) => {
  // NOTE: if we don't want to access users' emails, we can use scope ["user:read"]
  // instead of ["user"] and access args.profile.username instead
  const email = args.profile.emails[0].value;
  const username = args.profile.username;
  return { email, username };
};

export function getGitHubAuthConfig() {
  return {
    clientID: process.env.GITHUB_CLIENT_ID, // look up from env or elsewhere
    clientSecret: process.env.GITHUB_CLIENT_SECRET, // look up from env or elsewhere
    scope: ['user'],
  };
}

export const getGoogleUserFields: GetUserFieldsFn = async (_context, args) => {
  const email = args.profile.emails[0].value;
  const username = args.profile.displayName;
  return { email, username };
}

export function getGoogleAuthConfig() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return {
    clientID, // look up from env or elsewhere,
    clientSecret, // look up from env or elsewhere,
    scope: ['profile', 'email'], // must include at least 'profile' for Google
  };
}

