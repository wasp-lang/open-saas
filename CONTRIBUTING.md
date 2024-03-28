Thanks so much for considering contributing to Open SaaS 🙏

## Considerations before Contributing

### General Considerations
1. If there's something you'd like to add, and the issue doesn't already exist, create a new one and assign yourself to it. Wait until we've agreed on a plan of action before beginning your work.
2. If the issue does already exist, and noone is assigned to it, assign yourself and feel free to begin working on it.

### How Users Get the Starter Template

We currently have two ways to pull the template:
1. the `use this template` button on the [repo homepage](https://github.com/wasp-lang/open-saas)
2. the [Wasp CLI's](https://wasp-lang.dev/docs/quick-start) `wasp new` command

When pulling the template via `wasp new`, the Wasp CLI looks for a tag `wasp-{CURRENT_VERSION}-template` associated with a specific commit on the Open SaaS repo.

In order to keep this tag up to date, we've created a github action, `.github/workflows/retag-commit.yml`, that automatically reassigns the tag (defined as `TAG_NAME` in the action) to the most recent commit on `main`.

**This means, that whenever a user pulls the template, they are getting the version present in the most recent commit on `main`**

Also, If we update Wasp to a new major version, we should also update the `TAG_NAME` in the action.

### The Default Template vs. the Deployed Site / Docs

There are two main branches for development:
- `main`
- `deployed-version`

The default, clean template that users get when cloning the starter lives on `main`, while `deployed-version` is what you see when you go to [OpenSaaS.sh](https://opensaas.sh) and the [docs](https://docs.opensaas.sh) 

If you want to make changes to the default starter template, base feature branches and Pull Requests off of `main`
If you want to make changes to the OpenSaaS.sh site or it's Documentation, base feature branches and Pull Requests off of `deployed-version`

## How to contribute
Contributing is simple:
1. Make sure you've installed and run the app.
2. Find something you'd like to work on. Check out the [issues](https://github.com/wasp-lang/open-saas/issues) or contact us on the [Wasp Discord](https://discord.gg/aCamt5wCpS) to discuss.
3. Create a new feature branch for your work. See [above](#the-default-template-vs-the-deployed-site--docs) for which branch to base your feature branch off of.
4. Create a pull request.
5. Make a "Da Boi" meme while you wait for us to review your PR.
6. If you don't know who "Da Boi" is, head back to the [Wasp Discord](https://discord.gg/aCamt5wCpS) and find out :)