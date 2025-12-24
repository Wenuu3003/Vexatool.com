import { useEffect, useState } from 'react';
import { hasAdConsent } from './CookieConsent';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface SidebarAdProps {
  slot?: string;
  className?: string;
}

export const SidebarAd = ({ slot = "3456789012", className = "" }: SidebarAdProps) => {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    setHasConsent(hasAdConsent());
  }, []);

  useEffect(() => {
    if (!hasConsent) return;

    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('AdSense sidebar error:', error);
      }
    }
  }, [hasConsent]);

  if (!hasConsent) {
    return null;
  }

  return (
    <div className={`hidden lg:block sticky top-24 ${className}`}>
      <div className="bg-muted/30 rounded-lg p-2">
        <p className="text-[10px] text-muted-foreground text-center mb-1">Advertisement</p>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-3192107856471636"
          data-ad-slot={slot}
          data-ad-format="vertical"
          data-full-width-responsive="false"
        />
      </div>
    </div>
  );
};

export const InArticleAd = ({ slot = "4567890123", className = "" }: SidebarAdProps) => {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    setHasConsent(hasAdConsent());
  }, []);

  useEffect(() => {
    if (!hasConsent) return;

    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('AdSense in-article error:', error);
      }
    }
  }, [hasConsent]);

  if (!hasConsent) {
    return null;
  }

  return (
    <div className={`my-6 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-3192107856471636"
        data-ad-slot={slot}
      />
    </div>
  );
};
