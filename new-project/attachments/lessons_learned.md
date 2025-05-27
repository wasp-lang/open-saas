# Lessons Learned (v0)

* **UUID Everywhere** — mixing autoincrement IDs and UUIDs caused TaskIDResolver headaches. Use UUIDs from day 1.
* **Single Source of Truth** — ProjectContext must read once from storage/session and stay canonical.
* **Backups Matter** — early bugs corrupted data; daily pg_dump + code tar is mandatory.
* **Error Boundaries** — one uncaught error blanked the whole SPA. Top-level ErrorBoundary is a requirement.
* **E2E Tests** — a green Playwright run on each commit prevents silent regressions.
