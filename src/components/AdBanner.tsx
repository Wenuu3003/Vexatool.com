import { useEffect } from 'react';

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

export const AdBanner = ({ slot, format = 'auto', className = '' }: AdBannerProps) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

// Placeholder component for development
export const AdPlaceholder = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`bg-muted/50 border border-dashed border-border rounded-lg p-4 text-center ${className}`}>
      <p className="text-xs text-muted-foreground">Advertisement</p>
    </div>
  );
};
