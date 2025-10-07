# Template Testing

Tests the production version of the Open SaaS template that users get from `wasp new app -t saas`.

**Why this exists:** As a part of our release checklist, we want to test that the production version of the Open SaaS template works.

**How it works:** We create a new Wasp app from the production Open SaaS template, and then modify the app to be production-ready (e.g. replace `Dummy` email service with `SMTP`, add Dotenv Vault with real credentials, etc.). 

## Testing a new Wasp release

When testing a new Wasp release:

```bash
cd template-test
# Create a new Wasp app and apply our patches to it.
./tools/patch.sh

cd app

# Get the environment variables from Dotenv Vault.
npm run env:pull

wasp db start
wasp db migrate-dev
wasp start
```

### Workflow

- Generate `app/` from template and diffs: `./tools/patch.sh`
- Update diffs after modifying `app/`: `./tools/diff.sh`

For detailed information about the diff/patch workflow and MacOS setup requirements, see [../tools/README.md](../tools/README.md).
