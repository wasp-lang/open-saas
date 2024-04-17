# Open SaaS e2e Tests with Playwright

These are e2e tests that are written using [Playwright](https://playwright.dev/) for the Open SaaS project. 

They not only serve as tests for development of the Open SaaS project, but also as reference examples for how you can implement tests for the app you build with Open SaaS as a template, if you choose to do so.

## Running the tests
### Locally
Install the test dependencies:
```shell
cd e2e-tests && npm install
```

Start your Wasp DB and leave it running:
```shell
cd ../app && wasp db start
```

Open another terminal and start the Wasp app:
```shell
cd app && wasp start
```

In another terminal, run the local e2e tests:
```shell
cd e2e-tests && npm run local:e2e:start
```

This will start the tests in Playwright's UI mode, which will allow you to see the tests running in an interactive browser environment.

When the tests finish, you can kill the Stripe CLI process that was started by the tests:
```shell
npm run local:e2e:cleanup-stripe
```

## CI/CD

In `.github/workflows/e2e-tests.yml`, you can see the workflow that runs the headless e2e tests in a CI/CD pipeline via GitHub actions. 

In order for these tests to run correctly, you need to provide the environment variables mentioned in the `e2e-tests.yml` file within your GitHub repository's "Actions" secrets so that they can be accessed by the tests.

Upon pushing to the repository's main branch, or creating a PR against the main branch, the tests will run in the CI/CD pipeline.
