## Example Prompts

### PRD / initial prompt

I want to create a `<insert-type-of-app-here>` app with the current SaaS boilerplate template project I'm in which uses Wasp and already has payment processing, AWS S3 file upload, a landing page, an admin dashboard, and authentication already setup. Leveraging Wasp's full-stack features (such as Auth), let's build the app based on the following spec: 
  - `<insert-feature-spec-here>` 
  - `<insert-feature-spec-here>` 
  - `<insert-feature-spec-here>` 

With this in mind, I want you to first evaluate the project template and think about a few possible PRD approaches before landing on the best one. Provide reasoning why this would be the best approach. Remember we're using Wasp, a full-stack framework with batteries included, that can do some of the heavy lifting for us, and we want to use a modified vertical slice implementation approach for LLM-assisted coding so we can start with basic implementations of features first, and add on complexity from there.

### Plan prompt

From this PRD, create an actionable, step-by-step plan that we can use as a guide for LLM-assisted coding. Remember that this project is a SaaS boilerplate template with many features already implemented. Each feature is organized into its own folder (e.g. `src/payment`) with its client and server code split into subfolders and files. Before you create the plan, think about a few different plan styles that would be suitable for this project and the implmentation style before selecting the best one. Give your reasoning for why you think we should use this plan style. Remember that we will constantly refer to this plan to guide our coding implementation so it should be well structured, concise, and actionable, while still providing enough information to guide the LLM.
