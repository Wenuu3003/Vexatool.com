import { memo } from 'react';
import {
  MousePointer2, Type, Square, Circle, Minus, MoveRight,
  Pencil, Highlighter, Underline, Image, Droplets, Hand,
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize, RotateCw,
  Trash2, Copy, Lock, Unlock, Download, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tool, ZOOM_LEVELS } from './types';

interface EditorToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToWidth: () => void;
  onFitToPage: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  hasSelection: boolean;
  isLocked: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleLock: () => void;
  onDownload: () => void;
  isProcessing: boolean;
}

const ToolButton = memo(({ 
  icon: Icon, 
  tool, 
  activeTool, 
  onClick, 
  tooltip 
}: { 
  icon: any; 
  tool: Tool; 
  activeTool: Tool; 
  onClick: (tool: Tool) => void;
  tooltip: string;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={activeTool === tool ? 'default' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => onClick(tool)}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
));

export const EditorToolbar = memo(({
  activeTool,
  onToolChange,
  zoom,
  onZoomChange,
  onZoomIn,
  onZoomOut,
  onFitToWidth,
  onFitToPage,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  hasSelection,
  isLocked,
  onDelete,
  onDuplicate,
  onToggleLock,
  onDownload,
  isProcessing,
}: EditorToolbarProps) => {
  return (
    <div className="bg-card border-b border-border p-2 flex flex-wrap items-center gap-1 sticky top-0 z-20">
      {/* Selection Tools */}
      <div className="flex items-center gap-0.5">
        <ToolButton icon={MousePointer2} tool="select" activeTool={activeTool} onClick={onToolChange} tooltip="Select (V)" />
        <ToolButton icon={Hand} tool="pan" activeTool={activeTool} onClick={onToolChange} tooltip="Pan (H)" />
      </div>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Text & Shapes */}
      <div className="flex items-center gap-0.5">
        <ToolButton icon={Type} tool="text" activeTool={activeTool} onClick={onToolChange} tooltip="Add Text (T)" />
        <ToolButton icon={Square} tool="rectangle" activeTool={activeTool} onClick={onToolChange} tooltip="Rectangle (R)" />
        <ToolButton icon={Circle} tool="circle" activeTool={activeTool} onClick={onToolChange} tooltip="Circle (C)" />
        <ToolButton icon={Minus} tool="line" activeTool={activeTool} onClick={onToolChange} tooltip="Line (L)" />
        <ToolButton icon={MoveRight} tool="arrow" activeTool={activeTool} onClick={onToolChange} tooltip="Arrow (A)" />
      </div>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Drawing Tools */}
      <div className="flex items-center gap-0.5">
        <ToolButton icon={Pencil} tool="pen" activeTool={activeTool} onClick={onToolChange} tooltip="Pen (P)" />
        <ToolButton icon={Highlighter} tool="highlight" activeTool={activeTool} onClick={onToolChange} tooltip="Highlight" />
        <ToolButton icon={Underline} tool="underline" activeTool={activeTool} onClick={onToolChange} tooltip="Underline" />
      </div>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Image & Watermark */}
      <div className="flex items-center gap-0.5">
        <ToolButton icon={Image} tool="image" activeTool={activeTool} onClick={onToolChange} tooltip="Add Image (I)" />
        <ToolButton icon={Droplets} tool="watermark" activeTool={activeTool} onClick={onToolChange} tooltip="Watermark (W)" />
      </div>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Select value={String(zoom)} onValueChange={(v) => onZoomChange(Number(v))}>
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ZOOM_LEVELS.map((level) => (
              <SelectItem key={level.value} value={String(level.value)}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onFitToWidth}>
                <Maximize className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fit to Width</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onUndo} disabled={!canUndo}>
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRedo} disabled={!canRedo}>
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset All Changes</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Element Actions */}
      {hasSelection && (
        <div className="flex items-center gap-0.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDuplicate}>
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleLock}>
                  {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isLocked ? 'Unlock' : 'Lock'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete (Del)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Download */}
      <Button 
        onClick={onDownload} 
        disabled={isProcessing}
        className="bg-primary hover:bg-primary/90"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Processing...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </>
        )}
      </Button>
    </div>
  );
});

EditorToolbar.displayName = 'EditorToolbar';
