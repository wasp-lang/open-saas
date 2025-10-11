# OpenSaas.sh

This is the https://opensaas.sh page and demo app, built with the Open Saas template!

It consists of a Wasp app for showcasing the Open Saas template (+ landing page), while the Astro blog is blog and docs for the Open Saas template, found at https://docs.opensaas.sh.

Inception :)!

## Development

### Demo app (app_diff/)

Since the demo app is just the open saas template with some small tweaks, and we want to be able to easily keep it up to date as the template changes, we don't version (in git) the actual demo app code, instead we version the diffs between it and the template: `app_diff/`.

**Quick Reference:**

- Generate `app/` from template and diffs: `./tools/patch.sh`
- Update diffs after modifying `app/`: `./tools/diff.sh`

For detailed information about the diff/patch workflow and macOS setup requirements, see [../tools/README.md](../tools/README.md).

### Blog (blog/)

Blog (and docs in it) is currently tracked in whole, as it has quite some content, so updating it to the latest version of Open Saas is done manually, but it might be interesting to also move it to the `diff` approach, as we use for the demo app, if it turns out to be a good match.

For more info on authoring content for the docs and blog, including information on custom components, see the [blog/README.md](blog/README.md).

## Deployment

App: check its README.md (after you generate it with `.tools/patch.sh`) .

Blog (docs): hosted on Netlify.
