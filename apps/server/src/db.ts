import { DatabaseSync } from "node:sqlite";
import { config } from "./config.js";

export const db = new DatabaseSync(config.dbPath);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

export function migrate(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inbounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tag TEXT UNIQUE NOT NULL,
      protocol TEXT NOT NULL,
      transport TEXT NOT NULL,
      port INTEGER NOT NULL,
      path TEXT NOT NULL,
      host TEXT NOT NULL DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      uuid TEXT NOT NULL,
      password TEXT NOT NULL,
      sub_token TEXT UNIQUE NOT NULL,
      fingerprint TEXT NOT NULL DEFAULT 'chrome',
      alpn TEXT NOT NULL DEFAULT 'h2,http/1.1',
      data_limit INTEGER NOT NULL DEFAULT 0,
      ip_limit INTEGER NOT NULL DEFAULT 0,
      expire_at INTEGER,
      sub_expire_days INTEGER NOT NULL DEFAULT 0,
      sub_first_seen INTEGER,
      traffic_reset TEXT NOT NULL DEFAULT 'never',
      telegram_id TEXT NOT NULL DEFAULT '',
      comment TEXT NOT NULL DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 1,
      up INTEGER NOT NULL DEFAULT 0,
      down INTEGER NOT NULL DEFAULT 0,
      last_reset INTEGER NOT NULL DEFAULT 0,
      online_at INTEGER,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_inbounds (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      inbound_id INTEGER NOT NULL REFERENCES inbounds(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, inbound_id)
    );

    CREATE TABLE IF NOT EXISTS activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts INTEGER NOT NULL,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      detail TEXT NOT NULL DEFAULT ''
    );

    CREATE INDEX IF NOT EXISTS idx_activity_ts ON activity(ts DESC);
    CREATE INDEX IF NOT EXISTS idx_users_token ON users(sub_token);
  `);
}

export function getSetting(key: string): string | null {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row ? row.value : null;
}

export function setSetting(key: string, value: string): void {
  db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  ).run(key, value);
}
