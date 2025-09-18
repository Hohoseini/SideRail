import os from "node:os";
import fs from "node:fs";
import { execSync } from "node:child_process";
import { config } from "./config.js";
import { isRunning, xrayVersion } from "./xray.js";
import type { SystemStats } from "./types.js";

let lastCpu = os.cpus().map((c) => ({ ...c.times }));
let lastCpuTime = Date.now();

function cpuUsage(): { usage: number; cores: number; avg: number } {
  const cpus = os.cpus();
  const now = Date.now();
  let totalDiff = 0;
  let idleDiff = 0;
  for (let i = 0; i < cpus.length; i++) {
    const prev = lastCpu[i];
    const cur = cpus[i].times;
    if (!prev) continue;
    const prevTotal = prev.user + prev.nice + prev.sys + prev.idle + prev.irq;
    const curTotal = cur.user + cur.nice + cur.sys + cur.idle + cur.irq;
    totalDiff += curTotal - prevTotal;
    idleDiff += cur.idle - prev.idle;
  }
  lastCpu = cpus.map((c) => ({ ...c.times }));
  lastCpuTime = now;
  const usage = totalDiff > 0 ? (1 - idleDiff / totalDiff) * 100 : 0;
  const load = os.loadavg()[0];
  const avg = cpus.length > 0 ? Math.min(100, (load / cpus.length) * 100) : usage;
  return { usage: round(usage), cores: cpus.length, avg: round(avg) };
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

function memUsage() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  return { usage: round((used / total) * 100), used, total };
}

function swapUsage(): { usage: number; used: number; total: number } {
  try {
    if (config.platform === "linux" && fs.existsSync("/proc/meminfo")) {
      const info = fs.readFileSync("/proc/meminfo", "utf8");
      const totalKb = Number(info.match(/SwapTotal:\s+(\d+)/)?.[1] || 0);
      const freeKb = Number(info.match(/SwapFree:\s+(\d+)/)?.[1] || 0);
      const total = totalKb * 1024;
      const used = (totalKb - freeKb) * 1024;
      return { usage: total > 0 ? round((used / total) * 100) : 0, used, total };
    }
  } catch {
    /* noop */
  }
  return { usage: 0, used: 0, total: 0 };
}

function storageUsage(): { usage: number; free: number; total: number } {
  try {
    const stat = fs.statfsSync(config.dataDir);
    const total = stat.blocks * stat.bsize;
    const free = stat.bavail * stat.bsize;
    const used = total - free;
    return { usage: total > 0 ? round((used / total) * 100) : 0, free, total };
  } catch {
    /* noop */
  }
  try {
    if (config.platform === "win32") {
      const out = execSync("wmic logicaldisk get size,freespace,caption", { encoding: "utf8" });
      const line = out.split("\n").find((l) => l.trim().startsWith("C:"));
      if (line) {
        const parts = line.trim().split(/\s+/);
        const free = Number(parts[1]);
        const total = Number(parts[2]);
        return { usage: total > 0 ? round(((total - free) / total) * 100) : 0, free, total };
      }
    }
  } catch {
    /* noop */
  }
  return { usage: 0, free: 0, total: 0 };
}

export function getSystemStats(): SystemStats {
  void lastCpuTime;
  return {
    cpu: cpuUsage(),
    ram: memUsage(),
    swap: swapUsage(),
    storage: storageUsage(),
    uptime: os.uptime(),
    xray: { running: isRunning(), version: xrayVersion() },
  };
}
