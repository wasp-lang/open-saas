# AGENTS.md – Contributor & AI Agent Guide for **TCOF-Tool**

Welcome, human or AI contributor!  
This repo is a fork of the **Wasp open-saas** starter, extended for the Connected Outcomes Framework (TCOF).

---

## 1 · Repository Map

| Path | Purpose |
|------|---------|
| `/main.wasp` | Entity & route config (User, Organization + **Project, Task, SuccessFactor**) |
| `/prisma/` | Prisma schema & migrations (UUID everywhere) |
| `/client/src/` | React UI — Tailwind + shadcn/ui |
| `/server/` | Express / Wasp server code |
| `/new-project/README.md` | **Canonical requirements & roadmap** |
| `/new-project/attachments/` | Schema SQL, API contracts, env template, backup script, smoke test, screenshots |
| `/scripts/system-backup.sh` | Daily DB + code backup |
| `/tests/` | Playwright & other tests |

> **Work only inside these folders** unless specifically asked.

---

## 2 · Contribution & Style Guidelines

### Code Style
- TypeScript everywhere (client + server).  
- Use ESLint & Prettier defaults (`npm run lint` before commit).  
- Keep functions < 40 lines when possible; prefer small utilities.

### React
- Functional components with hooks.  
- Wrap app in `ErrorBoundary` (already wired).  
- Use shadcn/ui components for forms/dialogues.

### Server
- Add new middleware by importing it in `/server/server.ts`.  
- Use `async/await` and return JSON `{ data, error }` consistently.

---

## 3 · Migration & Data

- **UUIDs** only (`@default(uuid())`).  
- Add a migration via `wasp db migrate-dev "<name>"`.  
- Keep `prisma/schema.prisma` **in sync** with `attachments/schema.sql`.

---

## 4 · Testing & Validation

| Command | What it does |
|---------|--------------|
| `wasp db migrate-dev` | Applies latest migrations |
| `npm run test`        | Runs TypeScript type-check & unit tests |
| `npx playwright test` | Runs the green-path smoke test (`tests/smoke.spec.ts`) |
| `npm run lint`        | ESLint + Prettier |

> **CI** (GitHub Actions) requires: **lint clean + tests green + smoke test pass**.

---

## 5 · Typical Workflow for AI Agents

1. **Read** `/new-project/README.md` + attachments for context.  
2. **Plan**: outline changes before editing.  
3. **Edit**: touch only the paths listed in Section 1 unless instructed.  
4. **Self-check**: run lint, tests, Playwright.  
5. **Document**: update this file or code comments if behavior changes.  
6. **Commit** message style:  

feat: <scope> – short description
fix: <scope> – short description
docs: update AGENTS.md


---

## 6 · Pull-Request (PR) Checklist

- [ ] `npm run lint` passes  
- [ ] `npm run test` passes  
- [ ] `npx playwright test` passes  
- [ ] Migrations generated & committed  
- [ ] Updated docs or comments where needed  
- [ ] Clear, descriptive PR title (e.g. `[Project] Add Task CRUD pages`)  

Happy coding! 🎉
