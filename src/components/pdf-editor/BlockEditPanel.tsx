import { memo, useState, useCallback } from 'react';
import { TextRegion } from './useTextBlocks';
import { OCRTextBlock } from './useOCR';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, X, Trash2, Edit3, MousePointer, ChevronDown, ChevronUp } from 'lucide-react';

interface BlockEditPanelProps {
  regions: TextRegion[];
  selectedRegion: string | null;
  onSelectRegion: (id: string | null) => void;
  onReplaceRegion: (region: TextRegion, newText: string) => void;
  onDeleteRegion: (region: TextRegion) => void;
}

export const BlockEditPanel = memo(({
  regions,
  selectedRegion,
  onSelectRegion,
  onReplaceRegion,
  onDeleteRegion,
}: BlockEditPanelProps) => {
  const [editingRegion, setEditingRegion] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());

  const handleStartEdit = useCallback((region: TextRegion) => {
    setEditingRegion(region.id);
    setEditText(region.text);
    onSelectRegion(region.id);
  }, [onSelectRegion]);

  const handleSave = useCallback((region: TextRegion) => {
    if (editText.trim() !== region.text) {
      onReplaceRegion(region, editText);
    }
    setEditingRegion(null);
    onSelectRegion(null);
  }, [editText, onReplaceRegion, onSelectRegion]);

  const handleCancel = useCallback(() => {
    setEditingRegion(null);
    onSelectRegion(null);
    setEditText('');
  }, [onSelectRegion]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedRegions(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  if (regions.length === 0) {
    return (
      <div className="p-4 text-center">
        <MousePointer className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No text blocks detected yet. Extract text or run OCR first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Edit3 className="w-4 h-4 text-primary" />
            Text Blocks
          </h3>
          <Badge variant="secondary" className="text-[10px]">
            {regions.length} block{regions.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Click a block to highlight it on the page. Edit or delete entire text regions.
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1.5">
          {regions.map((region, idx) => {
            const isSelected = selectedRegion === region.id;
            const isEditing = editingRegion === region.id;
            const isExpanded = expandedRegions.has(region.id);
            const previewText = region.text.length > 80
              ? region.text.slice(0, 80) + '…'
              : region.text;
            const isLong = region.text.length > 80;

            return (
              <Card
                key={region.id}
                className={`transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-primary shadow-md bg-primary/5'
                    : 'hover:bg-muted/40 hover:shadow-sm'
                }`}
                onClick={() => !isEditing && onSelectRegion(isSelected ? null : region.id)}
              >
                <CardContent className="p-2.5">
                  {isEditing ? (
                    <div className="space-y-2" onClick={e => e.stopPropagation()}>
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-[80px] text-xs font-mono resize-y"
                        autoFocus
                        placeholder="Enter replacement text..."
                      />
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          className="flex-1 h-7 text-xs"
                          onClick={() => handleSave(region)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Replace
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-7 text-xs"
                          onClick={handleCancel}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Block {idx + 1}
                        </span>
                        <Badge
                          variant={region.confidence >= 90 ? 'default' : region.confidence >= 70 ? 'secondary' : 'destructive'}
                          className="text-[9px] h-4 px-1"
                        >
                          {region.confidence}%
                        </Badge>
                      </div>

                      <p className="text-xs leading-relaxed whitespace-pre-wrap break-words text-foreground">
                        {isExpanded || !isLong ? region.text : previewText}
                      </p>

                      {isLong && (
                        <button
                          className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                          onClick={(e) => { e.stopPropagation(); toggleExpand(region.id); }}
                        >
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}

                      {isSelected && (
                        <div className="flex gap-1.5 pt-1" onClick={e => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-7 text-xs"
                            onClick={() => handleStartEdit(region)}
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs px-2"
                            onClick={() => onDeleteRegion(region)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
});

BlockEditPanel.displayName = 'BlockEditPanel';
