-- === Users & Organisations (from open-saas) ===
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "Organization" (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  createdAt     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "User" (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  passwordHash  TEXT NOT NULL,
  orgId         UUID REFERENCES "Organization"(id) ON DELETE SET NULL,
  stripeCustomerId TEXT,
  createdAt     TIMESTAMP DEFAULT NOW()
);

-- === Projects ===
CREATE TABLE IF NOT EXISTS "Project" (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL,
  ownerId   UUID REFERENCES "User"(id) ON DELETE CASCADE,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- === Tasks ===
CREATE TABLE IF NOT EXISTS "Task" (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projectId  UUID REFERENCES "Project"(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  status     TEXT DEFAULT 'todo', -- todo|doing|done
  ownerId    UUID REFERENCES "User"(id),
  visibility TEXT DEFAULT 'visible',
  createdAt  TIMESTAMP DEFAULT NOW()
);

-- === Success Factors ===
CREATE TABLE IF NOT EXISTS "SuccessFactor" (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT
);

-- === Default Tasks per Factor ===
CREATE TABLE IF NOT EXISTS "FactorTaskTemplate" (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factorId  UUID REFERENCES "SuccessFactor"(id) ON DELETE CASCADE,
  title     TEXT NOT NULL,
  sortOrder INT
);
