# Wasp Configuration (main.wasp)

## Registering Feature in main.wasp

1. read [`../../../app/main.wasp`](../../../app/main.wasp) to see existing patterns
2. add feature section with region comments for organization

## Structure

```wasp
// #region FeatureName

route FeatureNameRoute { path: "/feature-path", to: FeatureNamePage }

page FeatureNamePage {
  authRequired: true,  // if authentication required
  component: import { FeatureNamePage } from "@src/feature-name/FeatureNamePage"
}

query getItems {
  fn: import { getItems } from "@src/feature-name/operations",
  entities: [EntityName, User]  // list ALL entities accessed
}

action createItem {
  fn: import { createItem } from "@src/feature-name/operations",
  entities: [EntityName]
}

// #endregion
```

## Key Points

- use `@src/feature-name/...` for imports in main.wasp
- list ALL entities accessed in `entities: [...]` array
- set `authRequired: true` for authenticated pages
- queries are for reading, actions are for writing
