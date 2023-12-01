---
title: Analytics
---
This guide will show you how to integrate analytics for your app. You can choose between [Google Analytics](#google-analytics) and [Plausible](#plausible).

Google Analytics is free, but tends to be more cumbersome to use.

Plausible is an open-source, privacy-friendly alternative to Google Analytics. It's also easier to use than Google if you use their hosted service, which is a paid feature. But, it is completely free if you want to self-host it, although this comes with some additional setup steps.

## Plausible

### Hosted Plausible
Sign up for a hosted Plausible account [here](https://plausible.io/).

Once you've signed up, you'll be taken to your dashboard. Create your site by adding your domain. Your domain is also your `PLAUSIBLE_SITE_ID` in your `.env.server` file. Make sure to add it.

```sh
PLAUSIBLE_SITE_ID=<your domain without www>
```

After adding your domain, you'll be taken to a page with your Plausible script tag. Copy and paste this script tag into the `main.wasp` file's head section. 

```js {7}
app SaaSTemplate {
  wasp: {
    version: "^0.11.6"
  },
  title: "My SaaS App",
  head: [
        "<your plausible script tag here>",
  ],
  //...
```

Go back to your Plausible dashboard, click on your username in the top right, and click on the `Settings` tab. Scroll down, find your API key and paste it into your `.env.server` file under the `PLAUSIBLE_API_KEY` variable.


### Self-hosted Plausible

Plausible, being an open-source project, allows you to self-host your analytics. This is a great option if you want to keep your data private and not pay for the hosted service.

*coming soon...*
*until then, check out the [official documentation](https://plausible.io/docs)*

:::tip[Contribute!] 
If you'd like to help us write this guide, click the "Edit page" button at the bottom of this page 

As a completely free, open-source project, we appreciate any help 🙏
:::

## Google Analytics

After you sign up for [Google analytics](https://analytics.google.com/), go to your `Admin` panel in the bottom of the left sidebar and then create a "Property" for your app.

Once you've completed the steps to create a new Property, some Installation Instructions will pop up. Select `install manually` and copy and paste the Google script tag into the `main.wasp` file's head section. 

```js {7}
app SaaSTemplate {
  wasp: {
    version: "^0.11.6"
  },
  title: "My SaaS App",
  head: [
        "<your google analytics script tag here>",
  ],
  //...
```

Then, set up the Google Analytics API access by following these steps:

1. **Set up a Google Cloud project:** If you haven't already, start by setting up a project in the [Google Cloud Console](https://console.cloud.google.com/).

2. **Enable the Google Analytics API for your project:** Navigate to the "Library" in the Google Cloud Console and search for the "Google Analytics Data API" (for Google Analytics 4 properties) and enable it.

3. **Create credentials:** Now go to the "Credentials" tab within your Google Cloud project, click on `+ credentials`, and create a new service account key. First, give it a name. Then, under "Grant this service account access to project", choose `viewer`.

4. **Create Credentials:** When you go back to `Credentials` page, you should see a new service account listed under "Service Accounts". It will be a long email address to ends with `@your-project-id.iam.gserviceaccount.com`. Click on the service account name to go to the service account details page. 

    - Under “Keys” in the service account details page, click “Add Key” and choose `Create new key`.
  
    - Select "JSON", then click “Create” to download your new service account’s JSON key file. Keep this file secure and don't add it to your git repo – it grants access to your Google Analytics data.  
5. **Update your Google Anayltics Settings:** Go back to your Google Analytics dashboard, and click on the `Admin` section in the left sidebar. Under `Property Settings > Property > Property Access Management` Add the service account email address (the one that ends with `@your-project-id.iam.gserviceaccount.com`) and give it `Viewer` permissions.

6. **Encode and add the Credentials:** Add the `client_email` and the `private_key` from your JSON Key file into your `.env.server` file. But be careful! Because Google uses a special PEM private key, you need to first convert the key to base64, otherwise you will run into errors parsing the key. To do this, in a terminal window, run the command below and paste the output into your `.env.server` file under the `GOOGLE_ANALYTICS_PRIVATE_KEY` variable:
    ```sh 
    echo -n "PRIVATE_KEY" | base64
    ```
    
7. **Add your Google Analytics Property ID:** You will find the Property ID in your Google Analytics dashboard in the `Admin > Property > Property Settings > Property Details` section of your Google Analytics property (**not** your Google Cloud console). Add this 9-digit number to your `.env.server` file under the `GOOGLE_ANALYTICS_PROPERTY_ID` variable.

