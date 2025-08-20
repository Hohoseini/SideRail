import type { Inbound, UserWithInbounds } from "./types.js";

interface LinkContext {
  host: string;
  user: UserWithInbounds;
  inbound: Inbound;
}

function label(host: string, inbound: Inbound): string {
  return `${inbound.tag}@${host}`;
}

function commonQuery(ctx: LinkContext): Record<string, string> {
  const { inbound, user, host } = ctx;
  const q: Record<string, string> = {
    security: "tls",
    sni: host,
    host,
    fp: user.fingerprint || "chrome",
  };
  if (user.alpn) q.alpn = user.alpn;
  q.type = inbound.transport === "xhttp" ? "xhttp" : inbound.transport;
  q.path = inbound.path;
  if (inbound.transport === "ws" || inbound.transport === "httpupgrade") {
    q.headerType = "none";
  }
  return q;
}

function qs(params: Record<string, string>): string {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
}

function vlessLink(ctx: LinkContext): string {
  const { user, host } = ctx;
  const query = qs({ ...commonQuery(ctx), encryption: "none" });
  return `vless://${user.uuid}@${host}:443?${query}#${encodeURIComponent(label(host, ctx.inbound))}`;
}

function trojanLink(ctx: LinkContext): string {
  const { user, host } = ctx;
  const query = qs(commonQuery(ctx));
  return `trojan://${encodeURIComponent(user.password)}@${host}:443?${query}#${encodeURIComponent(
    label(host, ctx.inbound),
  )}`;
}

function vmessLink(ctx: LinkContext): string {
  const { user, inbound, host } = ctx;
  const obj = {
    v: "2",
    ps: label(host, inbound),
    add: host,
    port: "443",
    id: user.uuid,
    aid: "0",
    scy: "auto",
    net: inbound.transport === "xhttp" ? "xhttp" : inbound.transport,
    type: "none",
    host,
    path: inbound.path,
    tls: "tls",
    sni: host,
    alpn: user.alpn || "",
    fp: user.fingerprint || "chrome",
  };
  return "vmess://" + Buffer.from(JSON.stringify(obj)).toString("base64");
}

export function buildLink(ctx: LinkContext): string {
  switch (ctx.inbound.protocol) {
    case "vless":
      return vlessLink(ctx);
    case "trojan":
      return trojanLink(ctx);
    case "vmess":
      return vmessLink(ctx);
  }
}

export function buildUserLinks(
  host: string,
  user: UserWithInbounds,
  inbounds: Inbound[],
): { tag: string; protocol: string; transport: string; link: string }[] {
  return inbounds
    .filter((ib) => ib.enabled && user.inbound_ids.includes(ib.id))
    .map((inbound) => ({
      tag: inbound.tag,
      protocol: inbound.protocol,
      transport: inbound.transport,
      link: buildLink({ host, user, inbound }),
    }));
}
