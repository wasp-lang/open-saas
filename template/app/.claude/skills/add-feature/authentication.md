# Authentication Setup

Add and configure authentication methods for your Wasp app.

## Prerequisites

- Fetch the list of available authentication methods from the [Wasp docs](https://wasp.sh/llms.txt)

## Steps

1. Read the wasp config file auth methods section to see which providers are already configured, if any.

2. **Display the full list** of available auth methods to the user.

3. Using the `AskUserQuestion` tool, ask the user which (additional) auth methods they'd like to add:
   - Use the most popular/common options (e.g., Email, Google, GitHub) as the selectable choices (limited to 2-4 options)
   - Remind users they can select "Other" to specify any option from the full list
   - If no auth methods are selected, skip to completion

4. For each auth method selected:
   - Fetch the raw GitHub doc URL for that auth method from the [Wasp docs](https://wasp.sh/llms.txt)
   - Add the provider to the wasp config file's auth methods section according to the docs
   - If applicable, inform user they'll need to set env vars

5. Check if the app has defined authentication pages (e.g. login, signup, forgot password):
   - If yes, check if those pages are using Wasp's managed AUTH UI components (e.g. `import { LoginForm } from "wasp/client/auth";`)
     - If using managed UI, skip to completion
     - If not, continue to next step

6. If the app does not have authentication pages, ask the user if they'd like to set up:
   - Authentication pages with Wasp's managed AUTH UI components that adapt to their selected auth methods
     - If yes, follow the selected auth methods' guides in the Wasp docs
     - If no, inform the user they can follow the "Create your own UI" guides later
