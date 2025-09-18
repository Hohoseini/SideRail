<div align="center">

# ⚡ **SideRail**

### **A modern, neobrutalist VPN management panel powered by Xray-core**

**One-click deploy on Railway — VLESS · VMess · Trojan over WebSocket, XHTTP & HTTPUpgrade**

<br/>

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Xray](https://img.shields.io/badge/Xray--core-v26.9.9-000000?style=for-the-badge&logo=v&logoColor=white)](https://github.com/XTLS/Xray-core)
[![Protocol](https://img.shields.io/badge/Protocol-VLESS%20%2B%20VMess%20%2B%20Trojan-blue?style=for-the-badge)](#)
[![Platform](https://img.shields.io/badge/Platform-Railway-8b5cf6?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app)
[![Made with TypeScript](https://img.shields.io/badge/Built%20with-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#)

</div>

---

## ✨ **Overview**

**SideRail** is a self-hosted control panel for [Xray-core](https://github.com/XTLS/Xray-core) built to run on **Railway** with a single click. It focuses on **HTTP-based transports** that survive behind a TLS-terminating edge, so every client link is clean, standard, and `security=tls` on port `443`.

The interface uses a bold **neobrutalist** design language — thick borders, hard shadows, animated icons — and is **fully responsive** from phone to desktop.

---

## 🚀 **One-Click Deploy**

**SideRail is built to fork-and-deploy:**

1. **Fork** this repository into your own GitHub account.
2. Head to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** and pick your fork.
3. Railway reads the `Dockerfile` and `railway.json`, builds the image, and boots the panel.
4. Add a **Volume** mounted at `/data` so your database and the Xray binary persist across deploys.
5. Open the generated `*.up.railway.app` domain — you land on the **Setup** page to create your admin account.

**That's it.** Xray-core `v26.9.9` is downloaded automatically on first boot.

### **Environment variables**

| **Variable** | **Default** | **Description** |
| --- | --- | --- |
| `JWT_SECRET` | _(generate!)_ | Signs admin session cookies. Use a long random string. |
| `XRAY_VERSION` | `v26.9.9` | Xray-core release fetched on first boot. |
| `SIDERAIL_DATA_DIR` | `/data` | Persistent data directory (mount a volume here). |
| `PORT` | `8080` | HTTP port (Railway injects this automatically). |
| `PUBLIC_DOMAIN` | _(auto)_ | Override for custom domains. Falls back to `RAILWAY_PUBLIC_DOMAIN`. |
| `XRAY_API_PORT` | `10085` | Internal Xray stats API port. |
| `XRAY_INBOUND_BASE_PORT` | `20000` | Base port for internal inbound listeners. |

---

## 🧭 **Features**

- **📊 Dashboard** — live **CPU, RAM, Swap and Storage** metrics, plus one-click **Backup & Restore** (export/import users and inbounds as JSON).
- **👥 Users** — create clients with a rich form; summary cards for **Clients / Online / Active / Depleting**; a full table with **actions, traffic, speed, remaining data and duration**.
- **📜 Activity Log** — a live timeline of every administrative event.
- **⚙️ Settings** — change your admin **username/password** directly from the panel, and enable/disable the seeded inbounds.
- **🧩 Setup page** — first-run flow to create the administrator account.
- **🔗 Subscription pages** — a gorgeous, responsive **per-user page** with usage chart, download/upload, expiry, and **QR codes** for each config plus the whole subscription. The same URL serves a base64 subscription to VPN clients and the visual page to browsers.

---

## 🏗️ **Architecture**

```
apps/
├─ web/           React + Vite + Tailwind (neobrutalism) frontend
│  └─ src/
│     ├─ components/ui/   Reusable neobrutalist primitives
│     ├─ pages/           Dashboard, Users, Activity, Settings, Setup, Login, Subscription
│     └─ lib/             API client, auth context, helpers
└─ server/        Express + Node (node:sqlite) backend
   └─ src/
      ├─ xray.ts          Binary fetch, process manager, traffic stats
      ├─ xray-config.ts   Config builder (sniffing fully disabled)
      ├─ tunnel.ts        WS/HTTPUpgrade via net.Socket, XHTTP via http-proxy
      ├─ links.ts         VLESS/VMess/Trojan link generation
      ├─ inbounds.ts      Default inbound seeding + enable/disable
      ├─ users.ts         User model, traffic reset, sub-token logic
      └─ routes.ts        Authenticated REST API
```

### **How traffic flows**

- **TLS is terminated at the Railway edge.** All client links are generated with `security=tls` on port `443`.
- Each inbound gets a **unique internal port** and a **unique path**.
- The Node process routes inbound requests to Xray:
  - **WebSocket / HTTPUpgrade** → piped raw with `net.Socket`.
  - **XHTTP** → forwarded through an HTTP proxy.
- Only **HTTP-based transports** are supported: `ws`, `httpupgrade`, `xhttp`. Raw TCP, gRPC, WireGuard and Hysteria are intentionally **not** included because they don't survive the edge.

### **Default inbounds (auto-seeded)**

Inbound creation is disabled by design — you only **enable/disable** these:

| **Tag** | **Protocol** | **Transport** |
| --- | --- | --- |
| VLESS-WS | VLESS | WebSocket |
| VLESS-XHTTP | VLESS | XHTTP |
| VMess-WS | VMess | WebSocket |
| Trojan-WS | Trojan | WebSocket |
| VLESS-HTTPUpgrade | VLESS | HTTPUpgrade |

### **⚠️ Sniffing is disabled**

Sniffing is turned **completely off** in the generated Xray config. `destOverride` with `quic` is known to **panic and crash** the core, so SideRail never enables it.

---

## 👤 **User model**

Each user supports:

`email` · `uuid` · `password` · `sub_token` · `fingerprint (uTLS)` · `alpn` · `dataLimit (GB)` · `ipLimit` · `expireDays` · `subExpireDays` (link invalidates N days after first visit) · `trafficReset` (never/daily/weekly/monthly) · `telegramId` · `comment` · attached inbounds.

---

## 🛠️ **Tech stack**

**Backend:** Node.js (Express) in **TypeScript**, using the built-in `node:sqlite` module (no native build step), `http-proxy` and raw `net.Socket` for tunneling.

**Frontend:** **React + Vite + TypeScript**, styled with **Tailwind CSS** following the [neobrutalism.dev](https://www.neobrutalism.dev) design system, animated [Lucide](https://lucide.dev) icons, TanStack Query, Recharts, and `qrcode`.

---

## 💻 **Local development**

Requires **Node.js ≥ 22.5** (Node 24 recommended).

```bash
npm install          # install all workspaces
npm run dev          # web on :5173, server on :8080 (proxied)
```

Production build:

```bash
npm run build        # builds web + server
npm start            # serves the API + built frontend on :8080
```

The server serves the built frontend **and** the subscription pages from a single port, so it behaves identically locally and on Railway.

---

## 🔒 **Security notes**

- The panel is protected by an admin account created during setup; sessions are **JWT cookies** signed with `JWT_SECRET`.
- Always set a **strong** `JWT_SECRET` in production.
- Subscription tokens are random 24-char strings and can be **rotated per user** from the table.

---

## 📈 **Star History**

<a href="https://www.star-history.com/#icubaby/SideRail&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=icubaby/SideRail&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=icubaby/SideRail&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=icubaby/SideRail&type=Date" />
  </picture>
</a>

---

## 💖 **Support the Project**

**If you find SideRail useful, consider supporting its continued development.**

| **Network** | **Address** |
| --- | --- |
| **Bitcoin (BTC)** | `bc1qx48j9lj989y5c9z8ewpgul2ed69mr50j97a0sk` |
| **Ethereum (ETH)** | `0xF2ba522fD846F83D84131D433f56F885740cFc47` |
| **Litecoin (LTC)** | `ltc1qh6y8ld27fdleuy3r7gykxxg38rkawl7adzc0dw` |
| **Gram (TON)** | `UQBGN4jXPW44cWQ20EGWqX7sU6K4RlYbnolc3IHoT3UWtmvW` |

---

## 📄 **License**

[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

Released under the **MIT License**.
