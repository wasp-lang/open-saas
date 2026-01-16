# Email Provider Setup

Configure an email sending provider for your Wasp app.

## Prerequisites

- Fetch the list of available email providers from the [Wasp docs](https://wasp.sh/llms.txt)

## Steps

1. **Display the full list** of available email providers to the user.

2. Using the `AskUserQuestion` tool, ask the user which email sending provider they'd like to use:
   - Use the most popular/common options as the selectable choices (limited to 2-4 options)
   - Remind users they can select "Other" to specify any option from the full list

3. For the selected provider:
   - Fetch the raw GitHub doc URL for that provider from the [Wasp docs](https://wasp.sh/llms.txt)
   - Add the provider to the wasp config file's `emailSender` section according to the docs

## Environment Variables

1. Generate a checklist of required env vars for the selected provider
2. Give user instructions for retrieving and adding env vars to `.env.server`
3. Follow steps/run commands in the guide to complete the integration where applicable

## Completion

After configuring the email provider, inform the user of the changes made and ask if they'd like to configure another feature.
