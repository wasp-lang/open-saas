import { type Auth, type AuthMethods } from "@wasp.sh/spec";

import {
  getPasswordResetEmailContent,
  getVerificationEmailContent,
} from "./email-and-pass/emails" with { type: "ref" };
import {
  getDiscordAuthConfig,
  getDiscordUserFields,
  getEmailUserFields,
  getGitHubAuthConfig,
  getGitHubUserFields,
  getGoogleAuthConfig,
  getGoogleUserFields,
} from "./userSignupFields" with { type: "ref" };

const emailAuthMethod: NonNullable<AuthMethods["email"]> = {
  fromField: {
    name: "Open SaaS App",
    email: "me@example.com",
  },
  emailVerification: {
    clientRoute: "EmailVerificationRoute",
    getEmailContentFn: getVerificationEmailContent,
  },
  passwordReset: {
    clientRoute: "PasswordResetRoute",
    getEmailContentFn: getPasswordResetEmailContent,
  },
  userSignupFields: getEmailUserFields,
};

// Plug the following authentication methods in the `authConfig` below to enable them.
// Do note that `email` and `usernameAndPassword` are mutually exclusive.
// @ts-expect-error Demo purposes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const usernameAndPasswordAuthMethod: NonNullable<
  AuthMethods["usernameAndPassword"]
> = {};
// @ts-expect-error Demo purposes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const googleAuthMethod: NonNullable<AuthMethods["google"]> = {
  userSignupFields: getGoogleUserFields,
  configFn: getGoogleAuthConfig,
};
// @ts-expect-error Demo purposes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const gitGubAuthMethod: NonNullable<AuthMethods["gitHub"]> = {
  userSignupFields: getGitHubUserFields,
  configFn: getGitHubAuthConfig,
};
// @ts-expect-error Demo purposes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const discordAuthMethod: NonNullable<AuthMethods["discord"]> = {
  userSignupFields: getDiscordUserFields,
  configFn: getDiscordAuthConfig,
};

// 🔐 Auth out of the box! https://wasp.sh/docs/auth/overview
export const authConfig: Auth = {
  userEntity: "User",
  methods: {
    // NOTE: If you decide to not use email auth, make sure to also delete the related pages below.
    //       (src/app/request-password-reset, src/app/password-reset, src/app/email-verification)
    email: emailAuthMethod,
    // usernameAndPassword: usernameAndPasswordAuthMethod,
    // google: googleAuthMethod,
    // gitHub: gitGubAuthMethod,
    // discord: discordAuthMethod,
  },
  onAuthFailedRedirectTo: "/login",
  onAuthSucceededRedirectTo: "/demo-app",
};
