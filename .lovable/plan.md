# Plan: Globally register Monetag service worker (/sw.js)

The Monetag snippet already lives at `public/sw.js` (domain `3nbf4.com`, zone `10975490`). Right now nothing registers it on the client, so Monetag never activates. We'll add a tiny, isolated registration component that loads after the app is interactive — no UI, no layout, no impact on tools, SEO, or routing.

## Changes

1. **New file:** `src/components/MonetagLoader.tsx`
   - Returns `null` (no DOM, zero CLS).
   - On mount, runs only in production (skips Lovable preview hosts and `localhost`, matching the pattern in `AdSenseLoader.tsx`).
   - Waits for `window.load`, then uses `requestIdleCallback` (fallback `setTimeout ~3s`) to call `navigator.serviceWorker.register('/sw.js', { scope: '/' })`.
   - Guards with a `window.__monetagRegistered` flag so it can never double-register across re-renders or HMR.
   - Wrapped in `try/catch`; failures are swallowed silently — no console errors, no impact on React.

2. **Edit:** `src/App.tsx`
   - Import `MonetagLoader` and mount it once next to `<AdSenseLoader />` inside `<BrowserRouter>`. One global mount, survives all route changes.

3. **Already in place (no change needed):**
   - `public/sw.js` exists with the Monetag snippet.
   - `public/_redirects` already has `/sw.js → /sw.js 200!` so the file is served at the root with correct path.
   - `public/_headers` already sets `Content-Type: application/javascript` and `Service-Worker-Allowed: /` for `/sw.js`.
   - `vite.config.ts` already renames the PWA worker to `pwa-sw.js`, so `/sw.js` stays Monetag's.

## Why this is safe

- **No UI / no CLS:** component renders `null`.
- **Non-blocking:** registration deferred until after `load` + idle, off the critical path → no LCP/INP regression.
- **No duplicates:** `__monetagRegistered` flag + browser SW dedup by scope.
- **Survives deploys:** lives in source, mounts on every page via `App.tsx`.
- **Preview-safe:** skipped on `lovable.app` / `lovableproject.com` / `localhost` to avoid polluting the editor.
- **No interference:** doesn't touch React tree, routing, forms, or any tool logic. Service workers run in a separate thread.
- **SEO-safe:** no markup, no head changes, no robots impact.

## Validation after implementation

- Build runs automatically; confirm no TS errors.
- After publish, in production DevTools → Application → Service Workers, verify `/sw.js` is registered and active.
- Confirm console is clean (no errors from registration).
