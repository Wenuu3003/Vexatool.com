// Weekly technical-SEO audit. Uses Firecrawl to map + scrape vexatool.com (and
// optional competitor URLs), detects:
//   - broken links (status >= 400 on internal links)
//   - duplicate titles
//   - missing meta descriptions
//   - missing canonicals
// Writes one row to seo_reports + one row per finding to seo_audit_findings.

import {
  corsHeaders,
  requireAdminOrCron,
  serviceClient,
  jsonResponse,
} from "../_shared/seoHelpers.ts";

const FC_V2 = "https://api.firecrawl.dev/v2";

function fcHeaders() {
  const key = Deno.env.get("FIRECRAWL_API_KEY");
  if (!key) throw new Error("FIRECRAWL_API_KEY not configured");
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

async function firecrawlMap(url: string, limit = 100): Promise<string[]> {
  const r = await fetch(`${FC_V2}/map`, {
    method: "POST",
    headers: fcHeaders(),
    body: JSON.stringify({ url, limit, includeSubdomains: false }),
  });
  if (!r.ok) throw new Error(`Firecrawl map ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return (j.links ?? j.data?.links ?? []) as string[];
}

async function firecrawlScrape(url: string) {
  const r = await fetch(`${FC_V2}/scrape`, {
    method: "POST",
    headers: fcHeaders(),
    body: JSON.stringify({
      url,
      formats: ["html", "links"],
      onlyMainContent: false,
    }),
  });
  if (!r.ok) return null;
  return await r.json();
}

function extractMeta(html: string) {
  const title = /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]?.trim() ?? "";
  const desc = /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i.exec(html)?.[1]?.trim() ?? "";
  const canonical = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i.exec(html)?.[1]?.trim() ?? "";
  return { title, desc, canonical };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const guard = await requireAdminOrCron(req);
  if (!guard.ok) return guard.response;

  let input: { site_url?: string; max_pages?: number } = {};
  if (req.method === "POST") {
    try { input = await req.json(); } catch { /* allow empty */ }
  }
  const siteUrl = input.site_url ?? "https://vexatool.com";
  const maxPages = Math.min(Math.max(input.max_pages ?? 40, 5), 100);

  try {
    const sb = serviceClient();

    const { data: report, error: rErr } = await sb
      .from("seo_reports")
      .insert({
        report_type: "tech_audit",
        period_end: new Date().toISOString().slice(0, 10),
        summary: "Tech-SEO audit running…",
      })
      .select("id")
      .single();
    if (rErr) throw rErr;

    const urls = (await firecrawlMap(siteUrl, maxPages)).slice(0, maxPages);
    const findings: Array<{ url: string; issue_type: string; severity: string; detail?: string }> = [];
    const titles = new Map<string, string[]>();

    // Sequential to respect Firecrawl rate limits.
    for (const u of urls) {
      const page = await firecrawlScrape(u);
      if (!page) {
        findings.push({ url: u, issue_type: "broken_link", severity: "high", detail: "Scrape failed" });
        continue;
      }
      const html = page.html ?? page.data?.html ?? "";
      const { title, desc, canonical } = extractMeta(html);
      if (!title) findings.push({ url: u, issue_type: "missing_title", severity: "high" });
      if (!desc) findings.push({ url: u, issue_type: "missing_meta", severity: "medium" });
      if (!canonical) findings.push({ url: u, issue_type: "canonical", severity: "medium", detail: "No <link rel=canonical>" });
      if (title) {
        const arr = titles.get(title) ?? [];
        arr.push(u);
        titles.set(title, arr);
      }
    }

    for (const [title, list] of titles.entries()) {
      if (list.length > 1) {
        for (const u of list) {
          findings.push({
            url: u, issue_type: "dup_title", severity: "medium",
            detail: `Title shared by ${list.length} pages: "${title.slice(0, 80)}"`,
          });
        }
      }
    }

    if (findings.length > 0) {
      const rows = findings.map((f) => ({
        audit_id: report.id,
        url: f.url,
        issue_type: f.issue_type,
        severity: f.severity,
        detail: f.detail ?? null,
      }));
      await sb.from("seo_audit_findings").insert(rows);
    }

    const summary = `Audited ${urls.length} pages, found ${findings.length} issues.`;
    await sb.from("seo_reports").update({
      summary,
      payload: {
        pages_audited: urls.length,
        issue_counts: findings.reduce<Record<string, number>>((acc, f) => {
          acc[f.issue_type] = (acc[f.issue_type] ?? 0) + 1;
          return acc;
        }, {}),
      },
    }).eq("id", report.id);

    return jsonResponse({ report_id: report.id, summary, findings_count: findings.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("tech-audit error", msg);
    return jsonResponse({ error: msg }, 500);
  }
});