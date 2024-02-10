---
title: Getting Started
---

This guide will help you get your new SaaS app up and running.

## Setting up

### Install Wasp

Install Wasp by running this command in your terminal:
```sh
curl -sSL https://get.wasp-lang.dev/installer.sh | sh
```

:::tip
Make sure to install the Wasp VSCode extension to get the best DX, e.g. syntax highlighting, code scaffolding, autocomplete, etc:

🐝 [Wasp VSCode Extension](https://marketplace.visualstudio.com/items?itemName=wasp-lang.wasp) 🧑‍💻
:::

### Clone the OpenSaaS repo

Clone this repo by running this command in your terminal:
```sh
git clone https://github.com/wasp-lang/open-saas.git
```

Then position yourself in the root of the project:
```sh
cd open-saas
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
This will start and connect your app to a Postgres database for you. No need to do anything else! 🤯 

Now let's initalize the database with the following command:
```sh
wasp db migrate-dev
```
You will also need to run `wasp db migrate-dev` whenever you make changes to your Prisma schema (entities).

If you want to see or manage your DB via Prisma's DB Studio GUI, run:
```sh
wasp db studio
```

### Start your app
In the `app/` directory, rename the `.env.server.example` file to `.env.server`. You don't have to fill in your API keys right away, but leave the placeholder strings for the time being as this will allow you to run the app.

In a new terminal window/tab, first make sure you're in the `app/` directory:
```sh
cd app
```

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

## What's next?

Awesome! We have our new app ready and we know how to run both it and the blog/docs! Now, in the next section, we'll give you a quick "guided tour" of the different parts of the app we created and understand how it works.

:::tip[Star our Repo on GitHub! 🌟]
We've packed in a ton of features and love into this SaaS starter.

If you're finding this template and its guides useful, consider giving us [a star on GitHub](https://github.com/wasp-lang/wasp)
:::
