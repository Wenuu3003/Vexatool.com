import { memo, useState, useCallback } from 'react';
import { OCRTextBlock } from './useOCR';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Edit2, Trash2, Check, X } from 'lucide-react';

interface TextSelectionLayerProps {
  textBlocks: OCRTextBlock[];
  currentPage: number;
  zoom: number;
  enabled: boolean;
  onTextDelete: (blockId: string) => void;
  onTextReplace: (blockId: string, newText: string, originalBlock: OCRTextBlock) => void;
}

/**
 * CRITICAL FIX: This layer is now rendered INSIDE the scaled container.
 * It does NOT apply its own scale(zoom) transform.
 * The parent container already handles zoom via CSS transform: scale(zoom).
 * Text blocks use absolute positioning matching PDF render coordinates directly.
 */
export const TextSelectionLayer = memo(({
  textBlocks,
  currentPage,
  zoom,
  enabled,
  onTextDelete,
  onTextReplace,
}: TextSelectionLayerProps) => {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const pageBlocks = textBlocks.filter(b => b.pageIndex === currentPage);

  const handleBlockClick = useCallback((blockId: string, text: string) => {
    if (!enabled) return;
    setSelectedBlock(blockId);
    setEditText(text);
  }, [enabled]);

  const handleEdit = useCallback((blockId: string, text: string) => {
    setEditingBlock(blockId);
    setEditText(text);
  }, []);

  const handleSaveEdit = useCallback((block: OCRTextBlock) => {
    if (editText.trim() !== block.text) {
      onTextReplace(block.id, editText, block);
    }
    setEditingBlock(null);
    setSelectedBlock(null);
  }, [editText, onTextReplace]);

  const handleCancelEdit = useCallback(() => {
    setEditingBlock(null);
    setSelectedBlock(null);
    setEditText('');
  }, []);

  const handleDelete = useCallback((blockId: string) => {
    onTextDelete(blockId);
    setSelectedBlock(null);
  }, [onTextDelete]);

  if (!enabled || pageBlocks.length === 0) return null;

  return (
    <div className="absolute inset-0">
      {pageBlocks.map((block) => (
        <Popover 
          key={block.id} 
          open={selectedBlock === block.id}
          onOpenChange={(open) => !open && setSelectedBlock(null)}
        >
          <PopoverTrigger asChild>
            <div
              className={`absolute pointer-events-auto cursor-pointer transition-all ${
                selectedBlock === block.id 
                  ? 'bg-primary/30 ring-2 ring-primary' 
                  : 'hover:bg-primary/20'
              }`}
              style={{
                left: block.x,
                top: block.y,
                width: Math.max(block.width, 20),
                height: Math.max(block.height, 16),
                minHeight: 14,
              }}
              onClick={() => handleBlockClick(block.id, block.text)}
              title={`${block.text} (${Math.round(block.confidence)}% confidence)`}
            />
          </PopoverTrigger>
          <PopoverContent 
            className="w-72 p-3" 
            side="top"
            align="start"
          >
            <div className="space-y-3">
              <div className="text-sm font-medium">Edit Text</div>
              
              {editingBlock === block.id ? (
                <div className="space-y-2">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Enter new text..."
                    className="w-full"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleSaveEdit(block)}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-2 bg-muted rounded text-sm break-words">
                    "{block.text}"
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Confidence: {Math.round(block.confidence)}%
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(block.id, block.text)}
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(block.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
});

TextSelectionLayer.displayName = 'TextSelectionLayer';
