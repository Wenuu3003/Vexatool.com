import { memo, useState } from 'react';
import { Bold, Italic, Underline as UnderlineIcon, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, AlignLeft, AlignCenter, AlignRight, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  AnyElement, 
  TextElement, 
  ShapeElement, 
  ImageElement,
  RedactElement,
  FONT_FAMILIES, 
  FONT_SIZES, 
  FONT_WEIGHTS,
  COLORS 
} from './types';

interface PropertiesPanelProps {
  element: AnyElement | null;
  onUpdate: (id: string, updates: Partial<AnyElement>) => void;
}

const ColorPicker = memo(({ 
  value, 
  onChange, 
  label 
}: { 
  value: string; 
  onChange: (color: string) => void;
  label: string;
}) => {
  const [hexInput, setHexInput] = useState(value);

  const handleHexChange = (hex: string) => {
    setHexInput(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hex);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className="flex flex-wrap gap-1">
        {COLORS.map(color => (
          <button
            key={color}
            className={`w-5 h-5 rounded border-2 ${value === color ? 'border-primary' : 'border-transparent'}`}
            style={{ backgroundColor: color }}
            onClick={() => { onChange(color); setHexInput(color); }}
          />
        ))}
      </div>
      <div className="flex gap-1 items-center">
        <Input
          type="color"
          value={value}
          onChange={(e) => { onChange(e.target.value); setHexInput(e.target.value); }}
          className="w-7 h-7 p-0 border-0 cursor-pointer shrink-0"
        />
        <Input
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          onBlur={() => setHexInput(value)}
          placeholder="#000000"
          className="h-7 text-xs font-mono"
        />
      </div>
    </div>
  );
});
ColorPicker.displayName = 'ColorPicker';

