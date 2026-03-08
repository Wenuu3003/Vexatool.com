import { memo, useState } from 'react';
import {
  MousePointer2, Type, Square, Circle, Minus, MoveRight,
  Pencil, Highlighter, Underline, Image, Droplets, Hand,
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize, 
  Trash2, Copy, Lock, Unlock, Download, RotateCcw,
  Paintbrush, Eraser, RectangleHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tool, ZOOM_LEVELS, BRUSH_SIZES, ERASER_SIZES, COLORS, BrushSettings, EraserSettings } from './types';

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
  brushSettings: BrushSettings;
  onBrushSettingsChange: (settings: BrushSettings) => void;
  eraserSettings: EraserSettings;
  onEraserSettingsChange: (settings: EraserSettings) => void;
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
  brushSettings,
  onBrushSettingsChange,
  eraserSettings,
  onEraserSettingsChange,
}: EditorToolbarProps) => {
  const [showBrushPopover, setShowBrushPopover] = useState(false);
  const [showEraserPopover, setShowEraserPopover] = useState(false);

  return (
    <div className="bg-card border-b border-border p-1.5 md:p-2 flex items-center gap-0.5 md:gap-1 sticky top-0 z-20 overflow-x-auto scrollbar-thin min-h-[44px]">
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
        <ToolButton icon={RectangleHorizontal} tool="redact" activeTool={activeTool} onClick={onToolChange} tooltip="Redact/White Patch (X) - Cover original text" />
      </div>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Drawing Tools */}
      <div className="flex items-center gap-0.5">
        <ToolButton icon={Pencil} tool="pen" activeTool={activeTool} onClick={onToolChange} tooltip="Pen (P)" />
        <ToolButton icon={Highlighter} tool="highlight" activeTool={activeTool} onClick={onToolChange} tooltip="Highlight" />
        <ToolButton icon={Underline} tool="underline" activeTool={activeTool} onClick={onToolChange} tooltip="Underline" />
        
        {/* Brush Tool with Popover */}
        <Popover open={showBrushPopover} onOpenChange={setShowBrushPopover}>
          <PopoverTrigger asChild>
            <Button
              variant={activeTool === 'brush' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                onToolChange('brush');
                setShowBrushPopover(true);
              }}
            >
              <Paintbrush className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" side="bottom">
            <div className="space-y-4">
              <div className="font-semibold text-sm">Brush Settings</div>
              
              {/* Color Picker */}
              <div className="space-y-2">
                <Label className="text-xs">Color</Label>
                <div className="flex flex-wrap gap-1">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded border-2 ${brushSettings.color === color ? 'border-primary' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => onBrushSettingsChange({ ...brushSettings, color })}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={brushSettings.color}
                  onChange={(e) => onBrushSettingsChange({ ...brushSettings, color: e.target.value })}
                  className="w-full h-8 cursor-pointer"
                />
              </div>
              
              {/* Size Slider */}
              <div className="space-y-2">
                <Label className="text-xs">Size: {brushSettings.size}px</Label>
                <Slider
                  value={[brushSettings.size]}
                  onValueChange={([size]) => onBrushSettingsChange({ ...brushSettings, size })}
                  min={1}
                  max={50}
                  step={1}
                  className="w-full"
                />
                <div className="flex gap-1">
                  {BRUSH_SIZES.map((size) => (
                    <Button
                      key={size}
                      variant={brushSettings.size === size ? 'default' : 'outline'}
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => onBrushSettingsChange({ ...brushSettings, size })}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Opacity Slider */}
              <div className="space-y-2">
                <Label className="text-xs">Opacity: {Math.round(brushSettings.opacity * 100)}%</Label>
                <Slider
                  value={[brushSettings.opacity * 100]}
                  onValueChange={([opacity]) => onBrushSettingsChange({ ...brushSettings, opacity: opacity / 100 })}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Eraser Tool with Popover */}
        <Popover open={showEraserPopover} onOpenChange={setShowEraserPopover}>
          <PopoverTrigger asChild>
            <Button
              variant={activeTool === 'eraser' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                onToolChange('eraser');
                setShowEraserPopover(true);
              }}
            >
              <Eraser className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-4" side="bottom">
            <div className="space-y-4">
              <div className="font-semibold text-sm">Eraser Settings</div>
              <p className="text-xs text-muted-foreground">Erases drawn strokes only</p>
              
              {/* Size Slider */}
              <div className="space-y-2">
                <Label className="text-xs">Size: {eraserSettings.size}px</Label>
                <Slider
                  value={[eraserSettings.size]}
                  onValueChange={([size]) => onEraserSettingsChange({ size })}
                  min={5}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex gap-1 flex-wrap">
                  {ERASER_SIZES.map((size) => (
                    <Button
                      key={size}
                      variant={eraserSettings.size === size ? 'default' : 'outline'}
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => onEraserSettingsChange({ size })}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
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
