# Styling (CSS, UI) Setup

Configure a CSS framework and/or component libraries for your Wasp app.

## Prerequisites

- Fetch the list of available CSS frameworks and styling options from the [Wasp docs](https://wasp.sh/llms.txt)
- Fetch the guide for using [ShadCN components with Wasp](https://gist.githubusercontent.com/infomiho/b35e9366e16913949e13eaba0538f553/raw/c6da98158c1a7e46b5874868f2e7c011f24d24d1/0-README.md)

## Steps

1. **Display the available options** to the user (e.g., Pure Tailwind CSS, ShadCN UI (on top of Tailwind CSS), etc.)

2. Using the `AskUserQuestion` tool, ask the user which CSS framework they'd like to use:

3. For the selected CSS framework:
   - Fetch the raw GitHub doc URL for that framework's setup guide from the [Wasp docs](https://wasp.sh/llms.txt)
   - Follow the installation steps in the guide
   - Install any required dependencies
   - Create/update configuration files as needed (e.g., `tailwind.config.js`, `postcss.config.js`)
   - Update the Wasp config if required

4. If setting up ShadCN UI (on top of Tailwind CSS):
   - Make sure to set up Tailwind CSS first
