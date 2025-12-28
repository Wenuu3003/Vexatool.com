import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RefreshCw, Upload, Download, Loader2, X, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageFile {
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
}

interface ConvertedImage {
  original: ImageFile;
  converted: string;
  format: string;
  size: number;
}

const formats = [
  { value: "image/jpeg", label: "JPEG", ext: "jpg" },
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/webp", label: "WebP", ext: "webp" },
];

export default function ImageFormatConverter() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
  const [targetFormat, setTargetFormat] = useState("image/webp");
  const [quality, setQuality] = useState(85);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((f) => f.type.startsWith("image/"));

    if (validFiles.length === 0) {
      toast({ title: "Invalid files", description: "Please select image files.", variant: "destructive" });
      return;
    }

    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setImages((prev) => [...prev, ...newImages]);
    setConvertedImages([]);
  }, [toast]);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (images.length === 0) return;

    setIsConverting(true);
    setConvertedImages([]);

    try {
      const results: ConvertedImage[] = [];

      for (const imageFile of images) {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageFile.preview;
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) throw new Error("Could not get canvas context");

        // For PNG transparency support
        if (targetFormat === "image/png") {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL(targetFormat, quality / 100);
        
        // Calculate approximate size
        const base64Length = dataUrl.split(",")[1].length;
        const sizeInBytes = Math.round((base64Length * 3) / 4);

        results.push({
          original: imageFile,
          converted: dataUrl,
          format: targetFormat,
          size: sizeInBytes,
        });
      }

      setConvertedImages(results);
      toast({ title: "Conversion complete!", description: `${results.length} image(s) converted.` });
    } catch (error) {
      console.error("Conversion error:", error);
      toast({ title: "Conversion failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsConverting(false);
    }
  };

  const downloadOne = (converted: ConvertedImage, index: number) => {
    const format = formats.find((f) => f.value === converted.format);
    const ext = format?.ext || "jpg";
    const baseName = converted.original.name.replace(/\.[^/.]+$/, "");

    const link = document.createElement("a");
    link.href = converted.converted;
    link.download = `${baseName}.${ext}`;
    link.click();
  };

  const downloadAll = () => {
    convertedImages.forEach((img, index) => {
      setTimeout(() => downloadOne(img, index), index * 200);
    });
  };

  const handleReset = () => {
    setImages([]);
    setConvertedImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <ToolLayout
      title="Image Format Converter"
      description="Convert images between PNG, JPG, and WebP formats. Batch convert multiple images at once."
      icon={RefreshCw}
      colorClass="bg-gradient-to-br from-orange-500 to-amber-600"
      category="Image Tools"
    >
      <div className="space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {images.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">Click to upload images</p>
              <p className="text-sm text-muted-foreground">JPG, PNG, WebP supported • Multiple files allowed</p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Selected Images ({images.length})</Label>
                <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Add More
                </Button>
              </div>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {images.map((img, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-lg border p-2">
                    <img src={img.preview} alt="" className="h-10 w-10 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{img.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(img.size)}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeImage(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Convert To</Label>
                <Select value={targetFormat} onValueChange={setTargetFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {formats.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quality: {quality}%</Label>
                <Slider
                  value={[quality]}
                  onValueChange={(v) => setQuality(v[0])}
                  min={10}
                  max={100}
                  step={5}
                  disabled={targetFormat === "image/png"}
                />
                {targetFormat === "image/png" && (
                  <p className="text-xs text-muted-foreground">PNG uses lossless compression</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleConvert}
                disabled={isConverting}
                className="flex-1"
                size="lg"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Convert {images.length} Image{images.length > 1 ? "s" : ""}
                  </>
                )}
              </Button>
              <Button variant="outline" size="lg" onClick={handleReset}>
                Reset
              </Button>
            </div>

            {convertedImages.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Converted Images</Label>
                  <Button onClick={downloadAll}>
                    <Download className="mr-2 h-4 w-4" />
                    Download All
                  </Button>
                </div>
                <div className="space-y-2">
                  {convertedImages.map((img, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-lg border p-3">
                      <img src={img.converted} alt="" className="h-12 w-12 rounded object-cover" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span>{formatSize(img.original.size)}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="font-medium text-green-600">{formatSize(img.size)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formats.find((f) => f.value === img.format)?.label}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => downloadOne(img, index)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
}
