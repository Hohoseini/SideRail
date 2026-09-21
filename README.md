<div align="center">

<img src=".github/banner.svg" width="100%" alt="SideRail" />

<br/>
<br/>

<a href="https://railway.com/new">
  <img src=".github/deploy-button.svg" alt="Deploy on Railway" height="56" />
</a>

<br/>
<br/>

<a href="LICENSE"><img src=".github/badges/license.svg" alt="License" height="40" /></a>
<a href="https://github.com/XTLS/Xray-core"><img src=".github/badges/xray.svg" alt="Xray-core" height="40" /></a>
<img src=".github/badges/protocols.svg" alt="Protocols" height="40" />
<br/>
<img src=".github/badges/transports.svg" alt="Transports" height="40" />
<a href="https://www.typescriptlang.org"><img src=".github/badges/typescript.svg" alt="TypeScript" height="40" /></a>
<a href="https://react.dev"><img src=".github/badges/react.svg" alt="React + Vite" height="40" /></a>

<br/>
<br/>

**A modern, neobrutalist VPN management panel powered by [Xray-core](https://github.com/XTLS/Xray-core) — deploy to [Railway](https://railway.app) in one click.**

</div>

<br/>

> [!TIP]
> **Fork, deploy on Railway, expose port `8080`, open the panel.** That is the whole setup. No environment variables required.

<br/>

<img src=".github/sections/why.svg" width="380" alt="Why SideRail" />

<table>
<tr>
<td width="50%" valign="top">

**Built for one job, done right**

SideRail focuses on **HTTP-based transports behind a TLS-terminating edge**. Every client link is clean, standard, and always `security=tls` on port `443`.

</td>
<td width="50%" valign="top">

**Beautiful and responsive**

A bold **neobrutalist** interface with thick borders, hard shadows and animated icons that looks great on both desktop and mobile.

</td>
</tr>
<tr>
<td width="50%" valign="top">

**Zero-config deploy**

Xray-core downloads itself on first boot. The session secret is auto-generated. **No environment variables needed.**

</td>
<td width="50%" valign="top">

**Multi-admin ready**

An Owner can add Admins with scoped page access and per-admin data quotas. Admins only see their own users.

</td>
</tr>
</table>

<br/>

<img src=".github/sections/features.svg" width="380" alt="Features" />

<table>
<tr>
<td valign="top"><b>Dashboard</b></td>
<td>Live CPU, RAM, Swap and Storage metrics, plus one-click Backup &amp; Restore of users, inbounds, admins and settings.</td>
</tr>
<tr>
<td valign="top"><b>Users</b></td>
<td>Rich create form, summary cards, a fully responsive table, live <b>Connected IPs</b>, and per-user actions.</td>
</tr>
<tr>
<td valign="top"><b>Inbounds</b></td>
<td>Five HTTP inbounds auto-seeded on first boot. Enable or disable only, each with a unique port and <code>/SideRail/...</code> path.</td>
</tr>
<tr>
<td valign="top"><b>Activity Log</b></td>
<td>A live timeline of every administrative event.</td>
</tr>
<tr>
<td valign="top"><b>Settings &amp; Admins</b></td>
<td>Owner and Admin roles, scoped permissions, and per-admin data quotas.</td>
</tr>
<tr>
<td valign="top"><b>Subscription</b></td>
<td>A gorgeous per-user page with a live usage chart, QR codes and a base64 subscription for clients.</td>
</tr>
<tr>
<td valign="top"><b>Security</b></td>
<td>JWT sessions, built-in rate limiting, and sniffing fully disabled to prevent the QUIC crash.</td>
</tr>
</table>

<br/>

<img src=".github/sections/deploy.svg" width="380" alt="Deploy on Railway" />

**No code required. Just follow these steps:**

**1. Fork this repository** — click **Fork** at the top-right to copy it to your GitHub account.

**2. Create a Railway project** — go to **[railway.app](https://railway.app)**, then **New Project → Deploy from GitHub repo**, and pick your fork.

**3. Deploy** — Railway reads the `Dockerfile` and `railway.json` and builds automatically.

**4. Expose port `8080`** — open **Settings → Networking → Generate Domain**, and set the port to **`8080`**.

> [!IMPORTANT]
> SideRail listens on port **`8080`** — this is the **only** port you expose. The ports `10085` and `20000–20004` are Xray's internal ports bound to `127.0.0.1`; they are private and must **not** be exposed.

**5. Add a volume (optional)** — attach a **Volume** at **`/data`** so users, admins and settings survive redeploys.

**6. Open your panel** — visit the generated `*.up.railway.app` domain, land on the **Setup** page, and create your **Owner** account.

<br/>

<img src=".github/sections/env.svg" width="380" alt="Environment variables" />

**All optional.**

| Variable | Default | Description |
|:--|:--|:--|
| `PORT` | `8080` | HTTP port. **Expose this one on Railway.** |
| `JWT_SECRET` | *auto* | Signs admin session cookies. Auto-generated and persisted if unset. |
| `XRAY_VERSION` | `v26.9.9` | Xray-core release fetched on first boot. |
| `SIDERAIL_DATA_DIR` | `/data` | Persistent data directory (mount a volume here). |
| `PUBLIC_DOMAIN` | *auto* | Override for a custom domain. Falls back to `RAILWAY_PUBLIC_DOMAIN`. |
| `XRAY_API_PORT` | `10085` | Internal Xray stats API port. |
| `XRAY_INBOUND_BASE_PORT` | `20000` | Base port for internal inbound listeners. |

<br/>

<img src=".github/sections/architecture.svg" width="380" alt="Architecture" />

```
apps/
├─ web/           React + Vite + Tailwind (neobrutalism) frontend
│  └─ src/
│     ├─ components/ui/   Reusable neobrutalist primitives
│     ├─ pages/           Dashboard · Users · Inbounds · Activity · Settings · Setup · Login · Subscription
│     └─ lib/             API client, auth context, helpers
└─ server/        Express + Node (node:sqlite) backend
   └─ src/
      ├─ xray.ts          Binary fetch, process manager, traffic stats, client IPs
      ├─ xray-config.ts   Config builder (sniffing fully disabled)
      ├─ tunnel.ts        WS/HTTPUpgrade via net.Socket, XHTTP via http-proxy
      ├─ links.ts         VLESS/VMess/Trojan link generation
      ├─ inbounds.ts      Default inbound seeding + enable/disable
      ├─ users.ts         User model, traffic reset, sub-token logic
      ├─ auth.ts          Owner/Admin roles, permissions, sessions
      ├─ ratelimit.ts     Rate limiting / brute-force protection
      └─ routes.ts        Authenticated REST API
```

**How traffic flows** — TLS is terminated at the Railway edge; all client links use `security=tls` on port `443`. The Node process routes **WebSocket/HTTPUpgrade** to Xray via raw `net.Socket`, and **XHTTP** through an HTTP proxy. Only `ws`, `httpupgrade` and `xhttp` are supported — raw TCP, gRPC, WireGuard and Hysteria are intentionally left out because they don't survive the edge.

<br/>

<img src=".github/sections/dev.svg" width="380" alt="Local development" />

**Requires Node.js ≥ 22.5 (Node 24 recommended).**

```bash
npm install     # install all workspaces
npm run dev     # web on :5173, server on :8080 (proxied)

npm run build   # production build (web + server)
npm start       # serve API + built frontend on :8080
```

<br/>

<img src=".github/sections/stars.svg" width="380" alt="Star history" />

<a href="https://www.star-history.com/#icubaby/SideRail&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=icubaby/SideRail&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=icubaby/SideRail&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=icubaby/SideRail&type=Date" width="80%" />
  </picture>
</a>

<br/>
<br/>

<img src=".github/sections/support.svg" width="380" alt="Support the project" />

**Built with countless late nights and a lot of coffee.** If SideRail powers your setup and saves you time, a small crypto tip goes straight into keeping it fast, secure and free for everyone.

<table>
  <tr>
    <td align="center" width="220">
      <img src="https://img.shields.io/badge/BITCOIN-BTC-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white&labelColor=0b0b0f" alt="Bitcoin" />
    </td>
    <td>

`bc1qx48j9lj989y5c9z8ewpgul2ed69mr50j97a0sk`

</td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://img.shields.io/badge/ETHEREUM-ETH-627EEA?style=for-the-badge&logo=ethereum&logoColor=white&labelColor=0b0b0f" alt="Ethereum" />
    </td>
    <td>

`0xF2ba522fD846F83D84131D433f56F885740cFc47`

</td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://img.shields.io/badge/LITECOIN-LTC-A6A9AA?style=for-the-badge&logo=litecoin&logoColor=white&labelColor=0b0b0f" alt="Litecoin" />
    </td>
    <td>

`ltc1qh6y8ld27fdleuy3r7gykxxg38rkawl7adzc0dw`

</td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://img.shields.io/badge/TON-GRAM-0098EA?style=for-the-badge&logo=ton&logoColor=white&labelColor=0b0b0f" alt="TON" />
    </td>
    <td>

`UQBGN4jXPW44cWQ20EGWqX7sU6K4RlYbnolc3IHoT3UWtmvW`

</td>
  </tr>
</table>

<br/>

<div align="center">

<a href="LICENSE"><img src=".github/badges/license.svg" alt="License" height="40" /></a>

**© 2025 icubaby — All rights reserved.** Attribution and repository links must remain intact in every deployment. See [LICENSE](LICENSE) for the full terms.

</div>
