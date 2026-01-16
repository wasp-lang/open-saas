# Verify Setup

Verify your Wasp app configuration compiles and runs correctly.

## Prerequisites

Fetch the raw github doc file URL for the CLI reference from the [Wasp docs](https://wasp.sh/llms.txt)

## Steps

1. Start the wasp app processes in new terminals as background tasks in the current Claude Code session depending on the features configured.

2. Monitor the output and verify:
   - Configuration compiles without errors
   - Database migrations run successfully (if applicable)
   - Server starts without errors
   - Client builds and starts without errors

3. If errors occur:
   - Analyze the error messages
   - Suggest fixes based on the error type
   - Guide the user through resolving the issues by fetching the raw github doc file URLs for the relevant guides.

## Completion

After verification:
1. Provide a summary of the verification results
2. If successful, inform the user their app is ready for feature development
3. If there were issues, provide next steps for resolution
4. Ask if they'd like to configure another feature or need help with anything else
