Thanks so much for considering contributing to Open SaaS 🙏

## Considerations before Contributing
Check if there is a GitHub issue already for the thing you would like to work on. If there is no issue yet, create a new one.

Let us know, in the issue, that you would like to work on it and how you plan to approach it.
This helps, especially with the more complex issues, as it allows us to discuss the solution upfront and make sure it is well planned and fits with the rest of the project.

## How to Contribute
1. Make sure you understand the basics of how open-saas works (check out [docs](https://docs.opensaas.sh)).
2. Check out this repo (`main` branch) and make sure you are able to get the app in `app/` running (to set it up, follow the same steps as for running a new open-saas app, as explained in the open-saas docs).
3. Create a new git branch for your work (aka feature branch) and do your changes on it.
4. Update e2e tests in [e2e-tests](/e2e-tests/) if needed and make sure they are passing.
5. Create a pull request (towards `main` as a base branch).
6. If docs (also) need updating, check out the `deployed-version` branch, make your own feature branch from it, make changes in [blog/src/content/docs](/blog/src/content/docs/), and submit another PR with those changes (towards `deployed-version` as a base branch).
7. Make a "Da Boi" meme while you wait for us to review your PR(s).
8. If you don't know who "Da Boi" is, head back to the [Wasp Discord](https://discord.gg/aCamt5wCpS) and find out :)

## Additional Info

### Template Versioning 

Whenever a user starts a new Wasp project with `wasp new -t <template_name>`, Wasp looks for a specific tag on the template repo, and pulls the project at the commit associated with that tag.

In the case of Open SaaS, which is a Wasp template, the tag is `wasp-v{{version}}-template`, where `{{version}}` is the current version of Wasp, e.g. `wasp-v0.13-template`.

For simplicity, in Open SaaS, we automatically re-apply the tag to the most recent commit on the `main` branch via the `.github/workflows/retag-commit.yml` workflow. This way, users always get the latest version of the template (as on `main` branch) when they start a new project via `wasp new -t saas`.

**This means, that whenever a user pulls the template via `wasp new -t saas`, they are getting the version present in the most recent commit on `main`.**

NOTE: When Wasp releases a new major version, we should also make sure to update Open SaaS to work with this new version. In PR that will bring this update, we should also make sure to update the `TAG_NAME` in the GitHub Workflow that does the tagging, to be the template tag used by the newest version of Wasp.

### The Default Template vs. the Deployed Site / Docs

There are two main branches for development:
- `main`
- `deployed-version`

The default, clean template that users get when cloning the starter lives on `main`, while `deployed-version` is somewhat modified version of that same template which you see when you go to [OpenSaaS.sh](https://opensaas.sh) and the [docs](https://docs.opensaas.sh).

If you want to make changes to the default starter template, base feature branches and Pull Requests off of `main`.
If you want to make changes to the OpenSaaS.sh site or it's Documentation, base feature branches and Pull Requests off of `deployed-version`.

