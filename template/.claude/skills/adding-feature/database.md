# Database Setup

## Adding/Modifying Models

1. Read [`../../../app/schema.prisma`](../../../app/schema.prisma) for existing patterns
2. Add or modify Prisma model
3. Run migration: `wasp db migrate-dev --name describe-change`

Wasp automatically generates TypeScript types in `wasp/entities`.

## Useful Commands

```bash
wasp db migrate-dev --name <name>  # Create and apply migration
wasp db studio                      # Open GUI to inspect database
wasp db reset                       # Reset database (WARNING: deletes data)
wasp db seed                        # Run seed functions
```

## Troubleshooting

**Schema changes not applied:** Run `wasp db migrate-dev --name describe-change`

**Database out of sync:** Run `wasp db reset` (deletes all data)

**Migration conflicts:** Check [`../../../app/migrations`](../../../app/migrations) directory for existing migrations
