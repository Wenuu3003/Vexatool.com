import { useEffect, useState, useRef } from 'react';
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
  const adInitialized = useRef(false);

  useEffect(() => {
    setHasConsent(hasAdConsent());
  }, []);

  useEffect(() => {
    if (!hasConsent || adInitialized.current) return;

    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
        adInitialized.current = true;
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
          style={{ display: 'block', width: '300px', height: '600px' }}
          data-ad-client="ca-pub-3192107856471636"
          data-ad-slot={slot}
          data-ad-format="vertical"
        />
      </div>
    </div>
  );
};

export const InArticleAd = ({ slot = "4567890123", className = "" }: SidebarAdProps) => {
  const [hasConsent, setHasConsent] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const adInitialized = useRef(false);

  useEffect(() => {
    setHasConsent(hasAdConsent());
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!hasConsent || adInitialized.current) return;

    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
        adInitialized.current = true;
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
    <div className={`my-6 flex justify-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ 
          display: 'block', 
          textAlign: 'center',
          width: isMobile ? '300px' : '100%',
          height: isMobile ? '250px' : 'auto'
        }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-3192107856471636"
        data-ad-slot={slot}
      />
    </div>
  );
};

// Anchor/Sticky ad for mobile (shows at bottom of screen)
export const MobileAnchorAd = ({ slot = "5678901234" }: { slot?: string }) => {
  const [hasConsent, setHasConsent] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const adInitialized = useRef(false);

  useEffect(() => {
    setHasConsent(hasAdConsent());
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!hasConsent || !isMobile || adInitialized.current) return;

    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
        adInitialized.current = true;
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('AdSense anchor error:', error);
      }
    }
  }, [hasConsent, isMobile]);

  if (!hasConsent || !isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t safe-area-pb">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '50px' }}
        data-ad-client="ca-pub-3192107856471636"
        data-ad-slot={slot}
        data-ad-format="auto"
      />
    </div>
  );
};
