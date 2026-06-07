// One-off migration applier for the Phase-1 pSEO content expansion.
// Reads the bundled content.sql and runs it via a direct Postgres
// connection authenticated as the service role through SUPABASE_DB_URL.
// Intended to be invoked once and then removed.
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

const SECRET = Deno.env.get("SEO_CRON_SECRET") ?? "";

Deno.serve(async (req) => {
  const auth = req.headers.get("x-cron-secret") ?? "";
  if (!SECRET || auth !== SECRET) {
    return new Response("unauthorized", { status: 401 });
  }
  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) return new Response("missing SUPABASE_DB_URL", { status: 500 });

  let sql: string;
  try {
    sql = await Deno.readTextFile(new URL("./content.sql", import.meta.url));
  } catch (e) {
    return new Response("cannot read content.sql: " + String(e), { status: 500 });
  }

  const client = postgres(dbUrl, { prepare: false, max: 1, ssl: "require" });
  const results: { i: number; ok: boolean; error?: string }[] = [];
  // Split on `;\n` boundaries (the file uses one statement per line).
  const stmts = sql.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean);
  try {
    for (let i = 0; i < stmts.length; i++) {
      try {
        await client.unsafe(stmts[i]);
        results.push({ i, ok: true });
      } catch (e) {
        results.push({ i, ok: false, error: String(e).slice(0, 300) });
      }
    }
  } finally {
    await client.end({ timeout: 5 });
  }
  return new Response(JSON.stringify({ count: stmts.length, results }, null, 2), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
});