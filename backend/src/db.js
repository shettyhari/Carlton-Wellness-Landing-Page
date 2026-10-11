const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");
const config = require("./config");

if (!config.schemaPath) throw new Error("schema.sql not found (looked in database/ and backend/)");

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
const db = new DatabaseSync(config.dbPath);
db.exec("PRAGMA journal_mode = WAL;");
db.exec(fs.readFileSync(config.schemaPath, "utf8"));

const insertLead = db.prepare(`
  INSERT INTO leads (name, phone, email, city, capital_contribution, timeline, background, source, page, ip, user_agent)
  VALUES (:name, :phone, :email, :city, :capital_contribution, :timeline, :background, :source, :page, :ip, :user_agent)
`);
const listLeads = db.prepare("SELECT * FROM leads ORDER BY id DESC LIMIT :limit OFFSET :offset");
const countLeads = db.prepare("SELECT COUNT(*) AS total FROM leads");

module.exports = {
  addLead: (lead) => Number(insertLead.run(lead).lastInsertRowid),
  getLeads: (limit, offset) => ({ total: countLeads.get().total, leads: listLeads.all({ limit, offset }) })
};
