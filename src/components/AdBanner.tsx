import { useEffect, forwardRef } from 'react';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export const AdBanner = forwardRef<HTMLDivElement, AdBannerProps>(
  ({ slot, format = 'auto', className = '' }, ref) => {
    useEffect(() => {
      try {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          window.adsbygoogle.push({});
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('AdSense error:', error);
        }
      }
    }, []);

    return (
      <div ref={ref} className={`ad-container ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-7714287689646578"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
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
