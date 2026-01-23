import { memo } from 'react';
import { Bold, Italic, Underline as UnderlineIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  AnyElement, 
  TextElement, 
  ShapeElement, 
  ImageElement,
  RedactElement,
  FONT_FAMILIES, 
  FONT_SIZES, 
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
}) => (
  <div className="space-y-2">
    <Label className="text-xs">{label}</Label>
    <div className="flex flex-wrap gap-1">
      {COLORS.map(color => (
        <button
          key={color}
          className={`w-6 h-6 rounded border-2 ${value === color ? 'border-primary' : 'border-transparent'}`}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
        />
      ))}
      <Input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 p-0 border-0 cursor-pointer"
      />
    </div>
  </div>
));

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

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
      <h3 className="font-semibold text-sm">Properties</h3>
      
      {/* Common Properties */}
      <div className="space-y-3">
        <div className="space-y-2">
          <Label className="text-xs">Opacity</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[element.opacity * 100]}
              onValueChange={([v]) => handleUpdate({ opacity: v / 100 })}
              min={10}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="text-xs w-8">{Math.round(element.opacity * 100)}%</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs">Rotation</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[element.rotation]}
              onValueChange={([v]) => handleUpdate({ rotation: v })}
              min={0}
              max={360}
              step={15}
              className="flex-1"
            />
            <span className="text-xs w-8">{element.rotation}°</span>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Text Properties */}
      {element.type === 'text' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Font Family</Label>
            <Select
              value={(element as TextElement).fontFamily}
              onValueChange={(v) => handleUpdate({ fontFamily: v })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map(font => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs">Font Size</Label>
            <Select
              value={String((element as TextElement).fontSize)}
              onValueChange={(v) => handleUpdate({ fontSize: Number(v) })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map(size => (
                  <SelectItem key={size} value={String(size)}>
                    {size}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-1">
            <Button
              variant={(element as TextElement).fontWeight === 'bold' ? 'default' : 'outline'}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleUpdate({ 
                fontWeight: (element as TextElement).fontWeight === 'bold' ? 'normal' : 'bold' 
              })}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={(element as TextElement).fontStyle === 'italic' ? 'default' : 'outline'}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleUpdate({ 
                fontStyle: (element as TextElement).fontStyle === 'italic' ? 'normal' : 'italic' 
              })}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant={(element as TextElement).textDecoration === 'underline' ? 'default' : 'outline'}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleUpdate({ 
                textDecoration: (element as TextElement).textDecoration === 'underline' ? 'none' : 'underline' 
              })}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <ColorPicker
            value={(element as TextElement).color}
            onChange={(color) => handleUpdate({ color })}
            label="Text Color"
          />
        </div>
      )}
      
      {/* Shape Properties */}
      {element.type === 'shape' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Stroke Width</Label>
            <Slider
              value={[(element as ShapeElement).strokeWidth]}
              onValueChange={([v]) => handleUpdate({ strokeWidth: v })}
              min={1}
              max={10}
              step={1}
              className="flex-1"
            />
          </div>
          
          <ColorPicker
            value={(element as ShapeElement).strokeColor}
            onChange={(strokeColor) => handleUpdate({ strokeColor })}
            label="Stroke Color"
          />
          
          {((element as ShapeElement).shapeType === 'rectangle' || 
            (element as ShapeElement).shapeType === 'circle') && (
            <ColorPicker
              value={(element as ShapeElement).fillColor}
              onChange={(fillColor) => handleUpdate({ fillColor })}
              label="Fill Color"
            />
          )}
        </div>
      )}
      
      {/* Redact Properties */}
      {element.type === 'redact' && (
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">
            Use this to cover/mask original scanned text
          </div>
          <ColorPicker
            value={(element as RedactElement).fillColor}
            onChange={(fillColor) => handleUpdate({ fillColor })}
            label="Cover Color"
          />
          <div className="flex gap-2">
            <Button
              variant={(element as RedactElement).fillColor === '#FFFFFF' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleUpdate({ fillColor: '#FFFFFF' })}
            >
              White
            </Button>
            <Button
              variant={(element as RedactElement).fillColor === '#000000' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleUpdate({ fillColor: '#000000' })}
            >
              Black
            </Button>
          </div>
        </div>
      )}
      
      {/* Image Properties */}
      {element.type === 'image' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Width</Label>
            <Slider
              value={[element.width]}
              onValueChange={([v]) => {
                const ratio = (element as ImageElement).originalHeight / (element as ImageElement).originalWidth;
                handleUpdate({ width: v, height: v * ratio });
              }}
              min={50}
              max={500}
              step={10}
            />
          </div>
        </div>
      )}
      
      {/* Position */}
      <Separator />
      <div className="space-y-3">
        <Label className="text-xs font-semibold">Position</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">X</Label>
            <Input
              type="number"
              value={Math.round(element.x)}
              onChange={(e) => handleUpdate({ x: Number(e.target.value) })}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Y</Label>
            <Input
              type="number"
              value={Math.round(element.y)}
              onChange={(e) => handleUpdate({ y: Number(e.target.value) })}
              className="h-8"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Width</Label>
            <Input
              type="number"
              value={Math.round(element.width)}
              onChange={(e) => handleUpdate({ width: Number(e.target.value) })}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Height</Label>
            <Input
              type="number"
              value={Math.round(element.height)}
              onChange={(e) => handleUpdate({ height: Number(e.target.value) })}
              className="h-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

PropertiesPanel.displayName = 'PropertiesPanel';
