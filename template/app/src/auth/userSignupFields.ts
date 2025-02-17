import { z } from 'zod';
import { defineUserSignupFields } from 'wasp/auth/providers/types';

const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

export const getEmailUserFields = defineUserSignupFields({
  username: (data: any) => data.email,
  isAdmin: (data: any) => adminEmails.includes(data.email),
  email: (data: any) => data.email,
});

const githubDataSchema = z.object({
  profile: z.object({
    emails: z.array(
      z.object({
        email: z.string(),
      })
    ),
    login: z.string(),
  }),
});

export const getGitHubUserFields = defineUserSignupFields({
  email: (data) => {
    const githubData = githubDataSchema.parse(data);
    return githubData.profile.emails[0].email;
  },
  username: (data) => {
    const githubData = githubDataSchema.parse(data);
    return githubData.profile.login;
  },
  isAdmin: (data) => {
    const githubData = githubDataSchema.parse(data);
    return adminEmails.includes(githubData.profile.emails[0].email);
  },
});

// NOTE: if we don't want to access users' emails, we can use scope ["user:read"]
// instead of ["user"] and access args.profile.username instead
export function getGitHubAuthConfig() {
  return {
    scopes: ['user'],
  };
}

const googleDataSchema = z.object({
  profile: z.object({
    email: z.string(),
  }),
});

export const getGoogleUserFields = defineUserSignupFields({
  email: (data) => {
    const googleData = googleDataSchema.parse(data);
    return googleData.profile.email;
  },
  username: (data) => {
    const googleData = googleDataSchema.parse(data);
    return googleData.profile.email;
  },
  isAdmin: (data) => {
    const googleData = googleDataSchema.parse(data);
    return adminEmails.includes(googleData.profile.email);
  },
});

export function getGoogleAuthConfig() {
  return {
    scopes: ['profile', 'email'], // must include at least 'profile' for Google
  };
}

const discordDataSchema = z.object({
  profile: z.object({
    username: z.string(),
    email: z.string().email().nullable(),
  }),
});

export const getDiscordUserFields = defineUserSignupFields({
  email: (data) => {
    const discordData = discordDataSchema.parse(data);
    return discordData.profile.email;
  },
  username: (data) => {
    const discordData = discordDataSchema.parse(data);
    return discordData.profile.username;
  },
  isAdmin: (data) => {
    const email = discordDataSchema.parse(data).profile.email;
    return !!email && adminEmails.includes(email);
  },
});

export function getDiscordAuthConfig() {
  return {
    scopes: ['identify', 'email'],
  };
}
