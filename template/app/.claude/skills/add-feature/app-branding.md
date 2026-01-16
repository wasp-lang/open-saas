# App Branding Setup

Configure your Wasp app's name and description.

## Steps

1. Ask the user:
   - What is your app name?
   - What is a one-line description?

2. Update the wasp config file `app` block according to the [Wasp docs](https://wasp.sh/llms.txt)
3. Add name, description, og, and other critical meta tags to the `app.head` section of the wasp config file.

**Important:** Only add placeholder URLs in the `app.head` meta tags with a TODO comment for the user to replace with the actual URLs once they have a production domain and are ready to deploy.
