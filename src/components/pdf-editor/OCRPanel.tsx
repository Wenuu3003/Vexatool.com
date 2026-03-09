import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScanText, FileText, AlertCircle, CheckCircle2, Loader2, Info } from 'lucide-react';
import { OCRProgress } from './useOCR';
import type { OCRStats } from './useOCR';

interface OCRPanelProps {
  pdfType: 'text-based' | 'scanned' | 'mixed' | null;
  isProcessing: boolean;
  progress: OCRProgress;
  textBlockCount: number;
  stats: OCRStats | null;
  onRunOCR: () => void;
  onExtractText: () => void;
  currentPage: number;
  totalPages: number;
}

export const OCRPanel = memo(({
  pdfType,
  isProcessing,
  progress,
  textBlockCount,
  stats,
  onRunOCR,
  onExtractText,
  currentPage,
  totalPages,
}: OCRPanelProps) => {
  return (
    <Card className="mb-4">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanText className="w-5 h-5 text-primary" />
            <CardTitle className="text-sm font-medium">Text Detection</CardTitle>
          </div>
          {pdfType && (
            <Badge 
              variant={pdfType === 'text-based' ? 'default' : pdfType === 'scanned' ? 'secondary' : 'outline'}
              className="text-xs"
            >
              {pdfType === 'text-based' ? 'Text PDF' : pdfType === 'scanned' ? 'Scanned PDF' : 'Mixed PDF'}
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs mt-1">
          Page {currentPage + 1} of {totalPages}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2 px-4 space-y-3">
        {isProcessing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="truncate">{progress.status}</span>
            </div>
            <Progress value={progress.progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {progress.progress}% complete
            </p>
          </div>
        ) : (
          <>
            {textBlockCount > 0 ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {textBlockCount} text blocks detected
                </div>
                {stats && (
                  <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Avg confidence: {stats.avgConfidence}%
                    </span>
                    {stats.usedFallback && (
                      <Badge variant="outline" className="text-[10px] h-4">
                        Multi-pass
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                No text detected yet
              </div>
            )}

            <div className="flex flex-col gap-2">
              {pdfType === 'text-based' || pdfType === 'mixed' ? (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onExtractText}
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Extract PDF Text
                </Button>
              ) : null}
              
              <Button 
                size="sm" 
                onClick={onRunOCR}
                className="w-full"
              >
                <ScanText className="w-4 h-4 mr-2" />
                Run OCR (Scanned/Image)
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {pdfType === 'scanned' 
                ? 'Scanned PDF detected. OCR uses dual-pass with image preprocessing for best results.'
                : pdfType === 'text-based'
                ? 'Text PDF detected. Click "Extract PDF Text" to enable inline editing.'
                : 'Mixed PDF. Extract text first, then OCR for remaining scanned content.'}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
});

OCRPanel.displayName = 'OCRPanel';
