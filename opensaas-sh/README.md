# OpenSaas.sh

This is the https://opensaas.sh page and demo app, built with the Open Saas template!

It consists of a Wasp app for showcasing the Open Saas template (+ landing page), while the Astro blog is blog and docs for the Open Saas template, found at https://docs.opensaas.sh.

Inception :)!

## Development

### Demo app (app_diff/)

Since the demo app is just the open saas template with some small tweaks, and we want to be able to easily keep it up to date as the template changes, we don't version (in git) the actual demo app code, instead we version the diffs between it and the template: `app_diff/`.

So because we don't version the actual demo app (`app/`) but its diffs instead (`app_diff`), the typical workflow is as follows:

1. Run `./tools/patch.sh` to generate `app/` from `../template/` and `app_diff/`.
2. If there are any conflicts (normally due to updates to the template), modify `app/` till you resolve them. Do any additional changes also if you wish.
3. Generate new `app_diff/`, based on the current updated `app/`, by running `./tools/diff.sh`.

**Running on MacOS**

If you're running the `patch.sh` or `diff.sh` scripts on Mac, you need to install:

- `grealpath` (packaged within `coreutils`),
- `gpatch`,
- and `diffutils`.

```sh
brew install coreutils # contains grealpath
brew install gpatch
brew install diffutils
```

Make sure not to commit `app/` to git. It is currently (until we resolve this) not added to .gitignore because that messes up diffing for us.

### Blog (blog/)

Blog (and docs in it) is currently tracked in whole, as it has quite some content, so updating it to the latest version of Open Saas is done manually, but it might be interesting to also move it to the `diff` approach, as we use for the demo app, if it turns out to be a good match.

For more info on authoring content for the docs and blog, including information on custom components, see the [blog/README.md](blog/README.md).

## Deployment

App: check its README.md (after you generate it with `.tools/patch.sh`) .

Blog (docs): hosted on Netlify.