export const PropertiesPanel = memo(({ element, onUpdate }: PropertiesPanelProps) => {
  if (!element) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        Select an element to edit its properties
      </div>
    );
  }

  const handleUpdate = (updates: Partial<AnyElement>) => {
    onUpdate(element.id, updates);
  };

  const nudge = (dir: 'up' | 'down' | 'left' | 'right', amount = 1) => {
    switch (dir) {
      case 'up': handleUpdate({ y: element.y - amount }); break;
      case 'down': handleUpdate({ y: element.y + amount }); break;
      case 'left': handleUpdate({ x: element.x - amount }); break;
      case 'right': handleUpdate({ x: element.x + amount }); break;
    }
  };

  return (
    <div className="p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
      <h3 className="font-semibold text-sm">Properties</h3>
      
      {/* Common: Opacity */}
      <div className="space-y-1">
        <Label className="text-xs">Opacity</Label>
        <div className="flex items-center gap-2">
          <Slider
            value={[element.opacity * 100]}
            onValueChange={([v]) => handleUpdate({ opacity: v / 100 })}
            min={10} max={100} step={5}
            className="flex-1"
          />
          <span className="text-xs w-8">{Math.round(element.opacity * 100)}%</span>
        </div>
      </div>
      
      {/* Common: Rotation */}
      <div className="space-y-1">
        <Label className="text-xs">Rotation</Label>
        <div className="flex items-center gap-2">
          <Slider
            value={[element.rotation]}
            onValueChange={([v]) => handleUpdate({ rotation: v })}
            min={0} max={360} step={1}
            className="flex-1"
          />
          <span className="text-xs w-8">{element.rotation}°</span>
        </div>
      </div>
      
      {/* Fine Nudge Controls */}
      <div className="space-y-1">
        <Label className="text-xs">Nudge Position (1px)</Label>
        <div className="flex items-center justify-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => nudge('left')}><ChevronLeft className="h-3 w-3" /></Button>
          <div className="flex flex-col gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => nudge('up')}><ChevronUp className="h-3 w-3" /></Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => nudge('down')}><ChevronDown className="h-3 w-3" /></Button>
          </div>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => nudge('right')}><ChevronRight className="h-3 w-3" /></Button>
        </div>
      </div>
      
      <Separator />
      
      {/* Text Properties */}
      {element.type === 'text' && (() => {
        const textEl = element as TextElement;
        return (
          <div className="space-y-3">
            {/* Font Family */}
            <div className="space-y-1">
              <Label className="text-xs">Font Family</Label>
              <Select value={textEl.fontFamily} onValueChange={(v) => handleUpdate({ fontFamily: v })}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map(font => (
                    <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Font Size */}
            <div className="space-y-1">
              <Label className="text-xs">Font Size</Label>
              <Select value={String(textEl.fontSize)} onValueChange={(v) => handleUpdate({ fontSize: Number(v) })}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONT_SIZES.map(size => (
                    <SelectItem key={size} value={String(size)}>{size}px</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Font Weight */}
            <div className="space-y-1">
              <Label className="text-xs">Font Weight</Label>
              <Select value={textEl.fontWeight} onValueChange={(v) => handleUpdate({ fontWeight: v })}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONT_WEIGHTS.map(w => (
                    <SelectItem key={w.value} value={w.value} style={{ fontWeight: w.css }}>
                      {w.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Style buttons */}
            <div className="flex gap-1">
              <Button variant={textEl.fontStyle === 'italic' ? 'default' : 'outline'} size="icon" className="h-8 w-8"
                onClick={() => handleUpdate({ fontStyle: textEl.fontStyle === 'italic' ? 'normal' : 'italic' })}>
                <Italic className="h-4 w-4" />
              </Button>
              <Button variant={textEl.textDecoration === 'underline' ? 'default' : 'outline'} size="icon" className="h-8 w-8"
                onClick={() => handleUpdate({ textDecoration: textEl.textDecoration === 'underline' ? 'none' : 'underline' })}>
                <UnderlineIcon className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Text Align */}
            <div className="space-y-1">
              <Label className="text-xs">Text Align</Label>
              <div className="flex gap-1">
                {(['left', 'center', 'right'] as const).map(align => (
                  <Button key={align}
                    variant={(textEl.textAlign || 'left') === align ? 'default' : 'outline'}
                    size="icon" className="h-8 w-8"
                    onClick={() => handleUpdate({ textAlign: align })}>
                    {align === 'left' && <AlignLeft className="h-4 w-4" />}
                    {align === 'center' && <AlignCenter className="h-4 w-4" />}
                    {align === 'right' && <AlignRight className="h-4 w-4" />}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Letter Spacing */}
            <div className="space-y-1">
              <Label className="text-xs">Letter Spacing</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[textEl.letterSpacing ?? 0]}
                  onValueChange={([v]) => handleUpdate({ letterSpacing: v })}
                  min={-2} max={10} step={0.1}
                  className="flex-1"
                />
                <span className="text-xs w-10">{(textEl.letterSpacing ?? 0).toFixed(1)}px</span>
              </div>
            </div>
            
            {/* Line Height */}
            <div className="space-y-1">
              <Label className="text-xs">Line Height</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[(textEl.lineHeightMultiplier ?? 1) * 100]}
                  onValueChange={([v]) => handleUpdate({ lineHeightMultiplier: v / 100 })}
                  min={80} max={200} step={5}
                  className="flex-1"
                />
                <span className="text-xs w-10">{((textEl.lineHeightMultiplier ?? 1) * 100).toFixed(0)}%</span>
              </div>
            </div>
            
            {/* Background Mask */}
            <div className="flex items-center justify-between">
              <Label className="text-xs">White mask (cover old text)</Label>
              <Switch
                checked={textEl.backgroundMask ?? false}
                onCheckedChange={(v) => handleUpdate({ backgroundMask: v })}
              />
            </div>
            
            <ColorPicker
              value={textEl.color}
              onChange={(color) => handleUpdate({ color })}
              label="Text Color"
            />
          </div>
        );
      })()}
      
      {/* Shape Properties */}
      {element.type === 'shape' && (() => {
        const shapeEl = element as ShapeElement;
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Stroke Width</Label>
              <Slider value={[shapeEl.strokeWidth]} onValueChange={([v]) => handleUpdate({ strokeWidth: v })} min={1} max={10} step={1} />
            </div>
            <ColorPicker value={shapeEl.strokeColor} onChange={(strokeColor) => handleUpdate({ strokeColor })} label="Stroke Color" />
            {(shapeEl.shapeType === 'rectangle' || shapeEl.shapeType === 'circle') && (
              <ColorPicker value={shapeEl.fillColor} onChange={(fillColor) => handleUpdate({ fillColor })} label="Fill Color" />
            )}
          </div>
        );
      })()}
      
      {/* Redact Properties */}
      {element.type === 'redact' && (() => {
        const redactEl = element as RedactElement;
        return (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">Cover/mask original text</div>
            <ColorPicker value={redactEl.fillColor} onChange={(fillColor) => handleUpdate({ fillColor })} label="Cover Color" />
            <div className="flex gap-2">
              <Button variant={redactEl.fillColor === '#FFFFFF' ? 'default' : 'outline'} size="sm" onClick={() => handleUpdate({ fillColor: '#FFFFFF' })}>White</Button>
              <Button variant={redactEl.fillColor === '#000000' ? 'default' : 'outline'} size="sm" onClick={() => handleUpdate({ fillColor: '#000000' })}>Black</Button>
            </div>
          </div>
        );
      })()}
      
      {/* Image Properties */}
      {element.type === 'image' && (
        <div className="space-y-2">
          <Label className="text-xs">Width</Label>
          <Slider
            value={[element.width]}
            onValueChange={([v]) => {
              const ratio = (element as ImageElement).originalHeight / (element as ImageElement).originalWidth;
              handleUpdate({ width: v, height: v * ratio });
            }}
            min={50} max={500} step={10}
          />
        </div>
      )}
      
      {/* Position */}
      <Separator />
      <div className="space-y-2">
        <Label className="text-xs font-semibold">Position & Size</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">X</Label>
            <Input type="number" value={Math.round(element.x)} onChange={(e) => handleUpdate({ x: Number(e.target.value) })} className="h-7 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Y</Label>
            <Input type="number" value={Math.round(element.y)} onChange={(e) => handleUpdate({ y: Number(e.target.value) })} className="h-7 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">W</Label>
            <Input type="number" value={Math.round(element.width)} onChange={(e) => handleUpdate({ width: Number(e.target.value) })} className="h-7 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">H</Label>
            <Input type="number" value={Math.round(element.height)} onChange={(e) => handleUpdate({ height: Number(e.target.value) })} className="h-7 text-xs" />
          </div>
        </div>
      </div>
    </div>
  );
});

PropertiesPanel.displayName = 'PropertiesPanel';
