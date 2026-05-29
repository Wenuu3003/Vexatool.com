// GSC Intelligence: pulls Search Console data for vexatool.com via the
// Google Search Console connector gateway, asks Gemini for improvement
// recommendations, and stores everything in public.seo_reports.
//
// POST body (all optional):
//   { site_url?: string, days?: number }
// Defaults: site_url="https://vexatool.com/", days=28

import {
  corsHeaders,
  requireAdminOrCron,
  serviceClient,
  callAIJson,
  jsonResponse,
} from "../_shared/seoHelpers.ts";

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

async function queryGsc(siteUrl: string, dimensions: string[], days: number, rowLimit = 250) {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const gscKey = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
  if (!lovableKey || !gscKey) {
    throw new Error("GSC connector secrets not configured");
  }

  const end = new Date();
  const start = new Date(end.getTime() - days * 86_400_000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const url = `${GATEWAY}/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": gscKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate: fmt(start),
      endDate: fmt(end),
      dimensions,
      rowLimit,
    }),
  });
  if (!res.ok) {
    throw new Error(`GSC query failed ${res.status}: ${await res.text()}`);
  }
  const j = await res.json();
  return (j.rows ?? []) as GscRow[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const guard = await requireAdminOrCron(req);
  if (!guard.ok) return guard.response;

  let input: { site_url?: string; days?: number } = {};
  if (req.method === "POST") {
    try { input = await req.json(); } catch { /* allow empty body */ }
  }
  const siteUrl = input.site_url ?? "https://vexatool.com/";
  const days = Math.min(Math.max(input.days ?? 28, 7), 90);

  try {
    // Two parallel pulls: by query, and by page.
    const [queryRows, pageRows] = await Promise.all([
      queryGsc(siteUrl, ["query"], days),
      queryGsc(siteUrl, ["page"], days),
    ]);

    const topImpressions = [...queryRows]
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 25);

    const lowCtr = queryRows
      .filter((r) => r.impressions >= 200 && r.ctr < 0.02)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 25);

    const striking = queryRows
      .filter((r) => r.position >= 5 && r.position <= 20 && r.impressions >= 50)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 25);

    const topPages = [...pageRows]
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 25);

    const aiInput = JSON.stringify({
      striking_distance_queries: striking.map((r) => ({
        query: r.keys[0], impressions: r.impressions, position: Math.round(r.position * 10) / 10, ctr: r.ctr,
      })),
      low_ctr_queries: lowCtr.map((r) => ({
        query: r.keys[0], impressions: r.impressions, ctr: r.ctr, position: Math.round(r.position * 10) / 10,
      })),
      top_pages: topPages.map((r) => ({ page: r.keys[0], clicks: r.clicks, impressions: r.impressions })),
    });

    const recs = await callAIJson<{
      summary: string;
      title_meta_rewrites: { query: string; suggested_title: string; suggested_meta: string }[];
      new_landing_page_ideas: { intent: string; suggested_slug: string; rationale: string }[];
      internal_linking: { from_page: string; to_page: string; anchor: string; reason: string }[];
    }>({
      system: `You are a senior SEO strategist for VexaTool (vexatool.com), an India-focused
free utilities site. Read the GSC data and return STRICT JSON with prioritized,
helpful, AdSense-safe recommendations. Focus on striking-distance wins (pos 5–20) and
CTR improvements. India intents (Aadhaar/PAN/exam/passport/KB compress) score higher.`,
      user: `GSC last ${days} days:\n${aiInput}\n\nReturn JSON shape:\n{\n  "summary": string,\n  "title_meta_rewrites": [...],\n  "new_landing_page_ideas": [...],\n  "internal_linking": [...]\n}`,
      maxTokens: 2500,
    });

    const sb = serviceClient();
    const { data: inserted, error } = await sb
      .from("seo_reports")
      .insert({
        report_type: "gsc_intelligence",
        period_start: new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10),
        period_end: new Date().toISOString().slice(0, 10),
        summary: recs.summary,
        payload: { topImpressions, lowCtr, striking, topPages, recommendations: recs },
      })
      .select("id")
      .single();
    if (error) throw error;

    return jsonResponse({ report_id: inserted.id, summary: recs.summary, counts: {
      topImpressions: topImpressions.length,
      striking: striking.length,
      lowCtr: lowCtr.length,
      topPages: topPages.length,
    }});
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("gsc-intelligence error", msg);
    return jsonResponse({ error: msg }, 500);
  }
});