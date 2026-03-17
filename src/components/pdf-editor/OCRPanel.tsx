import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScanText, FileText, AlertCircle, CheckCircle2, Loader2, Info, LayoutGrid } from 'lucide-react';
import { OCRProgress } from './useOCR';
import type { OCRStats } from './useOCR';
import type { ResolvedSegmentationMode, TextSegmentationMode } from './useTextBlocks';

interface OCRPanelProps {
  pdfType: 'text-based' | 'scanned' | 'mixed' | null;
  isProcessing: boolean;
  progress: OCRProgress;
  textBlockCount: number;
  stats: OCRStats | null;
  segmentationMode: TextSegmentationMode;
  resolvedSegmentationMode: ResolvedSegmentationMode;
  onSegmentationModeChange: (mode: TextSegmentationMode) => void;
  onRunOCR: () => void;
  onExtractText: () => void;
  currentPage: number;
  totalPages: number;
}

const SEGMENTATION_OPTIONS: { value: TextSegmentationMode; label: string; desc: string }[] = [
  { value: 'auto', label: 'Auto', desc: 'Auto-detect layout' },
  { value: 'line', label: 'Line', desc: 'Each line is editable' },
  { value: 'word', label: 'Word', desc: 'Click individual words' },
  { value: 'paragraph', label: 'Paragraph', desc: 'Group into paragraphs' },
  { value: 'table', label: 'Table', desc: 'Tabular cell layout' },
  { value: 'form', label: 'Form', desc: 'Form field layout' },
];

export const OCRPanel = memo(({
  pdfType,
  isProcessing,
  progress,
  textBlockCount,
  stats,
  segmentationMode,
  resolvedSegmentationMode,
  onSegmentationModeChange,
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
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <LayoutGrid className="w-3.5 h-3.5" />
              Segmentation mode
            </div>
            <Badge variant="outline" className="text-[10px] capitalize">
              Active: {resolvedSegmentationMode}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {SEGMENTATION_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={segmentationMode === option.value ? 'default' : 'outline'}
                className="h-7 text-[10px] px-1.5"
                onClick={() => onSegmentationModeChange(option.value)}
                disabled={isProcessing}
                title={option.desc}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

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
                <div className="flex items-center gap-2 text-sm text-primary">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {textBlockCount} editable text regions detected
                </div>
                {stats && (
                  <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Avg confidence: {stats.avgConfidence}%
                    </span>
                    {stats.usedFallback && (
                      <Badge variant="outline" className="text-[10px] h-4">
                        Multi-pass OCR
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
              {(pdfType === 'text-based' || pdfType === 'mixed') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onExtractText}
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Extract PDF Text
                </Button>
              )}

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
              Use <strong>{segmentationMode === 'auto' ? 'Auto' : segmentationMode}</strong> mode to control how blocks split for editing.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
});

OCRPanel.displayName = 'OCRPanel';
