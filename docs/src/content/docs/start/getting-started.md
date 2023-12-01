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
Also install the [Wasp extension for VSCode](https://marketplace.visualstudio.com/items?itemName=wasp-lang.wasp) to get the best DX (syntax highlighting, code scaffolding, autocomplete, etc.)

### Clone the repo

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

Then, in a new terminal window/tab, run:
```sh
wasp db migrate-dev
```
This will run the migrations for you and create the tables in your DB.

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

### Further info
Check the files for comments containing specific instructions.

For more info on Wasp as a full-stack React, NodeJS, Prisma framework, check out the [Wasp docs](https://wasp-lang.dev/docs/).

#### Install Docs and Blog (optional)

As an example, this SaaS app comes with a docs and blog section built with the [Starlight template on top of the Astro](https://starlight.astro.build) framework. You can use this as a starting point for your own docs and blog.

If you want to install the Starlight docs and blog, first navigate to the `docs` folder:

```sh
cd docs
```

Then run:
```sh
npm install
```

Then start the development server:
```sh
npm run dev
```


