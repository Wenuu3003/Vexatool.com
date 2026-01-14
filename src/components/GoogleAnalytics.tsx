import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Google Analytics Measurement ID - replace with your actual ID
const GA_MEASUREMENT_ID = "G-637SSN6MXq";

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export const useGoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Only track if gtag is available
    if (typeof window.gtag === "function") {
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
    }
  }, [location]);
};

export const GoogleAnalyticsScript = () => {
  useEffect(() => {
    // Skip in development or if already loaded
    if (typeof window.gtag === "function") return;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: false, // We'll handle this manually for SPA
    });

    // Load the GA script asynchronously
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

    // Defer loading for performance
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        document.head.appendChild(script);
      });
    } else {
      setTimeout(() => {
        document.head.appendChild(script);
      }, 2000);
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
