import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

const CONSENT_KEY = "cookie_consent";

export type ConsentStatus = "accepted" | "declined" | null;

export const getConsentStatus = (): ConsentStatus => {
  if (typeof window === "undefined") return null;
  const consent = localStorage.getItem(CONSENT_KEY);
  if (consent === "accepted" || consent === "declined") return consent;
  return null;
};

export const hasAdConsent = (): boolean => {
  return getConsentStatus() === "accepted";
};

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = getConsentStatus();
    if (consent === null) {
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setShowBanner(false);
    window.location.reload();
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-card/95 backdrop-blur-md border-t border-border shadow-lg animate-in slide-in-from-bottom-5 duration-300">
      <div className="container mx-auto max-w-3xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-start gap-2.5 flex-1 pr-6 sm:pr-0">
            <Cookie className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-0.5 text-xs sm:text-sm">We value your privacy</p>
              <p className="leading-relaxed">
                We use cookies to enhance your experience and show personalized ads.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="flex-1 sm:flex-none text-xs h-8"
            >
              Decline
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="flex-1 sm:flex-none text-xs h-8"
            >
              Accept
            </Button>
          </div>
          <button
            onClick={handleDecline}
            className="absolute top-2 right-2 sm:hidden p-1 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
