import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { db, getSetting, setSetting } from "./db.js";
import { config } from "./config.js";

interface AdminRow {
  id: number;
  username: string;
  password_hash: string;
  created_at: number;
}

export interface AuthedRequest extends Request {
  admin?: { id: number; username: string };
}

export function isSetupDone(): boolean {
  return getSetting("setup_done") === "1";
}

export function completeSetup(username: string, password: string): void {
  const hash = bcrypt.hashSync(password, 10);
  db.prepare("DELETE FROM admins").run();
  db.prepare("INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, ?)").run(
    username,
    hash,
    Date.now(),
  );
  setSetting("setup_done", "1");
}

export function verifyCredentials(username: string, password: string): AdminRow | null {
  const admin = db.prepare("SELECT * FROM admins WHERE username = ?").get(username) as
    | AdminRow
    | undefined;
  if (!admin) return null;
  return bcrypt.compareSync(password, admin.password_hash) ? admin : null;
}

export function changeCredentials(
  currentPassword: string,
  newUsername: string | undefined,
  newPassword: string | undefined,
): { ok: boolean; error?: string } {
  const admin = db.prepare("SELECT * FROM admins LIMIT 1").get() as AdminRow | undefined;
  if (!admin) return { ok: false, error: "no admin" };
  if (!bcrypt.compareSync(currentPassword, admin.password_hash))
    return { ok: false, error: "current password incorrect" };
  const username = newUsername?.trim() || admin.username;
  const hash = newPassword ? bcrypt.hashSync(newPassword, 10) : admin.password_hash;
  db.prepare("UPDATE admins SET username = ?, password_hash = ? WHERE id = ?").run(
    username,
    hash,
    admin.id,
  );
  return { ok: true };
}

export function signToken(admin: { id: number; username: string }): string {
  return jwt.sign({ id: admin.id, username: admin.username }, config.jwtSecret, {
    expiresIn: "7d",
  });
}

export function authGuard(req: AuthedRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.sr_token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { id: number; username: string };
    req.admin = { id: payload.id, username: payload.username };
    next();
  } catch {
    res.status(401).json({ error: "unauthorized" });
  }
}
