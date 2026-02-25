import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 10000;
const VALID_ROLES = ['user', 'assistant', 'system'];

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS_ANONYMOUS = 5; // 5 requests per minute for anonymous
const RATE_LIMIT_MAX_REQUESTS_AUTHENTICATED = 30; // 30 requests per minute for authenticated

// In-memory rate limit store (resets on cold start, acceptable for edge function)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface ChatMessage {
  role: string;
  content: string;
}

function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

function checkRateLimit(identifier: string, isAuthenticated: boolean): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const maxRequests = isAuthenticated ? RATE_LIMIT_MAX_REQUESTS_AUTHENTICATED : RATE_LIMIT_MAX_REQUESTS_ANONYMOUS;
  
  const existing = rateLimitStore.get(identifier);
  
  if (!existing || now > existing.resetTime) {
    // Start new window
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: maxRequests - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  
  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: existing.resetTime - now };
  }
  
  existing.count++;
  return { allowed: true, remaining: maxRequests - existing.count, resetIn: existing.resetTime - now };
}

// Cleanup old entries periodically (prevent memory leak)
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

function validateMessages(messages: unknown): { valid: boolean; error?: string } {
  if (!Array.isArray(messages)) {
    return { valid: false, error: 'Invalid messages format: expected an array' };
  }

  if (messages.length === 0) {
    return { valid: false, error: 'Messages array cannot be empty' };
  }

  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: `Too many messages: maximum ${MAX_MESSAGES} allowed` };
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i] as ChatMessage;
    
    if (!msg || typeof msg !== 'object') {
      return { valid: false, error: `Invalid message at index ${i}: expected an object` };
    }

    if (!msg.role || typeof msg.role !== 'string') {
      return { valid: false, error: `Invalid message at index ${i}: missing or invalid role` };
    }

    if (!VALID_ROLES.includes(msg.role)) {
      return { valid: false, error: `Invalid message at index ${i}: role must be one of ${VALID_ROLES.join(', ')}` };
    }

    if (!msg.content || typeof msg.content !== 'string') {
      return { valid: false, error: `Invalid message at index ${i}: missing or invalid content` };
    }

    if (msg.content.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, error: `Message at index ${i} exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` };
    }
  }

  return { valid: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Cleanup old rate limit entries
    cleanupRateLimitStore();

    // Authentication check - supports both authenticated and anonymous access
    // Anonymous access is intentionally allowed for public tools (Grammar, Text Generator, etc.)
    let userId = "anonymous";
    let isAuthenticated = false;
    const authHeader = req.headers.get('Authorization');
    const clientIP = getClientIP(req);
    
    if (authHeader && authHeader !== `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          userId = user.id;
          isAuthenticated = true;
        }
      } catch (authErr) {
        // Authentication failed - continue as anonymous with rate limiting
        console.log("Auth check failed, continuing as anonymous with rate limits");
      }
    }

    // Apply rate limiting
    const rateLimitIdentifier = isAuthenticated ? `user:${userId}` : `ip:${clientIP}`;
    const rateLimit = checkRateLimit(rateLimitIdentifier, isAuthenticated);
    
    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for ${rateLimitIdentifier}`);
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded. Please wait before making more requests.",
          retryAfter: Math.ceil(rateLimit.resetIn / 1000)
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(rateLimit.resetIn / 1000)),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetIn / 1000))
          } 
        }
      );
    }

    console.log(`AI Chat request from: ${userId} (${isAuthenticated ? 'authenticated' : 'anonymous'}) [${clientIP}] - ${rateLimit.remaining} requests remaining`);

    // Parse and validate request body
    let body: { messages?: unknown; systemPrompt?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, systemPrompt } = body;
    
    // Validate messages input
    const validation = validateMessages(messages);
    if (!validation.valid) {
      console.error("Message validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const defaultSystemPrompt = `You are a helpful AI assistant for VexaTool, a website with various online tools.
You help users with:
- PDF tools (merge, split, compress, convert, edit, sign, watermark, rotate, unlock, protect, organize, repair)
- QR code generation and scanning
- Calculator, currency converter, SEO analyzer, tags generator
- Any general questions they may have

Be concise, friendly, and helpful. Provide practical advice and step-by-step instructions when needed.
If asked about using tools on the website, guide them to the appropriate tool.`;

    console.log("Calling Lovable AI Gateway...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { 
            role: "system", 
            content: systemPrompt || defaultSystemPrompt
          },
          ...(messages as ChatMessage[]),
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded from AI gateway");
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const assistantResponse = data.choices?.[0]?.message?.content || "I couldn't generate a response.";

    console.log("AI response generated successfully for:", userId);

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": String(rateLimit.remaining)
        } 
      }
    );
  } catch (error) {
    console.error("AI Chat error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
