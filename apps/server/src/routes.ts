import { Router } from "express";
import { z } from "zod";
import {
  isSetupDone,
  completeSetup,
  verifyCredentials,
  signToken,
  authGuard,
  changeCredentials,
  type AuthedRequest,
} from "./auth.js";
import { db, getSetting, setSetting } from "./db.js";
import { getSystemStats } from "./system.js";
import { listInbounds, setInboundEnabled, getInbound } from "./inbounds.js";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  setUserEnabled,
  resetUserTraffic,
  rotateSubToken,
  getUser,
  summarize,
} from "./users.js";
import { listActivity, logActivity, clearActivity } from "./activity.js";
import { exportData, importData } from "./backup.js";
import { restartXray } from "./xray.js";

export const api = Router();

const trafficReset = z.enum(["never", "daily", "weekly", "monthly"]);

const userSchema = z.object({
  email: z.string().min(1),
  uuid: z.string().optional(),
  password: z.string().optional(),
  fingerprint: z.string().optional(),
  alpn: z.string().optional(),
  dataLimit: z.number().min(0).optional(),
  ipLimit: z.number().min(0).optional(),
  expireDays: z.number().min(0).optional(),
  subExpireDays: z.number().min(0).optional(),
  trafficReset: trafficReset.optional(),
  telegramId: z.string().optional(),
  comment: z.string().optional(),
  inboundIds: z.array(z.number()).optional(),
});

const updateSchema = userSchema.partial().extend({ enabled: z.boolean().optional() });

api.get("/status", (_req, res) => {
  res.json({ setup: isSetupDone(), name: "SideRail" });
});

api.post("/setup", (req, res) => {
  if (isSetupDone()) {
    res.status(400).json({ error: "already set up" });
    return;
  }
  const body = z
    .object({ username: z.string().min(3), password: z.string().min(6) })
    .safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid input" });
    return;
  }
  completeSetup(body.data.username, body.data.password);
  logActivity(body.data.username, "setup", "panel initialized");
  const token = signToken({ id: 1, username: body.data.username });
  setAuthCookie(res, token);
  res.json({ ok: true, token });
});

api.post("/login", (req, res) => {
  const body = z
    .object({ username: z.string(), password: z.string() })
    .safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid input" });
    return;
  }
  const admin = verifyCredentials(body.data.username, body.data.password);
  if (!admin) {
    logActivity(body.data.username, "login_failed", "");
    res.status(401).json({ error: "invalid credentials" });
    return;
  }
  const token = signToken(admin);
  setAuthCookie(res, token);
  logActivity(admin.username, "login", "");
  res.json({ ok: true, token });
});

api.post("/logout", (_req, res) => {
  res.clearCookie("sr_token");
  res.json({ ok: true });
});

api.use(authGuard);

api.get("/me", (req: AuthedRequest, res) => {
  res.json({ admin: req.admin });
});

api.get("/system", (_req, res) => {
  res.json(getSystemStats());
});

api.get("/inbounds", (_req, res) => {
  res.json(listInbounds());
});

api.patch("/inbounds/:id", async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const body = z.object({ enabled: z.boolean() }).safeParse(req.body);
  if (!body.success || !getInbound(id)) {
    res.status(400).json({ error: "invalid" });
    return;
  }
  setInboundEnabled(id, body.data.enabled);
  logActivity(req.admin!.username, "inbound_toggle", `#${id} -> ${body.data.enabled}`);
  await restartXray();
  res.json({ ok: true });
});

api.get("/users", (_req, res) => {
  const users = listUsers();
  res.json({ users, summary: summarize(users) });
});

api.get("/users/summary", (_req, res) => {
  res.json(summarize(listUsers()));
});

api.get("/users/:id", (req, res) => {
  const user = getUser(Number(req.params.id));
  if (!user) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(user);
});

api.post("/users", async (req: AuthedRequest, res) => {
  const body = userSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid input", detail: body.error.flatten() });
    return;
  }
  try {
    const user = createUser(body.data);
    logActivity(req.admin!.username, "user_create", user.email);
    await restartXray();
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

api.put("/users/:id", async (req: AuthedRequest, res) => {
  const body = updateSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid input" });
    return;
  }
  const user = updateUser(Number(req.params.id), body.data);
  if (!user) {
    res.status(404).json({ error: "not found" });
    return;
  }
  logActivity(req.admin!.username, "user_update", user.email);
  await restartXray();
  res.json(user);
});

api.delete("/users/:id", async (req: AuthedRequest, res) => {
  const user = getUser(Number(req.params.id));
  deleteUser(Number(req.params.id));
  logActivity(req.admin!.username, "user_delete", user?.email || String(req.params.id));
  await restartXray();
  res.json({ ok: true });
});

api.post("/users/:id/toggle", async (req: AuthedRequest, res) => {
  const body = z.object({ enabled: z.boolean() }).safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid" });
    return;
  }
  setUserEnabled(Number(req.params.id), body.data.enabled);
  logActivity(req.admin!.username, "user_toggle", `#${req.params.id} -> ${body.data.enabled}`);
  await restartXray();
  res.json({ ok: true });
});

api.post("/users/:id/reset-traffic", (req: AuthedRequest, res) => {
  resetUserTraffic(Number(req.params.id));
  logActivity(req.admin!.username, "user_reset_traffic", `#${req.params.id}`);
  res.json({ ok: true });
});

api.post("/users/:id/rotate-token", (req: AuthedRequest, res) => {
  rotateSubToken(Number(req.params.id));
  logActivity(req.admin!.username, "user_rotate_token", `#${req.params.id}`);
  res.json(getUser(Number(req.params.id)));
});

api.get("/activity", (_req, res) => {
  res.json(listActivity(300));
});

api.delete("/activity", (req: AuthedRequest, res) => {
  clearActivity();
  logActivity(req.admin!.username, "activity_clear", "");
  res.json({ ok: true });
});

api.get("/settings", (_req, res) => {
  res.json({
    xrayVersion: getSetting("xray_version") || "",
    subTitle: getSetting("sub_title") || "SideRail",
  });
});

api.put("/settings", (req: AuthedRequest, res) => {
  const body = z
    .object({ subTitle: z.string().optional() })
    .safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid" });
    return;
  }
  if (body.data.subTitle !== undefined) setSetting("sub_title", body.data.subTitle);
  logActivity(req.admin!.username, "settings_update", "");
  res.json({ ok: true });
});

api.post("/settings/credentials", (req: AuthedRequest, res) => {
  const body = z
    .object({
      currentPassword: z.string().min(1),
      newUsername: z.string().min(3).optional(),
      newPassword: z.string().min(6).optional(),
    })
    .safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid input" });
    return;
  }
  const result = changeCredentials(
    body.data.currentPassword,
    body.data.newUsername,
    body.data.newPassword,
  );
  if (!result.ok) {
    res.status(400).json({ error: result.error });
    return;
  }
  logActivity(req.admin!.username, "credentials_change", "");
  res.json({ ok: true });
});

api.get("/backup/export", (req: AuthedRequest, res) => {
  logActivity(req.admin!.username, "backup_export", "");
  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="siderail-backup-${Date.now()}.json"`,
  );
  res.send(JSON.stringify(exportData(), null, 2));
});

api.post("/backup/import", async (req: AuthedRequest, res) => {
  try {
    const result = importData(req.body);
    logActivity(req.admin!.username, "backup_import", `${result.users} users, ${result.inbounds} inbounds`);
    await restartXray();
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

function setAuthCookie(res: import("express").Response, token: string): void {
  res.cookie("sr_token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 86_400_000,
  });
}

void db;
