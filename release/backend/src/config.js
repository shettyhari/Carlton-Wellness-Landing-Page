const fs = require("node:fs");
const path = require("node:path");

const backendRoot = path.join(__dirname, "..");

// Minimal .env loader so the backend has no extra dependencies
const envFile = path.join(backendRoot, ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const resolve = (p) => path.resolve(backendRoot, p);

// schema.sql lives in database/ during development and next to the backend in release/
const schemaCandidates = [resolve("../database/schema.sql"), resolve("schema.sql")];

module.exports = {
  port: Number(process.env.PORT) || 3000,
  frontendDir: resolve(process.env.FRONTEND_DIR || "../frontend"),
  dbPath: process.env.DB_PATH ? resolve(process.env.DB_PATH) : resolve("../database/data/leads.db"),
  schemaPath: schemaCandidates.find((p) => fs.existsSync(p)),
  adminToken: process.env.ADMIN_TOKEN || "",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean)
};
