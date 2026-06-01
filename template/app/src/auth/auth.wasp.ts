import { page, route, type Auth, type Part } from '@wasp.sh/spec'

import { getVerificationEmailContent, getPasswordResetEmailContent } from './email-and-pass/emails' with { type: 'ref' }
import { getEmailUserFields } from './userSignupFields' with { type: 'ref' }

import { Login } from './LoginPage' with { type: 'ref' }
import { Signup } from './SignupPage' with { type: 'ref' }
import { RequestPasswordResetPage } from './email-and-pass/RequestPasswordResetPage' with { type: 'ref' }
import { PasswordResetPage } from './email-and-pass/PasswordResetPage' with { type: 'ref' }
import { EmailVerificationPage } from './email-and-pass/EmailVerificationPage' with { type: 'ref' }

// Uncomment the imports below to enable the matching social auth providers.
// import { getGoogleUserFields, getGoogleAuthConfig } from './userSignupFields' with { type: 'ref' }
// import { getGitHubUserFields, getGitHubAuthConfig } from './userSignupFields' with { type: 'ref' }
// import { getDiscordUserFields, getDiscordAuthConfig } from './userSignupFields' with { type: 'ref' }

// 🔐 Auth out of the box! https://wasp.sh/docs/auth/overview
export const authConfig: Auth = {
  userEntity: 'User',
  methods: {
    // NOTE: If you decide to not use email auth, make sure to also delete the related routes and pages below.
    //   (RequestPasswordReset, PasswordReset, EmailVerification)
    email: {
      fromField: {
        name: 'Open SaaS App',
        email: 'me@example.com',
      },
      emailVerification: {
        clientRoute: 'EmailVerificationRoute',
        getEmailContentFn: getVerificationEmailContent,
      },
      passwordReset: {
        clientRoute: 'PasswordResetRoute',
        getEmailContentFn: getPasswordResetEmailContent,
      },
      userSignupFields: getEmailUserFields,
    },
    // Guide for setting up Auth via Google: https://wasp.sh/docs/auth/social-auth/google
    // google: {
    //   userSignupFields: getGoogleUserFields,
    //   configFn: getGoogleAuthConfig,
    // },
    // Uncomment to enable GitHub Auth (check https://wasp.sh/docs/auth/social-auth/github for setup instructions):
    // gitHub: {
    //   userSignupFields: getGitHubUserFields,
    //   configFn: getGitHubAuthConfig,
    // },
    // Uncomment to enable Discord Auth (check https://wasp.sh/docs/auth/social-auth/discord for setup instructions):
    // discord: {
    //   userSignupFields: getDiscordUserFields,
    //   configFn: getDiscordAuthConfig,
    // },
  },
  onAuthFailedRedirectTo: '/login',
  onAuthSucceededRedirectTo: '/demo-app',
}

export const authParts: Part[] = [
  route('LoginRoute', '/login', page(Login)),
  route('SignupRoute', '/signup', page(Signup)),
  route('RequestPasswordResetRoute', '/request-password-reset', page(RequestPasswordResetPage)),
  route('PasswordResetRoute', '/password-reset', page(PasswordResetPage)),
  route('EmailVerificationRoute', '/email-verification', page(EmailVerificationPage)),
]
