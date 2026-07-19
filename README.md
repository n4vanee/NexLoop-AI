# NexLoop AI — Industrial Symbiosis Platform

> Turn industrial waste into resources worth recovering.

NexLoop AI is an AI-powered industrial symbiosis platform that matches surplus industrial waste — scrap metal, plastic, textile, e-waste, and food/agro waste — with industries that can reuse it as raw material. It combines an AI matching engine, circularity scoring, ESG report generation, and a conversational assistant, all built on a modern serverless stack.

This README is written for **hackathon judges and beginners**. Every technology, why it was chosen, and how it fits together is documented below, followed by a complete step-by-step deployment guide from export to live URL.

---

## Table of Contents

1. [Hackathon Overview](#1-hackathon-overview)
2. [Tech Stack & Why Each Technology Was Chosen](#2-tech-stack--why-each-technology-was-chosen)
3. [Features](#3-features)
4. [Project Structure](#4-project-structure)
5. [Beginner Deployment Guide](#5-beginner-deployment-guide)
   - [Phase A — Open the exported project in VS Code](#phase-a--open-the-exported-project-in-vs-code)
   - [Phase B — Install dependencies & run locally](#phase-b--install-dependencies--run-locally)
   - [Phase C — Connect Supabase (database + auth)](#phase-c--connect-supabase-database--auth)
   - [Phase D — Integrate the Groq AI API key](#phase-d--integrate-the-groq-ai-api-key)
   - [Phase E — Push to GitHub](#phase-e--push-to-github)
   - [Phase F — Deploy to Vercel](#phase-f--deploy-to-vercel)
   - [Phase G — Verify the live deployment](#phase-g--verify-the-live-deployment)
6. [Environment Variables Reference](#6-environment-variables-reference)
7. [Troubleshooting](#7-troubleshooting)
8. [Production Best Practices](#8-production-best-practices)

---

## 1. Hackathon Overview

**Problem.** Industries generate millions of tonnes of surplus waste every year — scrap metal, plastic offcuts, textile trimmings, electronic scrap, and food/agro byproducts. Most of it ends up in landfills, even when another industry nearby could reuse it as raw material. The missing piece is *discovery*: who has what, who needs what, and at what price.

**Solution.** NexLoop AI is a circular-economy marketplace with an AI engine that:

- Matches surplus waste to industries that can consume it as raw material.
- Recommends fair prices based on material category, quality grade, and demand.
- Predicts environmental impact (CO2 saved, landfill diverted, tree-equivalents).
- Scores each organization on a 0–100 **Circularity Score**.
- Generates AI-written ESG / sustainability reports (PDF export).
- Provides a conversational AI assistant for navigation and recommendations.

**Roles supported:** Citizens, Industries, Municipalities, Administrators — each with a role-specific dashboard.

**Impact metrics tracked:** 546T waste diverted, 198T CO2 saved, 186 active matches, 42 partner organizations (seed data).

---

## 2. Tech Stack & Why Each Technology Was Chosen

| Layer | Technology | Why it was chosen |
|---|---|---|
| **Framework** | Next.js 13.5 (App Router) | Full-stack React framework with file-based routing, server components, API routes, and zero-config static export. Chosen over plain React for built-in SSR/SSG, image optimization, and production-grade build pipeline. |
| **Language** | TypeScript 5.2 | Type safety across frontend and backend. Catches bugs at compile time and makes the data models in `lib/types.ts` self-documenting. |
| **UI Library** | React 18 | Industry-standard component model with hooks. |
| **Styling** | Tailwind CSS 3.3 | Utility-first CSS for rapid, consistent design. The project uses a custom emerald/eco theme defined in `tailwind.config.ts`. |
| **Components** | shadcn/ui + Radix UI | Accessible, unstyled primitives (dialogs, dropdowns, tabs, etc.) composed into a reusable component library under `components/ui/`. Chosen for accessibility (ARIA) and full ownership of the source. |
| **Icons** | lucide-react | Lightweight, tree-shakeable icon set. |
| **Animations** | Framer Motion 12 | Used for hero, feature, and role card entrance animations on the landing page. |
| **Charts** | Recharts 2 | Powers the analytics dashboard (waste-by-category, CO2 trends, match funnel). |
| **Maps** | Leaflet + react-leaflet | Open-source, no API key required. Renders the waste-listings map with custom markers. |
| **PDF** | jsPDF + jspdf-autotable | Generates downloadable ESG/sustainability reports client-side — no server needed. |
| **Forms** | React Hook Form + Zod | Type-safe form validation on login, signup, and report generation. |
| **Database** | Supabase (PostgreSQL) | Managed Postgres with real-time, storage, and auth. Chosen over Firebase because it's relational (we need joins across listings, matches, profiles), open-source, and has Row Level Security built in. |
| **Auth** | Supabase Auth | Email/password authentication with JWT sessions. No custom auth tables to maintain. |
| **AI Provider** | Groq (Llama 3.3 70B) | Free tier with 500+ tokens/second inference. OpenAI-compatible Chat Completions endpoint, so the code is provider-agnostic — swap to OpenAI/Together/Together/Mistral by changing 3 env vars. |
| **AI Hosting** | Supabase Edge Functions (Deno) | Serverless functions that hold the AI API key server-side so it never reaches the browser. The `ai-engine` function proxies all AI calls. |
| **Deployment** | Vercel | First-class Next.js hosting with automatic builds on git push, edge functions, and instant rollbacks. |
| **Version Control** | Git + GitHub | Standard distributed version control for collaboration and CI/CD trigger for Vercel. |

---

## 3. Features

- **AI Waste-to-Resource Matching** — analyzes material specs, proximity, and processing capacity.
- **AI Price Recommendation** — fair, market-aware price suggestions per listing.
- **CO2 & Landfill Impact Prediction** — every match scored for environmental impact.
- **Circularity Score (0–100)** — per-organization sustainability score.
- **AI-Generated ESG Reports** — downloadable PDF reports with AI narratives.
- **AI Chatbot Assistant** — conversational interface for recommendations and navigation.
- **Role-based dashboards** — tailored views for citizens, industries, municipalities, admins.
- **Interactive map** — Leaflet-based map of waste listings with geolocation.
- **Leaderboard** — gamified circular-economy participation.
- **Dark / light theme** — `next-themes` with a toggle.

---

## 4. Project Structure

```
nexloop-ai/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Landing page
│   ├── layout.tsx             # Root layout (navbar, footer, providers)
│   ├── dashboard/page.tsx     # Role-based dashboard
│   ├── reports/page.tsx       # ESG report generation + PDF export
│   ├── analytics/page.tsx     # Charts & impact analytics
│   ├── assistant/page.tsx     # AI chatbot
│   ├── map/page.tsx           # Leaflet waste map
│   ├── leaderboard/page.tsx   # Gamified leaderboard
│   ├── login/ signup/          # Auth pages
│   ├── profile/ settings/      # User account pages
│   ├── admin/                  # Admin dashboard
│   ├── about/ contact/         # Static pages
│   ├── error.tsx               # Error boundary
│   └── not-found.tsx           # 404 page
├── components/
│   ├── ui/                     # shadcn/ui primitives (button, card, dialog…)
│   ├── navbar.tsx              # Top navigation
│   ├── footer.tsx              # Footer
│   ├── app-shell.tsx           # Authenticated layout wrapper
│   ├── auth-provider.tsx       # Supabase auth context
│   ├── protected-route.tsx     # Route guard
│   ├── stat-card.tsx           # Dashboard stat card
│   ├── theme-provider.tsx      # Dark/light theme
│   ├── theme-toggle.tsx        # Theme switcher
│   ├── leaflet-map.tsx         # Map component
│   └── leaflet-map-safe.tsx    # SSR-safe map wrapper
├── lib/
│   ├── supabase.ts             # Supabase client (reads env vars)
│   ├── ai-client.ts            # Frontend AI client → edge function
│   ├── ai-service.ts           # Higher-level AI helpers (matching, reports)
│   ├── data.ts                 # Data-fetching helpers
│   ├── types.ts                # Shared TypeScript types
│   └── utils.ts                # cn() class merge helper
├── hooks/
│   └── use-toast.ts            # Toast hook
├── supabase/
│   ├── migrations/             # SQL migrations (schema + RLS + seed)
│   └── functions/
│       └── ai-engine/index.ts  # Edge function: AI proxy (holds Groq key)
├── public/                     # Static assets (icon, manifest)
├── .env.local                  # Local env vars (NEVER commit)
├── package.json                # Dependencies & scripts
├── next.config.js              # Next.js config
├── tailwind.config.ts          # Tailwind theme
├── tsconfig.json               # TypeScript config
└── README.md                   # This file
```

**Files you should edit for configuration:** `.env.local`, `package.json` (only if adding deps), `tailwind.config.ts` (theme).

**Files you should never modify:** `next.config.js` unless you know what you're doing, `node_modules/`, `.next/` (build output), `package-lock.json` (regenerate with `npm install`).

---

## 5. Beginner Deployment Guide

This guide takes you from a freshly exported Bolt project to a live URL on Vercel, with Supabase and Groq connected. Every step is explained. **Works on macOS.**

### Prerequisites (install these first)

| Tool | Why | How to verify |
|---|---|---|
| Node.js 18+ | Runs the Next.js dev server and build | `node --version` |
| Git | Version control + pushing to GitHub | `git --version` |
| VS Code | Code editor | Open the folder in VS Code |
| A GitHub account | Host the repo + trigger Vercel builds | github.com |
| A Supabase account | Database + auth + edge functions | supabase.com |
| A Groq account | Free AI inference API key | console.groq.com |
| A Vercel account | Host the live site | vercel.com |

Install Node.js from https://nodejs.org (choose the LTS button). On macOS, you can also use Homebrew: `brew install node`.

---

### Phase A — Open the exported project in VS Code

**Step A1.** Download the project ZIP from Bolt (the download/export button in the Bolt editor). It lands in your `~/Downloads` folder.

**Step A2.** Unzip it. On macOS, double-click the `.zip`. A folder appears, e.g. `nexloop-ai`.

**Step A3.** Move it somewhere permanent and open it in VS Code. In Terminal:
```bash
mkdir -p ~/Projects
mv ~/Downloads/nexloop-ai ~/Projects/nexloop-ai
cd ~/Projects/nexloop-ai
code .
```
> `code .` opens VS Code in the current folder. If that command isn't found, open VS Code → Command Palette (Cmd+Shift+P) → "Shell Command: Install 'code' command in PATH", then retry.

**Step A4.** Open the VS Code integrated terminal: `Ctrl + \`` (backtick) or menu **Terminal → New Terminal**. All commands below run there.

---

### Phase B — Install dependencies & run locally

**Step B1.** Install all libraries the project needs:
```bash
npm install
```
> This reads `package.json`, downloads every dependency (Next.js, React, Supabase client, Tailwind, etc.) into a new `node_modules/` folder, and creates `package-lock.json`. This can take 1–3 minutes. Wait until you see the prompt again with no errors.

**Step B2.** Create the local environment file:
```bash
touch .env.local
```
> `.env.local` is the file Next.js reads automatically for local environment variables. It is gitignored by default, so secrets never get committed. We'll fill it in Phase C.

**Step B3.** Start the development server:
```bash
npm run dev
```
> This runs `next dev` and starts a hot-reloading server at http://localhost:3000. You'll see "Ready" in the terminal. Open the URL in your browser. The landing page should load. (Auth and AI features won't work yet — we wire those next.)

**Step B4.** Stop the server when done: press `Ctrl + C` in the terminal.

---

### Phase C — Connect Supabase (database + auth)

Supabase gives you a hosted Postgres database, authentication, and edge functions. The project is already wired to Supabase via `lib/supabase.ts` — you only need to provide credentials.

**Step C1.** Go to https://supabase.com and sign in (GitHub login is fastest).

**Step C2.** Create a new project:
- Click **New project**.
- Organization: pick or create one.
- Name: `nexloop-ai`.
- Database password: generate a strong password and save it somewhere safe.
- Region: choose the one closest to you.
- Plan: Free.
- Click **Create new project**. Wait ~2 minutes for provisioning.

**Step C3.** Get your API credentials. In the Supabase dashboard, go to **Project Settings → API**. You need two values:
- **Project URL** — looks like `https://abcdefgh.supabase.co`
- **anon public key** — a long `eyJ...` JWT string

**Step C4.** Add them to `.env.local`. Open `.env.local` in VS Code and paste:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key...
```
> Replace the values with the ones from your dashboard. The `NEXT_PUBLIC_` prefix is required by Next.js so the browser can read them (they're public, anon-scoped keys — safe to expose).

**Step C5.** Apply the database schema. The SQL migrations are in `supabase/migrations/`. In the Supabase dashboard, go to **SQL Editor → New query**, paste the contents of `supabase/migrations/20260717163517_create_nexloop_schema.sql`, and click **Run**. Repeat for `20260717163623_relax_profiles_fk.sql` and `20260717163717_seed_nexloop_data.sql` (this one seeds demo data).

> This creates 8 tables (profiles, waste_listings, matches, bookmarks, notifications, activity_logs, reports, chat_messages) with Row Level Security enabled on every one, plus indexes and seed data.

**Step C6.** Turn off email confirmation (so testing is frictionless). In Supabase dashboard: **Authentication → Providers → Email** → toggle **Confirm email** OFF → **Save**.

**Step C7.** Restart the dev server (`npm run dev`) and test: go to http://localhost:3000/signup, create an account, and you should be redirected to the dashboard. Supabase auth is now working.

---

### Phase D — Integrate the Groq AI API key

The project never puts the AI key in `.env.local` or in the browser. Instead, it's stored as a **Supabase Edge Function secret**, and the `ai-engine` edge function proxies all AI calls server-side. This is the secure pattern.

**Step D1.** Create a Groq account. Go to https://console.groq.com → sign up with Google or email.

**Step D2.** Generate an API key. In the Groq Console:
- Left sidebar → **API Keys** → **Create API Key**.
- Name it `nexloop`.
- Copy the key immediately. It looks like `gsk_abc123XYZ...`. You won't be able to see it again after closing the dialog.

**Step D3.** Add the key as an Edge Function secret in Supabase. In the Supabase dashboard:
- Go to **Edge Functions → Secrets**.
- Click **Add new secret** and add these three:

  | Name | Value |
  |---|---|
  | `AI_API_KEY` | your Groq key (starts with `gsk_`) |
  | `AI_MODEL` | `llama-3.3-70b-versatile` |
  | `AI_API_BASE_URL` | `https://api.groq.com/openai/v1` |

> These three secrets are read by `supabase/functions/ai-engine/index.ts` at runtime. Because the function runs on Supabase's servers, the browser never sees the key.

**Step D4.** Confirm the edge function is deployed. The function source is already in your project at `supabase/functions/ai-engine/index.ts`. If it's not yet deployed to your Supabase project, deploy it using the Supabase MCP `deploy_edge_function` tool (or the Supabase dashboard **Edge Functions → Deploy**).

**Step D5.** Test the health endpoint. Open this URL in your browser (replace your project URL):
```
https://abcdefgh.supabase.co/functions/v1/ai-engine?health=1
```
You should see:
```json
{"configured": true, "provider": "openai-compatible"}
```
> If you see `"configured": false`, the secrets aren't set correctly — recheck Step D3.

**Step D6.** Test a chat completion. In Terminal:
```bash
curl -X POST https://abcdefgh.supabase.co/functions/v1/ai-engine \
  -H "Content-Type: application/json" \
  -d '{"action":"chat_completion","messages":[{"role":"user","content":"Say hello in one sentence."}]}'
```
You should get back something like:
```json
{"content":"Hello! How can I help you today?"}
```

**Step D7.** Test in the app. With the dev server running, go to http://localhost:3000/assistant and type a question. You should get an AI response. Groq integration is complete.

> **To swap providers later** (e.g. to OpenAI, Together AI, Mistral): just change the three secrets in Supabase — no code changes needed, because the edge function uses the OpenAI-compatible Chat Completions standard.

---

### Phase E — Push to GitHub

**Step E1.** Initialize Git in your project folder (if not already):
```bash
git init
```
> `git init` creates a hidden `.git/` folder that tracks version history.

**Step E2.** Stage and commit everything:
```bash
git add .
git commit -m "Initial commit: NexLoop AI platform"
```
> `git add .` stages all files. `git commit -m "..."` saves a snapshot with a message.

**Step E3.** Create a GitHub repository:
- Go to https://github.com/new.
- Repository name: `nexloop-ai`.
- Set to **Private** or **Public** (your choice).
- **Do not** add a README, .gitignore, or license — the project already has them.
- Click **Create repository**.

**Step E4.** Connect your local repo to GitHub and push. GitHub shows you the exact commands after creating the repo; they look like:
```bash
git remote add origin https://github.com/YOUR_USERNAME/nexloop-ai.git
git branch -M main
git push -u origin main
```
> `git remote add origin` links your local folder to the GitHub URL. `git branch -M main` renames your branch to `main`. `git push -u origin main` uploads your commits and sets `origin/main` as the default for future pushes.

**Step E5.** If Git asks for credentials, use a Personal Access Token (GitHub no longer accepts passwords for git over HTTPS):
- GitHub → **Settings → Developer settings → Personal access tokens → Tokens (classic)** → **Generate new token** → scope `repo` → copy token → paste when Git prompts for password.

**Step E6.** Verify on GitHub: refresh the repo page — you should see all your files.

---

### Phase F — Deploy to Vercel

**Step F1.** Create a Vercel account. Go to https://vercel.com → **Sign Up** → choose **Continue with GitHub** (so Vercel can read your repos).

**Step F2.** Import the project:
- Go to https://vercel.com/new.
- Vercel lists your GitHub repos — find `nexloop-ai` → **Import**.
- Framework preset: **Next.js** (auto-detected).

**Step F3.** Add environment variables. Before clicking Deploy, expand the **Environment Variables** section and add:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |

> **Do NOT add `AI_API_KEY` here.** The Groq key lives in Supabase Edge Function secrets (Phase D), not in Vercel. Keeping it out of Vercel means it's never bundled into the browser.

**Step F4.** Click **Deploy**. Vercel runs `npm install` then `npm run build` and deploys. This takes 1–2 minutes. You'll see a "Congratulations" page with a live URL like `https://nexloop-ai-abc123.vercel.app`.

**Step F5.** Update Supabase auth URLs. In the Supabase dashboard → **Authentication → URL Configuration**:
- **Site URL**: set to your Vercel URL.
- **Redirect URLs**: add `https://nexloop-ai-abc123.vercel.app/**`.
- Click **Save**.

> This ensures Supabase redirects users back to your live site after login/signup instead of localhost.

**Step F6.** (Optional) Custom domain:
- Vercel dashboard → your project → **Settings → Domains** → **Add**.
- Enter your domain → Vercel gives you DNS records (A record / CNAME) to add at your registrar (Namecheap, GoDaddy, etc.).
- SSL is automatic once DNS propagates.

---

### Phase G — Verify the live deployment

Open your Vercel URL and walk through this checklist:

1. **Landing page** loads with hero, stats, categories, features.
2. **Sign up** at `/signup` → redirected to dashboard.
3. **Login** at `/login` → dashboard.
4. **Dashboard** shows role-specific stats.
5. **Reports** page → generate an ESG report → download PDF.
6. **Analytics** page → charts render.
7. **Assistant** page → type a question → get an AI response (Groq working).
8. **Map** page → Leaflet map loads with markers.
9. **Leaderboard** → ranked list of users.
10. **Profile / Settings** → editable.
11. **Dark/light toggle** works.

If anything fails, open the Vercel dashboard → **Deployments → Logs** to see the error.

---

## 6. Environment Variables Reference

| Variable | Where it lives | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel env vars | Supabase project URL (public, safe to expose) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` + Vercel env vars | Supabase anon key (public, anon-scoped) |
| `AI_API_KEY` | Supabase Edge Function secrets only | Groq API key (secret — never in `.env` or Vercel) |
| `AI_MODEL` | Supabase Edge Function secrets only | Model id, e.g. `llama-3.3-70b-versatile` |
| `AI_API_BASE_URL` | Supabase Edge Function secrets only | Provider base URL, e.g. `https://api.groq.com/openai/v1` |

**Rule of thumb:** `NEXT_PUBLIC_*` vars are safe for the browser. Everything else must live server-side only.

---

## 7. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `Module not found` after install | Incomplete install | Delete `node_modules` and `package-lock.json`, rerun `npm install` |
| `Environment variables not loading` | `.env.local` missing or misnamed | Must be exactly `.env.local` (not `.env`), restart `npm run dev` after editing |
| `Port 3000 already in use` | Another process holds the port | `npx kill-port 3000` or run `npm run dev -- -p 3001` |
| Supabase `Invalid API key` | Wrong anon key or URL | Re-copy from Supabase **Settings → API** |
| AI assistant returns `configured: false` | Edge function secrets missing | Recheck `AI_API_KEY`, `AI_MODEL`, `AI_API_BASE_URL` in Supabase secrets |
| AI returns `Provider returned 401` | Bad Groq key | Regenerate key in Groq console, update secret |
| Signup works but login redirects to localhost | Supabase URL config wrong | Set Site URL + Redirect URLs to your Vercel domain (Phase F5) |
| `npm run build` fails with type errors | TypeScript mismatch | Run `npm run typecheck` to see the errors, fix the types |
| Vercel build fails | Missing env vars on Vercel | Add `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel project settings |
| Map is blank | Leaflet CSS not loaded | Check `leaflet-map-safe.tsx` imports; ensure no SSR of the map |
| Git push rejected (non-fast-forward) | Remote has commits you don't have | `git pull --rebase origin main` then `git push` |

---

## 8. Production Best Practices

- **Never commit `.env.local`.** It's in `.gitignore` — leave it there.
- **Rotate keys** if a secret leaks (Groq, Supabase service role).
- **Enable RLS** on every table (already done in the migrations).
- **Use the service role key only server-side** — never in the browser.
- **Set Supabase auth redirects** to your production domain.
- **Add rate limiting** on the edge function if traffic grows (Supabase has built-in limits; add a Redis-backed limiter for custom limits).
- **Monitor** Vercel logs and Supabase logs for errors.
- **Run `npm run build`** before every deploy to catch type errors early.
- **Keep dependencies updated** with `npm audit` and `npm update`.

---

Built with Next.js, Supabase, Groq, Tailwind CSS, and shadcn/ui. Deployed on Vercel.
