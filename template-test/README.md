# Template Testing

Tests the production version of the Open SaaS template that users get from `wasp new -t saas`.

**Why this exists:** opensaas-sh tests `template/app` (current repo state), but `main` branch may differ from the last released template. This tests what users actually get from `wasp new -t saas`.

**How it works:** Scripts run `wasp new -t saas` to get a fresh template, then apply minimal production patches (Dummy→SendGrid email, dotenv-vault for secrets). Tests that the template builds and runs with production email provider.

## Regular Usage

When testing a new Wasp release:

```bash
cd template-test
./tools/patch.sh
cd app && npm run env:pull
wasp start  # or wasp build
```

## Initial Setup

Only needed once to create the initial patches:

```bash
cd template-test
wasp new -t saas temp && cp -r temp/app/* app/ && rm -rf temp
cd app && git init && git add .

# Edit main.wasp: change Dummy→SendGrid
# Setup dotenv-vault with working credentials

cd .. && ./tools/diff.sh
git add app_diff/ && git commit -m "Add template-test patches"
```

## Requirements

MacOS users need: `brew install coreutils gpatch diffutils`
