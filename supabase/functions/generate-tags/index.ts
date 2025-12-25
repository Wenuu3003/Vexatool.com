import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const ALLOWED_ORIGINS = [
  "https://mypdfs.lovable.app",
  "https://mrjefpimgfzzjwoidocf.lovable.app",
  "https://www.mypdfs.com",
  "http://localhost:5173",
  "http://localhost:8080",
];

const isAllowedOrigin = (origin: string) => {
  try {
    const url = new URL(origin);
    return url.hostname.endsWith(".lovable.app") || url.hostname.endsWith(".lovableproject.com");
  } catch {
    return false;
  }
};

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin =
    origin && (ALLOWED_ORIGINS.includes(origin) || isAllowedOrigin(origin))
      ? origin
      : "*";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.log("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Authentication failed" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    const { content, platform } = await req.json();
    
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const platformInstructions = platform === "youtube" 
      ? "Generate tags optimized for YouTube video SEO. Focus on search terms viewers use."
      : platform === "instagram"
      ? "Generate hashtags optimized for Instagram engagement and discovery."
      : platform === "twitter"
      ? "Generate hashtags optimized for Twitter/X trending and engagement."
      : "Generate general SEO-optimized tags suitable for any platform.";

    const systemPrompt = `You are an expert SEO and social media specialist. Generate relevant, high-performing tags/hashtags for the given content.

${platformInstructions}

Rules:
- Generate 15-25 tags
- Mix broad popular tags with niche specific ones
- Include trending relevant terms when applicable
- Format each tag without # prefix in the JSON (we add it later if needed)
- Tags should be lowercase, no spaces (use underscores if needed)
- Focus on discoverability and relevance`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate SEO-optimized tags for the following content:\n\n${content}` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_tags",
              description: "Return a list of relevant tags for the content",
              parameters: {
                type: "object",
                properties: {
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Array of tag strings without # prefix"
                  },
                  categories: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 main categories/themes identified"
                  }
                },
                required: ["tags", "categories"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_tags" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service payment required." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      console.log("Generated tags for user:", user.id, "tags count:", result.tags?.length);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: parse from content if tool calling didn't work
    const content_response = data.choices?.[0]?.message?.content || "";
    return new Response(
      JSON.stringify({ tags: [], categories: [], raw: content_response }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Generate tags error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
