import { useEffect, forwardRef, useRef, useState, useId } from 'react';
import { hasAdConsent } from './CookieConsent';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle' | 'responsive';
  className?: string;
  network?: 'google' | 'effectivegate';
  mobileSlot?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
    adsbyoogleInitialized?: Set<string>;
  }
}

// Track which ad slots have been initialized globally
const getInitializedAds = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  if (!window.adsbyoogleInitialized) {
    window.adsbyoogleInitialized = new Set();
  }
  return window.adsbyoogleInitialized;
};

export const AdBanner = forwardRef<HTMLDivElement, AdBannerProps>(
  ({ slot, format = 'auto', className = '', network = 'google', mobileSlot }, ref) => {
    const uniqueId = useId();
    const scriptLoaded = useRef(false);
    const [hasConsent, setHasConsent] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      setHasConsent(hasAdConsent());
      
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
      if (!hasConsent) return;

      const activeSlot = isMobile && mobileSlot ? mobileSlot : slot;
      const adKey = `${activeSlot}-${uniqueId}`;
      const initializedAds = getInitializedAds();

      if (network === 'google' && !initializedAds.has(adKey)) {
        try {
          if (typeof window !== 'undefined' && window.adsbygoogle) {
            initializedAds.add(adKey);
            window.adsbygoogle.push({});
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('AdSense error:', error);
          }
        }
      } else if (network === 'effectivegate' && !scriptLoaded.current) {
        scriptLoaded.current = true;
        const script = document.createElement('script');
        script.src = 'https://pl28322651.effectivegatecpm.com/5d/b1/c4/5db1c48fa530f15ff066f2b7992b8f2d.js';
        script.async = true;
        script.type = 'text/javascript';
        document.body.appendChild(script);

        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      }
    }, [network, hasConsent, slot, mobileSlot, isMobile, uniqueId]);

    if (!hasConsent) {
      return null;
    }

    // Determine responsive format based on screen size
    const getResponsiveFormat = () => {
      if (format === 'responsive' || format === 'auto') {
        return isMobile ? 'rectangle' : 'horizontal';
      }
      return format;
    };

    // Use mobile slot if provided and on mobile
    const activeSlot = isMobile && mobileSlot ? mobileSlot : slot;
    const activeFormat = getResponsiveFormat();

    if (network === 'google') {
      return (
        <div ref={ref} className={`ad-container ${className}`}>
          {/* Mobile: smaller, centered ad */}
          {isMobile ? (
            <div className="flex justify-center">
              <ins
                className="adsbygoogle"
                style={{ 
                  display: 'block',
                  width: '320px',
                  height: activeFormat === 'rectangle' ? '250px' : '100px',
                  maxWidth: '100%'
                }}
                data-ad-client="ca-pub-3192107856471636"
                data-ad-slot={activeSlot}
                data-ad-format={activeFormat}
              />
            </div>
          ) : (
            /* Desktop: full-width responsive ad */
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-3192107856471636"
              data-ad-slot={activeSlot}
              data-ad-format={activeFormat}
              data-full-width-responsive="true"
            />
          )}
        </div>
      );
    }

    // EffectiveGateCPM
    return (
      <div ref={ref} className={`ad-container ${className}`}>
        <div id="effectivegate-ad" />
      </div>
    );
  }
);

AdBanner.displayName = 'AdBanner';

// Mobile-optimized banner (320x50 or 320x100)
export const MobileAdBanner = forwardRef<HTMLDivElement, { slot?: string; className?: string }>(
  ({ slot = "1234567890", className = '' }, ref) => {
    const uniqueId = useId();
    const [hasConsent, setHasConsent] = useState(false);

    useEffect(() => {
      setHasConsent(hasAdConsent());
    }, []);

    useEffect(() => {
      if (!hasConsent) return;

      const adKey = `mobile-${slot}-${uniqueId}`;
      const initializedAds = getInitializedAds();

      if (!initializedAds.has(adKey)) {
        try {
          if (typeof window !== 'undefined' && window.adsbygoogle) {
            initializedAds.add(adKey);
            window.adsbygoogle.push({});
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('AdSense mobile error:', error);
          }
        }
      }
    }, [hasConsent, slot, uniqueId]);

    if (!hasConsent) return null;

    return (
      <div ref={ref} className={`md:hidden flex justify-center ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '320px', height: '100px' }}
          data-ad-client="ca-pub-3192107856471636"
          data-ad-slot={slot}
        />
      </div>
    );
  }
);

MobileAdBanner.displayName = 'MobileAdBanner';

// Desktop-only leaderboard (728x90)
export const DesktopAdBanner = forwardRef<HTMLDivElement, { slot?: string; className?: string }>(
  ({ slot = "1234567891", className = '' }, ref) => {
    const uniqueId = useId();
    const [hasConsent, setHasConsent] = useState(false);

    useEffect(() => {
      setHasConsent(hasAdConsent());
    }, []);

    useEffect(() => {
      if (!hasConsent) return;

      const adKey = `desktop-${slot}-${uniqueId}`;
      const initializedAds = getInitializedAds();

      if (!initializedAds.has(adKey)) {
        try {
          if (typeof window !== 'undefined' && window.adsbygoogle) {
            initializedAds.add(adKey);
            window.adsbygoogle.push({});
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('AdSense desktop error:', error);
          }
        }
      }
    }, [hasConsent, slot, uniqueId]);

    if (!hasConsent) return null;

    return (
      <div ref={ref} className={`hidden md:flex justify-center ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '728px', height: '90px' }}
          data-ad-client="ca-pub-3192107856471636"
          data-ad-slot={slot}
        />
      </div>
    );
  }
);

DesktopAdBanner.displayName = 'DesktopAdBanner';

// Placeholder component for development
export const AdPlaceholder = forwardRef<HTMLDivElement, { className?: string }>(
  ({ className = '' }, ref) => {
    return (
      <div 
        ref={ref} 
        className={`bg-muted/50 border border-dashed border-border rounded-lg p-4 text-center ${className}`}
      >
        <p className="text-xs text-muted-foreground">Advertisement</p>
      </div>
    );
  }
);

AdPlaceholder.displayName = 'AdPlaceholder';
