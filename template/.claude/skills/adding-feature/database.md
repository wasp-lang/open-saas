# Database Setup

## Adding Entities to schema.prisma

1. read [`../../../app/schema.prisma`](../../../app/schema.prisma) to understand existing models
2. add new Prisma model following the pattern:
   - use `String @id @default(uuid())` for IDs
   - include `createdAt` and `updatedAt` timestamps
   - add user relation if feature is user-specific
3. if adding relation to User model, update User model with the relation field
4. reference existing models in schema.prisma as examples

## Running Migrations

1. run `cd app && wasp db migrate-dev --name add-feature-name`
2. verify migration completed successfully
3. Wasp automatically generates TypeScript types in `wasp/entities`

## Common Patterns

**User-owned resource:**
```prisma
model FeatureName {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id])
  userId    String
}
```

**Update User model:**
```prisma
model User {
  // ... existing fields
  featureNames FeatureName[]
}
```
