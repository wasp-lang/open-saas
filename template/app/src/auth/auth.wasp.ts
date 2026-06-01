import { page, route, type Auth, type EmailAuthConfig, type SocialAuthConfig, type Part } from '@wasp.sh/spec'

import { getVerificationEmailContent, getPasswordResetEmailContent } from './email-and-pass/emails' with { type: 'ref' }
import {
  getEmailUserFields,
  getGoogleUserFields,
  getGoogleAuthConfig,
  getGitHubUserFields,
  getGitHubAuthConfig,
  getDiscordUserFields,
  getDiscordAuthConfig,
} from './userSignupFields' with { type: 'ref' }

import { Login } from './LoginPage' with { type: 'ref' }
import { Signup } from './SignupPage' with { type: 'ref' }
import { RequestPasswordResetPage } from './email-and-pass/RequestPasswordResetPage' with { type: 'ref' }
import { PasswordResetPage } from './email-and-pass/PasswordResetPage' with { type: 'ref' }
import { EmailVerificationPage } from './email-and-pass/EmailVerificationPage' with { type: 'ref' }

const email: EmailAuthConfig = {
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
}

const google: SocialAuthConfig = {
  userSignupFields: getGoogleUserFields,
  configFn: getGoogleAuthConfig,
}
const gitHub: SocialAuthConfig = {
  userSignupFields: getGitHubUserFields,
  configFn: getGitHubAuthConfig,
}
const discord: SocialAuthConfig = {
  userSignupFields: getDiscordUserFields,
  configFn: getDiscordAuthConfig,
}

// 🔐 Auth out of the box! https://wasp.sh/docs/auth/overview
export const authConfig: Auth = {
  userEntity: 'User',
  methods: {
    email,
    // google,
    // gitHub,
    // discord
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
