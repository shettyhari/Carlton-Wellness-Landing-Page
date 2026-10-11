-- Carlton Wellness franchise landing page: lead capture schema (SQLite)

CREATE TABLE IF NOT EXISTS leads (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  name                 TEXT    NOT NULL,
  phone                TEXT    NOT NULL,
  email                TEXT    NOT NULL,
  city                 TEXT,
  capital_contribution TEXT,
  timeline             TEXT,
  background           TEXT,
  source               TEXT,
  page                 TEXT,
  ip                   TEXT,
  user_agent           TEXT,
  created_at           TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at);
CREATE INDEX IF NOT EXISTS idx_leads_email      ON leads (email);
