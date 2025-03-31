---
title: Updating your Open SaaS Template
banner:
  content: |
    Have an Open SaaS app in production? <a href="https://e44cy1h4s0q.typeform.com/to/EPJCwsMi">We'll send you some swag! 👕</a>
---

This guide will help you merge the latest changes from the Open SaaS template into your app.

## Initial Considerations

It's not recommended that you merge the latest changes from the template into your app as you would in a typical monorepo setup.

Instead, we recommend that you [cherry-pick the commits](#cherry-picking-git-commits) that you want to merge and deal with any merge conflicts on a case-by-case basis. Or if your app has diverged significantly, you should [manually merge the changes](#manually-merging-changes).

:::caution 
Open SaaS uses a tagging system in order to give you a version of the template that works for the version of Wasp you're using.

For example, if you're using Wasp `v0.16.x`, it will pull the template at the commit hash with the tag `wasp-v0.16-template`.

If we make important changes to the template we may update the tag to a newer commit, so that new users will get the latest changes. That means that a tag, e.g. `wasp-v0.16-template`, may point to different commits over time, as changes are made to the template.

When updating your app, make sure you check the commit history on the `main` branch of the Open SaaS repo to find the correct commit hash that matches the code you started with.
:::

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