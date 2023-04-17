# SaaS Template w/ GPT API, Google Auth, Tailwind, & Stripe Payments

<img src='src/client/static/gptsaastemplate.png' width='700px'/>

## Running it locally

1. Make sure you have the latest version of [Wasp](https://wasp-lang.dev) installed by running `curl -sSL https://get.wasp-lang.dev/installer.sh | sh` in your terminal.
2. Run `wasp new <project-name> -t saas` to create a new app using this template. 
3. Rename the `env.server.example` file to `.env.server` and fill in your API keys
4. Make sure you have a Database connected and running. Here are two quick options:  
  - run `wasp start db` if you have Docker installed (if not, on MacOS run `brew install docker-machine docker`). This will start a Postgres database for you. No need to do anything else! 🤯 
  - or provision a Postgres database on [Railway](https://railway.app), go to settings and copy the `connection url`. Past it as `DATABASE_URL=<your-postgres-connection-url>` into your `env.server` file.  
5. Run `wasp db migrate-dev`
6. Run `wasp start`. This will install all dependencies and start the client and server for you :)
7. Go to `localhost:3000` in your browser (your NodeJS server will be running on port `3001`)
8. Install the Wasp extension for VSCode to get the best DX
9. Check the files for comments containing specific instructions
10. Enjoy and Have fun. When you create an App with this template, be kind and let me know by tagging me on twitter [@hot_town](https://twitter.com/hot_town)

## How it works

- 🐝 [Wasp](https://wasp-lang.dev) - allows you to build full-stack apps with 10x less boilerplate
- 🎨 [Tailwind CSS](https://tailwindcss.com/) - CSS that's easy to work with
- 🤖 [OpenAI](https://openai.com/) - GPT-3.5 turbo API
- 💸 [Stripe](https://stripe.com/) - for payments
- 📧 [SendGrid](https://sendgrid.com/) - for email

[Wasp](https://wasp-lang.dev) as the full-stack framework allows you to describe your app’s core features in the `main.wasp` config file in the root directory. Then it builds and glues these features into a React-Express-Prisma app for you so that you can focus on writing the client and server-side logic instead of configuring. For example, I did not have to use any third-party libraries for Google Authentication. I just wrote a couple lines of code in the config file stating that I want to use Google Auth, and Wasp configures it for me. Check out the comments `main.wasp` file for more.

[Stripe](https://stripe.com/) makes the payment functionality super easy. I just used their `Subscription` feature. After the user pays, their `hasPaid` and `datePaid` fields are updated in the database via the webhook found in the `src/server/serverSetup.ts` file. 

[Wasp's integrated Jobs](https://wasp-lang.dev/docs/language/features#jobs) feature is used to run a cron job every week to send an newsletter email. I used [SendGrid](https://sendgrid.com/) for the email service.

If you have any other questions, feel free to reach out to me on [twitter](https://twitter.com/hot_town)
