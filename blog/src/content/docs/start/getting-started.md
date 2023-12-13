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

With Docker running, open a new terminal window/tab and from within the root of the project, run:
```sh
wasp start db 
```
This will start and connect your app to a Postgres database for you. No need to do anything else! 🤯 

Whenever you make any changes to your schema, you can migrate them with:
```sh
wasp db migrate-dev
```

If you want to see or manage your DB via Prisma's DB Studio GUI, run:
```sh
wasp db studio
```

### Start your app
In a new terminal window/tab, run:
```sh
wasp start 
```
This will install all dependencies and start the client and server for you :)

Go to `localhost:3000` in your browser to view it (your NodeJS server will be running on port `3001`)

### More Help/Further Info
For more info on Wasp as a full-stack React, NodeJS, Prisma framework, check out the [Wasp docs](https://wasp-lang.dev/docs/).

If you get stuck or need help, join the [Wasp Discord](https://discord.gg/aCamt5wCpS).

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

