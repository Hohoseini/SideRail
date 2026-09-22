export interface ApiError {
  error: string;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as ApiError;
      message = body.error || message;
    } catch {
      /* noop */
    }
    throw new Error(message);
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const api = {
  status: () => request<{ setup: boolean; name: string }>("/api/status"),
  setup: (username: string, password: string) =>
    request<{ ok: boolean }>("/api/setup", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  login: (username: string, password: string) =>
    request<{ ok: boolean }>("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request<{ ok: boolean }>("/api/logout", { method: "POST" }),
  me: () => request<{ admin: import("./types").AdminInfo }>("/api/me"),
  system: () => request<import("./types").SystemStats>("/api/system"),
  inbounds: () => request<import("./types").Inbound[]>("/api/inbounds"),
  toggleInbound: (id: number, enabled: boolean) =>
    request(`/api/inbounds/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    }),
  users: () =>
    request<{ users: import("./types").User[]; summary: import("./types").UserSummary }>(
      "/api/users",
    ),
  createUser: (payload: import("./types").UserFormValues) =>
    request<import("./types").User>("/api/users", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateUser: (id: number, payload: Partial<import("./types").UserFormValues>) =>
    request<import("./types").User>(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteUser: (id: number) => request(`/api/users/${id}`, { method: "DELETE" }),
  toggleUser: (id: number, enabled: boolean) =>
    request(`/api/users/${id}/toggle`, {
      method: "POST",
      body: JSON.stringify({ enabled }),
    }),
  resetTraffic: (id: number) =>
    request(`/api/users/${id}/reset-traffic`, { method: "POST" }),
  rotateToken: (id: number) =>
    request<import("./types").User>(`/api/users/${id}/rotate-token`, { method: "POST" }),
  clientIps: (id: number) =>
    request<{ ip: string; last_seen: number }[]>(`/api/users/${id}/ips`),
  activity: () => request<import("./types").ActivityEntry[]>("/api/activity"),
  clearActivity: () => request("/api/activity", { method: "DELETE" }),
  settings: () => request<{ subTitle: string }>("/api/settings"),
  updateSettings: (subTitle: string) =>
    request("/api/settings", { method: "PUT", body: JSON.stringify({ subTitle }) }),
  changeCredentials: (payload: {
    currentPassword: string;
    newUsername?: string;
    newPassword?: string;
  }) =>
    request("/api/settings/credentials", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  importBackup: (data: unknown) =>
    request("/api/backup/import", { method: "POST", body: JSON.stringify(data) }),
  admins: () =>
    request<{ admins: import("./types").AdminInfo[]; permissions: string[] }>("/api/admins"),
  createAdmin: (payload: {
    username: string;
    password: string;
    permissions: string[];
    dataLimit: number;
  }) => request("/api/admins", { method: "POST", body: JSON.stringify(payload) }),
  updateAdmin: (
    id: number,
    payload: { permissions?: string[]; dataLimit?: number; password?: string },
  ) => request(`/api/admins/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteAdmin: (id: number) => request(`/api/admins/${id}`, { method: "DELETE" }),
  trafficStats: () =>
    request<{
      server: { ts: number; up: number; down: number }[];
      inbounds: { inbound_tag: string; up: number; down: number }[];
    }>("/api/stats/traffic"),
  routing: () => request<import("./types").RoutingRule[]>("/api/routing"),
  addRouting: (domain: string, inboundIds: number[]) =>
    request<import("./types").RoutingRule>("/api/routing", {
      method: "POST",
      body: JSON.stringify({ domain, inboundIds }),
    }),
  updateRouting: (id: number, inboundIds: number[]) =>
    request(`/api/routing/${id}`, { method: "PUT", body: JSON.stringify({ inboundIds }) }),
  deleteRouting: (id: number) => request(`/api/routing/${id}`, { method: "DELETE" }),
  getBot: () => request<import("./types").BotConfig>("/api/bot"),
  saveBot: (payload: Partial<import("./types").BotConfig>) =>
    request("/api/bot", { method: "PUT", body: JSON.stringify(payload) }),
  testBot: (token: string, chatIds: string[]) =>
    request("/api/bot/test", { method: "POST", body: JSON.stringify({ token, chatIds }) }),
};

export function exportBackupUrl(): string {
  return "/api/backup/export";
}
