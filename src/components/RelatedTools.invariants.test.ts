import { describe, it, expect } from "vitest";
import { toolsData } from "@/data/toolsData";

// Re-export the relationships map by importing the module's source.
// We re-declare it here as a typed mirror to keep this test self-contained
// and to avoid coupling the production file to test exports.
import { readFileSync } from "fs";
import { resolve } from "path";

function loadRelationships(): Record<string, string[]> {
  const src = readFileSync(
    resolve(__dirname, "RelatedTools.tsx"),
    "utf-8"
  );
  const start = src.indexOf("const toolRelationships");
  const end = src.indexOf("};", start) + 2;
  const block = src.slice(start, end);
  // Build a JS expression we can eval safely
  const expr = block
    .replace("const toolRelationships: Record<string, string[]> =", "")
    .replace(/;$/, "");
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${expr});`)();
}

const rel = loadRelationships();
const registry = new Map(toolsData.map((t) => [t.href, t]));

describe("Tool registry icon/slug integrity", () => {
  it("every tool has a unique href (slug)", () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const t of toolsData) {
      if (seen.has(t.href)) dupes.push(t.href);
      seen.add(t.href);
    }
    expect(dupes, `duplicate hrefs: ${dupes.join(", ")}`).toEqual([]);
  });

  it("every tool has a unique id", () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const t of toolsData) {
      if (seen.has(t.id)) dupes.push(t.id);
      seen.add(t.id);
    }
    expect(dupes, `duplicate ids: ${dupes.join(", ")}`).toEqual([]);
  });

  it("every tool has a defined icon component", () => {
    const missing = toolsData
      .filter((t) => typeof t.icon !== "function" && typeof t.icon !== "object")
      .map((t) => t.href);
    expect(missing, `tools missing icon: ${missing.join(", ")}`).toEqual([]);
  });

  it("every tool has a non-empty colorClass", () => {
    const missing = toolsData
      .filter((t) => !t.colorClass || !t.colorClass.trim())
      .map((t) => t.href);
    expect(missing, `tools missing colorClass: ${missing.join(", ")}`).toEqual([]);
  });

  it("no two tools accidentally share the same icon + title combo (likely copy-paste bug)", () => {
    const combos = new Map<string, string[]>();
    for (const t of toolsData) {
      const key = `${(t.icon as { displayName?: string; name?: string }).displayName ?? (t.icon as { name?: string }).name ?? "anon"}::${t.title}`;
      const arr = combos.get(key) ?? [];
      arr.push(t.href);
      combos.set(key, arr);
    }
    const dupes = [...combos.entries()].filter(([, hrefs]) => hrefs.length > 1);
    expect(
      dupes,
      `tools sharing icon+title: ${dupes.map(([k, v]) => `${k} -> ${v.join(",")}`).join(" | ")}`
    ).toEqual([]);
  });
});

describe("RelatedTools relationships integrity", () => {
  it("every relationship key exists in the tool registry", () => {
    const missing = Object.keys(rel).filter((k) => !registry.has(k));
    expect(missing, `relationship keys missing from registry: ${missing.join(", ")}`).toEqual([]);
  });

  it("every related path exists in the tool registry", () => {
    const missing: string[] = [];
    for (const [key, paths] of Object.entries(rel)) {
      for (const p of paths) {
        if (!registry.has(p)) missing.push(`${key} -> ${p}`);
      }
    }
    expect(missing, `related paths missing from registry: ${missing.join(", ")}`).toEqual([]);
  });

  it("no tool lists itself in its related tools", () => {
    const self: string[] = [];
    for (const [key, paths] of Object.entries(rel)) {
      if (paths.includes(key)) self.push(key);
    }
    expect(self, `tools self-referencing: ${self.join(", ")}`).toEqual([]);
  });

  it("no duplicate related paths within a single list", () => {
    const dupes: string[] = [];
    for (const [key, paths] of Object.entries(rel)) {
      if (new Set(paths).size !== paths.length) dupes.push(key);
    }
    expect(dupes, `tools with duplicate related entries: ${dupes.join(", ")}`).toEqual([]);
  });
});
