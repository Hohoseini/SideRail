import net from "node:net";
import httpProxy from "http-proxy";
import type { Server, IncomingMessage } from "node:http";
import type { Socket } from "node:net";
import { listEnabledInbounds } from "./inbounds.js";
import type { Inbound } from "./types.js";

const xhttpProxy = httpProxy.createProxyServer({ ws: false, xfwd: true });
xhttpProxy.on("error", () => {});

function matchInbound(url: string | undefined): Inbound | null {
  if (!url) return null;
  const pathname = url.split("?")[0];
  const inbounds = listEnabledInbounds();
  for (const ib of inbounds) {
    if (pathname === ib.path || pathname.startsWith(ib.path + "/")) return ib;
  }
  return null;
}

function pipeToXray(req: IncomingMessage, clientSocket: Socket, head: Buffer, inbound: Inbound) {
  const upstream = net.connect(inbound.port, "127.0.0.1", () => {
    const headers = [`${req.method} ${req.url} HTTP/${req.httpVersion}`];
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      headers.push(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}`);
    }
    headers.push("\r\n");
    upstream.write(headers.join("\r\n"));
    if (head && head.length) upstream.write(head);
    clientSocket.pipe(upstream);
    upstream.pipe(clientSocket);
  });
  const kill = () => {
    upstream.destroy();
    clientSocket.destroy();
  };
  upstream.on("error", kill);
  clientSocket.on("error", kill);
}

export function attachTunnel(server: Server): void {
  server.on("upgrade", (req, socket, head) => {
    const inbound = matchInbound(req.url);
    if (!inbound) {
      socket.destroy();
      return;
    }
    pipeToXray(req, socket as Socket, head, inbound);
  });
}

export function tryTunnelHttp(req: IncomingMessage, res: import("node:http").ServerResponse): boolean {
  const inbound = matchInbound(req.url);
  if (!inbound || inbound.transport !== "xhttp") return false;
  xhttpProxy.web(req, res, { target: `http://127.0.0.1:${inbound.port}` });
  return true;
}
