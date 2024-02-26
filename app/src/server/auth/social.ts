import { defineUserSignupFields } from 'wasp/server/auth';
import { z } from 'zod';

const googleDataSchema = z.object({
  profile: z.object({
    emails: z.array(
      z.object({
        value: z.string(),
      })
    ),
  }),
});

const githubDataSchema = z.object({
  profile: z.object({
    emails: z.array(
      z.object({
        value: z.string(),
      })
    ),
    username: z.string(),
  }),
});

export const getGitHubUserFields = defineUserSignupFields({
  email: (data) => {
    const githubData = githubDataSchema.parse(data);
    return githubData.profile.emails[0].value;
  },
  username: (data) => {
    const githubData = githubDataSchema.parse(data);
    return githubData.profile.username;
  },
});

export function getGitHubAuthConfig() {
  return {
    clientID: process.env.GITHUB_CLIENT_ID, // look up from env or elsewhere
    clientSecret: process.env.GITHUB_CLIENT_SECRET, // look up from env or elsewhere
    scope: ['user'],
  };
}

export const getGoogleUserFields = defineUserSignupFields({
  email: (data) => {
    const googleData = googleDataSchema.parse(data);
    return googleData.profile.emails[0].value;
  },
  username: (data) => {
    const googleData = googleDataSchema.parse(data);
    return googleData.profile.emails[0].value;
  },
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
