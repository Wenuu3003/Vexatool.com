import { useState, useRef } from 'react';
import { Image, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WatermarkElement, FONT_FAMILIES, COLORS } from './types';

interface WatermarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (watermark: Omit<WatermarkElement, 'id' | 'zIndex'>) => void;
  currentPage: number;
  totalPages: number;
}

export const WatermarkDialog = ({
  open,
  onOpenChange,
  onApply,
  currentPage,
  totalPages,
}: WatermarkDialogProps) => {
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('WATERMARK');
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState('Helvetica');
  const [color, setColor] = useState('#CCCCCC');
  const [opacity, setOpacity] = useState(0.5);
  const [rotation, setRotation] = useState(45);
  const [position, setPosition] = useState<'center' | 'diagonal' | 'tiled'>('diagonal');
  const [applyTo, setApplyTo] = useState<'current' | 'all'>('all');
  const [imageSrc, setImageSrc] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApply = () => {
    const watermark: Omit<WatermarkElement, 'id' | 'zIndex'> = {
      type: 'watermark',
      watermarkType,
      page: currentPage,
      x: 0,
      y: 0,
      width: 200,
      height: 50,
      rotation: position === 'diagonal' ? rotation : 0,
      opacity,
      locked: false,
      position,
      applyTo,
      ...(watermarkType === 'text' 
        ? { text, fontSize, fontFamily, color }
        : { imageSrc }
      ),
    };
    onApply(watermark);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Watermark</DialogTitle>
        </DialogHeader>
        
        <Tabs value={watermarkType} onValueChange={(v) => setWatermarkType(v as 'text' | 'image')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">
              <Type className="h-4 w-4 mr-2" />
              Text
            </TabsTrigger>
            <TabsTrigger value="image">
              <Image className="h-4 w-4 mr-2" />
              Image
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Watermark Text</Label>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter watermark text"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Font</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger>
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
                <Label>Size: {fontSize}px</Label>
                <Slider
                  value={[fontSize]}
                  onValueChange={([v]) => setFontSize(v)}
                  min={12}
                  max={120}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-1">
                {COLORS.map(c => (
                  <button
                    key={c}
                    className={`w-6 h-6 rounded border-2 ${color === c ? 'border-primary' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="image" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Upload Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-4 w-4 mr-2" />
                {imageSrc ? 'Change Image' : 'Select Image'}
              </Button>
              {imageSrc && (
                <div className="mt-2 p-2 border rounded-lg">
                  <img src={imageSrc} alt="Watermark preview" className="max-h-24 mx-auto" />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Opacity: {Math.round(opacity * 100)}%</Label>
            <Slider
              value={[opacity * 100]}
              onValueChange={([v]) => setOpacity(v / 100)}
              min={10}
              max={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Position</Label>
            <RadioGroup value={position} onValueChange={(v) => setPosition(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="center" id="center" />
                <Label htmlFor="center">Center</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="diagonal" id="diagonal" />
                <Label htmlFor="diagonal">Diagonal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tiled" id="tiled" />
                <Label htmlFor="tiled">Tiled (Repeat)</Label>
              </div>
            </RadioGroup>
          </div>
          
          {position === 'diagonal' && (
            <div className="space-y-2">
              <Label>Rotation: {rotation}°</Label>
              <Slider
                value={[rotation]}
                onValueChange={([v]) => setRotation(v)}
                min={-90}
                max={90}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Apply to</Label>
            <RadioGroup value={applyTo} onValueChange={(v) => setApplyTo(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="current" id="current" />
                <Label htmlFor="current">Current Page ({currentPage + 1})</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All Pages ({totalPages})</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={watermarkType === 'image' && !imageSrc}>
            Apply Watermark
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
