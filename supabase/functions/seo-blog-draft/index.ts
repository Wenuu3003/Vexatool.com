// AI blog draft generator.
// POST body: { topic: string, target_keyword?: string, save_to_google_doc?: boolean }
// Pipeline: Perplexity research → Gemini long-form draft → optional Google Doc save.
// Stores result in public.seo_blog_drafts (status='draft').

import {
  corsHeaders,
  requireAdminOrCron,
  serviceClient,
  callAIJson,
  jsonResponse,
} from "../_shared/seoHelpers.ts";

interface Draft {
  title: string;
  slug: string;
  meta_description: string;
  outline: { heading: string; bullets: string[] }[];
  content_md: string;
  faqs: { q: string; a: string }[];
  internal_links: { href: string; label: string }[];
}

async function perplexityResearch(topic: string, keyword?: string): Promise<{ summary: string; sources: string[] }> {
  const key = Deno.env.get("PERPLEXITY_API_KEY");
  if (!key) return { summary: "", sources: [] };
  const q = keyword ? `${topic} (keyword focus: ${keyword})` : topic;
  const r = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        { role: "system", content: "Be precise and factual. Cite reputable sources." },
        { role: "user", content: `Brief research notes (8-12 bullet points) for a help-content blog post on: ${q}. Focus on what real users in India ask, common pain points, current best practices.` },
      ],
    }),
  });
  if (!r.ok) return { summary: "", sources: [] };
  const j = await r.json();
  return {
    summary: j?.choices?.[0]?.message?.content ?? "",
    sources: Array.isArray(j?.citations) ? j.citations : [],
  };
}

async function saveToGoogleDoc(title: string, contentMd: string): Promise<{ docId: string; url: string } | null> {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const docsKey = Deno.env.get("GOOGLE_DOCS_API_KEY");
  if (!lovableKey || !docsKey) return null;

  // Create the doc.
  const createRes = await fetch("https://connector-gateway.lovable.dev/google_docs/v1/documents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": docsKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });
  if (!createRes.ok) {
    console.error("Google Docs create failed", createRes.status, await createRes.text());
    return null;
  }
  const doc = await createRes.json();
  const docId = doc.documentId;

  // Insert the markdown content as plain text (simplest reliable insert).
  const insertRes = await fetch(
    `https://connector-gateway.lovable.dev/google_docs/v1/documents/${docId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": docsKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [{ insertText: { location: { index: 1 }, text: contentMd } }],
      }),
    },
  );
  if (!insertRes.ok) {
    console.error("Google Docs insert failed", insertRes.status, await insertRes.text());
  }

  return { docId, url: `https://docs.google.com/document/d/${docId}/edit` };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const guard = await requireAdminOrCron(req);
  if (!guard.ok) return guard.response;

  let body: { topic?: string; target_keyword?: string; save_to_google_doc?: boolean };
  try { body = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }

  const topic = body.topic?.trim();
  if (!topic) return jsonResponse({ error: "topic required" }, 400);

  try {
    const research = await perplexityResearch(topic, body.target_keyword);

    const draft = await callAIJson<Draft>({
      system: `You are a senior content writer for VexaTool (vexatool.com), an India-focused free
utilities site (PDF/image/QR/calculators). Write a helpful, human, AdSense-safe blog post
optimized for SEO + featured snippets.

Rules:
- 1200–1800 words in clean markdown
- Clear H2/H3 hierarchy
- Short paragraphs (2–4 sentences), scannable
- Include a TL;DR at the top
- No AI/GPT references, no spammy phrasing
- Recommend specific VexaTool routes where relevant from this allow-list:
  /compress-image, /image-resizer, /compress-pdf, /merge-pdf, /split-pdf,
  /pdf-to-jpg, /jpg-to-pdf, /passport-photo-resize, /aadhaar-photo-resize,
  /govt-job-photo-resize, /whatsapp-dp-resize, /qr-code-generator
- Output STRICT JSON only.`,
      user: `Topic: ${topic}\n${body.target_keyword ? `Target keyword: ${body.target_keyword}\n` : ""}\nResearch notes:\n${research.summary || "(none)"}\n\nReturn JSON:\n{\n  "title": string (≤65 chars),\n  "slug": string (kebab-case),\n  "meta_description": string (≤155 chars),\n  "outline": [{"heading": string, "bullets": [string]}],\n  "content_md": string (full markdown),\n  "faqs": [{"q": string, "a": string}],\n  "internal_links": [{"href": string, "label": string}]\n}`,
      maxTokens: 6000,
    });

    let gdoc: { docId: string; url: string } | null = null;
    if (body.save_to_google_doc !== false) {
      gdoc = await saveToGoogleDoc(draft.title, draft.content_md);
    }

    const sb = serviceClient();
    const { data: row, error } = await sb
      .from("seo_blog_drafts")
      .insert({
        topic,
        target_keyword: body.target_keyword ?? null,
        status: "draft",
        title: draft.title,
        slug: draft.slug,
        meta_description: draft.meta_description,
        outline: draft.outline,
        content_md: draft.content_md,
        faqs: draft.faqs ?? [],
        internal_links: draft.internal_links ?? [],
        research_sources: research.sources,
        google_doc_id: gdoc?.docId ?? null,
        google_doc_url: gdoc?.url ?? null,
      })
      .select("id, slug, google_doc_url")
      .single();
    if (error) throw error;

    return jsonResponse({ draft_id: row.id, slug: row.slug, google_doc_url: row.google_doc_url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("blog-draft error", msg);
    return jsonResponse({ error: msg }, 500);
  }
});