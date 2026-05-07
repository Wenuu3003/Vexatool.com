import { useEffect } from "react";

declare global {
  interface Window {
    __monetagRegistered?: boolean;
  }
}

const isPreviewHost = () => {
  if (typeof window === "undefined") return true;
  const host = window.location.hostname.toLowerCase();
  return (
    host.includes("lovableproject.com") ||
    host.includes("lovable.app") ||
    host === "localhost" ||
    host === "127.0.0.1"
  );
};

/**
 * Registers the Monetag service worker (/sw.js) globally, after the page is
 * idle. Renders no DOM, so it has zero impact on layout, CLS, or React tree.
 */
export function MonetagLoader() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (isPreviewHost()) return;
    if (window.__monetagRegistered) return;

    const register = () => {
      if (window.__monetagRegistered) return;
      window.__monetagRegistered = true;
      try {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .catch(() => {
            /* swallow — never disturb the app */
          });
      } catch {
        /* noop */
      }
    };

    const schedule = () => {
      const w = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void;
      };
      if (typeof w.requestIdleCallback === "function") {
        w.requestIdleCallback(register, { timeout: 4000 });
      } else {
        w.setTimeout(register, 3000);
      }
    };

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }
  }, []);

  return null;
}

export default MonetagLoader;