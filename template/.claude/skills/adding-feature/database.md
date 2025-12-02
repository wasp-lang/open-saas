# Database Setup

1. read [`../../../app/schema.prisma`](../../../app/schema.prisma) for existing patterns
2. add new Prisma model
3. run `wasp db migrate-dev --name describe-change`

Wasp automatically generates TypeScript types in `wasp/entities`.
