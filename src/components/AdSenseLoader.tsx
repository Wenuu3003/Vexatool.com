import { useEffect } from "react";
import { hasAdConsent } from "./CookieConsent";

declare global {
  interface Window {
    adsbygoogle: unknown[];
    __adsenseLoaded?: boolean;
    // requestIdleCallback is not in the default TS lib for all targets
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requestIdleCallback?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cancelIdleCallback?: any;
  }
}

const ADSENSE_SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3192107856471636";

export function AdSenseLoader({ delayMs = 2500 }: { delayMs?: number }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasAdConsent()) return;

    // Create queue immediately so ad components can push safely even before the script loads.
    window.adsbygoogle = window.adsbygoogle || [];

    if (window.__adsenseLoaded) return;

    const load = () => {
      if (window.__adsenseLoaded) return;
      window.__adsenseLoaded = true;

      const script = document.createElement("script");
      script.src = ADSENSE_SRC;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    };

    const timeoutId = window.setTimeout(load, delayMs);

    // Prefer idle time on capable browsers to reduce main-thread contention.
    if ("requestIdleCallback" in window) {
      window.clearTimeout(timeoutId);
      // @ts-expect-error requestIdleCallback is not typed in some TS configs
      const idleId = window.requestIdleCallback(load, { timeout: delayMs + 500 });
      return () => {
        // @ts-expect-error cancelIdleCallback is not typed in some TS configs
        if ("cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      };
    }

    return () => window.clearTimeout(timeoutId);
  }, [delayMs]);

  return null;
}
