import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Maximize, Upload, Download, Loader2, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageFile {
  file: File;
  preview: string;
  width: number;
  height: number;
}

interface ResizedImage {
  original: ImageFile;
  resized: string;
  newWidth: number;
  newHeight: number;
}

const presets = [
  { label: "Custom", value: "custom", width: 0, height: 0 },
  { label: "Passport Photo (35x45mm)", value: "passport", width: 413, height: 531 },
  { label: "Instagram Square (1080x1080)", value: "ig-square", width: 1080, height: 1080 },
  { label: "Instagram Portrait (1080x1350)", value: "ig-portrait", width: 1080, height: 1350 },
  { label: "Instagram Story (1080x1920)", value: "ig-story", width: 1080, height: 1920 },
  { label: "Facebook Cover (820x312)", value: "fb-cover", width: 820, height: 312 },
  { label: "Facebook Profile (180x180)", value: "fb-profile", width: 180, height: 180 },
  { label: "Twitter Header (1500x500)", value: "twitter-header", width: 1500, height: 500 },
  { label: "Twitter Post (1200x675)", value: "twitter-post", width: 1200, height: 675 },
  { label: "LinkedIn Banner (1584x396)", value: "linkedin-banner", width: 1584, height: 396 },
  { label: "YouTube Thumbnail (1280x720)", value: "yt-thumb", width: 1280, height: 720 },
  { label: "HD (1920x1080)", value: "hd", width: 1920, height: 1080 },
  { label: "4K (3840x2160)", value: "4k", width: 3840, height: 2160 },
];

export default function ImageResizer() {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [preset, setPreset] = useState("custom");
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [quality, setQuality] = useState(90);
  const [resized, setResized] = useState<ResizedImage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aspectRatioRef = useRef(1);
  const { toast } = useToast();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImage({
        file,
        preview: URL.createObjectURL(file),
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      aspectRatioRef.current = img.naturalWidth / img.naturalHeight;
      setResized(null);
    };
    img.src = URL.createObjectURL(file);
  }, [toast]);

  const handlePresetChange = (value: string) => {
    setPreset(value);
    const selected = presets.find((p) => p.value === value);
    if (selected && selected.width > 0) {
      setWidth(selected.width);
      setHeight(selected.height);
      setMaintainRatio(false);
    } else if (image) {
      setWidth(image.width);
      setHeight(image.height);
      setMaintainRatio(true);
    }
  };

  const handleWidthChange = (value: string) => {
    const newWidth = parseInt(value) || 1;
    setWidth(newWidth);
    if (maintainRatio && image) {
      setHeight(Math.round(newWidth / aspectRatioRef.current));
    }
    setPreset("custom");
  };

  const handleHeightChange = (value: string) => {
    const newHeight = parseInt(value) || 1;
    setHeight(newHeight);
    if (maintainRatio && image) {
      setWidth(Math.round(newHeight * aspectRatioRef.current));
    }
    setPreset("custom");
  };

  const handleResize = async () => {
    if (!image) return;

    setIsProcessing(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Could not get canvas context");

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = image.preview;
      });

      ctx.drawImage(img, 0, 0, width, height);

      const resizedDataUrl = canvas.toDataURL("image/jpeg", quality / 100);

      setResized({
        original: image,
        resized: resizedDataUrl,
        newWidth: width,
        newHeight: height,
      });

      toast({ title: "Image resized!", description: `New size: ${width}x${height}px` });
    } catch (error) {
      console.error("Resize error:", error);
      toast({ title: "Resize failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resized) return;

    const link = document.createElement("a");
    link.href = resized.resized;
    link.download = `resized_${resized.newWidth}x${resized.newHeight}.jpg`;
    link.click();
  };

  const handleReset = () => {
    setImage(null);
    setResized(null);
    setPreset("custom");
    setWidth(800);
    setHeight(600);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <ToolLayout
      title="Image Resizer"
      description="Resize images for social media, passports, and custom dimensions. Supports all major platforms."
      icon={Maximize}
      colorClass="bg-gradient-to-br from-cyan-500 to-blue-600"
      category="Image Tools"
    >
      <div className="space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!image ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">Click to upload an image</p>
              <p className="text-sm text-muted-foreground">JPG, PNG, WebP supported</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-4 rounded-lg border p-4">
              <img
                src={image.preview}
                alt="Preview"
                className="h-20 w-20 rounded object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{image.file.name}</p>
                <p className="text-sm text-muted-foreground">
                  Original: {image.width}x{image.height}px
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleReset}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Preset Size</Label>
                <Select value={preset} onValueChange={handlePresetChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {presets.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="width">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    min="1"
                    max="10000"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    min="1"
                    max="10000"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ratio"
                  checked={maintainRatio}
                  onChange={(e) => setMaintainRatio(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="ratio" className="cursor-pointer">
                  Maintain aspect ratio
                </Label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Quality: {quality}%</Label>
                </div>
                <Slider
                  value={[quality]}
                  onValueChange={(v) => setQuality(v[0])}
                  min={10}
                  max={100}
                  step={5}
                />
              </div>

              <Button
                onClick={handleResize}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resizing...
                  </>
                ) : (
                  <>
                    <Maximize className="mr-2 h-4 w-4" />
                    Resize Image
                  </>
                )}
              </Button>
            </div>

            {resized && (
              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Resized Image</p>
                    <p className="text-sm text-muted-foreground">
                      {resized.newWidth}x{resized.newHeight}px
                    </p>
                  </div>
                  <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
                <img
                  src={resized.resized}
                  alt="Resized"
                  className="max-h-[300px] rounded object-contain mx-auto"
                />
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
}
