import { db } from "./db.js";
import type { Inbound, UserRecord } from "./types.js";

interface BackupPayload {
  version: number;
  exported_at: number;
  users: UserRecord[];
  user_inbounds: { user_id: number; inbound_id: number }[];
  inbounds: Inbound[];
}

export function exportData(): BackupPayload {
  const users = db.prepare("SELECT * FROM users").all() as unknown as UserRecord[];
  const inbounds = db.prepare("SELECT * FROM inbounds").all() as unknown as Inbound[];
  const links = db.prepare("SELECT user_id, inbound_id FROM user_inbounds").all() as unknown as {
    user_id: number;
    inbound_id: number;
  }[];
  return {
    version: 1,
    exported_at: Date.now(),
    users,
    inbounds,
    user_inbounds: links,
  };
}

export function importData(payload: BackupPayload): { users: number; inbounds: number } {
  if (!payload || payload.version !== 1) throw new Error("invalid backup version");
  const tx = () => {
    db.exec("DELETE FROM user_inbounds; DELETE FROM users; DELETE FROM inbounds;");

    const insInbound = db.prepare(
      `INSERT INTO inbounds (id, tag, protocol, transport, port, path, host, enabled, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const ib of payload.inbounds) {
      insInbound.run(
        ib.id,
        ib.tag,
        ib.protocol,
        ib.transport,
        ib.port,
        ib.path,
        ib.host,
        ib.enabled,
        ib.created_at,
      );
    }

    const insUser = db.prepare(
      `INSERT INTO users
        (id, email, uuid, password, sub_token, fingerprint, alpn, data_limit, ip_limit,
         expire_at, sub_expire_days, sub_first_seen, traffic_reset, telegram_id, comment,
         enabled, up, down, last_reset, online_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const u of payload.users) {
      insUser.run(
        u.id,
        u.email,
        u.uuid,
        u.password,
        u.sub_token,
        u.fingerprint,
        u.alpn,
        u.data_limit,
        u.ip_limit,
        u.expire_at,
        u.sub_expire_days,
        u.sub_first_seen,
        u.traffic_reset,
        u.telegram_id,
        u.comment,
        u.enabled,
        u.up,
        u.down,
        u.last_reset,
        u.online_at,
        u.created_at,
      );
    }

    const insLink = db.prepare(
      "INSERT OR IGNORE INTO user_inbounds (user_id, inbound_id) VALUES (?, ?)",
    );
    for (const l of payload.user_inbounds) insLink.run(l.user_id, l.inbound_id);
  };
  db.exec("BEGIN");
  try {
    tx();
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  return { users: payload.users.length, inbounds: payload.inbounds.length };
}
