import "dotenv/config";
import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import express from "express";
import cookieParser from "cookie-parser";
import { config } from "./config.js";
import { migrate } from "./db.js";
import { seedInbounds } from "./inbounds.js";
import { seedDefaultClient } from "./users.js";
import { api } from "./routes.js";
import { sub, setSubStaticRoot } from "./sub.js";
import { attachTunnel, tryTunnelHttp } from "./tunnel.js";
import { startXray, collectTraffic, collectClientIps } from "./xray.js";
import { applyTrafficReset } from "./users.js";
import { rateLimit } from "./ratelimit.js";

migrate();
seedInbounds();
seedDefaultClient();

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "25mb" }));
app.use(cookieParser());

app.set("trust proxy", true);
app.get("/healthz", (_req, res) => res.json({ ok: true }));

app.use("/api", rateLimit, api);
app.use("/sub", sub);

const staticCandidates = [
  path.join(process.cwd(), "public"),
  path.join(process.cwd(), "apps", "web", "dist"),
];
const staticDir = staticCandidates.find((p) => fs.existsSync(p)) || staticCandidates[0];

if (fs.existsSync(staticDir)) {
  setSubStaticRoot(staticDir);
  app.use(express.static(staticDir));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/sub")) return next();
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

const server = http.createServer((req, res) => {
  if ((req.url || "").startsWith("/api") || (req.url || "").startsWith("/sub")) {
    app(req, res);
    return;
  }
  if (tryTunnelHttp(req, res)) return;
  app(req, res);
});

attachTunnel(server);

server.listen(config.port, config.host, async () => {
  console.log(`SideRail listening on http://${config.host}:${config.port}`);
  await startXray();
});

setInterval(() => {
  try {
    collectTraffic();
  } catch {
    /* noop */
  }
  try {
    collectClientIps();
  } catch {
    /* noop */
  }
}, 30_000);

setInterval(() => {
  try {
    applyTrafficReset();
  } catch {
    /* noop */
  }
}, 3_600_000);

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
