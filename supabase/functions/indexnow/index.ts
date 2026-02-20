import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const INDEXNOW_KEY = "58b54417ff684284a45803b3a6855462";
const SITE_HOST = "mypdfs.in";

// Rate limiting configuration
const RATE_LIMIT = 10; // Max requests per window
const RATE_WINDOW_MS = 3600000; // 1 hour in milliseconds
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

// Clean up old rate limit entries periodically
function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.timestamp > RATE_WINDOW_MS) {
      rateLimitMap.delete(key);
    }
  }
}

// Check rate limit for an IP
function checkRateLimit(ip: string): boolean {
  cleanupRateLimits();
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now - entry.timestamp > RATE_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Validate URL format
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow URLs from our domain
    return parsed.hostname === SITE_HOST || parsed.hostname === `www.${SITE_HOST}`;
  } catch {
    return false;
  }
}

// Validate IP address format
function isValidIpAddress(ip: string): boolean {
  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 pattern (simplified)
  const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^([0-9a-fA-F]{1,4}:)*::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;
  
  if (ipv4Pattern.test(ip)) {
    // Validate each octet is 0-255
    const octets = ip.split('.').map(Number);
    return octets.every(octet => octet >= 0 && octet <= 255);
  }
  
  return ipv6Pattern.test(ip);
}

// Verify bot IP using reverse DNS lookup
// Bingbot: hostnames ending with .search.msn.com
// Googlebot: hostnames ending with .googlebot.com or .google.com
async function verifyBotIp(
  ip: string, 
  botType: 'bingbot' | 'googlebot'
): Promise<{
  isValid: boolean;
  hostname: string | null;
  forwardIp: string | null;
  error: string | null;
}> {
  try {
    // Step 1: Reverse DNS lookup using Cloudflare's DNS-over-HTTPS
    const reverseName = ip.split('.').reverse().join('.') + '.in-addr.arpa';
    
    const reverseResponse = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${reverseName}&type=PTR`,
      {
        headers: { 'Accept': 'application/dns-json' }
      }
    );
    
    if (!reverseResponse.ok) {
      return {
        isValid: false,
        hostname: null,
        forwardIp: null,
        error: "Failed to perform reverse DNS lookup"
      };
    }
    
    const reverseData = await reverseResponse.json();
    
    if (!reverseData.Answer || reverseData.Answer.length === 0) {
      return {
        isValid: false,
        hostname: null,
        forwardIp: null,
        error: "No PTR record found for this IP"
      };
    }
    
    // Get hostname from PTR record
    let hostname = reverseData.Answer[0].data;
    // Remove trailing dot if present
    hostname = hostname.replace(/\.$/, '');
    
    // Check hostname based on bot type
    let isValidHostname = false;
    let expectedSuffix = '';
    
    if (botType === 'bingbot') {
      isValidHostname = hostname.endsWith('.search.msn.com');
      expectedSuffix = '.search.msn.com';
    } else if (botType === 'googlebot') {
      isValidHostname = hostname.endsWith('.googlebot.com') || hostname.endsWith('.google.com');
      expectedSuffix = '.googlebot.com or .google.com';
    }
    
    if (!isValidHostname) {
      return {
        isValid: false,
        hostname,
        forwardIp: null,
        error: `Hostname "${hostname}" does not end with ${expectedSuffix}`
      };
    }
    
    // Step 2: Forward DNS lookup to verify the hostname resolves back to the IP
    const forwardResponse = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${hostname}&type=A`,
      {
        headers: { 'Accept': 'application/dns-json' }
      }
    );
    
    if (!forwardResponse.ok) {
      return {
        isValid: false,
        hostname,
        forwardIp: null,
        error: "Failed to perform forward DNS lookup"
      };
    }
    
    const forwardData = await forwardResponse.json();
    
    if (!forwardData.Answer || forwardData.Answer.length === 0) {
      return {
        isValid: false,
        hostname,
        forwardIp: null,
        error: "No A record found for hostname"
      };
    }
    
    // Check if any of the resolved IPs match the original IP
    const resolvedIps = forwardData.Answer.map((a: { data: string }) => a.data);
    const forwardIp = resolvedIps[0];
    const ipMatches = resolvedIps.includes(ip);
    
    if (!ipMatches) {
      return {
        isValid: false,
        hostname,
        forwardIp,
        error: `Forward lookup IP (${forwardIp}) does not match original IP (${ip})`
      };
    }
    
    // Both checks passed - this is a legitimate bot IP
    return {
      isValid: true,
      hostname,
      forwardIp,
      error: null
    };
    
  } catch (e: unknown) {
    return {
      isValid: false,
      hostname: null,
      forwardIp: null,
      error: e instanceof Error ? e.message : "Unknown error during verification"
    };
  }
}

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
  "/tools/currency-converter", "/tools/love-calculator", "/tools/bmi-calculator",
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

  // Get client IP for rate limiting
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   req.headers.get('x-real-ip') || 
                   'unknown';

  // Apply rate limiting
  if (!checkRateLimit(clientIp)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Maximum 10 requests per hour." }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { urls, submitAll, action, ip } = body;
    
    // Handle bot IP verification actions
    if (action === 'verify-bingbot' || action === 'verify-googlebot') {
      if (!ip || typeof ip !== 'string') {
        return new Response(
          JSON.stringify({ error: "IP address is required for verification" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Validate IP format
      if (!isValidIpAddress(ip)) {
        return new Response(
          JSON.stringify({ error: "Invalid IP address format" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const botType = action === 'verify-bingbot' ? 'bingbot' : 'googlebot';
      const result = await verifyBotIp(ip, botType);
      
      const responseKey = botType === 'bingbot' ? 'isBingbot' : 'isGooglebot';
      const suffix = botType === 'bingbot' 
        ? '.search.msn.com' 
        : '.googlebot.com or .google.com';
      
      return new Response(
        JSON.stringify({
          ip,
          botType,
          [responseKey]: result.isValid,
          isVerified: result.isValid,
          hostname: result.hostname,
          forwardIp: result.forwardIp,
          error: result.error,
          verificationMethod: "Reverse DNS lookup (PTR) + Forward DNS verification",
          trustedHostnameSuffix: suffix
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Default action: Submit URLs to IndexNow
    let urlsToSubmit: string[];
    
    if (submitAll) {
      urlsToSubmit = ALL_URLS.map(path => `https://${SITE_HOST}${path}`);
    } else if (Array.isArray(urls)) {
      // Validate and filter URLs - only allow our domain
      urlsToSubmit = urls.filter((url: unknown) => {
        if (typeof url !== 'string') return false;
        return isValidUrl(url);
      });
      
      if (urlsToSubmit.length !== urls.length) {
        console.warn(`Filtered out ${urls.length - urlsToSubmit.length} invalid URLs`);
      }
    } else {
      urlsToSubmit = [];
    }

    if (urlsToSubmit.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid URLs provided. URLs must be from mypdfs.in domain." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit to max 10,000 URLs per IndexNow spec
    const limitedUrls = urlsToSubmit.slice(0, 10000);

    // Submit to IndexNow (Bing, Yandex, Seznam, Naver)
    const indexNowPayload = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
keyLocation: `https://${SITE_HOST}/58b54417ff684284a45803b3a6855462.txt`,
      urlList: limitedUrls
    };

    const results = {
      bing: null as { status?: number; success?: boolean; error?: string } | null,
      yandex: null as { status?: number; success?: boolean; error?: string } | null,
      urlsSubmitted: limitedUrls.length
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
        message: `Submitted ${limitedUrls.length} URLs to IndexNow`,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: "Invalid request format" }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
