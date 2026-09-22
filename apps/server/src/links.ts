/**
 * SideRail - Xray-core VPN management panel
 * Copyright (c) 2025 icubaby. All rights reserved.
 * Official repository: https://github.com/icubaby/SideRail
 *
 * Licensed under the SideRail Proprietary License (see LICENSE).
 * Unauthorized selling, white-labeling, or removal of attribution,
 * branding, or the embedded authorship identifiers is prohibited.
 * Watermark: sr-icubaby-2025-9f4c1a7e
 */
import type { Inbound, UserWithInbounds } from "./types.js";

interface LinkContext {
  host: string;
  user: UserWithInbounds;
  inbound: Inbound;
}

function label(inbound: Inbound): string {
  return `icubaby/SideRail - ${inbound.tag}`;
}

function commonQuery(ctx: LinkContext): Record<string, string> {
  const { inbound, user, host } = ctx;
  const q: Record<string, string> = {
    security: "tls",
    sni: host,
    host,
    fp: user.fingerprint || "chrome",
  };
  q.type = inbound.transport === "xhttp" ? "xhttp" : inbound.transport;
  q.path = inbound.path;
  if (inbound.transport === "ws" || inbound.transport === "httpupgrade") {
    q.alpn = "http/1.1";
    q.headerType = "none";
  } else {
    q.alpn = user.alpn || "h2,http/1.1";
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
  return `vless://${user.uuid}@${host}:443?${query}#${encodeURIComponent(label(ctx.inbound))}`;
}

function trojanLink(ctx: LinkContext): string {
  const { user, host } = ctx;
  const query = qs(commonQuery(ctx));
  return `trojan://${encodeURIComponent(user.password)}@${host}:443?${query}#${encodeURIComponent(
    label(ctx.inbound),
  )}`;
}

function vmessLink(ctx: LinkContext): string {
  const { user, inbound, host } = ctx;
  const obj = {
    v: "2",
    ps: label(inbound),
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
