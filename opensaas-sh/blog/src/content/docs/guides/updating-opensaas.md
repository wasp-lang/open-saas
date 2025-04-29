---
title: How (Not) to Update Your Open SaaS App
banner:
  content: |
    Have an Open SaaS app in production? <a href="https://e44cy1h4s0q.typeform.com/to/EPJCwsMi">We'll send you some swag! 👕</a>
---

:::danger[We advise against merging the latest template changes into your app]
If you've already started building your app, we generally advise against merging the latest template changes into your app.

Below we outline our reasoning why, and provide a basic guide to help you update your app if you decide to do so anyway.
:::


## Why you probably shouldn't include the latest template changes in your app

We generally **advise against updating your Open SaaS-based applications** after initial setup. 

Why? 

Because your codebase will naturally diverge from the template as you build your unique application, and any updates we may make to the template may not be compatible with your modified codebase, or your version of Wasp.

Even if you *really* want to include a new feature from the template in your app, proceed with caution and througly consider the following:

- Changes to the template may be tightly coupled. Implementing one change without related ones could cause unexpected issues.
- Updates might not be compatible with your version of Wasp.
- The more your codebase has diverged, the more challenging the update will be.
- We use a tagging system to keep template and Wasp versions in sync. This can make it difficult for you to pin down the exact commit hash of the template you started with.

## If you still decide to update your app

If you read above, considered the risks, and still need specific improvements, we recommend that you either:
1. Recommended: [Manually merge the changes](#manually-merging-changes).
2. Riskier/Advanced: [Cherry-pick the commits](#cherry-picking-git-commits) that you want to merge and deal with any merge conflicts on a case-by-case basis. 

:::caution[Difficulties finding the correct commit hash] 
Open SaaS uses a tagging system in order to give you a version of the template that works for the version of Wasp you're using.

For example, if you're using Wasp `v0.16.x`, it will pull the template at the commit hash with the tag `wasp-v0.16-template`.

If we make important changes to the template we may update the tag to a newer commit, so that new users will get the latest changes. That means that a tag, e.g. `wasp-v0.16-template`, may point to different commits over time, as changes are made to the template.

This may make it difficult to find the correct commit hash that matches the template code you started with.
:::
## Manually merging changes
Compare your starting revision with the latest. You can find the commit hash of your starting revision in the [Open Saas GitHub repo's `main` branch](https://github.com/wasp-lang/open-saas/commits/main/).

Once you've copied the commit hash, you can use it to compare with the latest commit hash:

```bash
https://github.com/wasp-lang/open-saas/compare/<your-starting-commit-hash>..<latest-commit-hash>
```
For example, if your starting commit hash is `4c106fd` and the latest commit hash is `576d47a`, you can use the following URL:
[https://github.com/wasp-lang/open-saas/compare/4c106fd..576d47a](https://github.com/wasp-lang/open-saas/compare/4c106fd..576d47a)

This will show you the changes between your starting revision and the latest.

Manually apply any changes you want into your local project.


## Cherry-picking git commits

Add the Open SaaS repo as a remote:

```bash
git remote add upstream https://github.com/wasp-lang/open-saas/
```

Fetch the history:

```bash
git fetch upstream
```

Cherry-pick any or all commits since the release you started from. e.g. if you're currently using the [0.16 template](https://github.com/wasp-lang/open-saas/releases/tag/wasp-v0.16-template):

```bash
git cherry-pick 4c106fd^..upstream/main
```

This will replay every subsequent commit excluding the specified starting point (remove the `^` to be inclusive). If your codebase has diverged significantly, you may have to resolve any merge commits, but once complete, you'll have all the latest changes in your local repo.
