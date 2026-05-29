// Programmatic SEO page generator.
// POST body: { presets: [{ slug, category, parent_tool_slug, h1_hint, preset_payload }], dry_run?: boolean }
// For each preset, asks Gemini for SEO title/meta/H1/sections/FAQs/internal-links/breadcrumbs
// in strict JSON, then upserts into public.programmatic_seo_pages.

import {
  corsHeaders,
  requireAdminOrCron,
  serviceClient,
  callAIJson,
  jsonResponse,
} from "../_shared/seoHelpers.ts";

interface Preset {
  slug: string;
  category: string;
  parent_tool_slug?: string;
  h1_hint?: string;
  preset_payload?: Record<string, unknown>;
}

interface GeneratedPage {
  seo_title: string;
  meta_description: string;
  h1: string;
  intro_md: string;
  sections: { heading: string; body_md: string }[];
  faqs: { q: string; a: string }[];
  internal_links: { href: string; label: string }[];
  breadcrumbs: { name: string; href: string }[];
}

const SYSTEM = `You are an elite SEO content engineer for VexaTool (https://vexatool.com),
a free, privacy-first online utility suite (PDF, image, QR, calculators) popular in India.

You generate SEO landing pages for very specific user intents (e.g. "compress image to 50kb",
"resize photo for Aadhaar"). Pages must be helpful, human, AdSense-safe, NOT AI-spammy,
and follow Google's helpful-content guidelines.

Constraints:
- SEO title: ≤60 chars, includes the primary keyword + brand "| VexaTool".
- Meta description: ≤155 chars, action-oriented, includes one benefit.
- H1: distinct from SEO title; user-friendly.
- intro_md: 80–140 words, plain markdown, no headings inside.
- sections: 3–5 sections, each with H2 heading and 100–180 words body_md.
- faqs: 5–8 schema-ready FAQs, concise answers (≤60 words).
- internal_links: 4–6 links to existing VexaTool routes from this allow-list only:
  /compress-image, /image-resizer, /image-format-converter, /background-remover,
  /compress-pdf, /merge-pdf, /split-pdf, /pdf-to-jpg, /jpg-to-pdf,
  /passport-photo-resize, /aadhaar-photo-resize, /govt-job-photo-resize,
  /whatsapp-dp-resize, /qr-code-generator, /word-counter, /pincode-generator.
- breadcrumbs: [{name:"Home",href:"/"}, ... up to 3 levels].
- India-leaning where the intent suggests it (Aadhaar/PAN/exam/passport/KB-targets).
- NEVER mention AI, GPT, ChatGPT, "as an AI", or popups.
- Output STRICT JSON ONLY matching the requested shape. No prose, no code fences.`;

function buildUserPrompt(p: Preset): string {
  return [
    `Generate page JSON for:`,
    `slug: ${p.slug}`,
    `category: ${p.category}`,
    p.parent_tool_slug ? `parent_tool_slug: ${p.parent_tool_slug}` : "",
    p.h1_hint ? `intent: ${p.h1_hint}` : "",
    p.preset_payload ? `preset_payload: ${JSON.stringify(p.preset_payload)}` : "",
    ``,
    `Output schema:`,
    `{`,
    `  "seo_title": string,`,
    `  "meta_description": string,`,
    `  "h1": string,`,
    `  "intro_md": string,`,
    `  "sections": [{"heading": string, "body_md": string}],`,
    `  "faqs": [{"q": string, "a": string}],`,
    `  "internal_links": [{"href": string, "label": string}],`,
    `  "breadcrumbs": [{"name": string, "href": string}]`,
    `}`,
  ].filter(Boolean).join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const guard = await requireAdminOrCron(req);
  if (!guard.ok) return guard.response;

  let body: { presets?: Preset[]; dry_run?: boolean };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const presets = Array.isArray(body.presets) ? body.presets : [];
  if (presets.length === 0) return jsonResponse({ error: "presets required" }, 400);
  if (presets.length > 25) return jsonResponse({ error: "max 25 presets per call" }, 400);

  const sb = serviceClient();
  const results: Array<{ slug: string; status: "ok" | "error"; error?: string }> = [];

  for (const preset of presets) {
    if (!preset?.slug || !preset?.category) {
      results.push({ slug: preset?.slug ?? "(missing)", status: "error", error: "slug+category required" });
      continue;
    }
    try {
      const generated = await callAIJson<GeneratedPage>({
        system: SYSTEM,
        user: buildUserPrompt(preset),
        maxTokens: 3000,
      });

      if (body.dry_run) {
        results.push({ slug: preset.slug, status: "ok" });
        continue;
      }

      const row = {
        slug: preset.slug,
        category: preset.category,
        parent_tool_slug: preset.parent_tool_slug ?? null,
        preset_payload: preset.preset_payload ?? {},
        seo_title: generated.seo_title,
        meta_description: generated.meta_description,
        h1: generated.h1,
        intro_md: generated.intro_md,
        sections: generated.sections ?? [],
        faqs: generated.faqs ?? [],
        internal_links: generated.internal_links ?? [],
        breadcrumbs: generated.breadcrumbs ?? [],
        canonical_url: `https://vexatool.com/${preset.slug}`,
        is_published: true,
      };

      const { error } = await sb
        .from("programmatic_seo_pages")
        .upsert(row, { onConflict: "slug" });
      if (error) throw error;
      results.push({ slug: preset.slug, status: "ok" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("generate failed", preset.slug, msg);
      results.push({ slug: preset.slug, status: "error", error: msg });
    }
  }

  return jsonResponse({ results });
});