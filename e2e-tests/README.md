# Open SaaS e2e Tests with Playwright

These are e2e tests that are written using [Playwright](https://playwright.dev/) for the Open SaaS project. 

They not only serve as tests for development of the Open SaaS project, but also as reference examples for how you can implement tests for the app you build with Open SaaS as a template, if you choose to do so.

## Running the tests
### Locally
First, make sure you've [integrated Stripe into your app](https://docs.opensaas.sh/guides/stripe-integration/). This includes  [installing the Stripe CLI and logging into it](https://docs.opensaas.sh/guides/stripe-testing/) with your Stripe account.

Next, Install the test dependencies:
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

This will start the tests in Playwright's UI mode, which will allow you to see and run the tests in an interactive browser environment. You should also see the Stripe events being triggered in the terminal where the tests were started.

To exit the local e2e tests, go back to the terminal were you started your tests and press `ctrl + c`.

## CI/CD

In `.github/workflows/e2e-tests.yml`, you can see the workflow that runs the headless e2e tests in a CI/CD pipeline via GitHub actions. 

In order for these tests to run correctly, you need to provide the environment variables mentioned in the `e2e-tests.yml` file within your GitHub repository's "Actions" secrets so that they can be accessed by the tests.

Upon pushing to the repository's main branch, or creating a PR against the main branch, the tests will run in the CI/CD pipeline.
