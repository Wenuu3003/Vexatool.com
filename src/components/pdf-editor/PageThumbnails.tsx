import { memo, useCallback } from 'react';
import { RotateCw, Trash2, Copy, Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PageInfo } from './types';

interface PageThumbnailsProps {
  pages: PageInfo[];
  currentPage: number;
  onPageSelect: (index: number) => void;
  onRotatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onDuplicatePage: (index: number) => void;
  onAddBlankPage: (afterIndex: number) => void;
  onReorderPages: (fromIndex: number, toIndex: number) => void;
}

export const PageThumbnails = memo(({
  pages,
  currentPage,
  onPageSelect,
  onRotatePage,
  onDeletePage,
  onDuplicatePage,
  onAddBlankPage,
  onReorderPages,
}: PageThumbnailsProps) => {
  const visiblePages = pages.filter(p => !p.deleted);
  
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = Number(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== toIndex) {
      onReorderPages(fromIndex, toIndex);
    }
  }, [onReorderPages]);

  return (
    <div className="w-40 bg-card border-r border-border overflow-y-auto p-2">
      <h3 className="text-xs font-semibold mb-2 px-1 text-muted-foreground">Pages</h3>
      <div className="space-y-2">
        {visiblePages.map((page, displayIndex) => {
          const actualIndex = pages.findIndex(p => p.pageNumber === page.pageNumber);
          
          return (
            <div
              key={page.pageNumber}
              draggable
              onDragStart={(e) => handleDragStart(e, actualIndex)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, actualIndex)}
              className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                actualIndex === currentPage 
                  ? 'border-primary shadow-md' 
                  : 'border-transparent hover:border-muted-foreground/30'
              }`}
              onClick={() => onPageSelect(actualIndex)}
            >
              {/* Drag Handle */}
              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              
              {/* Thumbnail */}
              <div 
                className="aspect-[3/4] bg-muted/30 flex items-center justify-center"
                style={{ transform: `rotate(${page.rotation}deg)` }}
              >
                {page.canvas ? (
                  <img 
                    src={page.canvas.toDataURL()} 
                    alt={`Page ${displayIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground/30">
                    {displayIndex + 1}
                  </span>
                )}
              </div>
              
              {/* Page number */}
              <div className="absolute bottom-0 left-0 right-0 bg-background/80 text-center text-xs py-0.5">
                {displayIndex + 1}
              </div>
              
              {/* Actions */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-5 w-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRotatePage(actualIndex);
                        }}
                      >
                        <RotateCw className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Rotate</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-5 w-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicatePage(actualIndex);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Duplicate</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {visiblePages.length > 1 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-5 w-5 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePage(actualIndex);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Add Blank Page */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onAddBlankPage(pages.length - 1)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Page
        </Button>
      </div>
    </div>
  );
});

PageThumbnails.displayName = 'PageThumbnails';
