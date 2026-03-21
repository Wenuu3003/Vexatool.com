import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_HOST = "vexatool.com";

// All sitemap URLs (synced with src/config/routes.ts)
const ALL_PATHS = [
  "/", "/blog", "/about-us", "/privacy-policy", "/terms-and-conditions", "/contact", "/disclaimer",
  "/all-tools", "/pdf-tools", "/image-tools", "/calculator-tools", "/qr-tools", "/utility-tools",
  // PDF Tools
  "/merge-pdf", "/split-pdf", "/compress-pdf", "/pdf-to-word", "/word-to-pdf",
  "/edit-pdf", "/sign-pdf", "/watermark-pdf", "/rotate-pdf", "/unlock-pdf", "/protect-pdf",
  "/organize-pdf", "/repair-pdf", "/pdf-to-image", "/pdf-to-jpg", "/pdf-to-png",
  "/pdf-to-html", "/pdf-to-powerpoint", "/pdf-to-excel", "/jpg-to-pdf", "/png-to-pdf",
  "/image-to-pdf",
  // Image Tools
  "/compress-image", "/image-resizer", "/image-format-converter", "/background-remover",
  "/file-compressor", "/whatsapp-dp-resize", "/aadhaar-photo-resize",
  "/govt-job-photo-resize", "/passport-photo-resize",
  // Calculator Tools
  "/calculator", "/bmi-calculator", "/emi-calculator", "/gst-calculator",
  "/love-calculator", "/age-calculator", "/percentage-calculator", "/currency-converter",
  // QR & Utility Tools
  "/qr-code-generator", "/qr-code-scanner", "/word-counter", "/unit-converter", "/pincode-generator",
  // Document Converters
  "/word-to-excel", "/excel-to-word", "/excel-to-pdf", "/ppt-to-pdf", "/html-to-pdf",
  "/google-drive-to-pdf",
  // Blog posts
  "/blog/digital-productivity-habits-that-save-time",
  "/blog/how-to-merge-pdf-files-online-complete-guide",
  "/blog/love-age-calculator-complete-guide",
  "/blog/age-calculator-birthday-planning",
  "/blog/age-calculator-birthday-wishes-motivation",
  "/blog/qr-code-generator-complete-guide",
  "/blog/background-remover-perfect-product-photos",
  "/blog/emi-calculator-home-loan-guide",
  "/blog/gst-calculator-business-guide",
  "/blog/pdf-to-word-formatting-tips",
  "/blog/image-compression-web-performance",
  "/blog/split-pdf-organize-documents",
  "/blog/bmi-calculator-health-guide",
  "/blog/word-to-pdf-professional-documents",
  "/blog/currency-converter-travel-guide",
  "/blog/pdf-watermark-protect-documents",
  "/blog/image-resizer-social-media-guide",
  "/blog/unit-converter-complete-reference",
  "/blog/pdf-to-excel-data-extraction",
  "/blog/word-counter-content-optimization",
  "/blog/pincode-finder-india-postal-guide",
  "/blog/pdf-to-jpg-image-conversion",
];

// Rate limiting
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 3600000;
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  // Cleanup old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.timestamp > RATE_WINDOW_MS) rateLimitMap.delete(key);
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.timestamp > RATE_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === SITE_HOST || parsed.hostname === `www.${SITE_HOST}`;
  } catch {
    return false;
  }
}

