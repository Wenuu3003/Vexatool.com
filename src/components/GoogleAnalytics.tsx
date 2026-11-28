import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Google Analytics Measurement ID, supplied by the connected Google Analytics
// connection (Browser tracking). Falls back to the previously configured ID so
// tracking keeps working if the connection is ever unlinked.
const GA_MEASUREMENT_ID =
  (import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY as string | undefined) ||
  "G-473NX43VJ4";

const isLovablePreviewHost = () => {
  if (typeof window === "undefined") return true;
  const host = window.location.hostname.toLowerCase();
  return host.includes("lovableproject.com") || host.includes("lovable.app") || host === "localhost";
};

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export const useGoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (isLovablePreviewHost()) return;

    if (!GA_MEASUREMENT_ID) return;

    // Only track if gtag is available
    if (typeof window.gtag === "function") {
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
      // The initial config is loaded with send_page_view: false, and repeating
      // config for the same ID only updates parameters - it does not send
      // another page view. Send the page view explicitly so every route change
      // (and the first render) is actually recorded.
      window.gtag("event", "page_view", {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
    }
  }, [location]);
};

export const GoogleAnalyticsScript = () => {
  useEffect(() => {
    if (isLovablePreviewHost()) return;

    if (!GA_MEASUREMENT_ID) return;

    // Skip in development or if already loaded
    if (typeof window.gtag === "function") return;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(..._args: unknown[]) {
      // gtag.js only processes queued entries that are `arguments` objects;
      // pushing a plain array (e.g. from rest params) is silently ignored, so
      // no page view is ever sent.
      // eslint-disable-next-line prefer-rest-params -- gtag.js needs the Arguments object
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: false, // We'll handle this manually for SPA
    });

    // Load GA script after page is fully interactive
    const loadGA = () => {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);
    };

    // Defer 4s after load to not compete with critical resources
    if (document.readyState === "complete") {
      setTimeout(loadGA, 4000);
    } else {
      window.addEventListener("load", () => setTimeout(loadGA, 4000), { once: true });
    }
  }, []);

  return null;
};

// Track custom events
export const trackEvent = (eventName: string, eventParams?: Record<string, string | number | boolean>) => {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, eventParams);
  }
};

// Track tool usage
export const trackToolUsage = (toolName: string, action: string) => {
  trackEvent("tool_usage", {
    tool_name: toolName,
    action: action,
    timestamp: new Date().toISOString(),
  });
};
