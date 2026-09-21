<div align="center">

<img src=".github/banner.svg" width="100%" alt="SideRail" />

<br/>
<br/>

<a href="https://railway.com/new">
  <img src="https://img.shields.io/badge/%F0%9F%9A%80%20Deploy%20on%20Railway-a3e635?style=for-the-badge&labelColor=0b0b0f&color=a3e635" alt="Deploy on Railway" height="46" />
</a>

<br/>
<br/>

![License](https://img.shields.io/badge/License-MIT-a3e635?style=flat-square&labelColor=0b0b0f)
![Xray](https://img.shields.io/badge/Xray--core-v26.9.9-a3e635?style=flat-square&labelColor=0b0b0f)
![Protocols](https://img.shields.io/badge/VLESS%20·%20VMess%20·%20Trojan-a3e635?style=flat-square&labelColor=0b0b0f)
![Transports](https://img.shields.io/badge/WS%20·%20XHTTP%20·%20HTTPUpgrade-a3e635?style=flat-square&labelColor=0b0b0f)
![TypeScript](https://img.shields.io/badge/TypeScript-a3e635?style=flat-square&labelColor=0b0b0f&logo=typescript&logoColor=a3e635)
![React](https://img.shields.io/badge/React%20+%20Vite-a3e635?style=flat-square&labelColor=0b0b0f&logo=react&logoColor=a3e635)

<br/>

**A modern, neobrutalist VPN management panel powered by [Xray-core](https://github.com/XTLS/Xray-core) — deploy to [Railway](https://railway.app) in one click.**

</div>

<br/>

> [!TIP]
> **Fork → Deploy on Railway → Expose port `8080` → Open the panel.** That's the whole setup. No env vars required.

<br/>

## ✨ Why SideRail?

<table>
<tr>
<td width="50%" valign="top">

**🎯 Built for one job, done right**

SideRail focuses on **HTTP-based transports behind a TLS-terminating edge**. Every client link is clean, standard, and always `security=tls` on port `443`.

</td>
<td width="50%" valign="top">

**🎨 Beautiful & responsive**

A bold **neobrutalist** interface — thick borders, hard shadows, animated icons — that looks great on both desktop and mobile.

</td>
</tr>
<tr>
<td width="50%" valign="top">

**⚡ Zero-config deploy**

Xray-core downloads itself on first boot. The session secret is auto-generated. No environment variables needed.

</td>
<td width="50%" valign="top">

**👑 Multi-admin ready**

An Owner can add Admins with scoped page access and per-admin data quotas. Admins only see their own users.

</td>
</tr>
</table>

<br/>

## 🧭 Features at a glance

| | Feature | Details |
|:--:|:--|:--|
| 📊 | **Dashboard** | Live CPU / RAM / Swap / Storage · one-click Backup & Restore (users, inbounds, admins, settings) |
| 👥 | **Users** | Rich create form, summary cards, responsive table, live **Connected IPs**, per-user actions |
| 🔌 | **Inbounds** | 5 auto-seeded HTTP inbounds — enable/disable only, unique port + `/SideRail/...` path each |
| 📜 | **Activity Log** | Live timeline of every administrative event |
| ⚙️ | **Settings & Admins** | Owner/Admin roles, scoped permissions, per-admin data quotas |
| 🔗 | **Subscription** | Gorgeous per-user page — usage chart, QR codes, base64 sub for clients |
| 🛡️ | **Security** | JWT sessions · built-in rate limiting · sniffing fully disabled (no QUIC crash) |

<br/>

## 🚀 Deploy on Railway

No code required. Just follow these steps:

**1. Fork this repository** — click **Fork** at the top-right to copy it to your GitHub.

**2. Create a Railway project** — go to **[railway.app](https://railway.app)** → **New Project** → **Deploy from GitHub repo** → pick your fork.

**3. Deploy** — Railway reads the `Dockerfile` and `railway.json` and builds automatically.

**4. ⚠️ Expose port `8080`** — open **Settings → Networking → Generate Domain**, and set the port to **`8080`**.

> [!IMPORTANT]
> SideRail listens on port **`8080`** — this is the **only** port you expose. The ports `10085` and `20000–20004` are Xray's internal ports bound to `127.0.0.1`; they are private and must **not** be exposed.

**5. (Optional) Add a volume** — attach a **Volume** at **`/data`** so users, admins and settings survive redeploys.

**6. Open your panel** — visit the generated `*.up.railway.app` domain, land on the **Setup** page, and create your **Owner** account. 🎉

<br/>

## 🔧 Environment variables (all optional)

| Variable | Default | Description |
|:--|:--|:--|
| `PORT` | `8080` | HTTP port. **Expose this one on Railway.** |
| `JWT_SECRET` | _auto_ | Signs admin session cookies. Auto-generated & persisted if unset. |
| `XRAY_VERSION` | `v26.9.9` | Xray-core release fetched on first boot. |
| `SIDERAIL_DATA_DIR` | `/data` | Persistent data directory (mount a volume here). |
| `PUBLIC_DOMAIN` | _auto_ | Override for a custom domain. Falls back to `RAILWAY_PUBLIC_DOMAIN`. |
| `XRAY_API_PORT` | `10085` | Internal Xray stats API port. |
| `XRAY_INBOUND_BASE_PORT` | `20000` | Base port for internal inbound listeners. |

<br/>

## 🏗️ Architecture

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

## 🛠️ Tech stack

**Backend** — Node.js (Express) in **TypeScript**, using the built-in `node:sqlite` module (no native build step).

**Frontend** — **React + Vite + TypeScript**, styled with **Tailwind CSS** following the [neobrutalism.dev](https://www.neobrutalism.dev) design system, with [Lucide](https://lucide.dev) icons, TanStack Query, Recharts, and `qrcode`.

<br/>

## 💻 Local development

Requires **Node.js ≥ 22.5** (Node 24 recommended).

```bash
npm install     # install all workspaces
npm run dev     # web on :5173, server on :8080 (proxied)

npm run build   # production build (web + server)
npm start       # serve API + built frontend on :8080
```

<br/>

## 📈 Star History

<a href="https://www.star-history.com/#icubaby/SideRail&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=icubaby/SideRail&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=icubaby/SideRail&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=icubaby/SideRail&type=Date" width="70%" />
  </picture>
</a>

<br/>
<br/>

## 💖 Support the Project

<div align="center">

**If SideRail is useful to you, a small donation keeps it moving forward.** 🚀

</div>

<br/>

<table>
  <tr>
    <td align="center" width="25%">
      <img src="https://img.shields.io/badge/Bitcoin-BTC-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white&labelColor=0b0b0f" alt="Bitcoin" />
    </td>
    <td>

`bc1qx48j9lj989y5c9z8ewpgul2ed69mr50j97a0sk`

</td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://img.shields.io/badge/Ethereum-ETH-627EEA?style=for-the-badge&logo=ethereum&logoColor=white&labelColor=0b0b0f" alt="Ethereum" />
    </td>
    <td>

`0xF2ba522fD846F83D84131D433f56F885740cFc47`

</td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://img.shields.io/badge/Litecoin-LTC-A6A9AA?style=for-the-badge&logo=litecoin&logoColor=white&labelColor=0b0b0f" alt="Litecoin" />
    </td>
    <td>

`ltc1qh6y8ld27fdleuy3r7gykxxg38rkawl7adzc0dw`

</td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://img.shields.io/badge/TON-Gram-0098EA?style=for-the-badge&logo=ton&logoColor=white&labelColor=0b0b0f" alt="TON" />
    </td>
    <td>

`UQBGN4jXPW44cWQ20EGWqX7sU6K4RlYbnolc3IHoT3UWtmvW`

</td>
  </tr>
</table>

<br/>

<div align="center">

[![License](https://img.shields.io/badge/License-MIT-a3e635?style=for-the-badge&labelColor=0b0b0f)](LICENSE)

</div>
