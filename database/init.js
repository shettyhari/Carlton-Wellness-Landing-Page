// Creates the SQLite database file and applies schema.sql.
// Usage: node database/init.js   (or: npm run db:init)
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const dbPath = process.env.DB_PATH || path.join(__dirname, "data", "leads.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));
const { count } = db.prepare("SELECT COUNT(*) AS count FROM leads").get();
db.close();

console.log(`Database ready at ${dbPath} (${count} leads)`);
