import {
  page,
  route,
  type Auth,
  type AuthMethods,
  type Part,
} from "@wasp.sh/spec";

import { LoginPage } from "./LoginPage" with { type: "ref" };
import { SignupPage } from "./SignupPage" with { type: "ref" };
import { EmailVerificationPage } from "./email-and-pass/EmailVerificationPage" with { type: "ref" };
import { PasswordResetPage } from "./email-and-pass/PasswordResetPage" with { type: "ref" };
import { RequestPasswordResetPage } from "./email-and-pass/RequestPasswordResetPage" with { type: "ref" };
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

// 🔐 Auth out of the box! https://wasp.sh/docs/auth/overview
export const authConfig: Auth = {
  userEntity: "User",
  methods: {
    // NOTE: If you decide to not use email auth, make sure to also delete the related routes below.
    //       (RequestPasswordResetRoute, PasswordResetRoute, EmailVerificationRoute)
    email: getEmailAuthMethod(),
  },
  onAuthFailedRedirectTo: "/login",
  onAuthSucceededRedirectTo: "/demo-app",
};

export const auth: Part[] = [
  route("LoginRoute", "/login", page(LoginPage)),
  route("SignupRoute", "/signup", page(SignupPage)),
  route(
    "RequestPasswordResetRoute",
    "/request-password-reset",
    page(RequestPasswordResetPage),
  ),
  route("PasswordResetRoute", "/password-reset", page(PasswordResetPage)),
  route(
    "EmailVerificationRoute",
    "/email-verification",
    page(EmailVerificationPage),
  ),
];

function getEmailAuthMethod(): NonNullable<AuthMethods["email"]> {
  return {
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
}

// Plug the following authentication methods in the `authConfig` above to enable them.
// Do note that `email` and `usernameAndPassword` are mutually exclusive.
function getUsernameAndPasswordAuthMethod(): NonNullable<
  AuthMethods["usernameAndPassword"]
> {
  return {};
}
function getGoogleAuthMethod(): NonNullable<AuthMethods["google"]> {
  return {
    userSignupFields: getGoogleUserFields,
    configFn: getGoogleAuthConfig,
  };
}
function getGitGubAuthMethod(): NonNullable<AuthMethods["gitHub"]> {
  return {
    userSignupFields: getGitHubUserFields,
    configFn: getGitHubAuthConfig,
  };
}
function getDiscordAuthMethod(): NonNullable<AuthMethods["discord"]> {
  return {
    userSignupFields: getDiscordUserFields,
    configFn: getDiscordAuthConfig,
  };
}
