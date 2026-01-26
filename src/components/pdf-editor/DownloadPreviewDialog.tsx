import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, Type, Square, Image, Pencil, Droplets, Eye, RotateCw, Trash2, Copy, Plus } from 'lucide-react';
import { AnyElement, PageInfo, TextElement, ShapeElement, ImageElement, DrawingElement, WatermarkElement, RedactElement } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DownloadPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  elements: AnyElement[];
  pages: PageInfo[];
  fileName: string;
  isProcessing: boolean;
}

interface ChangeSummary {
  textElements: number;
  shapeElements: number;
  imageElements: number;
  drawingElements: number;
  watermarkElements: number;
  redactElements: number;
  rotatedPages: number;
  deletedPages: number;
  addedPages: number;
}

export const DownloadPreviewDialog = ({
  open,
  onOpenChange,
  onConfirm,
  elements,
  pages,
  fileName,
  isProcessing,
}: DownloadPreviewDialogProps) => {
  // Calculate change summary
  const summary: ChangeSummary = {
    textElements: elements.filter(e => e.type === 'text').length,
    shapeElements: elements.filter(e => e.type === 'shape').length,
    imageElements: elements.filter(e => e.type === 'image').length,
    drawingElements: elements.filter(e => e.type === 'drawing').length,
    watermarkElements: elements.filter(e => e.type === 'watermark').length,
    redactElements: elements.filter(e => e.type === 'redact').length,
    rotatedPages: pages.filter(p => p.rotation !== 0 && !p.deleted).length,
    deletedPages: pages.filter(p => p.deleted).length,
    addedPages: pages.filter(p => !p.canvas && !p.deleted).length,
  };

  const totalChanges = Object.values(summary).reduce((a, b) => a + b, 0);
  const hasChanges = totalChanges > 0;

  // Group elements by page for detailed view
  const elementsByPage = pages.map((_, index) => ({
    pageNumber: index + 1,
    elements: elements.filter(e => e.page === index),
    isRotated: pages[index]?.rotation !== 0,
    isDeleted: pages[index]?.deleted,
    isNew: !pages[index]?.canvas,
  })).filter(p => p.elements.length > 0 || p.isRotated || p.isDeleted || p.isNew);

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="w-3 h-3" />;
      case 'shape': return <Square className="w-3 h-3" />;
      case 'image': return <Image className="w-3 h-3" />;
      case 'drawing': return <Pencil className="w-3 h-3" />;
      case 'watermark': return <Droplets className="w-3 h-3" />;
      case 'redact': return <Eye className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const getElementDescription = (element: AnyElement) => {
    switch (element.type) {
      case 'text':
        const textEl = element as TextElement;
        return `"${textEl.text.substring(0, 30)}${textEl.text.length > 30 ? '...' : ''}"`;
      case 'shape':
        const shapeEl = element as ShapeElement;
        return shapeEl.shapeType.charAt(0).toUpperCase() + shapeEl.shapeType.slice(1);
      case 'image':
        return 'Image/Logo';
      case 'drawing':
        const drawEl = element as DrawingElement;
        return `${drawEl.drawingType.charAt(0).toUpperCase() + drawEl.drawingType.slice(1)} stroke`;
      case 'watermark':
        const wmEl = element as WatermarkElement;
        return wmEl.watermarkType === 'text' ? `"${wmEl.text}"` : 'Image watermark';
      case 'redact':
        return 'Redaction box';
      default:
        return 'Element';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Download Edited PDF
          </DialogTitle>
          <DialogDescription>
            Review your changes before downloading
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <p className="font-medium text-sm">edited_{fileName}</p>
              <p className="text-xs text-muted-foreground">
                {pages.filter(p => !p.deleted).length} page{pages.filter(p => !p.deleted).length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Changes summary */}
          {hasChanges ? (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Changes Summary</h4>
              
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2">
                {summary.textElements > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded text-xs">
                    <Type className="w-4 h-4 text-blue-500" />
                    <span>{summary.textElements} text</span>
                  </div>
                )}
                {summary.shapeElements > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded text-xs">
                    <Square className="w-4 h-4 text-green-500" />
                    <span>{summary.shapeElements} shape{summary.shapeElements !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {summary.imageElements > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-purple-500/10 rounded text-xs">
                    <Image className="w-4 h-4 text-purple-500" />
                    <span>{summary.imageElements} image{summary.imageElements !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {summary.drawingElements > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-orange-500/10 rounded text-xs">
                    <Pencil className="w-4 h-4 text-orange-500" />
                    <span>{summary.drawingElements} drawing{summary.drawingElements !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {summary.watermarkElements > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-cyan-500/10 rounded text-xs">
                    <Droplets className="w-4 h-4 text-cyan-500" />
                    <span>{summary.watermarkElements} watermark{summary.watermarkElements !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {summary.redactElements > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded text-xs">
                    <Eye className="w-4 h-4 text-red-500" />
                    <span>{summary.redactElements} redaction{summary.redactElements !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {summary.rotatedPages > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded text-xs">
                    <RotateCw className="w-4 h-4 text-amber-500" />
                    <span>{summary.rotatedPages} rotated</span>
                  </div>
                )}
                {summary.deletedPages > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded text-xs">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span>{summary.deletedPages} deleted</span>
                  </div>
                )}
                {summary.addedPages > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded text-xs">
                    <Plus className="w-4 h-4 text-green-500" />
                    <span>{summary.addedPages} added</span>
                  </div>
                )}
              </div>

              {/* Detailed changes by page */}
              {elementsByPage.length > 0 && (
                <ScrollArea className="h-[150px] border rounded-lg">
                  <div className="p-3 space-y-3">
                    {elementsByPage.map((pageData) => (
                      <div key={pageData.pageNumber} className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <span>Page {pageData.pageNumber}</span>
                          {pageData.isRotated && (
                            <span className="text-amber-500">(rotated)</span>
                          )}
                          {pageData.isDeleted && (
                            <span className="text-red-500">(deleted)</span>
                          )}
                          {pageData.isNew && (
                            <span className="text-green-500">(new)</span>
                          )}
                        </div>
                        {pageData.elements.map((element) => (
                          <div 
                            key={element.id}
                            className="flex items-center gap-2 text-xs pl-4 text-muted-foreground"
                          >
                            {getElementIcon(element.type)}
                            <span className="capitalize">{element.type}:</span>
                            <span className="truncate">{getElementDescription(element)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No changes detected</p>
              <p className="text-xs">The PDF will be saved as-is</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isProcessing} className="gap-2">
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Processing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
