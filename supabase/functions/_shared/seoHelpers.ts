// Shared helpers for the SEO Growth System edge functions.
// - Admin guard (requires authenticated user with the 'admin' role)
// - Service-role Supabase client
// - Lovable AI Gateway wrapper

import { createClient } from "npm:@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export function serviceClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Requires the caller to be an authenticated admin OR to present the
 * `x-cron-secret` header matching the SEO_CRON_SECRET project secret
 * (used by pg_cron triggers).
 */
export async function requireAdminOrCron(req: Request): Promise<
  { ok: true } | { ok: false; response: Response }
> {
  const cronSecret = req.headers.get("x-cron-secret");
  const expected = Deno.env.get("SEO_CRON_SECRET");
  if (expected && cronSecret && cronSecret === expected) return { ok: true };

  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Missing Authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }

  const sb = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error } = await sb.auth.getUser();
  if (error || !userData.user) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }

  const svc = serviceClient();
  const { data: hasRole } = await svc.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (!hasRole) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }
  return { ok: true };
}

/**
 * Call the Lovable AI Gateway, returning the assistant's text response.
 * Defaults to a fast Gemini model — override per-task if needed.
 */
export async function callAI(opts: {
  system: string;
  user: string;
  model?: string;
  jsonMode?: boolean;
  maxTokens?: number;
}): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");

  const body: Record<string, unknown> = {
    model: opts.model ?? "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
  };
  if (opts.jsonMode) body.response_format = { type: "json_object" };
  if (opts.maxTokens) body.max_tokens = opts.maxTokens;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (res.status === 429) throw new Error("AI rate limited. Try again shortly.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add funds in Settings → Usage.");
  if (!res.ok) throw new Error(`AI gateway error ${res.status}: ${await res.text()}`);

  const j = await res.json();
  return j?.choices?.[0]?.message?.content ?? "";
}

export async function callAIJson<T = unknown>(opts: {
  system: string;
  user: string;
  model?: string;
  maxTokens?: number;
}): Promise<T> {
  const raw = await callAI({ ...opts, jsonMode: true });
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Strip code fences if the model wrapped the JSON.
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    return JSON.parse(cleaned) as T;
  }
}

export function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}