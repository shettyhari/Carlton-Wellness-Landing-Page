// Vercel build: copies frontend/ to public/, Vercel's default output folder.
// Runs automatically on Vercel via the "vercel-build" script in package.json.
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const src = path.join(root, "frontend");
const out = path.join(root, "public");

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(src, out, { recursive: true });

if (!fs.existsSync(path.join(out, "index.html"))) throw new Error("public/index.html missing after copy");
console.log(`Copied frontend/ to public/ (${fs.readdirSync(out, { recursive: true }).length} entries)`);
