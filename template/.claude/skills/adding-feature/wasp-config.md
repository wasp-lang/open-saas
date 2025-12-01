# Wasp Configuration (main.wasp)

## Registering Feature in main.wasp

1. read [`../../../app/main.wasp`](../../../app/main.wasp) to see existing patterns
2. add feature section with region comments for organization

## Key Points

- list ALL entities accessed in `entities: [...]` array
- set `authRequired: true` for authenticated pages
- queries are for reading, actions are for writing
