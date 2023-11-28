---
title: Authentication
---

Setting up your app's authentication is easy with Wasp. In fact, it's aready set up for your in the `main.wasp` file: 

```tsx title="main.wasp" ins="email: {}" ins="google: {}" ins="gitHub: {}" 
  auth: {
    userEntity: User,
    externalAuthEntity: SocialLogin,
    methods: {
      email: {},
      google: {},
      gitHub: {},
    },
    onAuthFailedRedirectTo: "/",
  },
```

The great part is, by defining your auth config in the `main.wasp` file, not only does Wasp handle Auth for you, but you also get auto-generated client components for your app on the fly (aka AuthUI)! You can see them in the `src/client/auth` folder.

To learn more about using and customizing full-stack Auth with Wasp, including AuthUI, check out the [Wasp Auth docs](https://wasp-lang.dev/docs/auth/overview). 

Since this template has Auth set up for you, you just need to fill in your API keys for your social Auth providers and your Email sender. Follow the integration guides here to do so:
- [Google Auth](https://wasp-lang.dev/docs/auth/social-auth/google#3-creating-a-google-oauth-app)
- [GitHub Auth](https://wasp-lang.dev/docs/auth/social-auth/github#3-creating-a-github-oauth-app)
- [Email verified Auth](https://wasp-lang.dev/docs/auth/email)