import { defineUserSignupFields } from 'wasp/auth/providers/types';

export const getUsernameAndPasswordUserFields = defineUserSignupFields({
  username: (data: any) => data.username,
});

const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

export const getEmailUserFields = defineUserSignupFields({
  username: (data: any) => data.email,
  isAdmin : (data: any) => adminEmails.includes(data.email),
  email: (data: any) => data.email,
});

export const getGitHubUserFields = defineUserSignupFields({
  // NOTE: if we don't want to access users' emails, we can use scope ["user:read"]
  // instead of ["user"] and access args.profile.username instead
  email: (data: any) => data.profile.emails[0].value,
  username: (data: any) => data.profile.username,
  isAdmin: (data: any) => adminEmails.includes(data.profile.emails[0].value),
});

export function getGitHubAuthConfig() {
  return {
    clientID: process.env.GITHUB_CLIENT_ID, // look up from env or elsewhere
    clientSecret: process.env.GITHUB_CLIENT_SECRET, // look up from env or elsewhere
    scope: ['user'],
  };
}

export const getGoogleUserFields = defineUserSignupFields({
  email: (data: any) => data.profile.emails[0].value,
  username: (data: any) => data.profile.displayName,
  isAdmin: (data: any) => adminEmails.includes(data.profile.emails[0].value),
});

export function getGoogleAuthConfig() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return {
    clientID, // look up from env or elsewhere,
    clientSecret, // look up from env or elsewhere,
    scope: ['profile', 'email'], // must include at least 'profile' for Google
  };
}

