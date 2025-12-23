import { useState, useCallback } from "react";
import { ImageDown, Download, Settings2 } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface CompressedImage {
  original: File;
  compressed: Blob;
  originalSize: number;
  compressedSize: number;
  previewUrl: string;
}

const CompressImage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState(80);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const imageFiles = selectedFiles.filter(file => 
      file.type.startsWith('image/') && 
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    );
    
    if (imageFiles.length !== selectedFiles.length) {
      toast({
        title: "Some files skipped",
        description: "Only JPG, PNG, and WebP images are supported.",
        variant: "destructive",
      });
    }
    
    if (imageFiles.length > 0) {
      setFiles(prev => [...prev, ...imageFiles]);
      setCompressedImages([]);
    }
  }, []);

  const compressImage = (file: File, targetQuality: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate new dimensions (max 2048px while maintaining aspect ratio)
        let { width, height } = img;
        const maxDimension = 2048;
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        // Use better quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with quality setting
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const qualityValue = outputType === 'image/png' ? undefined : targetQuality / 100;
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Could not compress image'));
            }
          },
          outputType,
          qualityValue
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not load image'));
      };

      img.src = url;
    });
  };

  const handleCompress = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select images to compress.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const results: CompressedImage[] = [];

    try {
      for (const file of files) {
        const compressed = await compressImage(file, quality);
        const previewUrl = URL.createObjectURL(compressed);
        
        results.push({
          original: file,
          compressed,
          originalSize: file.size,
          compressedSize: compressed.size,
          previewUrl,
        });
      }

      setCompressedImages(results);

      const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
      const totalCompressed = results.reduce((sum, r) => sum + r.compressedSize, 0);
      const savings = Math.max(0, ((totalOriginal - totalCompressed) / totalOriginal * 100));

      toast({
        title: "Compression complete!",
        description: `Reduced by ${savings.toFixed(1)}% (${formatSize(totalOriginal)} → ${formatSize(totalCompressed)})`,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Compress error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to compress some images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (image: CompressedImage) => {
    const url = URL.createObjectURL(image.compressed);
    const link = document.createElement("a");
    link.href = url;
    const ext = image.original.type === 'image/png' ? '.png' : '.jpg';
    link.download = `compressed_${image.original.name.replace(/\.[^/.]+$/, '')}${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    compressedImages.forEach(image => handleDownload(image));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (compressedImages[index]?.previewUrl) {
      URL.revokeObjectURL(compressedImages[index].previewUrl);
    }
    setCompressedImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    compressedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setFiles([]);
    setCompressedImages([]);
  };

  return (
    <ToolLayout
      title="Compress Images"
      description="Reduce image file sizes while maintaining quality"
      icon={ImageDown}
      colorClass="bg-teal-500"
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <ImageDown className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop images here or click to upload</p>
            <p className="text-sm text-muted-foreground">Supports JPG, PNG, WebP (Max 20MB each)</p>
          </label>
        </div>

        {/* Quality Settings */}
        {files.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings2 className="w-4 h-4" />
              <Label className="font-medium">Compression Quality: {quality}%</Label>
            </div>
            <Slider
              value={[quality]}
              onValueChange={(value) => setQuality(value[0])}
              min={10}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Lower quality = smaller file size. Recommended: 60-80% for web use.
            </p>
          </Card>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{files.length} image(s) selected</h3>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>
            
            <div className="grid gap-3">
              {files.map((file, index) => (
                <Card key={index} className="p-3 flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                    {compressedImages[index]?.previewUrl ? (
                      <img 
                        src={compressedImages[index].previewUrl} 
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Original: {formatSize(file.size)}
                      {compressedImages[index] && (
                        <span className="text-green-600 ml-2">
                          → {formatSize(compressedImages[index].compressedSize)}
                          {" "}({Math.max(0, ((file.size - compressedImages[index].compressedSize) / file.size * 100)).toFixed(0)}% smaller)
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {compressedImages[index] && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownload(compressedImages[index])}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {files.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={handleCompress}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                "Compressing..."
              ) : (
                <>
                  <ImageDown className="w-5 h-5" />
                  Compress {files.length > 1 ? 'All' : 'Image'}
                </>
              )}
            </Button>
            
            {compressedImages.length > 1 && (
              <Button
                size="lg"
                variant="outline"
                onClick={handleDownloadAll}
                className="gap-2"
              >
                <Download className="w-5 h-5" />
                Download All
              </Button>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default CompressImage;
