# NexLoop AI — Complete Beginner's Guide

> A step-by-step guide for setting up, running, and deploying the NexLoop AI
> industrial symbiosis platform. Written for beginners. Every command and
> file is explained before it is used. All instructions are compatible with
> macOS.

---

## Table of Contents

1. [Groq AI Integration](#1-groq-ai-integration)
2. [Running the Project Locally](#2-running-the-project-locally)
3. [Exporting the Project](#3-exporting-the-project)
4. [Supabase Integration](#4-supabase-integration)
5. [Vercel Deployment](#5-vercel-deployment)
6. [Git & GitHub Workflow](#6-git--github-workflow)
7. [Project Structure](#7-project-structure)
8. [Production Best Practices](#8-production-best-practices)

---

## 1. Groq AI Integration

### 1.1 What is Groq and why is it used?

**Groq** is a company that builds ultra-fast AI inference hardware called an
**LPU** (Language Processing Unit). They host AI models on this hardware and
expose them through an API. The key benefits:

- **Speed**: 500+ tokens per second — the fastest hosted AI inference
  available. Responses feel instant.
- **Free tier**: ~14,400 requests per day, 30 requests per minute. No credit
  card required.
- **Quality**: Hosts **Llama 3.3 70B**, a strong open-source model from Meta.
- **Compatibility**: The API is **OpenAI-compatible** — it uses the same
  request/response format as OpenAI's Chat Completions endpoint. This means
  you can use the same code structure with minimal changes.
- **No SDK lock-in**: You call it with plain `fetch()`. No proprietary SDK
  required.

We use Groq instead of OpenAI or Gemini because it is free, fast, and
reliable for a hackathon or production prototype.

### 1.2 How to create a Groq account

1. Open your browser and go to **https://console.groq.com**
2. Click **"Login"** or **"Sign Up"** in the top right.
3. You can sign up with a Google account or an email address.
4. Verify your email if you used email signup.
5. Once logged in, you will see the Groq Console dashboard.

### 1.3 How to generate an API key

1. In the Groq Console, click on **"API Keys"** in the left sidebar.
2. Click the **"Create API Key"** button.
3. Give your key a name, for example `nexloop-production`.
4. Copy the generated key immediately — it looks like
   `gsk_XXXXXXXXXXXXXXXXXXXXXXXXXXXX`.
5. Store it somewhere safe. You will not be able to see it again after
   closing the dialog.

> **Important**: Never commit this key to GitHub or share it publicly. It
> gives anyone who has it the ability to use your Groq quota.

### 1.4 Where to store the API key securely

API keys must **never** be hardcoded in your source code or committed to
Git. Instead, store them in **environment variables**.

This project uses **two layers** of secrets:

| Layer | File | Purpose |
|-------|------|---------|
| Edge function secrets | Set via Supabase dashboard | Used by the edge function server-side |
| Local development | `.env.local` | Used only on your machine during development |

#### Why two layers?

The AI call flow is:

```
Browser (client) → Supabase Edge Function → Groq API
```

The browser never talks to Groq directly. The edge function holds the real
API key and forwards the request. This keeps your key invisible to users.

For local development, you can also call Groq directly from a Next.js API
route using `.env.local`. Both approaches are explained below.

#### Creating `.env.local`

In the **root of your project** (the folder containing `package.json`),
create a file named `.env.local`:

```bash
touch .env.local
```

Add this content:

```env
# Groq AI — for local Next.js API route usage (optional in this project)
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Supabase (already provided in .env, but .env.local takes precedence)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **Why `.env.local` and not `.env`?** Next.js automatically loads `.env.local`
> and it is ignored by Git (check your `.gitignore`). The `.env` file in this
> project is used for the Bolt preview environment. For your own development,
> use `.env.local`.

#### Adding `.env.local` to `.gitignore`

Open the existing `.gitignore` file in the project root and make sure this
line exists:

```
.env*.local
```

This ensures your secrets are never committed to GitHub.

### 1.5 How to integrate the Groq API into the existing Next.js app

This project already has a **centralized AI client** set up. Here is how it
works and how to extend it.

#### The architecture

```
┌──────────────┐     ┌──────────────────────┐     ┌──────────┐
│  React UI    │────▶│ Supabase Edge Func   │────▶│  Groq    │
│ (browser)    │     │ (ai-engine)          │     │  API     │
└──────────────┘     └──────────────────────┘     └──────────┘
```

- **`lib/ai-client.ts`** — Frontend code. Calls the edge function.
- **`supabase/functions/ai-engine/index.ts`** — Edge function. Holds the
  Groq API key, calls Groq, returns the response.
- **`lib/ai-service.ts`** — Feature functions (matching, pricing, chat, etc.)
  that use `ai-client.ts`.

### 1.6 The project folder structure for AI files

```
project/
├── lib/
│   ├── ai-client.ts          ← Centralized client (calls edge function)
│   ├── ai-service.ts         ← Feature-level AI functions
│   └── types.ts              ← TypeScript types
└── supabase/
    └── functions/
        └── ai-engine/
            └── index.ts      ← Edge function (holds API key, calls Groq)
```

If you want to add a **local Next.js API route** as an alternative to the
edge function, you would create:

```
project/
└── app/
    └── api/
        └── ai/
            └── route.ts      ← Next.js API route (server-side)
```

### 1.7 Code explanation — line by line

#### File: `lib/ai-client.ts`

This file is the **only** place the frontend talks to AI. All features import
from here.

```typescript
// The URL of our deployed Supabase edge function.
// NEXT_PUBLIC_ prefix means it is safe to expose to the browser.
const EDGE_FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-engine`;

// The shape of a chat message — same as OpenAI's format.
export interface ChatMessageInput {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Options for controlling the AI response.
export interface AIClientOptions {
  temperature?: number;  // 0 = deterministic, 1 = creative
  maxTokens?: number;    // Maximum length of the response
}

// The main function. Sends messages to the edge function and gets text back.
export async function aiChatCompletion(
  messages: ChatMessageInput[],
  options: AIClientOptions = {}
): Promise<string> {
  const { temperature = 0.4, maxTokens = 1024 } = options;

  // POST request to the edge function with the chat messages.
  const res = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'chat_completion',
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  // If the request fails, throw an error with details.
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`AI request failed (${res.status}): ${detail}`);
  }

  // Parse the JSON response from the edge function.
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  if (typeof data.content !== 'string' || data.content.length === 0) {
    throw new Error('AI returned an empty response');
  }
  return data.content;  // The assistant's text response.
}

// Health check — lets the frontend know if the AI is configured.
export async function aiIsConfigured(): Promise<boolean> {
  try {
    const res = await fetch(`${EDGE_FUNCTION_URL}?health=1`, { method: 'GET' });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data?.configured);
  } catch {
    return false;
  }
}
```

#### File: `supabase/functions/ai-engine/index.ts`

This is the **edge function** — server-side code that holds the API key and
calls Groq. It runs on Supabase's servers, not in the browser.

```typescript
// CORS headers — required so the browser can call this function.
// Without these, the browser blocks the request.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Helper to return a JSON response with CORS headers.
function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// The core function — calls the Groq (or any OpenAI-compatible) API.
async function callProvider(
  messages: { role: string; content: string }[],
  temperature: number,
  maxTokens: number,
): Promise<string> {
  // Read secrets from the edge function's environment.
  // These are set in the Supabase dashboard, NOT in .env.
  const apiKey = Deno.env.get("AI_API_KEY");
  const model = Deno.env.get("AI_MODEL");
  const baseUrl = Deno.env.get("AI_API_BASE_URL");

  // If any secret is missing, return a clear error.
  if (!apiKey || !model || !baseUrl) {
    throw new Error(
      "AI not configured. Set AI_API_KEY, AI_MODEL, and AI_API_BASE_URL as edge function secrets.",
    );
  }

  // Build the full endpoint URL. For Groq this is:
  // https://api.groq.com/openai/v1/chat/completions
  const endpoint = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

  // Call the provider using fetch — no SDK needed.
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,  // The API key goes here.
    },
    body: JSON.stringify({
      model,           // e.g. "llama-3.3-70b-versatile"
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  // Handle HTTP errors from the provider.
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Provider returned ${res.status}: ${detail}`);
  }

  // Extract the assistant's message from the response.
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Provider returned no content");
  return content as string;
}

// The main server handler — routes requests by action.
Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests.
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Health check endpoint — returns whether secrets are configured.
  if (req.method === "GET" || req.url.includes("health=1")) {
    const configured = Boolean(
      Deno.env.get("AI_API_KEY") &&
        Deno.env.get("AI_MODEL") &&
        Deno.env.get("AI_API_BASE_URL"),
    );
    return json({ configured, provider: "openai-compatible" });
  }

  try {
    const body = await req.json();
    const action = body.action;

    // Route: chat completion
    if (action === "chat_completion") {
      const messages = body.messages ?? [];
      const temperature = body.temperature ?? 0.4;
      const maxTokens = body.max_tokens ?? 1024;

      const content = await callProvider(messages, temperature, maxTokens);
      return json({ content });
    }

    // Unknown action
    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});
```

### 1.8 Creating a reusable Groq service

The file `lib/ai-service.ts` is your reusable service. It contains functions
for every AI feature in the app. Here is how to add a new one:

```typescript
import { aiChatCompletion } from '@/lib/ai-client';

// Example: a new feature — summarize a waste listing.
export async function aiSummarizeListing(title: string, description: string): Promise<string> {
  const prompt = `Summarize this waste listing in one sentence:\n${title}\n${description}`;

  try {
    return await aiChatCompletion(
      [
        { role: 'system', content: 'You are a concise summarizer.' },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.3, maxTokens: 100 },
    );
  } catch (e) {
    console.error('aiSummarizeListing failed:', e);
    return 'Summary unavailable.';
  }
}
```

### 1.9 Calling Groq from a server-side API route (alternative)

If you prefer a Next.js API route instead of the edge function, create
`app/api/ai/route.ts`:

```typescript
// app/api/ai/route.ts
// This runs ONLY on the server. The API key is never sent to the browser.

export const runtime = 'nodejs';  // Use Node.js runtime, not Edge.

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(req: Request) {
  try {
    if (!GROQ_API_KEY) {
      return Response.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const { messages, temperature = 0.4, maxTokens = 1024 } = await req.json();

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return Response.json({ error: `Groq error: ${detail}` }, { status: res.status });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    return Response.json({ content });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
```

> **Note**: This project uses the edge function approach by default. The API
> route above is an alternative if you do not want to use Supabase edge
> functions.

### 1.10 How to avoid exposing API keys to the client

Three rules:

1. **Never** use the `NEXT_PUBLIC_` prefix for secret keys. Any variable
   with `NEXT_PUBLIC_` is embedded in the browser bundle and visible to
   everyone.
2. **Never** import the API key in a client component (a file with
   `"use client"` at the top).
3. **Always** route AI calls through a server — either a Next.js API route
   (`app/api/...`) or a Supabase edge function.

In this project:
- `GROQ_API_KEY` has no `NEXT_PUBLIC_` prefix → stays on the server.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` have the
  prefix → safe to expose (the anon key is designed to be public and is
  protected by Row Level Security).

### 1.11 Error handling

Every AI function in `lib/ai-service.ts` follows this pattern:

```typescript
export async function aiSomeFeature(input: string): Promise<string> {
  try {
    // Call the AI...
    return await aiChatCompletion([...]);
  } catch (e) {
    // Log the error for debugging.
    console.error('aiSomeFeature failed, using fallback:', e);
    // Return a safe fallback so the UI never crashes.
    return 'Fallback response';
  }
}
```

This ensures:
- The user always sees a response, even if Groq is down.
- Errors are logged server-side for debugging.
- The app never crashes due to an AI failure.

### 1.12 Loading states in the UI

In any React component that calls an AI function, use a loading state:

```tsx
'use client';

import { useState } from 'react';
import { aiChat } from '@/lib/ai-service';

export function ChatComponent() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(message: string) {
    setLoading(true);
    setError('');
    try {
      const result = await aiChat(message);
      setResponse(result);
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={() => handleSubmit('Hello')} disabled={loading}>
        {loading ? 'Thinking...' : 'Ask AI'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {response && <p>{response}</p>}
    </div>
  );
}
```

### 1.13 Rate limiting recommendations

Groq's free tier allows **30 requests per minute** and ~14,400 per day.
Recommendations:

1. **Debounce user input**: If the user types in a chat box, wait 500ms after
   they stop typing before sending a request.
2. **Cache responses**: If the same question is asked twice, return the
   cached answer instead of calling Groq again.
3. **Show a loading state**: Prevent users from clicking "submit" multiple
   times while a request is in flight (see the `disabled={loading}` pattern
   above).
4. **Queue requests**: If you have batch operations, process them one at a
   time with a small delay rather than all at once.
5. **Server-side rate limiting**: In the edge function or API route, track
   requests per user and return a 429 status if they exceed the limit.

Example of simple rate limiting in an edge function:

```typescript
// Simple in-memory rate limiting (per Deno isolate).
const requestTimestamps = new Map<string, number[]>();

function checkRateLimit(userId: string, maxPerMinute = 30): boolean {
  const now = Date.now();
  const timestamps = requestTimestamps.get(userId) || [];
  const recent = timestamps.filter(t => now - t < 60_000);
  if (recent.length >= maxPerMinute) return false;
  recent.push(now);
  requestTimestamps.set(userId, recent);
  return true;
}
```

### 1.14 Replacing existing Gemini/OpenAI placeholders with Groq

This project has **already been migrated** from Gemini/OpenAI to Groq. All
references to OpenAI and Gemini have been removed. The migration involved:

1. **Removed** all `import OpenAI` / `import { GoogleGenerativeAI }` statements.
2. **Removed** `OPENAI_API_KEY` and `GEMINI_API_KEY` references.
3. **Replaced** direct SDK calls with `aiChatCompletion()` from the
   centralized client.
4. **Updated** all comments that mentioned Gemini or OpenAI.

If you find any remaining references, search for them:

```bash
grep -ri "openai\|gemini\|gpt-" --include="*.ts" --include="*.tsx" .
```

If this returns results, replace those references with calls to
`aiChatCompletion()`.

### 1.15 Testing the Groq integration

#### Step 1: Set the edge function secrets

In the Supabase dashboard (https://supabase.com/dashboard):

1. Select your project.
2. Go to **Edge Functions** → **Secrets**.
3. Add these three secrets:
   - `AI_API_KEY` = your Groq API key (starts with `gsk_`)
   - `AI_MODEL` = `llama-3.3-70b-versatile`
   - `AI_API_BASE_URL` = `https://api.groq.com/openai/v1`

#### Step 2: Test the health check

Open this URL in your browser (replace your project URL):

```
https://qfgbwvbgmcavxmobxlct.supabase.co/functions/v1/ai-engine?health=1
```

You should see:

```json
{"configured": true, "provider": "openai-compatible"}
```

If you see `"configured": false`, the secrets are not set correctly.

#### Step 3: Test a chat completion

Use `curl` in your terminal:

```bash
curl -X POST https://qfgbwvbgmcavxmobxlct.supabase.co/functions/v1/ai-engine \
  -H "Content-Type: application/json" \
  -d '{"action": "chat_completion", "messages": [{"role": "user", "content": "Say hello"}]}'
```

You should get a response like:

```json
{"content": "Hello! How can I help you today?"}
```

#### Step 4: Test in the app

1. Start the dev server (see Section 2).
2. Go to the **Assistant** page.
3. Type a question and submit.
4. You should get an AI-generated response.

### Troubleshooting — Groq Integration

| Problem | Cause | Fix |
|---------|-------|-----|
| `"configured": false` | Secrets not set | Add them in Supabase dashboard → Edge Functions → Secrets |
| `401 Unauthorized` | Wrong API key | Regenerate the key at console.groq.com and update the secret |
| `429 Too Many Requests` | Rate limit hit | Wait 1 minute, reduce request frequency |
| `Provider returned no content` | Model name wrong | Use exactly `llama-3.3-70b-versatile` |
| Empty response in UI | Edge function not deployed | Redeploy via Supabase MCP or dashboard |
| CORS error in browser | Missing CORS headers | Already handled in the edge function — redeploy if needed |

---

## 2. Running the Project Locally

### 2.1 Prerequisites

Before you begin, install these on your Mac:

#### Node.js (version 18 or higher)

Node.js is the runtime that executes JavaScript outside the browser. Next.js
requires it.

1. Go to **https://nodejs.org**
2. Download the **LTS** (Long Term Support) version for macOS.
3. Run the installer.
4. Verify the installation by opening **Terminal** and running:

```bash
node --version
```

You should see something like `v20.x.x`.

#### npm (comes with Node.js)

npm is the package manager — it downloads libraries your project needs.
Verify it:

```bash
npm --version
```

You should see something like `10.x.x`.

#### Git (for version control)

1. Go to **https://git-scm.com/downloads**
2. Download the macOS version.
3. Run the installer.
4. Verify:

```bash
git --version
```

#### Visual Studio Code (recommended editor)

1. Go to **https://code.visualstudio.com**
2. Download the macOS version.
3. Drag it to your Applications folder.
4. Open it and install the **ES7+ React/Redux/React-Native snippets** and
   **Tailwind CSS IntelliSense** extensions for the best experience.

### 2.2 Installing all dependencies

After you have the project folder, open Terminal and navigate to it:

```bash
cd /path/to/project
```

Then install all required libraries:

```bash
npm install
```

**What this does**: Reads the `package.json` file, downloads every library
listed in the `dependencies` section, and puts them in the `node_modules/`
folder. This can take 1-3 minutes.

### 2.3 Creating the `.env.local` file

Environment variables are settings your app needs but should not be
committed to Git.

Create the file:

```bash
touch .env.local
```

Open it in your editor and add:

```env
# Supabase (required — already in .env, but .env.local overrides for local dev)
NEXT_PUBLIC_SUPABASE_URL=https://qfgbwvbgmcavxmobxlct.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Groq AI (only needed if using the Next.js API route approach)
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

> **Why `.env.local`?** Next.js loads this file automatically and it is
> ignored by Git. The `.env` file is used by the Bolt preview environment.

### 2.4 Configuring environment variables

| Variable | Where to find it | Required? |
|----------|-----------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API → Project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API → anon public key | Yes |
| `GROQ_API_KEY` | console.groq.com → API Keys | Only for API route approach |
| `GROQ_MODEL` | console.groq.com → Models | Only for API route approach |

> **Note**: This project uses Supabase edge function secrets for the Groq
> API key, so `GROQ_API_KEY` in `.env.local` is only needed if you use the
> alternative Next.js API route approach (Section 1.9).

### 2.5 Starting the development server

```bash
npm run dev
```

**What this does**: Starts the Next.js development server with hot-reloading.
Every time you save a file, the browser refreshes automatically.

You will see:

```
- Local: http://localhost:3000
```

Open **http://localhost:3000** in your browser.

### 2.6 Fixing common errors

#### Module not found

**Error**: `Module not found: Can't resolve 'some-package'`

**Cause**: A dependency is not installed.

**Fix**:

```bash
npm install some-package
```

If many modules are missing, your `node_modules` may be corrupted. Delete
and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

#### Environment variables not loading

**Error**: `process.env.NEXT_PUBLIC_SUPABASE_URL is undefined`

**Cause**: The `.env.local` file is missing, has a typo, or the server was
not restarted after adding it.

**Fix**:
1. Verify `.env.local` exists in the project root (same level as
   `package.json`).
2. Verify there are no spaces around the `=` sign.
3. Restart the dev server: press `Ctrl+C` in Terminal, then run `npm run dev`
   again.

#### Port already in use

**Error**: `Port 3000 is already in use`

**Cause**: Another process is using port 3000.

**Fix**: Either use a different port:

```bash
npm run dev -- -p 3001
```

Or kill the process using port 3000:

```bash
lsof -ti:3000 | xargs kill -9
```

Then run `npm run dev` again.

#### API errors

**Error**: `AI request failed (500)` or `AI request failed (401)`

**Cause**: The Groq API key is missing, wrong, or the rate limit is hit.

**Fix**:
1. Check the edge function secrets in the Supabase dashboard.
2. Verify the API key is valid at console.groq.com.
3. Wait 1 minute if you hit the rate limit.
4. Check the edge function logs in Supabase dashboard → Edge Functions →
   Logs.

#### Build failures

**Error**: `Failed to compile` during `npm run build`

**Cause**: A TypeScript error or missing import.

**Fix**:
1. Read the error message — it tells you the file and line number.
2. Fix the error in that file.
3. Run `npm run build` again.

If the error is a type error you do not understand, you can check types
separately:

```bash
npm run typecheck
```

### 2.7 Verifying everything works

1. The home page loads at `http://localhost:3000`.
2. You can navigate to `/login` and sign up.
3. The Dashboard page shows listings.
4. The Assistant page returns AI responses.
5. The Analytics page shows charts.
6. The Map page shows the waste exchange map.

### Troubleshooting — Running Locally

| Problem | Fix |
|---------|-----|
| White screen | Check browser console (F12) for errors |
| Login not working | Verify Supabase URL and anon key in `.env.local` |
| Map not loading | Check browser console for Leaflet errors |
| Charts empty | Verify Supabase database has seeded data |
| CSS looks broken | Run `npm install` again, then restart dev server |

---

## 3. Exporting the Project

### 3.1 How to export/download the Bolt.new project

In the Bolt.new interface:

1. Click the **Download** icon (arrow pointing down) in the top-right
   toolbar, or use the menu.
2. This downloads a `.zip` file containing the entire project.
3. Double-click the `.zip` file on your Mac to extract it.
4. Move the extracted folder to your preferred location, e.g.:

```bash
mv ~/Downloads/nexloop-ai ~/Projects/nexloop-ai
```

### 3.2 Expected folder structure

```
nexloop-ai/
├── .env                        ← Bolt environment (do not edit)
├── .env.local                  ← Your local secrets (create this)
├── .eslintrc.json              ← Code linting rules
├── .gitignore                  ← Files Git should ignore
├── .bolt/                      ← Bolt configuration (do not edit)
├── app/                        ← Next.js pages and routes
│   ├── layout.tsx              ← Root layout (wraps every page)
│   ├── page.tsx                ← Home page
│   ├── globals.css             ← Global styles
│   ├── about/page.tsx
│   ├── admin/page.tsx
│   ├── analytics/page.tsx
│   ├── assistant/page.tsx
│   ├── contact/page.tsx
│   ├── dashboard/page.tsx
│   ├── forgot-password/page.tsx
│   ├── leaderboard/page.tsx
│   ├── login/page.tsx
│   ├── map/page.tsx
│   ├── profile/page.tsx
│   ├── reports/page.tsx
│   ├── settings/page.tsx
│   ├── signup/page.tsx
│   └── error.tsx               ← Error boundary
├── components/                 ← Reusable UI components
│   ├── app-shell.tsx           ← App wrapper with navbar/footer
│   ├── auth-provider.tsx       ← Supabase auth context
│   ├── footer.tsx
│   ├── navbar.tsx
│   ├── protected-route.tsx     ← Guards pages that need login
│   ├── stat-card.tsx
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   ├── leaflet-map.tsx
│   ├── leaflet-map-safe.tsx    ← Dynamic import wrapper for Leaflet
│   └── ui/                     ← shadcn/ui components (buttons, cards, etc.)
├── hooks/
│   └── use-toast.ts            ← Toast notification hook
├── lib/
│   ├── ai-client.ts            ← Centralized AI client
│   ├── ai-service.ts           ← AI feature functions
│   ├── data.ts                 ← Data fetching helpers
│   ├── supabase.ts             ← Supabase client
│   ├── types.ts                ← TypeScript type definitions
│   └── utils.ts                ← Utility functions (cn, formatters)
├── public/                     ← Static files (images, icons)
│   ├── icon.svg
│   └── manifest.json
├── supabase/
│   ├── migrations/             ← Database migration SQL files
│   └── functions/              ← Edge functions
│       └── ai-engine/
│           └── index.ts        ← AI edge function
├── components.json             ← shadcn/ui config
├── next.config.js              ← Next.js configuration
├── package.json                ← Dependencies and scripts
├── postcss.config.js           ← PostCSS config (for Tailwind)
├── tailwind.config.ts          ← Tailwind CSS configuration
├── tsconfig.json               ← TypeScript configuration
└── netlify.toml                ← Netlify deployment config
```

### 3.3 Files that should never be modified

| File | Why |
|------|-----|
| `.bolt/` | Bolt configuration — modifying it breaks the Bolt preview |
| `node_modules/` | Auto-generated by `npm install` — never edit manually |
| `package-lock.json` | Auto-generated — ensures reproducible installs |
| `.next/` (after build) | Auto-generated build output |
| `components/ui/*.tsx` | shadcn/ui library components — extend, do not modify directly |

### 3.4 Files to edit for configuration

| File | What to change |
|------|---------------|
| `.env.local` | Add your API keys and Supabase credentials |
| `lib/supabase.ts` | Change Supabase connection if needed |
| `lib/ai-service.ts` | Modify AI prompts and features |
| `tailwind.config.ts` | Change colors, fonts, theme |
| `app/globals.css` | Change global styles and CSS variables |
| `next.config.js` | Change Next.js build settings |

---

## 4. Supabase Integration

### 4.1 Why Supabase is useful

**Supabase** is an open-source alternative to Firebase. It provides:

- **PostgreSQL database**: A powerful relational database.
- **Authentication**: Email/password, OAuth (Google, GitHub, etc.).
- **Storage**: File uploads (images, documents).
- **Edge Functions**: Server-side code (like AWS Lambda).
- **Row Level Security (RLS)**: Database-level access control.
- **Real-time subscriptions**: Live updates when data changes.

This project uses Supabase for: user authentication, waste listings storage,
matches, user profiles, and the AI edge function.

### 4.2 How to create a Supabase project

1. Go to **https://supabase.com**
2. Click **"Start your project"** and sign up (GitHub or email).
3. Click **"New Project"**.
4. Fill in:
   - **Name**: `nexloop-ai`
   - **Database Password**: Generate a strong password and save it.
   - **Region**: Choose the closest to your users.
5. Click **"Create new project"**. Wait 2-3 minutes for provisioning.

### 4.3 Authentication

This project uses **email/password authentication**.

To configure:

1. In Supabase dashboard → **Authentication** → **Providers**.
2. Ensure **Email** is enabled.
3. Under **Email**, disable **"Confirm email"** for development (so users
   can log in immediately without checking email).
4. Under **URLs**, set:
   - **Site URL**: `http://localhost:3000` for development
   - **Redirect URLs**: `http://localhost:3000/**`

The auth code is in `components/auth-provider.tsx` and uses the Supabase JS
client's `signUp`, `signInWithPassword`, and `onAuthStateChange` methods.

### 4.4 Database creation

The database schema is defined in migration files in
`supabase/migrations/`. This project already has migrations applied.

To view your tables:

1. Go to Supabase dashboard → **Table Editor**.
2. You will see tables like: `profiles`, `waste_listings`, `matches`,
   `transactions`, etc.

To run a new migration, use the Supabase MCP `apply_migration` tool (not the
CLI, which is not supported in this environment).

### 4.5 Storage buckets

Storage is for file uploads (e.g., waste listing photos).

1. Go to Supabase dashboard → **Storage**.
2. Click **"New bucket"**.
3. Name it `waste-images`.
4. Set it to **Public** (so images can be viewed without auth).
5. Create the bucket.

To upload a file from your app:

```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.storage
  .from('waste-images')
  .upload(`listing-${Date.now()}.jpg`, file);
```

### 4.6 Row Level Security (RLS)

**RLS** is a PostgreSQL feature that restricts which rows a user can read,
insert, update, or delete. It is **mandatory** for every table.

This project has RLS enabled on all tables with policies like:

```sql
-- Users can only see their own listings
CREATE POLICY "select_own_listings" ON waste_listings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- Users can only insert their own listings
CREATE POLICY "insert_own_listings" ON waste_listings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
```

**Key rules**:
- Always use `auth.uid()` (never `current_user`).
- Write 4 separate policies (one per CRUD verb: SELECT, INSERT, UPDATE,
  DELETE) — never use `FOR ALL`.
- Scope to `TO authenticated` for apps with login.

### 4.7 Environment variables

| Variable | Where to find | Purpose |
|----------|--------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Dashboard → Settings → API → Project URL | Frontend client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard → Settings → API → anon public | Frontend client |
| `AI_API_KEY` | Edge Function Secrets | Groq API key (server-side only) |
| `AI_MODEL` | Edge Function Secrets | Model name |
| `AI_API_BASE_URL` | Edge Function Secrets | Provider base URL |

### 4.8 Connecting Supabase with Next.js

The Supabase client is in `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

This client is used throughout the app for auth, database queries, and
storage.

### 4.9 Migrating from Firebase to Supabase

If you have an existing Firebase project, here is the mapping:

| Firebase | Supabase |
|----------|----------|
| Firestore (documents) | PostgreSQL (tables/rows) |
| Firebase Auth | Supabase Auth |
| Cloud Storage | Supabase Storage |
| Cloud Functions | Edge Functions |
| `onSnapshot()` | `.on()` real-time subscriptions |

Migration steps:

1. Export your Firestore data to JSON.
2. Create equivalent PostgreSQL tables in Supabase.
3. Transform JSON data to SQL INSERT statements.
4. Replace Firebase SDK imports with Supabase SDK.
5. Update queries from Firestore syntax to Supabase query syntax.

### 4.10 Testing database connectivity

Run this in your terminal to test the connection:

```bash
curl -s "https://qfgbwvbgmcavxmobxlct.supabase.co/rest/v1/profiles?select=id&limit=1" \
  -H "apikey: your-anon-key" | head -5
```

If you get JSON back (even an empty array `[]`), the connection works. If
you get an error, check your URL and API key.

### 4.11 Deploying using Supabase

Supabase is already deployed (it is a cloud service). To deploy changes:

1. **Database migrations**: Use the Supabase MCP `apply_migration` tool.
2. **Edge functions**: Use the Supabase MCP `deploy_edge_function` tool.
   First write the function code to `supabase/functions/<name>/index.ts`,
   then deploy.
3. **Secrets**: Set via Supabase dashboard → Edge Functions → Secrets.

---

## 5. Vercel Deployment

### 5.1 Creating a Vercel account

1. Go to **https://vercel.com**
2. Click **"Sign Up"**.
3. Sign up with **GitHub** (recommended — this connects your Git
   repositories automatically).

### 5.2 Connecting GitHub

1. During Vercel signup, authorize Vercel to access your GitHub account.
2. You can choose to give access to all repositories or specific ones.

### 5.3 Pushing the project to GitHub

See Section 6 for the full Git workflow. The short version:

```bash
# Initialize Git in your project folder
git init

# Add all files
git add .

# Create your first commit
git commit -m "Initial commit: NexLoop AI platform"

# Create a repository on GitHub (via github.com)
# Then connect and push:
git remote add origin https://github.com/yourusername/nexloop-ai.git
git branch -M main
git push -u origin main
```

### 5.4 Importing the repository into Vercel

1. Go to **https://vercel.com/new**
2. Select your GitHub repository `nexloop-ai`.
3. Vercel auto-detects Next.js and configures build settings.

### 5.5 Configuring environment variables

In the Vercel import screen, expand **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://qfgbwvbgmcavxmobxlct.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |

> **Note**: `GROQ_API_KEY` is NOT needed here because the AI call goes
> through the Supabase edge function, which has its own secrets.

### 5.6 Production build settings

Vercel auto-detects these from `package.json`:

- **Framework**: Next.js
- **Build command**: `npm run build` (or `next build`)
- **Output directory**: `.next`
- **Install command**: `npm install`

No changes needed — the defaults are correct.

### 5.7 Automatic deployments

Once connected, every `git push` to the `main` branch triggers a new
deployment. You can also enable **Preview Deployments** for pull requests
in Vercel → Settings → Git.

### 5.8 Custom domains (optional)

1. Go to Vercel dashboard → your project → **Settings** → **Domains**.
2. Click **"Add"** and enter your domain (e.g. `nexloop.yourdomain.com`).
3. Vercel gives you DNS records to add at your domain registrar.
4. Once DNS propagates (minutes to hours), SSL is automatic.

### 5.9 Verifying the deployment

1. After deployment, Vercel gives you a URL like
   `nexloop-ai-xxx.vercel.app`.
2. Open it in your browser.
3. Test login, dashboard, assistant, and other pages.
4. Check Vercel → Deployments → **Logs** if anything fails.

### 5.10 Common deployment errors

| Error | Fix |
|-------|-----|
| Build fails | Check build logs — usually a TypeScript error |
| Environment variable error | Add missing env vars in Vercel → Settings → Environment Variables |
| Blank page | Check browser console — usually missing `NEXT_PUBLIC_` env var |
| 404 on routes | Ensure all pages are in the `app/` directory |
| Auth redirect fails | Update Supabase Auth → URLs → Site URL to your Vercel domain |
| Edge function not found | Verify the function is deployed in Supabase dashboard |

---

## 6. Git & GitHub Workflow

### 6.1 Initialize Git

In your project folder:

```bash
git init
```

**What this does**: Creates a new Git repository in the current folder. Git
starts tracking changes to your files.

### 6.2 Creating a GitHub repository

1. Go to **https://github.com/new**
2. **Repository name**: `nexloop-ai`
3. **Description**: `Industrial symbiosis platform with AI matching`
4. Choose **Private** or **Public**.
5. **Do not** add a README or .gitignore (the project already has one).
6. Click **"Create repository"**.

### 6.3 Connecting the local repository

Copy the URL GitHub gives you, then:

```bash
git remote add origin https://github.com/yourusername/nexloop-ai.git
git branch -M main
```

**What this does**:
- `git remote add origin` — links your local repo to GitHub.
- `git branch -M main` — renames your current branch to `main` (GitHub's
  default).

### 6.4 Committing changes

```bash
# See what changed
git status

# Stage all changes
git add .

# Commit with a message
git commit -m "Add AI matching feature"
```

**What this does**:
- `git status` — shows which files changed.
- `git add .` — stages all changes (prepares them for commit).
- `git commit -m "..."` — saves a snapshot with a message.

### 6.5 Pushing code

```bash
git push origin main
```

**What this does**: Uploads your commits to GitHub.

### 6.6 Pulling updates

If someone else (or you on another computer) made changes:

```bash
git pull origin main
```

**What this does**: Downloads and merges the latest changes from GitHub.

### 6.7 Creating branches

```bash
# Create and switch to a new branch
git checkout -b feature/new-matching-algorithm
```

**What this does**: Creates a separate "timeline" of changes. You can
experiment without affecting `main`.

### 6.8 Merging branches

```bash
# Switch back to main
git checkout main

# Merge your feature branch
git merge feature/new-matching-algorithm

# Push the merged result
git push origin main

# Delete the feature branch (optional cleanup)
git branch -d feature/new-matching-algorithm
```

### 6.9 Git best practices

1. **Commit often**: Small, focused commits are easier to review and revert.
2. **Write clear messages**: `"Add waste listing price recommendation"`
   is better than `"fix"`.
3. **Use branches**: Never develop directly on `main`.
4. **Pull before push**: Always `git pull` before `git push` to avoid
   conflicts.
5. **Use `.gitignore`**: Never commit `node_modules/`, `.env.local`, or
   build output.
6. **Review changes**: Use `git diff` to see what changed before committing.

---

## 7. Project Structure

### 7.1 `app/` — Next.js App Router

This folder contains all pages and routes. Next.js 13+ uses the **App
Router** — each folder is a route, and `page.tsx` is the page component.

| File | Purpose |
|------|---------|
| `layout.tsx` | Root layout — wraps every page with navbar, footer, providers |
| `page.tsx` | Home page (`/`) |
| `globals.css` | Global CSS styles and Tailwind imports |
| `error.tsx` | Error boundary — shows when a page crashes |
| `not-found.tsx` | 404 page |
| `about/page.tsx` | About page (`/about`) |
| `admin/page.tsx` | Admin panel (`/admin`) |
| `analytics/page.tsx` | Analytics dashboard (`/analytics`) |
| `assistant/page.tsx` | AI chatbot (`/assistant`) |
| `contact/page.tsx` | Contact form (`/contact`) |
| `dashboard/page.tsx` | Main dashboard (`/dashboard`) |
| `forgot-password/page.tsx` | Password reset (`/forgot-password`) |
| `leaderboard/page.tsx` | Sustainability leaderboard (`/leaderboard`) |
| `login/page.tsx` | Login page (`/login`) |
| `map/page.tsx` | Waste exchange map (`/map`) |
| `profile/page.tsx` | User profile (`/profile`) |
| `reports/page.tsx` | ESG/sustainability reports (`/reports`) |
| `settings/page.tsx` | User settings (`/settings`) |
| `signup/page.tsx` | Sign up page (`/signup`) |

### 7.2 `components/` — Reusable UI Components

| File | Purpose |
|------|---------|
| `app-shell.tsx` | Wraps pages with navbar + footer + theme |
| `auth-provider.tsx` | React context for Supabase auth state |
| `footer.tsx` | Site footer |
| `navbar.tsx` | Top navigation bar |
| `protected-route.tsx` | Redirects to login if not authenticated |
| `stat-card.tsx` | Reusable statistics card |
| `theme-provider.tsx` | Dark/light mode context |
| `theme-toggle.tsx` | Theme switcher button |
| `leaflet-map.tsx` | Interactive map component |
| `leaflet-map-safe.tsx` | Dynamic import wrapper (prevents SSR issues) |
| `ui/` | shadcn/ui library — Button, Card, Dialog, Table, etc. |

### 7.3 `lib/` — Business Logic and Utilities

| File | Purpose |
|------|---------|
| `ai-client.ts` | Centralized AI client — calls the edge function |
| `ai-service.ts` | AI feature functions (matching, pricing, chat, reports) |
| `data.ts` | Data fetching and seeding helpers |
| `supabase.ts` | Supabase client initialization |
| `types.ts` | TypeScript type definitions for the whole app |
| `utils.ts` | Utility functions (className merging, formatters) |

### 7.4 `hooks/` — Custom React Hooks

| File | Purpose |
|------|---------|
| `use-toast.ts` | Toast notification hook (shows success/error messages) |

### 7.5 `public/` — Static Assets

Files in this folder are served directly by Next.js without processing.

| File | Purpose |
|------|---------|
| `icon.svg` | App favicon |
| `manifest.json` | PWA manifest (for "Add to Home Screen") |

### 7.6 `supabase/` — Database and Edge Functions

| Path | Purpose |
|------|---------|
| `migrations/` | SQL migration files that create tables, policies, seed data |
| `functions/ai-engine/index.ts` | Edge function that proxies AI calls to Groq |

### 7.7 Configuration files

| File | Purpose |
|------|---------|
| `package.json` | Lists all dependencies and npm scripts |
| `next.config.js` | Next.js configuration (image domains, redirects, etc.) |
| `tsconfig.json` | TypeScript configuration (paths, strict mode, etc.) |
| `tailwind.config.ts` | Tailwind CSS theme (colors, fonts, breakpoints) |
| `postcss.config.js` | PostCSS plugins (processes Tailwind) |
| `.eslintrc.json` | ESLint rules (code quality checks) |
| `components.json` | shadcn/ui configuration |
| `netlify.toml` | Netlify deployment configuration |
| `.gitignore` | Files Git should not track |
| `.env` | Bolt preview environment variables (do not edit) |
| `.env.local` | Your local secrets (create this, never commit) |

### 7.8 `middleware` (not present in this project)

If you need middleware (code that runs before every request), create
`middleware.ts` in the root:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Example: redirect to login if not authenticated
  const token = req.cookies.get('sb-access-token');
  if (!token && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/settings/:path*'],
};
```

### 7.9 `api/` routes (optional)

If you add Next.js API routes (instead of edge functions), create them in
`app/api/`. Example: `app/api/ai/route.ts` (see Section 1.9).

### 7.10 `styles/`

This project does not have a separate `styles/` folder. All global styles
are in `app/globals.css`, and component styles use Tailwind CSS utility
classes directly in the JSX.

---

## 8. Production Best Practices

### 8.1 Environment variable security

- **Never** commit `.env.local` to Git (it is in `.gitignore`).
- **Never** use `NEXT_PUBLIC_` prefix for secret keys.
- **Use** Supabase edge function secrets for server-side keys.
- **Rotate** keys periodically (every 3-6 months).
- **Use** different keys for development and production.

### 8.2 API security

- **Rate limit**: Limit requests per user (30/min for Groq free tier).
- **Validate input**: Never trust user input — use Zod schemas.
- **CORS**: Restrict `Access-Control-Allow-Origin` to your domain in
  production (change `*` to your URL).
- **HTTPS only**: Vercel and Supabase enforce this automatically.

### 8.3 Authentication security

- **Enable RLS** on every table — no exceptions.
- **Use `auth.uid()`** for ownership checks, never `current_user`.
- **Set strong password requirements** in Supabase Auth settings.
- **Enable email confirmation** in production.
- **Use HTTPS** — Vercel provides this automatically.
- **Store JWT in httpOnly cookies** — Supabase does this by default.

### 8.4 Database security

- **RLS on every table** — this project follows this rule.
- **4 policies per table** (SELECT, INSERT, UPDATE, DELETE) — never `FOR ALL`.
- **Never use the service role key in the browser** — only in edge functions.
- **Backup regularly** — Supabase provides daily backups on Pro plan.
- **Index frequently queried columns** for performance.

### 8.5 Error logging

- **Frontend**: Use `console.error` and show user-friendly toast messages.
- **Edge functions**: Errors are automatically logged in Supabase dashboard
  → Edge Functions → Logs.
- **Production**: Consider integrating Sentry (https://sentry.io) for error
  tracking.

### 8.6 Performance optimization

- **Code splitting**: Next.js automatically code-splits by page. Use
  `dynamic()` for heavy components like maps and charts.
- **Image optimization**: Use `next/image` instead of `<img>` for automatic
  optimization.
- **Database queries**: Select only needed columns (`select('id, name'`),
  use pagination (`limit` + `offset`), and add indexes.
- **Bundle analysis**: Run `npm run build` and check the output sizes.

### 8.7 Image optimization

Use Next.js's built-in `Image` component:

```tsx
import Image from 'next/image';

<Image
  src="/photo.jpg"
  alt="Waste material"
  width={400}
  height={300}
  priority={false}  // Set true only for above-the-fold images
/>
```

This automatically:
- Serves WebP format
- Resizes images for different screen sizes
- Lazy-loads images below the fold

### 8.8 Caching

- **Next.js fetch caching**: Use `fetch(url, { next: { revalidate: 60 } })`
  to cache API responses for 60 seconds.
- **Supabase queries**: Cache read-heavy queries in React state or use
  `useMemo`.
- **Static generation**: Pages without dynamic data are statically
  generated at build time (see the `○` symbol in build output).

### 8.9 Code splitting

Next.js does this automatically. For manual control:

```tsx
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('@/components/leaflet-map'), {
  ssr: false,  // Do not render on server (Leaflet needs the browser)
  loading: () => <p>Loading map...</p>,
});
```

### 8.10 SEO

- **Metadata**: Each page can export a `metadata` object:

```tsx
export const metadata = {
  title: 'NexLoop AI — Industrial Symbiosis Platform',
  description: 'Match industrial waste with industries that can reuse it.',
};
```

- **Sitemap**: Create `app/sitemap.ts` for automatic sitemap generation.
- **robots.txt**: Create `public/robots.txt`.
- **Semantic HTML**: Use proper heading tags (`h1`, `h2`) and `alt`
  attributes on images.

### 8.11 Accessibility

- **Color contrast**: Ensure text is readable on all backgrounds (WCAG AA
  standard: 4.5:1 for normal text).
- **Keyboard navigation**: All interactive elements should be reachable
  with Tab.
- **ARIA labels**: Add `aria-label` to icon-only buttons.
- **Focus indicators**: Never remove the focus outline without a
  replacement.
- **Screen reader testing**: Test with VoiceOver (built into macOS, press
  `Cmd+F5`).

### 8.12 Deployment checklist

Before deploying to production:

- [ ] All environment variables set in Vercel
- [ ] All edge function secrets set in Supabase
- [ ] `npm run build` passes with no errors
- [ ] `npm run typecheck` passes
- [ ] No `console.log` statements in production code
- [ ] No API keys or secrets in source code
- [ ] RLS enabled on all database tables
- [ ] CORS headers set correctly in edge functions
- [ ] Error boundaries in place (`app/error.tsx`)
- [ ] 404 page works (`app/not-found.tsx`)
- [ ] Tested login, signup, and password reset flows
- [ ] Tested all AI features (matching, chat, reports)
- [ ] Tested on mobile viewport sizes
- [ ] Lighthouse audit score > 90 (run in Chrome DevTools)
- [ ] Supabase Auth redirect URLs updated to production domain
- [ ] Database backups configured

---

## Quick Reference — All Commands

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Start dev server | `npm run dev` |
| Build for production | `npm run build` |
| Run type checking | `npm run typecheck` |
| Run linter | `npm run lint` |
| Start production server | `npm start` |
| Initialize Git | `git init` |
| Commit changes | `git add . && git commit -m "message"` |
| Push to GitHub | `git push origin main` |
| Pull updates | `git pull origin main` |
| Create a branch | `git checkout -b branch-name` |
| Kill port 3000 | `lsof -ti:3000 \| xargs kill -9` |
| Test Groq health | `curl "https://your-project.supabase.co/functions/v1/ai-engine?health=1"` |

---

*This guide covers everything you need to set up, run, and deploy the NexLoop
AI platform. If you encounter issues not covered here, check the
troubleshooting tables in each section or the Supabase and Vercel
documentation.*
