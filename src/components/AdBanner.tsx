import { useEffect, forwardRef, useRef } from 'react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
  network?: 'google' | 'effectivegate';
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export const AdBanner = forwardRef<HTMLDivElement, AdBannerProps>(
  ({ slot, format = 'auto', className = '', network = 'effectivegate' }, ref) => {
    const scriptLoaded = useRef(false);

    useEffect(() => {
      if (network === 'google') {
        try {
          if (typeof window !== 'undefined' && window.adsbygoogle) {
            window.adsbygoogle.push({});
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('AdSense error:', error);
          }
        }
      } else if (network === 'effectivegate' && !scriptLoaded.current) {
        // Load EffectiveGateCPM script
        scriptLoaded.current = true;
        const script = document.createElement('script');
        script.src = 'https://pl28322651.effectivegatecpm.com/5d/b1/c4/5db1c48fa530f15ff066f2b7992b8f2d.js';
        script.async = true;
        script.type = 'text/javascript';
        document.body.appendChild(script);

        return () => {
          // Cleanup on unmount
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      }
    }, [network]);

    if (network === 'google') {
      return (
        <div ref={ref} className={`ad-container ${className}`}>
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-3192107856471636"
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        </div>
      );
    }

    // EffectiveGateCPM - the script auto-injects ads
    return (
      <div ref={ref} className={`ad-container ${className}`}>
        <div id="effectivegate-ad" />
      </div>
    );
  }
);

AdBanner.displayName = 'AdBanner';

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
