import { defineUserSignupFields } from 'wasp/auth/providers/types';

const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

export const getEmailUserFields = defineUserSignupFields({
  username: (data: any) => data.email,
  isAdmin: (data: any) => adminEmails.includes(data.email),
  email: (data: any) => data.email,
});

export const getGitHubUserFields = defineUserSignupFields({
  // NOTE: if we don't want to access users' emails, we can use scope ["user:read"]
  // instead of ["user"] and access args.profile.username instead
  email: (data: any) => data.profile.emails[0].email,
  username: (data: any) => data.profile.login,
  isAdmin: (data: any) => adminEmails.includes(data.profile.emails[0].email),
});

export function getGitHubAuthConfig() {
  return {
    scopes: ['user'],
  };
}

export const getGoogleUserFields = defineUserSignupFields({
  email: (data: any) => data.profile.email,
  username: (data: any) => data.profile.name,
  isAdmin: (data: any) => adminEmails.includes(data.profile.email),
});

export function getGoogleAuthConfig() {
  return {
    scopes: ['profile', 'email'], // must include at least 'profile' for Google
  };
}
