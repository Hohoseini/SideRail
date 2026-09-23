import https from "node:https";

interface IpInfo {
  ip: string;
  location: string;
}

let cached: IpInfo | null = null;
let cachedAt = 0;

function fetchJson(url: string): Promise<Record<string, unknown> | null> {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { "User-Agent": "SideRail" }, timeout: 8000 }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    });
    req.on("error", () => resolve(null));
    req.on("timeout", () => {
      req.destroy();
      resolve(null);
    });
  });
}

export async function refreshIpInfo(): Promise<void> {
  const data = await fetchJson("https://ipinfo.io/json");
  if (!data) return;
  const ip = typeof data.ip === "string" ? data.ip : "";
  const city = typeof data.city === "string" ? data.city : "";
  const country = typeof data.country === "string" ? data.country : "";
  const location = [city, country].filter(Boolean).join(", ");
  if (ip) {
    cached = { ip, location: location || "Unknown" };
    cachedAt = Date.now();
  }
}

export function getIpInfo(): IpInfo {
  if (cached && Date.now() - cachedAt < 6 * 3_600_000) return cached;
  void refreshIpInfo();
  return cached || { ip: "", location: "" };
}
