---
title: Authentication
banner:
  content: |
    ⚠️ Open SaaS is now running on <a href='https://wasp-lang.dev'>Wasp v0.13</a>! If you're running an older version of Open SaaS, please follow the 
    <a href="https://wasp-lang.dev/docs/migrate-from-0-12-to-0-13">migration instructions here</a> ⚠️ 
---

Setting up your app's authentication is easy with Wasp. In fact, it's aready set up for your in the `main.wasp` file: 

```tsx title="main.wasp" " 
  auth: {
    userEntity: User,
    methods: {
      email: {}, 
      google: {},
      gitHub: {}
    },
    onAuthFailedRedirectTo: "/",
  },
```

The great part is, by defining your auth config in the `main.wasp` file, Wasp manages most of the Auth process for you, including the auth-related databse entities for user credentials and sessions, as well as auto-generated client components for your app on the fly (aka AuthUI -- you can see them in the `src/client/auth` folder).

## Email Verified Auth

The `email` method, with it's use of an Email Sending provider to send a verification email to the user's email address, is the default auth method in Open SaaS.

⚠️ **Note that the `email` method ships with the "Dummy" provider, which should only be used for local development. To obtain a user's email confirmation token on initial sign-up, check your server logs! We suggest you set up SendGrid as the email provider once you're ready** 

We've pre-configured the `email` auth method for you in a number of different files but commented out the code in case you'd like to quickly implement it in your app. To do so, you'll first need to fill in your Email Sending provider's API keys. We chose [SendGrid](https://sendgrid.com) as the provider, but Wasp can also handle [MailGun](https://mailgun.com), or SMTP. 

After you've signed up for a Sendgrid account and [set up your app's `emailSender`](/guides/email-sending/#integrate-your-email-sender), perform the following steps:

1. Add your `SENDGRID_API_KEY` to the `.env.server` file
2. Remove `usernameAndPassword` and uncomment the `email` properties from the `auth.methods` object in `main.wasp`:
    ```ts title="main.wasp" del={4} ins={5-11}
    auth: {
      //...
      methods: {
        usernameAndPassword: {}, 
        email: {
          fromField: {
            name: "Open SaaS App",
            // When using SendGrid, you must use the same email address that you configured your account to send out emails with!
            email: "me@example.com" 
          },
          //...
        }, 

    ```
3. Make sure the email address you use in the `fromField` object is the same one you registered your SendGrid account with, which should also match the info in the [`emailSender` property](/guides/email-sending/#integrate-your-email-sender) of your `main.wasp` file. 
4. Uncomment `RequestPasswordResetRoute`, `ResetPasswordRoute`, `EmailVerificationRoute` in the `main.wasp` file
   ```ts title="main.wasp"
      route RequestPasswordResetRoute { path: "/request-password-reset", to: RequestPasswordResetPage }
      page RequestPasswordResetPage {
        component: import { RequestPasswordReset } from "@src/client/auth/RequestPasswordReset",
      }

      route PasswordResetRoute { path: "/password-reset", to: PasswordResetPage }
      page PasswordResetPage {
        component: import { PasswordReset } from "@src/client/auth/PasswordReset",
      }

      route EmailVerificationRoute { path: "/email-verification", to: EmailVerificationPage }
      page EmailVerificationPage {
        component: import { EmailVerification } from "@src/client/auth/EmailVerification",
      }
   ```
5. Uncomment out the above routes's respective code in the `/src/client/auth` folder:
    - `EmailVerification.tsx`
    - `PasswordReset.tsx` 
    - `RequestPasswordReset.tsx`
6. Uncomment out the code in `app/src/server/auth/email.ts` as well.

And that's it. Wasp will take care of the rest and update your AuthUI components accordingly.

Check out the  [Wasp Auth docs](https://wasp-lang.dev/docs/auth/overview) for more info.

## Google Auth

We've also customized and pre-built the Google auth flow for you. To start using it you just need to uncomment out the `google` method in `main.wasp` file and fill in your API keys in the `.env.server` file. 

To get your Google API keys, follow the instructions in Wasp's [Google Auth docs](https://wasp-lang.dev/docs/auth/social-auth/google#3-creating-a-google-oauth-app).

Again, Wasp will take care of the rest and update your AuthUI components accordingly.

## GitHub Auth

To easily add GitHub as a login option, you can follow the instructions in Wasp's [GitHub Auth docs](https://wasp-lang.dev/docs/auth/social-auth/github#3-creating-a-github-oauth-app).
