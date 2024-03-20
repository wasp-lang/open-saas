---
title: Getting Started
banner:
  content: |
    ⚠️ Open SaaS is now running on <a href='https://wasp-lang.dev'>Wasp v0.13</a>! If you're running an older version of Open SaaS, please follow the 
    <a href="https://wasp-lang.dev/docs/migrate-from-0-12-to-0-13">migration instructions here</a> ⚠️ 
---

This guide will help you get your new SaaS app up and running.

## Setting up

### Install Wasp

#### MacOS and Linux

Install Wasp by running this command in your terminal:

```sh
curl -sSL https://get.wasp-lang.dev/installer.sh | sh
```

#### Windows

In order to use Wasp on Windows, you need to install WSL2 (Windows Subsystem for Linux) and a Linux distribution of your choice. We recommend using Ubuntu. 

**You can refer to this [article](https://wasp-lang.dev/blog/2023/11/21/guide-windows-development-wasp-wsl) for a step by step guide to using Wasp in the WSL environment.** If you need further help, reach out to us on [Discord](https://discord.gg/rzdnErX).

Once in WSL2, run the following command in your **WSL2 environment**:

```sh
curl -sSL https://get.wasp-lang.dev/installer.sh | sh
```

:::caution
  If you are using WSL2, make sure that your Wasp project is not on the Windows file system, **but instead on the Linux file system**. Otherwise, Wasp won't be able to detect file changes, due to this [issue in WSL2](https://github.com/microsoft/WSL/issues/4739).
:::

<br/>

---

:::tip[VSCode Extension ]
Make sure to install the Wasp VSCode extension to get the best DX, e.g. syntax highlighting, code scaffolding, autocomplete, etc:

🐝 [Wasp VSCode Extension](https://marketplace.visualstudio.com/items?itemName=wasp-lang.wasp) 🧑‍💻
:::

### Cloning the OpenSaaS template

From the [Open SaaS repo on GitHub](https://github.com/wasp-lang/open-saas), click on "Use this template" > "Create a new repository".
![use template](/getting-started/open-saas-template.png)

Then, give your new repo a name and click "Create repository".
![create repo](/getting-started/create-repo.png)

Once you've created your new repo, you can clone it to your local machine by copying the repo URL found here: 
![clone repo](/getting-started/clone-repo.png)

And then running the following command in your terminal:

```sh
git clone <your-repo-url>
```

Finally, you can navigate to the root of your new project:

```sh
cd <your-repo-name>
```

### Start your DB

Before you start your app, you need to have a Postgres Database connected and running. With Wasp, that's super easy!

First, make sure you have Docker installed and running. If not, download and install it [here](https://www.docker.com/products/docker-desktop/)

With Docker running, open a new terminal window/tab and position yourself in the `app` directory:

```sh
cd app
```

Then run:

```sh
wasp start db
```

This will start and connect your app to a Postgres database for you. No need to do anything else! 🤯 Just make sure to leave this terminal window open in the background while developing. Once you terminate the process, your DB will no longer be available to your app.

Now let's initalize the database. Open a new terminal tab/window and run the following command:

```sh
wasp db migrate-dev
```

You will also need to run `wasp db migrate-dev` whenever you make changes to your Prisma schema (entities).

If you want to see or manage your DB via Prisma's DB Studio GUI, open yet another separate terminal tab/window and run:

```sh
wasp db studio
```

### Start your app

In a new terminal window/tab, first make sure you're in the `app/` directory:

```sh
cd app
```

Copy the `.env.server.example` file to `.env.server`. 

```sh
cp .env.server.example .env.server
```

You don't have to fill in your API keys right away, but leave the placeholder strings for the time being as this will allow you to run the app.

Then run:

```sh
wasp start
```

This will install all dependencies and start the client and server for you :)

Go to `localhost:3000` in your browser to view it (your NodeJS server will be running on port `3001`)

#### Run Blog and Docs

This SaaS app comes with a docs and blog section built with the [Starlight template on top of the Astro](https://starlight.astro.build) framework. You can use this as a starting point for your own blog and documentation, if necessary.

If you do not need this, you can simply delete the `blog` folder from the root of the project.

If you want to run the Starlight docs and blog, first navigate to the `blog` folder:

```sh
cd blog
```

Then run:

```sh
npm install
```

Then start the development server:

```sh
npm run dev
```

### Getting Updates to the Open SaaS Template

We will be updating the Open SaaS template with new features and improvements. To get these updates, you can pull the changes from the original template into your own repository.

First, you need to add the original template as a remote `upstream` repository:
```sh
git remote add upstream https://github.com/wasp-lang/open-saas.git
```

Then, you can fetch the changes from the original template:
```sh
git fetch upstream
```

And finally, merge the changes into your local repository:
```sh
git merge upstream/main
```

## What's next?

Awesome! We have our new app ready and we know how to run both it and the blog/docs! Now, in the next section, we'll give you a quick "guided tour" of the different parts of the app we created and understand how it works.

:::tip[Star our Repo on GitHub! 🌟]
We've packed in a ton of features and love into this SaaS starter, and offer it all to you for free!

If you're finding this template and its guides useful, consider giving us [a star on GitHub](https://github.com/wasp-lang/wasp)
:::
