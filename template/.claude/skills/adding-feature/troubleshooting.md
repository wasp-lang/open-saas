# Troubleshooting - Adding Features

**Type errors after adding operations:** re-run `wasp start`, restart TypeScript server

**Entity not in context:** add to `entities: [...]` array in main.wasp

**Migration fails:** check schema.prisma syntax, ensure DB running (`wasp start db`)

**401 errors:** verify `authRequired: true` in main.wasp

**Page 404:** verify route defined in main.wasp, restart Wasp server

For more issues, see [debugging-wasp skill](../debugging-wasp/SKILL.md).
