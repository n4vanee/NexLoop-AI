/**
 * Centralized AI Client
 *
 * Single entry point for all AI calls. The frontend talks to our Supabase
 * edge function (supabase/functions/ai-engine), which holds the provider
 * secret server-side and forwards the request to the configured AI
 * provider using an OpenAI-compatible Chat Completions endpoint.
 *
 * Provider is configured entirely via environment variables — no keys,
 * model names, or endpoint URLs are hardcoded here.
 *
 * Env vars (set as edge function secrets, NOT in .env):
 *   AI_API_KEY      — bearer token for the AI provider
 *   AI_MODEL         — model id (e.g. "llama-3.3-70b-versatile")
 *   AI_API_BASE_URL  — base URL ending in /v1 (e.g. "https://api.groq.com/openai/v1")
 *
 * To swap providers later, only change these three secrets and redeploy
 * the edge function — no feature-code changes needed.
 */

const EDGE_FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-engine`;

export interface ChatMessageInput {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIClientOptions {
  /** Temperature 0-1; lower = more deterministic (use ~0.2 for matching, ~0.7 for chat) */
  temperature?: number;
  /** Max tokens for the response */
  maxTokens?: number;
}

/**
 * Low-level call to the edge function's chat-completion proxy.
 * Returns the assistant's text response, or throws on error.
 */
export async function aiChatCompletion(
  messages: ChatMessageInput[],
  options: AIClientOptions = {}
): Promise<string> {
  const { temperature = 0.4, maxTokens = 1024 } = options;

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

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`AI request failed (${res.status}): ${detail}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error);
  if (typeof data.content !== 'string' || data.content.length === 0) {
    throw new Error('AI returned an empty response');
  }
  return data.content;
}

/** Whether the AI backend is configured (edge function returns this flag on health check). */
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
