import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { openInNewTab, breakOutOfIframe } from '@/lib/iframeDetection';

interface IframeWarningProps {
  onContinueAnyway?: () => void;
}

/**
 * Warning component shown when authentication page is loaded inside an iframe.
 * Provides options to open in new tab or break out of iframe.
 */
export const IframeWarning = ({ onContinueAnyway }: IframeWarningProps) => {
  const handleOpenInNewTab = () => {
    openInNewTab(window.location.href);
  };

  const handleBreakOut = () => {
    breakOutOfIframe(window.location.href);
  };

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
            Secure Login Required
          </CardTitle>
        </div>
        <CardDescription className="text-amber-700 dark:text-amber-300">
          For security reasons, Google Sign-in must be opened in a separate window.
          This protects your credentials from potential security risks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={handleOpenInNewTab}
          className="w-full gap-2"
          variant="default"
        >
          <ExternalLink className="h-4 w-4" />
          Open Login in New Tab
        </Button>
        
        <Button 
          onClick={handleBreakOut}
          className="w-full gap-2"
          variant="outline"
        >
          Open in Full Window
        </Button>

        {onContinueAnyway && (
          <Button 
            onClick={onContinueAnyway}
            variant="ghost"
            className="w-full text-muted-foreground text-sm"
          >
            Continue with email/password only
          </Button>
        )}

        <p className="text-xs text-center text-muted-foreground mt-4">
          🔒 Your data is protected with industry-standard encryption
        </p>
      </CardContent>
    </Card>
  );
};
