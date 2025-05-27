# TCOF v2 — Built on Wasp *open-saas* Starter

> **This project is a direct fork of https://github.com/Greg-CLD/open-saas.**
> All code and new features build on top of this foundation.

> **Purpose:** Provide a multi-tenant checklist SaaS (£5 / mo) with Stripe billing.

---

## 0 · Quick Start

```bash
git clone https://github.com/Greg-CLD/open-saas.git tcof-v2
cd tcof-v2
cp attachments/env.sample .env    # fill DB + Stripe keys
wasp start                        # runs Prisma, server, client
1 · Why Wasp open-saas?
✅ Ready-made user accounts, org workspaces, Stripe billing, admin panel.

✅ React + Tailwind front-end, Express + Prisma + Postgres back-end.

✅ Extensible main.wasp config for entities/routes.

2 · Required Feature Roadmap (phased)
Seq	Area	Feature	Where it lives in code
1	Risk Reducers	ErrorBoundary	src/client/App.tsx
Resilient Storage	src/client/lib/storageAdapter.ts
2	System	GDPR Banner	src/client/components/ConsentBanner.tsx
Responsive + Cross-browser	Tailwind classes, Playwright test
Security Headers	src/server/middleware/security.ts
3	EPIC 1	Registration + Reset	already in starter (adjust copy)
4	EPIC 2	Orientation Module	src/client/pages/orientation/
5	EPIC 6	Dashboard · Project CRUD · Sessions · Subscription Mgmt	main.wasp entities Project, React pages dashboard/
6	EPIC 3	Task CRUD + Owners + Visibility	Task entity, actions, pages
7	EPIC 4	PDF export, mail-to	client util pdfExport.ts
9	EPIC 8	Factor & Default Task Admin	admin pages under src/client/pages/admin/
10	EPIC 7	Embedded Support	src/client/components/SupportWidget.tsx

(Full table in attachments/feature_table.xlsx)

3 · Data Model (Prisma)
The base open-saas models:

prisma
Copy
Edit
model User           { id String @id @default(uuid()) ... }
model Organization   { id String @id @default(uuid()) ... }
New models to add:

prisma
Copy
Edit
model Project {
  id           String   @id @default(uuid())
  name         String
  owner        User     @relation(fields: [ownerId], references: [id])
  ownerId      String
  tasks        Task[]
  createdAt    DateTime @default(now())
}

model Task {
  id          String   @id @default(uuid())
  title       String
  status      String   @default("todo")
  visibility  String   @default("visible")
  project     Project  @relation(fields: [projectId], references: [id])
  projectId   String
  owner       User?    @relation(fields: [ownerId], references: [id])
  ownerId     String?
}
(Full schema in attachments/schema.sql, mirrored into prisma/schema.prisma.)

4 · Non-Functional Requirements
Daily full-stack backup — see scripts/system-backup.sh.

CI — GitHub Action or Replit Automation running wasp test && playwright test.

Security — Helmet, rate-limit 100 req / 15 min.

5 · Attachments

File	Purpose
attachments/schema.sql	Canonical schema (sync with Prisma).
attachments/env.sample	Env template inc. Stripe keys.
attachments/api_contracts.md	REST+Wasp action contracts.
scripts/system-backup.sh	Backup script (tar + pg_dump).
tests/smoke.spec.ts	Playwright green-path.
attachments/screenshots/	Wireframes / mocks.
attachments/lessons_learned.md	Legacy pitfalls to avoid.


6 · Next Steps for Contributors (Codex / Replit Agent)
Review README.md & attachments.

Generate file scaffold for new entities, pages, and actions.

Implement phase-1 Risk Reducers (ErrorBoundary, Storage adapter).

Ensure wasp db migrate-dev succeeds with new models.

Happy coding! 🎉

yaml
Copy
Edit

*(save as `README.md` in project root)*

---

### Updated Attachments List (files you now have)

attachments/
├ schema.sql
├ env.sample
├ api_contracts.md
├ lessons_learned.md
├ diagrams/
│ └ ERD.png
├ screenshots/
└ tests/
└ smoke.spec.ts
scripts/
└ system-backup.sh
tests/
└ smoke.spec.ts (duplicate placed where Playwright expects)

yaml
Copy
Edit

*(If Playwright prefers `tests/` at root, keep that duplicate.)*

---

## 3 · Extra Pointers for a Tech Novice

1. **Wasp CLI basics**  
wasp start # dev mode (DB + server + client)
wasp db studio # open Prisma Studio UI
wasp build # production bundle

markdown
Copy
Edit

2. **Where to add new pages** — `src/client/pages/*` and reference them in `main.wasp`.

3. **Prisma migration flow**  
```bash
wasp db migrate-dev "add_project_and_task"
# then wasp start, DB auto-updated
Stripe test keys — fill in .env with test keys beginning sk_test_..., run Stripe CLI to test webhooks.

ErrorBoundary quick test — throw new Error('boom') in a component; you should see the fallback UI, not a blank page.

Backup script — run bash scripts/system-backup.sh once manually to verify files appear in /mnt/data/backups.
![image](image.png)