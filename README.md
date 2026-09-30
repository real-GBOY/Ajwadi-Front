# Ajwadi: freelancer marketplace admin dashboard

![React 18](https://img.shields.io/badge/React-18-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6) ![Vite 5](https://img.shields.io/badge/Vite-5-646cff) ![Tailwind 3](https://img.shields.io/badge/Tailwind-3-06b6d4) ![English + Arabic](https://img.shields.io/badge/i18n-AR%20%2B%20EN%20(RTL)-2ea44f) ![Vercel](https://img.shields.io/badge/deployed-Vercel-black)

**Live:** https://ajwadi-front.vercel.app

Ajwadi is the back office of a freelancer marketplace. Staff see the health of the marketplace at a glance,
manage clients, freelancers and employees, review identity and experience demands, resolve complaints, follow
money through wallets and escrow, approve withdrawals, and watch projects and contracts move from start to
finish. The dashboard is **Arabic first** and switches to English with one click.

This repository is the **admin dashboard**. It talks to the Ajwadi REST API and WebSocket server in the
separate `Ajwadi/Back` project.

![Dashboard](docs/screenshots/03-dashboard.png)

---

## Contents

- [What it does](#what-it-does)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Internationalization](#internationalization)
- [Deployment](#deployment)
- [Demo account](#demo-account)
- [Known limitations](#known-limitations)

---

## What it does

| Area | What people do there |
|---|---|
| **Dashboard** | Totals for freelancers, clients, projects and revenue with period comparison, active vs completed projects over time, projects by category, transactions over time |
| **Users** | Clients, freelancers and employees, each with a detail page (identity, projects, proposals, contracts, tags) |
| **App data** | Skills, specifications, privacy policy (per language) and tags that drive the marketplace |
| **Demands** | Identity verification, tag and experience demands awaiting review |
| **Complaints** | Public complaints and project complaints, with a live count in the sidebar |
| **Finance** | Transactions, withdrawal demands, taxed transactions and top-ups |
| **Projects** | Projects and contracts with their own detail pages and approval states |
| **Push notifications** | Compose and send notifications to users |
| **Chat** | Start a conversation with a client or freelancer from their profile |

Across the whole app:

- **Arabic (RTL) and English**, switched from the sidebar without a reload.
- **Role-based access**, with the seeded super administrator able to do everything.
- **Live counters** for complaints and pending demands in the sidebar.
- **Phone layout** with a collapsible sidebar.

## Screenshots

| | |
|---|---|
| **Sign in** ![Sign in](docs/screenshots/01-login.png) | **Dashboard, Arabic (RTL)** ![Dashboard Arabic](docs/screenshots/02-dashboard-arabic-rtl.png) |
| **Dashboard** ![Dashboard](docs/screenshots/03-dashboard.png) | **Clients** ![Clients](docs/screenshots/04-clients.png) |
| **Client detail** ![Client detail](docs/screenshots/05-client-detail.png) | **Freelancers** ![Freelancers](docs/screenshots/06-freelancers.png) |
| **Employees** ![Employees](docs/screenshots/07-employees.png) | **Skills** ![Skills](docs/screenshots/08-skills.png) |
| **Privacy policy** ![Privacy policy](docs/screenshots/09-privacy-policy.png) | **Public complaints** ![Public complaints](docs/screenshots/10-public-complaints.png) |
| **Project complaints** ![Project complaints](docs/screenshots/11-project-complaints.png) | **Transactions** ![Transactions](docs/screenshots/12-transactions.png) |
| **Withdrawal demands** ![Withdrawal demands](docs/screenshots/13-withdraw-demands.png) | **Projects** ![Projects](docs/screenshots/14-projects.png) |
| **Contracts** ![Contracts](docs/screenshots/15-contracts.png) | **Push notifications** ![Push notifications](docs/screenshots/16-push-notifications.png) |

**On a phone**

<img src="docs/screenshots/17-dashboard-mobile.png" alt="Dashboard on a phone" width="260">

All data in the screenshots is synthetic demo data.

## Architecture

```
   Browser (this repo)                          Ajwadi API (Ajwadi/Back)             Data
   React 18 · Vite · Tailwind 3                 Express 5 · Sequelize
   ┌────────────────────────────┐   HTTPS      ┌──────────────────────────┐   ┌──────────────────┐
   │ pages → components         │ ───────────► │ Routes → Controller →    │ ─►│ PostgreSQL       │
   │ hooks (TanStack Query)     │   Bearer JWT │ Service → Repository     │   │ Redis / Valkey   │
   │ services (Axios client)    │ ◄─────────── │                          │   └──────────────────┘
   │ socketService (Socket.IO)  │  WebSocket   │ Socket.IO · chat proxy   │
   └────────────────────────────┘              └──────────────────────────┘
```

The dashboard holds no business rules. The API decides what each role may see and do, and the UI renders that.

| Principle | How it shows up |
|---|---|
| **Server state lives in TanStack Query** | Lists and details come from query hooks, with caching and invalidation after mutations. |
| **One design system** | Shared tables, modals, cards and form controls live in `src/designSystem`. |
| **Arabic first** | Every string is translated through i18next, and layout direction flips with the language. |
| **One place for the API address** | `src/config/axios.ts` and `src/services/socketService.ts` read it from the environment. |

## Tech stack

| Layer | Choices |
|---|---|
| Build | Vite 5, TypeScript |
| UI | React 18, Tailwind CSS 3, Recharts |
| Data | TanStack Query, TanStack Table, Axios |
| Routing | React Router v7 |
| i18n | i18next (Arabic and English, RTL) |
| Real-time | Socket.IO client |
| Documents | html2pdf.js for PDF export |

## Getting started

Prerequisites: Node.js v20+ and pnpm (or npm).

```bash
pnpm install
printf "VITE_API_BASE_URL=http://localhost:5000/api\nVITE_WS_URL=http://localhost:5000\n" > .env
pnpm dev
```

The app expects a running Ajwadi API (`Ajwadi/Back`).

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Vite development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview the production build locally |
| `pnpm lint` | Run ESLint over the project |
| `pnpm typecheck` | Run `tsc --noEmit` against `tsconfig.app.json` |

## Environment variables

```bash
VITE_API_BASE_URL=http://localhost:5000/api   # REST API base URL
VITE_WS_URL=http://localhost:5000             # WebSocket (Socket.IO) origin
```

`.env` is gitignored, so Vercel never reads it. On Vercel these are **Production environment variables** on the
`ajwadi-front` project, and they override the fallbacks in `src/config/axios.ts` and
`src/services/socketService.ts`. After changing them, redeploy with `vercel --prod`.

## Project structure

```
src/
├── components/       Cards, charts, modals, sidebar and forms (UserCard, ProjectCard, ContractCard, TransactionsChart, ...)
├── pages/            Route-level pages (auth, dashboard, users, finance, projects, ...)
├── designSystem/     Shared UI primitives (tables, modals, cards, form controls)
├── layouts/          App shell with sidebar and header
├── routes/           React Router route definitions and guards
├── services/         API clients and the socket service
├── hooks/            Query hooks grouped by domain (users, projects, contracts, wallet, withdrawals, complaints, demands, ...)
├── contexts/         ChatSocketProvider and PermissionContext
├── locales/          i18next translation files (ar/en)
├── config/           Axios instance and endpoints
├── utilities/ utils/ Formatting, exports and helpers
└── types/            Shared TypeScript types
docs/
├── screenshots/      Images used in this README
└── *.http / *.md     API request collections and notes for the backend endpoints
```

## Internationalization

- Languages: Arabic (`ar`, default) and English (`en`), switched from the sidebar.
- Direction (`rtl` / `ltr`) and number and date formats follow the selected language.

## Deployment

The dashboard is a static Vite build hosted on **Vercel** (project `ajwadi-front`, SPA rewrites in
`vercel.json`). Git auto-deploy is not enabled for this project, so deploy explicitly with `vercel --prod`.
The API runs separately on a VPS behind nginx and Let's Encrypt.

## Demo account

The sign-in form is pre-filled for the public demo, and all data is fictional.

| Email | Password | Role |
|---|---|---|
| `admin@ajwadi.com` | `admin123` | Super Administrator |

Clear the pre-filled values in `src/pages/auth/LoginPage.tsx` before using the app with real data.

## Known limitations

- The chat microservice behind the API is not deployed, so **Start Chat** does not open a live conversation
  in the demo.
- Uploads and push delivery need AWS credentials that are not configured on the demo server.
- The **Settings** page is a placeholder ("Under Development").
- The **Projects** page is titled "Project Complaints" in the UI.

## License

Internal project. All rights reserved.
