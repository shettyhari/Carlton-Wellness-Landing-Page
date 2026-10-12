// Vercel build: copies frontend/ to public/ (Vercel's default output folder) in the folder the
// build runs from. Works whether the Vercel project's Root Directory is the repo root or backend/.
const fs = require("node:fs");
const path = require("node:path");

const src = path.join(__dirname, "..", "frontend");
const out = path.join(process.cwd(), "public");

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(src, out, { recursive: true });

if (!fs.existsSync(path.join(out, "index.html"))) throw new Error("public/index.html missing after copy");
console.log(`Copied frontend/ to ${path.relative(path.join(__dirname, ".."), out) || "."} (${fs.readdirSync(out, { recursive: true }).length} entries)`);
