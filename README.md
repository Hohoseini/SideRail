<div align="center">

<img src="apps/web/public/favicon.svg" width="96" height="96" alt="SideRail logo" />

# **SideRail**

### **A modern, neobrutalist VPN management panel powered by Xray-core**

**One-click deploy on Railway — VLESS · VMess · Trojan over WebSocket, XHTTP & HTTPUpgrade**

<br/>

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new)

<br/>

[![License](https://img.shields.io/badge/License-MIT-a3e635?style=for-the-badge)](LICENSE)
[![Xray](https://img.shields.io/badge/Xray--core-v26.9.9-000000?style=for-the-badge)](https://github.com/XTLS/Xray-core)
[![Protocol](https://img.shields.io/badge/Protocol-VLESS%20%2B%20VMess%20%2B%20Trojan-2563eb?style=for-the-badge)](#)
[![Platform](https://img.shields.io/badge/Platform-Railway-8b5cf6?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app)
[![TypeScript](https://img.shields.io/badge/Built%20with-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![React](https://img.shields.io/badge/UI-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#)

</div>

---

## ✨ **What is SideRail?**

**SideRail** is a self-hosted control panel for [Xray-core](https://github.com/XTLS/Xray-core), built to run on **[Railway](https://railway.app)** with a single click. It is designed for one specific, reliable setup: **HTTP-based transports behind a TLS-terminating edge**, so every client link is clean, standard, and always `security=tls` on port `443`.

The interface is built with a bold **neobrutalist** design — thick borders, hard shadows, animated icons — and is **fully responsive**, looking great on both desktop and mobile.

> **In short:** fork the repo, deploy it on Railway, open the panel, create your account. Done.

---

## 🧭 **Full feature list**

### 📊 Dashboard
- Live **CPU, RAM, Swap and Storage** metrics that refresh automatically.
- One-click **Backup & Restore** — export/import **users, inbounds, admins and settings** as a single JSON file.

### 👥 Users
- Create clients with a clean form: name, data limit (GB), expiry (days), attached inbounds, plus advanced options (UUID, Trojan password, uTLS fingerprint, ALPN, IP limit, traffic reset).
- Summary cards: **Clients / Online / Active / Depleting**.
- Full table with per-user **actions, enable toggle, live online status, traffic bar, remaining data and duration** — fully responsive with card view on mobile.
- **Connected IPs**: see the real IP addresses currently connected to each client.
- Per-user actions: copy sub link, open sub page, reset traffic, rotate sub token, delete.

### 🔌 Inbounds
- Five HTTP-based inbounds are **auto-seeded** on first boot: `VLESS-WS`, `VLESS-XHTTP`, `VMess-WS`, `Trojan-WS`, `VLESS-HTTPUpgrade`.
- You only **enable/disable** them — no manual inbound creation (that's the point).
- Each inbound gets a unique internal port and a unique `/SideRail/...` path.

### 📜 Activity Log
- A live timeline of every administrative event (logins, user changes, inbound toggles, backups, and more).

### ⚙️ Settings & Admins
- Change your own **username and password** from the panel.
- **Role-based access**: the account created during setup is the **Owner** 👑.
- The Owner can **add Admins**, choose exactly which pages each admin can access (Dashboard / Users / Inbounds / Activity), and set a **data quota (GB)** per admin.
- Admins only see and manage **their own users**; the Owner sees everything, with a tag showing which admin created each user.
- Admins **cannot** reach Settings or manage other admins.

### 🔗 Subscription pages
- A gorgeous, responsive **per-user page** with a live **usage chart**, download/upload totals, expiry, and status.
- **QR codes** for each individual config and for the whole subscription.
- The same URL serves a base64 subscription to VPN clients and the visual page to browsers.

### 🛡️ Security
- Admin sessions via signed JWT cookies (secret auto-generated & persisted).
- Built-in **rate limiting** to blunt DDoS / brute-force attempts.
- **Sniffing is fully disabled** in the Xray config (`destOverride` with `quic` is known to crash the core).

---

## 🚀 **Deploy on Railway (step by step)**

You don't need to touch a single line of code. Just follow along:

### 1. Fork this repository
Click the **Fork** button at the top-right of this page to copy the project into your own GitHub account.

### 2. Create a Railway project
- Go to **[railway.app](https://railway.app)** and sign in with GitHub.
- Click **New Project → Deploy from GitHub repo**.
- Pick your **forked SideRail** repository.

### 3. Deploy
- Railway automatically reads the `Dockerfile` and `railway.json` and starts building.
- Wait for the build to finish and the service to boot.

### 4. ⚠️ Expose port **8080** (important!)
SideRail listens on port **`8080`**. Railway must publish this exact port:
- Open your service → **Settings → Networking**.
- Click **Generate Domain**.
- When asked for the port, enter **`8080`**.

> **This is the only port you need to expose.** The other ports you may see (`10085`, `20000–20004`) are Xray's internal ports bound to `127.0.0.1` — they are private and must **not** be exposed.

### 5. (Optional) Add a volume for persistence
By default your data resets on each redeploy. To keep users, admins and settings across deploys:
- Open your service → attach a **Volume** mounted at **`/data`**.

### 6. Open your panel
- Open the generated `*.up.railway.app` domain.
- You'll land on the **Setup** page — create your **Owner** account and you're in. 🎉

Xray-core `v26.9.9` is downloaded automatically on first boot, and the session secret is generated for you — **no environment variables are required**.

---

## 🔧 **Environment variables (all optional)**

| **Variable** | **Default** | **Description** |
| --- | --- | --- |
| `PORT` | `8080` | HTTP port. **Expose this one on Railway.** |
| `JWT_SECRET` | _(auto-generated)_ | Signs admin session cookies. Generated & persisted automatically if unset. |
| `XRAY_VERSION` | `v26.9.9` | Xray-core release fetched on first boot. |
| `SIDERAIL_DATA_DIR` | `/data` | Persistent data directory (mount a volume here). |
| `PUBLIC_DOMAIN` | _(auto)_ | Override for a custom domain. Falls back to `RAILWAY_PUBLIC_DOMAIN`. |
| `XRAY_API_PORT` | `10085` | Internal Xray stats API port. |
| `XRAY_INBOUND_BASE_PORT` | `20000` | Base port for internal inbound listeners. |

---

## 🏗️ **Architecture**

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

### How traffic flows
- **TLS is terminated at the Railway edge.** All client links use `security=tls` on port `443`.
- The Node process routes inbound requests to Xray:
  - **WebSocket / HTTPUpgrade** → piped raw with `net.Socket`.
  - **XHTTP** → forwarded through an HTTP proxy.
- Only **HTTP-based transports** work: `ws`, `httpupgrade`, `xhttp`. Raw TCP, gRPC, WireGuard and Hysteria are intentionally **not** supported because they don't survive the edge.

---

## 🛠️ **Tech stack**

**Backend:** Node.js (Express) in **TypeScript**, using the built-in `node:sqlite` module (no native build step).

**Frontend:** **React + Vite + TypeScript**, styled with **Tailwind CSS** following the [neobrutalism.dev](https://www.neobrutalism.dev) design system, with [Lucide](https://lucide.dev) icons, TanStack Query, Recharts, and `qrcode`.

---

## 💻 **Local development**

Requires **Node.js ≥ 22.5** (Node 24 recommended).

```bash
npm install     # install all workspaces
npm run dev     # web on :5173, server on :8080 (proxied)
```

Production build:

```bash
npm run build   # builds web + server
npm start       # serves API + built frontend on :8080
```

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

[![License](https://img.shields.io/badge/License-MIT-a3e635?style=for-the-badge)](LICENSE)

Released under the **MIT License**.
