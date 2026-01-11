import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const INDEXNOW_KEY = "mypdfs-indexnow-2026-key";
const SITE_HOST = "mypdfs.in";

// All URLs to index
const ALL_URLS = [
  "/", "/about", "/contact", "/privacy-policy", "/terms-and-conditions", "/blog",
  "/tools/compress-pdf", "/tools/merge-pdf", "/tools/split-pdf", "/tools/pdf-to-word",
  "/tools/word-to-pdf", "/tools/pdf-to-jpg", "/tools/jpg-to-pdf", "/tools/pdf-to-png",
  "/tools/png-to-pdf", "/tools/pdf-to-excel", "/tools/excel-to-pdf", "/tools/pdf-to-ppt",
  "/tools/ppt-to-pdf", "/tools/pdf-to-html", "/tools/html-to-pdf", "/tools/image-to-pdf",
  "/tools/pdf-to-image", "/tools/rotate-pdf", "/tools/unlock-pdf", "/tools/protect-pdf",
  "/tools/sign-pdf", "/tools/watermark-pdf", "/tools/edit-pdf", "/tools/organize-pdf",
  "/tools/repair-pdf", "/tools/convert-pdf", "/tools/compress-image", "/tools/resize-image",
  "/tools/image-format-converter", "/tools/background-remover", "/tools/qr-code-generator",
  "/tools/qr-code-scanner", "/tools/word-counter", "/tools/calculator", "/tools/unit-converter",
  "/tools/currency-converter", "/tools/age-calculator", "/tools/bmi-calculator",
  "/tools/emi-calculator", "/tools/gst-calculator", "/tools/pin-code-generator",
  "/tools/ai-text-generator", "/tools/ai-grammar-tool", "/tools/ai-resume-builder",
  "/tools/ai-chat", "/tools/ai-search", "/tools/hashtag-generator", "/tools/youtube-generator",
  "/tools/seo-tool", "/tools/whatsapp-analyzer", "/tools/file-compressor",
  "/tools/excel-to-word", "/tools/word-to-excel", "/tools/google-drive-to-pdf",
  "/blog/how-to-compress-pdf-files", "/blog/best-free-pdf-tools-online",
  "/blog/convert-images-to-pdf-guide", "/blog/pdf-security-tips",
  "/blog/how-to-merge-pdf-files", "/blog/image-compression-guide"
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls, submitAll } = await req.json();
    
    const urlsToSubmit = submitAll 
      ? ALL_URLS.map(path => `https://${SITE_HOST}${path}`)
      : (urls || []);

    if (urlsToSubmit.length === 0) {
      return new Response(
        JSON.stringify({ error: "No URLs provided" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Submit to IndexNow (Bing, Yandex, Seznam, Naver)
    const indexNowPayload = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${SITE_HOST}/indexnow-key.txt`,
      urlList: urlsToSubmit.slice(0, 10000) // Max 10,000 URLs per request
    };

    const results = {
      bing: null as any,
      yandex: null as any,
      urlsSubmitted: urlsToSubmit.length
    };

    // Submit to Bing IndexNow
    try {
      const bingResponse = await fetch("https://www.bing.com/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(indexNowPayload)
      });
      results.bing = { 
        status: bingResponse.status, 
        success: bingResponse.status === 200 || bingResponse.status === 202 
      };
    } catch (e: unknown) {
      results.bing = { error: e instanceof Error ? e.message : "Unknown error" };
    }

    // Submit to Yandex IndexNow
    try {
      const yandexResponse = await fetch("https://yandex.com/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(indexNowPayload)
      });
      results.yandex = { 
        status: yandexResponse.status, 
        success: yandexResponse.status === 200 || yandexResponse.status === 202 
      };
    } catch (e: unknown) {
      results.yandex = { error: e instanceof Error ? e.message : "Unknown error" };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Submitted ${urlsToSubmit.length} URLs to IndexNow`,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
