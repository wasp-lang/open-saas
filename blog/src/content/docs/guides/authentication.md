---
title: Authentication
---

Setting up your app's authentication is easy with Wasp. In fact, it's aready set up for your in the `main.wasp` file: 

```tsx title="main.wasp" ins="usernameAndPassword: {}" ins="email: {}" ins="google: {}" ins="gitHub: {}" 
  auth: {
    userEntity: User,
    externalAuthEntity: SocialLogin,
    methods: {
      usernameAndPassword: {},
      email: {},
      google: {},
      gitHub: {},
    },
    onAuthFailedRedirectTo: "/",
  },
```

The great part is, by defining your auth config in the `main.wasp` file, not only does Wasp handle Auth for you, but you also get auto-generated client components for your app on the fly (aka AuthUI)! You can see them in the `src/client/auth` folder.

## Migrating to a different Auth method

If you want to use a different method or combinations of Auth methods, you can easily do so by changing the `auth.methods` object in the `main.wasp` file.

We've set up the template to get you started with Wasp's simplest auth method, `usernameAndPassword`, but we suggest you only use it to get your app developlment going and opt for `email`, `google`, `gitHub`, or a combination of these in production.

### Email Verified Auth

The `email` method, with it's use of an Email Sending provider to verify a user's email, is preferrable to `usernameAndPassword` because it's more secure and allows for password reset options. Note, you cannot use both `email` and `usernameAndPassword` methods at the same time.

We've pre-configured the `email` auth method for you in a number of different files but commented out the code in case you'd like to quickly implement it in your app. To do so, you'll first need to fill in your Email Sending provider's API keys. We chose [SendGrid](https://sendgrid.com) as the provider, but Wasp can also handle [MailGun](https://mailgun.com), or SMTP. 

After you've signed up for a Sendgrid account, perform the following steps:

1. Add your `SENDGRID_API_KEY` to the `.env.server` file
2. Uncomment  
  `RequestPasswordResetRoute`,  
  `ResetPasswordRoute`,  
  `EmailVerificationRoute`  
   in the `main.wasp` file
3. Make sure to also uncomment out these routes respective code in the `/src/client/auth` folder, as well as in the `app/src/server/auth/email.ts` file.

And that's it. Wasp will take care of the rest and update your AuthUI components accordingly.

Check out the  [Wasp Auth docs](https://wasp-lang.dev/docs/auth/overview) for more info.

## Google Auth

We've also customized and pre-built the Google auth flow for you. To start using it you just need to uncomment out the `google` method in `main.wasp` file and fill in your API keys in the `.env.server` file. 

To get your Google API keys, follow the instructions in Wasp's [Google Auth docs](https://wasp-lang.dev/docs/auth/social-auth/google#3-creating-a-google-oauth-app).

Again, Wasp will take care of the rest and update your AuthUI components accordingly.

## GitHub Auth

To easily add GitHub as a login option, you can follow the instructions in Wasp's [GitHub Auth docs](https://wasp-lang.dev/docs/auth/social-auth/github#3-creating-a-github-oauth-app).