// ─── IndexNow submission (Bing + Yandex) ────────────────────────────
async function submitIndexNow(urls: string[]): Promise<Record<string, unknown>> {
  const indexNowKey = Deno.env.get("INDEXNOW_API_KEY") || "58b54417ff684284a45803b3a6855462";

  const payload = {
    host: SITE_HOST,
    key: indexNowKey,
    keyLocation: `https://${SITE_HOST}/${indexNowKey}.txt`,
    urlList: urls,
  };

  const results: Record<string, unknown> = {};

  // Bing
  try {
    const r = await fetch("https://www.bing.com/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    results.bing = { status: r.status, success: r.status === 200 || r.status === 202 };
    console.log(`[IndexNow/Bing] status=${r.status}`);
  } catch (e: unknown) {
    results.bing = { error: e instanceof Error ? e.message : "Unknown error" };
    console.error("[IndexNow/Bing] error:", e);
  }

  // Yandex
  try {
    const r = await fetch("https://yandex.com/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    results.yandex = { status: r.status, success: r.status === 200 || r.status === 202 };
    console.log(`[IndexNow/Yandex] status=${r.status}`);
  } catch (e: unknown) {
    results.yandex = { error: e instanceof Error ? e.message : "Unknown error" };
    console.error("[IndexNow/Yandex] error:", e);
  }

  return results;
}

// ─── Google Indexing API submission ──────────────────────────────────
async function submitGoogleIndexing(urls: string[]): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get("GOOGLE_INDEX_API_KEY");
  if (!apiKey) {
    console.warn("[Google Indexing] GOOGLE_INDEX_API_KEY not set, skipping");
    return { skipped: true, reason: "GOOGLE_INDEX_API_KEY not configured" };
  }

  const results: Record<string, unknown> = {
    submitted: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Google Indexing API accepts one URL at a time
  // Batch in groups to avoid overwhelming
  const batchSize = 100;
  const batch = urls.slice(0, batchSize);

  for (const url of batch) {
    try {
      const r = await fetch(
        `https://indexing.googleapis.com/v3/urlNotifications:publish?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            type: "URL_UPDATED",
          }),
        }
      );

      if (r.ok) {
        (results.submitted as number)++;
      } else {
        (results.failed as number)++;
        const text = await r.text();
        (results.errors as string[]).push(`${url}: ${r.status} ${text.substring(0, 100)}`);
        console.error(`[Google Indexing] ${url} failed: ${r.status}`);
      }
    } catch (e: unknown) {
      (results.failed as number)++;
      (results.errors as string[]).push(
        `${url}: ${e instanceof Error ? e.message : "Unknown error"}`
      );
    }
  }

  console.log(`[Google Indexing] submitted=${results.submitted}, failed=${results.failed}`);
  return results;
}

// ─── Bing Webmaster URL Submission API ───────────────────────────────
async function submitBingWebmaster(urls: string[]): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get("BING_WEBMASTER_API_KEY");
  if (!apiKey) {
    console.warn("[Bing Webmaster] BING_WEBMASTER_API_KEY not set, skipping");
    return { skipped: true, reason: "BING_WEBMASTER_API_KEY not configured" };
  }

  // Bing Webmaster URL Submission API
  const endpoint = `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch?apikey=${apiKey}`;

  try {
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteUrl: `https://${SITE_HOST}`,
        urlList: urls.slice(0, 500), // Bing allows max 500 per batch
      }),
    });

    const status = r.status;
    let responseText = "";
    try { responseText = await r.text(); } catch { /* ignore */ }

    console.log(`[Bing Webmaster] status=${status}`);
    return {
      status,
      success: status === 200,
      response: responseText.substring(0, 200),
    };
  } catch (e: unknown) {
    console.error("[Bing Webmaster] error:", e);
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

// ─── Sitemap ping ────────────────────────────────────────────────────
async function pingSitemaps(): Promise<Record<string, unknown>> {
  const sitemapUrl = `https://${SITE_HOST}/sitemap.xml`;
  const results: Record<string, unknown> = {};

  // Google sitemap ping
  try {
    const r = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    );
    results.google = { status: r.status, success: r.ok };
    console.log(`[Sitemap Ping/Google] status=${r.status}`);
  } catch (e: unknown) {
    results.google = { error: e instanceof Error ? e.message : "Unknown error" };
  }

  // Bing sitemap ping
  try {
    const r = await fetch(
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    );
    results.bing = { status: r.status, success: r.ok };
    console.log(`[Sitemap Ping/Bing] status=${r.status}`);
  } catch (e: unknown) {
    results.bing = { error: e instanceof Error ? e.message : "Unknown error" };
  }

  return results;
}

// ─── Main handler ────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(clientIp)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Maximum 10 requests per hour." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { urls, submitAll, action } = body;

    // ── Action: submit-all (full index submission) ──
    if (action === "submit-all" || submitAll) {
      const allUrls = ALL_PATHS.map((p) => `https://${SITE_HOST}${p}`);
      console.log(`[submit-all] Submitting ${allUrls.length} URLs to all engines`);

      const [indexNowResults, googleResults, bingWebmasterResults, sitemapResults] =
        await Promise.all([
          submitIndexNow(allUrls),
          submitGoogleIndexing(allUrls),
          submitBingWebmaster(allUrls),
          pingSitemaps(),
        ]);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Submitted ${allUrls.length} URLs to all indexing services`,
          urlCount: allUrls.length,
          results: {
            indexNow: indexNowResults,
            googleIndexing: googleResults,
            bingWebmaster: bingWebmasterResults,
            sitemapPing: sitemapResults,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Action: ping-sitemaps ──
    if (action === "ping-sitemaps") {
      const results = await pingSitemaps();
      return new Response(
        JSON.stringify({ success: true, action: "ping-sitemaps", results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Action: status (check configuration) ──
    if (action === "status") {
      return new Response(
        JSON.stringify({
          success: true,
          configuration: {
            indexNowKey: Deno.env.get("INDEXNOW_API_KEY") ? "configured" : "using default",
            googleIndexApiKey: Deno.env.get("GOOGLE_INDEX_API_KEY") ? "configured" : "NOT SET",
            bingWebmasterApiKey: Deno.env.get("BING_WEBMASTER_API_KEY") ? "configured" : "NOT SET",
            totalUrls: ALL_PATHS.length,
            siteHost: SITE_HOST,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Default: submit specific URLs ──
    let urlsToSubmit: string[] = [];
    if (Array.isArray(urls)) {
      urlsToSubmit = urls.filter(
        (url: unknown) => typeof url === "string" && isValidUrl(url)
      );
    }

    if (urlsToSubmit.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No valid URLs provided. Use submitAll:true or provide urls array.",
          hint: "Available actions: submit-all, ping-sitemaps, status",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const limited = urlsToSubmit.slice(0, 10000);
    const [indexNowResults, googleResults, bingWebmasterResults] = await Promise.all([
      submitIndexNow(limited),
      submitGoogleIndexing(limited),
      submitBingWebmaster(limited),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Submitted ${limited.length} URLs`,
        urlCount: limited.length,
        results: {
          indexNow: indexNowResults,
          googleIndexing: googleResults,
          bingWebmaster: bingWebmasterResults,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[indexnow] Request error:", error);
    return new Response(
      JSON.stringify({ error: "Invalid request format" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
