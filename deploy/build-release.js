// Builds release/backend and release/frontend: clean, deployable copies of the app.
// Usage: npm run build
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const release = path.join(root, "release");
const out = { backend: path.join(release, "backend"), frontend: path.join(release, "frontend") };

for (const dir of Object.values(out)) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

// Frontend: the static landing page as-is
fs.cpSync(path.join(root, "frontend"), out.frontend, { recursive: true });

// Backend: source, manifest and env template (no node_modules, .env or local data)
const backend = path.join(root, "backend");
fs.cpSync(path.join(backend, "src"), path.join(out.backend, "src"), { recursive: true });
fs.cpSync(path.join(backend, "api"), path.join(out.backend, "api"), { recursive: true });
for (const f of ["package.json", "package-lock.json", ".env.example", "vercel.json"]) {
  if (fs.existsSync(path.join(backend, f))) fs.copyFileSync(path.join(backend, f), path.join(out.backend, f));
}
// Schema travels with the backend so release/ is self-contained
fs.copyFileSync(path.join(root, "database", "schema.sql"), path.join(out.backend, "schema.sql"));
fs.copyFileSync(path.join(__dirname, "ecosystem.config.cjs"), path.join(out.backend, "ecosystem.config.cjs"));

const count = (dir) => fs.readdirSync(dir, { recursive: true }).length;
console.log(`release/frontend: ${count(out.frontend)} entries`);
console.log(`release/backend:  ${count(out.backend)} entries`);
console.log("Release built. Upload the release/ folder to your server, then see deploy/README.md.");
