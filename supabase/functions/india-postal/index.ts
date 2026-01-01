import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_QUERY_LENGTH = 100;

type IndiaPostOffice = {
  Name: string;
  Description: string | null;
  BranchType: string;
  DeliveryStatus: string;
  Circle: string;
  District: string;
  Division: string;
  Region: string;
  Block: string;
  State: string;
  Country: string;
  Pincode: string;
};

type IndiaPostResponse = Array<{
  Status: "Success" | "Error";
  Message: string;
  PostOffice: IndiaPostOffice[] | null;
}>;

function mapBranchType(branchType: string): string {
  const t = branchType.toLowerCase();
  if (t.includes("head")) return "HO";
  if (t.includes("sub")) return "SO";
  if (t.includes("branch")) return "BO";
  if (t.includes("gpo")) return "GPO";
  return "";
}

function sanitizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: { query?: unknown };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const queryRaw = body.query;
    if (typeof queryRaw !== "string") {
      return new Response(JSON.stringify({ error: "Query must be a string" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const query = sanitizeQuery(queryRaw);

    if (!query) {
      return new Response(JSON.stringify({ error: "Query cannot be empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (query.length > MAX_QUERY_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const isPincode = /^\d{6}$/.test(query);
    const isAllDigits = /^\d+$/.test(query);

    if (!isPincode && isAllDigits) {
      // For partial numeric input, do not query upstream.
      return new Response(JSON.stringify({ results: [], message: "Please enter a 6-digit PIN code." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upstreamUrl = isPincode
      ? `https://api.postalpincode.in/pincode/${query}`
      : `https://api.postalpincode.in/postoffice/${encodeURIComponent(query)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const upstreamRes = await fetch(upstreamUrl, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
      },
    }).finally(() => clearTimeout(timeout));

    if (!upstreamRes.ok) {
      return new Response(JSON.stringify({ results: [], message: "Postal service error. Please try again." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upstreamJson = (await upstreamRes.json()) as IndiaPostResponse;
    const first = upstreamJson?.[0];

    if (!first || first.Status !== "Success" || !Array.isArray(first.PostOffice)) {
      return new Response(
        JSON.stringify({ results: [], message: first?.Message || "No results found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = first.PostOffice.map((po) => {
      const suffix = mapBranchType(po.BranchType);
      const postOffice = suffix ? `${po.Name} ${suffix}` : po.Name;

      return {
        state: po.State,
        district: po.District,
        mandal: po.Block || po.Division || "",
        village: po.Name,
        post_office: postOffice,
        pincode: po.Pincode,
      };
    });

    // Put exact name matches first for name queries.
    if (!isPincode) {
      const qLower = query.toLowerCase();
      results.sort((a, b) => {
        const aExact = a.village.toLowerCase() === qLower;
        const bExact = b.village.toLowerCase() === qLower;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return a.village.localeCompare(b.village);
      });
    }

    return new Response(JSON.stringify({ results, message: "OK" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ results: [], error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
