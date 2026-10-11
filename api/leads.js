// Vercel serverless function: POST /api/leads
// Validates the lead form and records each lead in the Vercel function logs.
// TODO: lead storage (database / CRM / Google Sheet) will be added here later.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+0-9\s-]{10,15}$/;
const OPTIONAL_FIELDS = ["city", "capital_contribution", "timeline", "background", "source", "page"];

const clean = (v, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const lead = { name: clean(body.name, 120), phone: clean(body.phone, 20), email: clean(body.email, 160) };

  const errors = [];
  if (!lead.name) errors.push("name");
  if (!PHONE_RE.test(lead.phone)) errors.push("phone");
  if (!EMAIL_RE.test(lead.email)) errors.push("email");
  if (errors.length) return res.status(400).json({ ok: false, error: "Invalid fields", fields: errors });

  for (const f of OPTIONAL_FIELDS) lead[f] = clean(body[f], f === "page" ? 500 : 200) || null;
  lead.received_at = new Date().toISOString();

  // Temporary: visible in Vercel → Project → Logs until lead storage is connected
  console.log("NEW_LEAD", JSON.stringify(lead));

  return res.status(201).json({ ok: true });
};
