const express = require("express");
const { addLead, getLeads } = require("./db");
const config = require("./config");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+0-9\s-]{10,15}$/;
const OPTIONAL_FIELDS = ["city", "capital_contribution", "timeline", "background", "source", "page"];

const clean = (v, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Simple in-memory rate limit: 10 submissions per IP per 10 minutes
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

router.post("/", (req, res) => {
  const ip = req.ip;
  if (rateLimited(ip)) return res.status(429).json({ ok: false, error: "Too many submissions. Please try again later." });

  const body = req.body || {};
  const lead = { name: clean(body.name, 120), phone: clean(body.phone, 20), email: clean(body.email, 160) };

  const errors = [];
  if (!lead.name) errors.push("name");
  if (!PHONE_RE.test(lead.phone)) errors.push("phone");
  if (!EMAIL_RE.test(lead.email)) errors.push("email");
  if (errors.length) return res.status(400).json({ ok: false, error: "Invalid fields", fields: errors });

  for (const f of OPTIONAL_FIELDS) lead[f] = clean(body[f], f === "page" ? 500 : 200) || null;
  lead.ip = ip;
  lead.user_agent = clean(req.get("user-agent"), 300) || null;

  try {
    const id = addLead(lead);
    res.status(201).json({ ok: true, id });
  } catch (err) {
    console.error("Failed to save lead:", err);
    res.status(500).json({ ok: false, error: "Could not save your details" });
  }
});

// Admin read access: GET /api/leads?limit=100&offset=0[&format=csv] with Authorization: Bearer <ADMIN_TOKEN>
router.get("/", (req, res) => {
  if (!config.adminToken) return res.status(404).json({ ok: false, error: "Not found" });
  if (req.get("authorization") !== `Bearer ${config.adminToken}`) return res.status(401).json({ ok: false, error: "Unauthorized" });

  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 1000);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
  const { total, leads } = getLeads(limit, offset);

  if (req.query.format === "csv") {
    const cols = leads.length ? Object.keys(leads[0]) : ["id"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...leads.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
    res.type("text/csv").attachment("carlton-wellness-leads.csv").send(csv);
    return;
  }
  res.json({ ok: true, total, limit, offset, leads });
});

module.exports = router;
