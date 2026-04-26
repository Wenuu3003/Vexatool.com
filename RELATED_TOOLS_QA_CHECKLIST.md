# Related Tools — QA Checklist

> Purpose: verify that every "Related Tools You Might Like" card on every tool page
> (a) links to a real, reachable tool route, and
> (b) shows the **same icon, gradient color, and title** as the destination tool page.
>
> Source of truth: `src/data/toolsData.ts` (registry) + `toolRelationships` map in
> `src/components/RelatedTools.tsx`.

---

## Part 1 — Per-Card Checklist

Run this for **each card** in the Related Tools grid on the tool page being audited.

| # | Check | Pass? |
|---|-------|-------|
| 1 | Card renders (not blank, not missing) | |
| 2 | Icon is visible inside the colored square | |
| 3 | Title text is visible and not truncated mid-word | |
| 4 | Clicking the card navigates without a 404 | |
| 5 | Destination page loads (ToolLayout renders) | |
| 6 | **Icon on destination page === icon on the card** | |
| 7 | **Gradient color on destination page === color on the card** | |
| 8 | **Title on destination page === title on the card** | |
| 9 | Destination route exists in `toolsData.ts` registry | |
| 10 | Destination route exists in `public/sitemap.xml` | |
| 11 | Card is NOT a duplicate of another card in the same grid | |
| 12 | Card is NOT a self-link to the current tool page | |

A card passes only if **all 12 rows** pass. Any failure = bug, log it in Part 3.

---

## Part 2 — Per-Tool-Page Checklist

Run this once per tool page that renders `<RelatedTools />`.

| # | Check | Pass? |
|---|-------|-------|
| A | Section heading "Related Tools You Might Like" is present | |
| B | Grid shows between 1 and 5 cards (never 0 if relationships defined) | |
| C | No card links back to the current tool's own URL | |
| D | No two cards share the same `href` | |
| E | All `href` values are present as keys in `toolsData` registry | |
| F | Footer line "complete collection of free online tools" link works | |
| G | Layout: 2 cols on mobile (<640px), 5 cols on desktop (≥640px) | |
| H | Hover state (border + bg) works on desktop | |
| I | Tap target is at least 44px on mobile | |

---

## Part 3 — Audit Log Template

For every failure, record:

```
Tool page:        /<route>
Card position:    <1-5>
Card href:        /<route>
Failure check:    <row number from Part 1 or letter from Part 2>
Observed:         <what's wrong — e.g. "card shows red gradient, destination shows blue">
Expected:         <what it should be>
Root cause:       <e.g. "toolRelationships entry points to a path missing from toolsData">
Fix applied:      <commit/edit summary>
```

---

## Part 4 — Automated Verification (run before manual sweep)

These TypeScript-level invariants must hold. If any fail, fix the data before manually
clicking through cards — manual QA on broken data wastes time.

1. **Every value in `toolRelationships` resolves to a `toolsData` entry.**
2. **Every key in `toolRelationships` resolves to a `toolsData` entry.**
3. **No self-references.** `toolRelationships[path]` must not contain `path`.
4. **No duplicates within a list.** `new Set(relatedPaths).size === relatedPaths.length`.
5. **Every tool in `toolsData` has at least one inbound related-tools reference.**

Suggested location for an automated test: `src/components/RelatedTools.test.ts`
(use Vitest, import `toolsData` and the relationships map, assert each rule).

---

## Part 5 — Recommended Sweep Order

1. `/merge-pdf`, `/compress-pdf`, `/split-pdf` — most-linked PDF tools
2. `/compress-image`, `/image-resizer`, `/background-remover` — most-linked image tools
3. `/calculator`, `/emi-calculator`, `/gst-calculator` — calculator hub pages
4. `/qr-code-generator`, `/qr-code-scanner` — utility hub pages
5. All remaining tool pages with a `RelatedTools` component, in registry order

---

## Part 6 — Final Status

- [ ] **✅ Pass** — every card on every audited page passes Part 1 + Part 2
- [ ] **🟡 Pass with notes** — minor visual nits, no broken links or wrong icons
- [ ] **🔴 Fail** — at least one card has a broken link, wrong icon, wrong color, or wrong title

Re-run the full sweep any time `toolsData.ts` or `toolRelationships` is edited.
