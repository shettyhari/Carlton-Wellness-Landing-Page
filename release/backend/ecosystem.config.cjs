// PM2 process file. On the server, from release/backend:
//   npm ci --omit=dev && pm2 start ecosystem.config.cjs && pm2 save
module.exports = {
  apps: [
    {
      name: "carlton-wellness",
      script: "src/server.js",
      cwd: __dirname,
      instances: 1, // SQLite: keep a single instance
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        DB_PATH: "/var/lib/carlton-wellness/leads.db"
      }
    }
  ]
};
