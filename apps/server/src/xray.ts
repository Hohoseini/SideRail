import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import https from "node:https";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { createWriteStream } from "node:fs";
import { config } from "./config.js";
import { buildXrayConfig } from "./xray-config.js";
import { db } from "./db.js";

let proc: ChildProcess | null = null;
let running = false;

function binName(): string {
  return config.platform === "win32" ? "xray.exe" : "xray";
}

function binPath(): string {
  return path.join(config.xrayDir, binName());
}

function assetName(): string {
  const arch = config.arch;
  if (config.platform === "linux") {
    if (arch === "arm64") return "Xray-linux-arm64-v8a.zip";
    return "Xray-linux-64.zip";
  }
  if (config.platform === "darwin") {
    return arch === "arm64" ? "Xray-macos-arm64-v8a.zip" : "Xray-macos-64.zip";
  }
  return "Xray-windows-64.zip";
}

function download(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    const req = https.get(url, { headers: { "User-Agent": "SideRail" } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`download failed ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => file.close(() => resolve()));
    });
    req.on("error", reject);
  });
}

function unzip(zip: string, dir: string): void {
  if (config.platform === "win32") {
    spawnSync(
      "powershell",
      ["-NoProfile", "-Command", `Expand-Archive -LiteralPath '${zip}' -DestinationPath '${dir}' -Force`],
      { stdio: "ignore" },
    );
  } else {
    spawnSync("unzip", ["-o", zip, "-d", dir], { stdio: "ignore" });
  }
}

export async function ensureBinary(): Promise<boolean> {
  if (fs.existsSync(binPath())) return true;
  try {
    const version = config.xrayVersion;
    const url = `https://github.com/XTLS/Xray-core/releases/download/${version}/${assetName()}`;
    const tmpZip = path.join(os.tmpdir(), `xray-${Date.now()}.zip`);
    await download(url, tmpZip);
    unzip(tmpZip, config.xrayDir);
    fs.rmSync(tmpZip, { force: true });
    if (config.platform !== "win32" && fs.existsSync(binPath())) {
      fs.chmodSync(binPath(), 0o755);
    }
    return fs.existsSync(binPath());
  } catch {
    return false;
  }
}

function writeConfig(): string {
  const cfg = buildXrayConfig();
  const file = path.join(config.xrayDir, "config.json");
  fs.writeFileSync(file, JSON.stringify(cfg, null, 2));
  return file;
}

export async function startXray(): Promise<void> {
  const ok = await ensureBinary();
  if (!ok) {
    running = false;
    return;
  }
  const cfgFile = writeConfig();
  stopXray();
  proc = spawn(binPath(), ["run", "-config", cfgFile], {
    cwd: config.xrayDir,
    stdio: "ignore",
  });
  running = true;
  proc.on("exit", () => {
    running = false;
  });
}

export function stopXray(): void {
  if (proc) {
    try {
      proc.kill();
    } catch {
      /* noop */
    }
    proc = null;
  }
  running = false;
}

export async function restartXray(): Promise<void> {
  await startXray();
}

export function isRunning(): boolean {
  return running;
}

export function xrayVersion(): string {
  return config.xrayVersion;
}

interface StatStub {
  name: string;
  value: number;
}

function queryStats(): StatStub[] {
  if (!fs.existsSync(binPath())) return [];
  const res = spawnSync(
    binPath(),
    ["api", "statsquery", `--server=127.0.0.1:${config.xrayApiPort}`],
    { encoding: "utf8", timeout: 5000 },
  );
  if (res.status !== 0 || !res.stdout) return [];
  try {
    const parsed = JSON.parse(res.stdout) as { stat?: StatStub[] };
    return parsed.stat || [];
  } catch {
    return [];
  }
}

export function collectTraffic(): void {
  const stats = queryStats();
  if (stats.length === 0) return;
  const now = Date.now();
  const updateUp = db.prepare("UPDATE users SET up = up + ?, online_at = ? WHERE email = ?");
  const updateDown = db.prepare("UPDATE users SET down = down + ?, online_at = ? WHERE email = ?");
  for (const s of stats) {
    const m = s.name.match(/^user>>>(.+)>>>traffic>>>(uplink|downlink)$/);
    if (!m || s.value <= 0) continue;
    const email = m[1];
    if (m[2] === "uplink") updateUp.run(s.value, now, email);
    else updateDown.run(s.value, now, email);
  }
}
