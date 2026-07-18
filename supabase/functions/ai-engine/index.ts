// NexLoop AI Engine — Edge Function
//
// Centralized AI proxy. Reads provider config from environment variables and
// forwards requests to any OpenAI-compatible Chat Completions endpoint.
//
// Recommended provider: Groq (free tier, 500+ tok/s, Llama 3.3 70B).
// But any OpenAI-compatible endpoint works — just change the env vars.
//
// Required edge function secrets (set via Supabase dashboard or CLI):
//   AI_API_KEY       — bearer token for the AI provider
//   AI_MODEL          — model id, e.g. "llama-3.3-70b-versatile"
//   AI_API_BASE_URL   — base URL ending in /v1, e.g. "https://api.groq.com/openai/v1"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callProvider(
  messages: { role: string; content: string }[],
  temperature: number,
  maxTokens: number,
): Promise<string> {
  const apiKey = Deno.env.get("AI_API_KEY");
  const model = Deno.env.get("AI_MODEL");
  const baseUrl = Deno.env.get("AI_API_BASE_URL");

  if (!apiKey || !model || !baseUrl) {
    throw new Error(
      "AI not configured. Set AI_API_KEY, AI_MODEL, and AI_API_BASE_URL as edge function secrets.",
    );
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Provider returned ${res.status}: ${detail}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Provider returned no content");
  return content as string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Health check — lets the frontend detect whether secrets are set.
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

    if (action === "chat_completion") {
      const messages = body.messages ?? [];
      const temperature = body.temperature ?? 0.4;
      const maxTokens = body.max_tokens ?? 1024;

      const content = await callProvider(messages, temperature, maxTokens);
      return json({ content });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});
