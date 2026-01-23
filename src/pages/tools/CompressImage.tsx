import { useState, useCallback, useEffect } from "react";
import { ImageDown, Download, Settings2 } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { compressImageFile } from "@/lib/imageCompression";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import ToolSEOContent from "@/components/ToolSEOContent";
import { CanonicalHead } from "@/components/CanonicalHead";

interface CompressedImage {
  original: File;
  compressed: Blob;
  outputType: string;
  originalSize: number;
  compressedSize: number;
  previewUrl: string;
}

const CompressImage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState(80);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      filePreviews.forEach(url => URL.revokeObjectURL(url));
      compressedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    };
  }, []);

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
      // Create previews for new files
      const newPreviews = imageFiles.map(file => URL.createObjectURL(file));
      setFilePreviews(prev => [...prev, ...newPreviews]);
      setFiles(prev => [...prev, ...imageFiles]);
      setCompressedImages([]);
    }
    
    // Reset the input
    e.target.value = '';
  }, []);

  // Image compression is handled by a shared helper so all tools stay consistent.


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
        const { blob: compressed, outputType } = await compressImageFile(file, {
          quality,
          maxDimension: 2048,
        });
        const previewUrl = URL.createObjectURL(compressed);

        results.push({
          original: file,
          compressed,
          outputType,
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
        description:
          savings > 0.5
            ? `Reduced by ${savings.toFixed(1)}% (${formatSize(totalOriginal)} → ${formatSize(totalCompressed)})`
            : `Optimized. Try lowering quality for smaller files (${formatSize(totalOriginal)} → ${formatSize(totalCompressed)}).`,
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

    const ext =
      image.outputType === "image/webp"
        ? ".webp"
        : image.outputType === "image/png"
          ? ".png"
          : ".jpg";

    link.download = `compressed_${image.original.name.replace(/\.[^/.]+$/, "")}${ext}`;
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
    // Cleanup preview URLs
    if (filePreviews[index]) {
      URL.revokeObjectURL(filePreviews[index]);
    }
    if (compressedImages[index]?.previewUrl) {
      URL.revokeObjectURL(compressedImages[index].previewUrl);
    }
    
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
    setCompressedImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    filePreviews.forEach(url => URL.revokeObjectURL(url));
    compressedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setFiles([]);
    setFilePreviews([]);
    setCompressedImages([]);
  };

  return (
    <>
      <CanonicalHead
        title="Compress Images Online Free - Reduce JPG, PNG, WebP Size | Mypdfs"
        description="Free online image compressor. Reduce JPG, PNG, and WebP file sizes up to 90% while maintaining quality."
        keywords="image compressor, compress images, reduce image size, JPG compressor, PNG compressor, WebP compressor"
      />
      
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
                  <Card key={`${file.name}-${index}`} className="p-3 flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={compressedImages[index]?.previewUrl || filePreviews[index]} 
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Original: {formatSize(file.size)}
                        {compressedImages[index] && (() => {
                          const c = compressedImages[index];
                          const percent = ((file.size - c.compressedSize) / file.size) * 100;
                          const label = percent > 0.5 ? `${percent.toFixed(0)}% smaller` : "optimized";

                          return (
                            <span className="text-primary ml-2">
                              → {formatSize(c.compressedSize)} {" "}({label})
                            </span>
                          );
                        })()}
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

        <ToolSEOContent
          toolName="Compress Images"
          whatIs="Image compression reduces the file size of your photos and graphics while preserving visual quality. Large image files slow down websites, fill up storage quickly, and are difficult to share via email or messaging apps. Our free online image compressor supports JPG, PNG, and WebP formats, allowing you to reduce file sizes by up to 90% with minimal visible quality loss. Whether you are optimizing images for web use, social media, or storage, this tool provides fast and efficient compression."
          howToUse={[
            "Click the upload area or drag and drop your images (JPG, PNG, or WebP).",
            "Adjust the quality slider to set your preferred compression level.",
            "Click 'Compress' to process your images.",
            "Download individual images or all compressed files at once."
          ]}
          features={[
            "Support for JPG, PNG, and WebP image formats.",
            "Adjustable quality settings from 10% to 100%.",
            "Batch processing for multiple images simultaneously.",
            "Real-time preview of compression results.",
            "Shows file size reduction percentage for each image.",
            "Fast browser-based processing with no external uploads."
          ]}
          safetyNote="All image processing occurs directly in your browser. Your photos are never uploaded to external servers, ensuring complete privacy and security. Compressed images are available only in your current session and are not stored anywhere."
          faqs={[
            {
              question: "What quality setting should I use?",
              answer: "For web use, 60-80% quality provides excellent results with significant file size reduction. For print or high-quality displays, use 80-90%. Lower settings produce smaller files but may show visible compression artifacts."
            },
            {
              question: "Which image format compresses best?",
              answer: "WebP typically provides the smallest file sizes with good quality. JPG is excellent for photographs, while PNG is best when you need transparency or lossless quality."
            },
            {
              question: "Will compression affect my image dimensions?",
              answer: "No, compression only reduces file size while maintaining your image's original width and height. To resize images, use our Image Resizer tool."
            },
            {
              question: "Is there a limit on how many images I can compress?",
              answer: "You can compress multiple images in one session. For best performance, we recommend processing batches of 10-20 images at a time."
            }
          ]}
        />
      </ToolLayout>
    </>
  );
};

export default CompressImage;
