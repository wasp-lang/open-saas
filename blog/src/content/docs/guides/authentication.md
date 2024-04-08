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

The `email` method, with it's use of an Email Sending provider to send verification and password reset emails to the user's email address, is the default auth method in Open SaaS.

:::caution[Dummy Email Provider]
The `email` method relies on the `emailSender` within the `main.wasp` file. By default, Open SaaS ships with the `Dummy` email provider, which does not send any emails, but instead will log all email verication links/tokens to the server's console! You can follow these links to verify and continue with the sign up process.  
```tsx title="main.wasp" 
  emailSender: {
    provider: Dummy, // logs all email verification links/tokens to the server's console
    defaultFrom: {
      name: "Open SaaS App",
      email: "me@example.com" 
    },
  },
```

You **can not use the Dummy provider in production** and your app **will not build** until you move to a production-ready provider, such as SendGrid. We outline the process of migrating to SendGrid below. 
:::

We've pre-configured the `email` auth method for you in a number of different files so you can get started quickly. In order to use the `email` auth method, you'll need to switch from the `Dummy` email provider to a production-ready provider like SendGrid: 

1. First, set up the your app's `emailSender` in the `main.wasp` file by following [this guide](/guides/email-sending/#integrate-your-email-sender). 
2. Add your `SENDGRID_API_KEY` to the `.env.server` file.
3. Make sure the email address you use in the `fromField` object is the same email address that you configured your SendGrid account to send out emails with. In the end, your `main.wasp` file should look something like this: 
```ts title="main.wasp" {6,7} del={15} ins={16}
  auth: {
    methods: {
      email: {
        fromField: {
          name: "Open SaaS App",
          // When using SendGrid, you must use the same email address that you configured your account to send out emails with!
          email: "me@example.com" 
        },
        //...
      }, 
    }
  },
  //...
  emailSender: {
    provider: Dummy,
    provider: SendGrid,
    defaultFrom: {
      name: "Open SaaS App",
      // When using SendGrid, you must use the same email address that you configured your account to send out emails with!
      email: "me@example.com" 
    },
  },
  ```


And that's it. Wasp will take care of the rest and update your AuthUI components accordingly.

Check out the  [Wasp Auth docs](https://wasp-lang.dev/docs/auth/overview) for more info.

## Google & GitHub Auth

We've also customized and pre-built the Google and GitHub auth flow for you. To start using them, you just need to uncomment out the methods you want in your `main.wasp` file and obtain the proper API keys to add to your `.env.server` file. 

To create a Google OAuth app and get your Google API keys, follow the instructions in [Wasp's Google Auth docs](https://wasp-lang.dev/docs/auth/social-auth/google#3-creating-a-google-oauth-app).

To create a GitHub OAuth App add get your GitHub API keys, you can follow the instructions in [Wasp's GitHub Auth docs](https://wasp-lang.dev/docs/auth/social-auth/github#3-creating-a-github-oauth-app).

Again, Wasp will take care of the rest and update your AuthUI components accordingly.
