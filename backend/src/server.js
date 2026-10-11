const express = require("express");
const config = require("./config");
const leadsRouter = require("./leads");

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1); // correct client IPs behind nginx / a load balancer
app.use(express.json({ limit: "20kb" }));

// CORS, only needed when the frontend is hosted on a different domain
app.use("/api", (req, res, next) => {
  const origin = req.get("origin");
  if (origin && config.allowedOrigins.includes(origin)) {
    res.set({
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      Vary: "Origin"
    });
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/leads", leadsRouter);
app.use("/api", (req, res) => res.status(404).json({ ok: false, error: "Not found" }));

// Landing page
app.use(express.static(config.frontendDir, { extensions: ["html"], maxAge: "1h" }));
app.use((req, res) => res.status(404).sendFile("index.html", { root: config.frontendDir }));

app.listen(config.port, () => {
  console.log(`Carlton Wellness landing page running on http://localhost:${config.port}`);
  console.log(`Serving ${config.frontendDir}, leads stored in ${config.dbPath}`);
});
