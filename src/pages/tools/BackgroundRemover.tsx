import { useState, useCallback, useRef } from "react";
import { Eraser, Upload, Download, Loader2, ImageIcon, Edit2, Eye, EyeOff, Clock, Sparkles, Palette, Image as ImageIconLucide } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { 
  removeBackground, 
  loadImage, 
  convertBlobToFormat, 
  applyEditedMask,
  applyCustomBackground,
  type RemovalResult 
} from "@/lib/backgroundRemoval";
import { MaskEditor } from "@/components/MaskEditor";
import ToolSEOContent from "@/components/ToolSEOContent";
import { CanonicalHead } from "@/components/CanonicalHead";

type OutputFormat = "png" | "jpeg" | "webp";

const PRESET_COLORS = [
  "#FFFFFF", "#000000", "#EF4444", "#F97316", "#EAB308", 
  "#22C55E", "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899",
  "#F472B6", "#A855F7", "#6366F1", "#14B8A6", "#84CC16"
];

const BackgroundRemover = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("png");
  const [isDragging, setIsDragging] = useState(false);

  // Processing time tracking
  const startTimeRef = useRef<number>(0);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  // Toggle view state
  const [showOriginal, setShowOriginal] = useState(false);

  // Mask editing state
  const [isEditing, setIsEditing] = useState(false);
  const [removalResult, setRemovalResult] = useState<RemovalResult | null>(null);
  const [currentMaskData, setCurrentMaskData] = useState<Float32Array | null>(null);

  // Original transparent blob (before background applied)
  const [originalTransparentBlob, setOriginalTransparentBlob] = useState<Blob | null>(null);

  // Custom background state
  const [backgroundColor, setBackgroundColor] = useState<string>("");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isApplyingBackground, setIsApplyingBackground] = useState(false);

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResultBlob(null);
    setResultUrl(null);
    setOriginalTransparentBlob(null);
    setProgress(0);
    setIsEditing(false);
    setRemovalResult(null);
    setCurrentMaskData(null);
    setProcessingTime(null);
    setShowOriginal(false);
    setBackgroundColor("");
    setBackgroundImage(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemoveBackground = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    startTimeRef.current = performance.now();

    try {
      const img = await loadImage(file);
      setProgress(5);

      const result = await removeBackground(img, setProgress);
      
      const endTime = performance.now();
      setProcessingTime(Math.round((endTime - startTimeRef.current) / 1000 * 10) / 10);

      setRemovalResult(result);
      setCurrentMaskData(new Float32Array(result.maskData));
      setResultBlob(result.blob);
      setOriginalTransparentBlob(result.blob);
      setResultUrl(URL.createObjectURL(result.blob));
      toast.success("Background removed successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to remove background. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartEditing = () => {
    if (!removalResult) return;
    setIsEditing(true);
  };

  const handleMaskUpdate = (newMaskData: Float32Array) => {
    setCurrentMaskData(newMaskData);
  };

  const handleApplyEdits = async () => {
    if (!removalResult || !currentMaskData) return;

    try {
      const newBlob = await applyEditedMask(
        removalResult.originalImage,
        currentMaskData,
        removalResult.width,
        removalResult.height
      );
      setResultBlob(newBlob);
      setOriginalTransparentBlob(newBlob);
      setResultUrl(URL.createObjectURL(newBlob));
      setBackgroundColor("");
      setBackgroundImage(null);
      setIsEditing(false);
      toast.success("Edits applied successfully!");
    } catch (error) {
      console.error("Error applying edits:", error);
      toast.error("Failed to apply edits");
    }
  };

  // Apply custom background color
  const handleApplyBackgroundColor = async (color: string) => {
    if (!originalTransparentBlob) return;
    
    setIsApplyingBackground(true);
    setBackgroundColor(color);
    setBackgroundImage(null);
    
    try {
      const newBlob = await applyCustomBackground(
        originalTransparentBlob,
        { type: 'color', value: color },
        outputFormat
      );
      setResultBlob(newBlob);
      setResultUrl(URL.createObjectURL(newBlob));
      toast.success("Background color applied!");
    } catch (error) {
      console.error("Error applying background color:", error);
      toast.error("Failed to apply background color");
    } finally {
      setIsApplyingBackground(false);
    }
  };

  // Apply custom background image
  const handleApplyBackgroundImage = async (imageUrl: string) => {
    if (!originalTransparentBlob) return;
    
    setIsApplyingBackground(true);
    setBackgroundImage(imageUrl);
    setBackgroundColor("");
    
    try {
      const newBlob = await applyCustomBackground(
        originalTransparentBlob,
        { type: 'image', value: imageUrl },
        outputFormat
      );
      setResultBlob(newBlob);
      setResultUrl(URL.createObjectURL(newBlob));
      toast.success("Background image applied!");
    } catch (error) {
      console.error("Error applying background image:", error);
      toast.error("Failed to apply background image");
    } finally {
      setIsApplyingBackground(false);
    }
  };

  // Remove custom background (restore transparent)
  const handleRemoveCustomBackground = () => {
    if (!originalTransparentBlob) return;
    setBackgroundColor("");
    setBackgroundImage(null);
    setResultBlob(originalTransparentBlob);
    setResultUrl(URL.createObjectURL(originalTransparentBlob));
    toast.success("Transparent background restored");
  };

  // Handle background image upload
  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bgFile = e.target.files?.[0];
    if (!bgFile) return;
    
    if (!bgFile.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    
    const imageUrl = URL.createObjectURL(bgFile);
    handleApplyBackgroundImage(imageUrl);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    // Reset to original mask
    if (removalResult) {
      setCurrentMaskData(new Float32Array(removalResult.maskData));
    }
  };

  const handleDownload = async () => {
    if (!resultBlob) return;

    try {
      let downloadBlob = resultBlob;

      if (outputFormat !== "png" && !backgroundColor && !backgroundImage) {
        downloadBlob = await convertBlobToFormat(resultBlob, outputFormat);
      }

      const url = URL.createObjectURL(downloadBlob);
      const a = document.createElement("a");
      a.href = url;
      const baseName = file?.name.replace(/\.[^/.]+$/, "") || "image";
      const bgSuffix = backgroundColor || backgroundImage ? "-with-bg" : "-no-bg";
      a.download = `${baseName}${bgSuffix}.${outputFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded as ${outputFormat.toUpperCase()}`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResultBlob(null);
    setResultUrl(null);
    setOriginalTransparentBlob(null);
    setProgress(0);
    setIsEditing(false);
    setRemovalResult(null);
    setCurrentMaskData(null);
    setProcessingTime(null);
    setShowOriginal(false);
    setBackgroundColor("");
    setBackgroundImage(null);
  };

  return (
    <>
      <CanonicalHead
        title="Remove Image Background Free Online | AI Background Remover"
        description="Remove background from any image instantly using AI. Free online tool to make transparent PNG, JPG, or WebP images. No signup required."
        keywords="remove background, background remover, transparent background, AI background removal, free background remover"
      />

      <ToolLayout
        title="Background Remover"
        description="Remove background from images instantly using AI"
        icon={Eraser}
        colorClass="bg-gradient-to-br from-purple-500 to-pink-500"
        category="ImageApplication"
      >
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Upload Area */}
          {!file && (
            <div
              className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) handleFileSelect(selectedFile);
                }}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Drop your image here or click to upload
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports JPG, PNG, WebP (max 10MB)
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Mask Editor Mode */}
          {file && isEditing && removalResult && currentMaskData && (
            <MaskEditor
              originalImage={removalResult.originalImage}
              maskData={currentMaskData}
              width={removalResult.width}
              height={removalResult.height}
              onMaskUpdate={handleMaskUpdate}
              onApply={handleApplyEdits}
              onCancel={handleCancelEditing}
            />
          )}

          {/* Preview and Result */}
          {file && !isEditing && (
            <div className="space-y-6">
              {/* Processing Time & Toggle Controls */}
              {resultUrl && (
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-4">
                    {processingTime !== null && (
                      <Badge variant="secondary" className="gap-1.5 text-sm py-1.5 px-3">
                        <Clock className="w-3.5 h-3.5" />
                        Processed in {processingTime}s
                      </Badge>
                    )}
                    <Badge variant="outline" className="gap-1.5 text-sm py-1.5 px-3">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI-Powered
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="toggle-view" className="text-sm text-muted-foreground cursor-pointer">
                      {showOriginal ? "Showing Original" : "Showing Result"}
                    </Label>
                    <Switch
                      id="toggle-view"
                      checked={showOriginal}
                      onCheckedChange={setShowOriginal}
                    />
                    {showOriginal ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Original Image */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Original</h3>
                  <div className="relative aspect-square bg-muted rounded-xl overflow-hidden flex items-center justify-center">
                    {preview && (
                      <img
                        src={preview}
                        alt="Original"
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                  </div>
                </div>

                {/* Result Image with Toggle */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Result {showOriginal && resultUrl && "(Toggle to see)"}
                  </h3>
                  <div
                    className="relative aspect-square rounded-xl overflow-hidden flex items-center justify-center"
                    style={{
                      backgroundImage: showOriginal 
                        ? "none"
                        : "linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)",
                      backgroundSize: "20px 20px",
                      backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                      backgroundColor: showOriginal ? "hsl(var(--muted))" : undefined,
                    }}
                  >
                    {resultUrl ? (
                      <img
                        src={showOriginal ? preview! : resultUrl}
                        alt={showOriginal ? "Original" : "Result"}
                        className="max-w-full max-h-full object-contain transition-opacity duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImageIcon className="w-12 h-12" />
                        <p className="text-sm">Result will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {progress < 35 ? "Loading AI model..." : 
                       progress < 50 ? "Preparing image..." :
                       progress < 80 ? "Removing background..." : "Finalizing..."}
                    </span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4">
                {!resultUrl ? (
                  <Button
                    onClick={handleRemoveBackground}
                    disabled={isProcessing}
                    size="lg"
                    className="gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Removing Background...
                      </>
                    ) : (
                      <>
                        <Eraser className="w-4 h-4" />
                        Remove Background
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    {/* Edit button */}
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleStartEditing}
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Mask
                    </Button>

                    {/* Custom Background Popover */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="lg"
                          className="gap-2"
                          disabled={isApplyingBackground}
                        >
                          {isApplyingBackground ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Palette className="w-4 h-4" />
                          )}
                          Add Background
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72" align="start">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2">Solid Colors</h4>
                            <div className="grid grid-cols-5 gap-2">
                              {PRESET_COLORS.map((color) => (
                                <button
                                  key={color}
                                  className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 ${
                                    backgroundColor === color ? "border-primary ring-2 ring-primary/50" : "border-border"
                                  }`}
                                  style={{ backgroundColor: color }}
                                  onClick={() => handleApplyBackgroundColor(color)}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Custom Color</h4>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                className="w-12 h-10 p-1 cursor-pointer"
                                onChange={(e) => handleApplyBackgroundColor(e.target.value)}
                              />
                              <Input
                                type="text"
                                placeholder="#FFFFFF"
                                className="flex-1"
                                value={backgroundColor}
                                onChange={(e) => {
                                  if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                                    handleApplyBackgroundColor(e.target.value);
                                  }
                                }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Background Image</h4>
                            <div className="flex gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleBackgroundImageUpload}
                                className="hidden"
                                id="bg-image-input"
                              />
                              <label
                                htmlFor="bg-image-input"
                                className="flex-1 cursor-pointer"
                              >
                                <Button variant="outline" className="w-full gap-2" asChild>
                                  <span>
                                    <ImageIconLucide className="w-4 h-4" />
                                    Upload Image
                                  </span>
                                </Button>
                              </label>
                            </div>
                          </div>
                          
                          {(backgroundColor || backgroundImage) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-destructive hover:text-destructive"
                              onClick={handleRemoveCustomBackground}
                            >
                              <Eraser className="w-4 h-4 mr-2" />
                              Remove Background (Transparent)
                            </Button>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Select
                      value={outputFormat}
                      onValueChange={(v) => setOutputFormat(v as OutputFormat)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpeg">JPG</SelectItem>
                        <SelectItem value="webp">WebP</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button onClick={handleDownload} size="lg" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download {outputFormat.toUpperCase()}
                    </Button>
                  </>
                )}

                <Button variant="outline" onClick={handleReset}>
                  Upload New Image
                </Button>
              </div>

              {/* Background indicator */}
              {resultUrl && (backgroundColor || backgroundImage) && (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Palette className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Custom background applied
                    {backgroundColor && (
                      <span
                        className="inline-block w-4 h-4 rounded-full ml-2 border border-border align-middle"
                        style={{ backgroundColor }}
                      />
                    )}
                    {backgroundImage && " (image)"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          {!isEditing && (
            <div className="bg-muted/30 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                How It Works
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  Upload any image (JPG, PNG, or WebP up to 10MB)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  Our AI automatically detects and removes the background
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  Use <strong>Add Background</strong> to replace with solid colors or custom images
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  Use <strong>Edit Mask</strong> to manually refine edges with brush tools
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">5.</span>
                  Toggle between original and result to compare
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">6.</span>
                  Download your image in PNG, JPG, or WebP format
                </li>
              </ul>
              <p className="text-sm text-muted-foreground">
                ✨ All processing happens in your browser. Your images are never uploaded to any server.
              </p>
            </div>
          )}

          <ToolSEOContent
            toolName="Background Remover"
            whatIs="AI-powered background removal automatically detects and removes the background from any image, leaving you with a clean transparent or solid-colored result. This technology is essential for product photography, profile pictures, marketing materials, and creative projects. Our free online tool uses advanced machine learning to accurately separate subjects from backgrounds, providing professional results without expensive software or manual editing skills."
            howToUse={[
              "Upload your image by clicking the upload area or dragging and dropping.",
              "Click 'Remove Background' to let the AI process your image.",
              "Use 'Add Background' to replace with solid colors or upload a custom image.",
              "Use the toggle switch to compare original and result side by side.",
              "Use the 'Edit Mask' feature to refine edges with erase/restore brush tools.",
              "Choose your output format (PNG, JPG, or WebP) and download."
            ]}
            features={[
              "AI-powered automatic subject detection and background removal.",
              "Custom background colors - choose from presets or pick any color.",
              "Custom background images - upload your own background.",
              "Manual mask editing with erase and restore brush tools.",
              "Real-time original vs result comparison toggle.",
              "Processing time display for performance tracking.",
              "Multiple output formats: PNG (transparent), JPG, and WebP.",
              "Undo/redo support in mask editor with keyboard shortcuts.",
              "Zoom and pan controls for precise editing.",
              "All processing happens locally in your browser for privacy."
            ]}
            safetyNote="Your images are processed entirely within your browser using on-device AI technology. No photos are uploaded to external servers, ensuring your images remain completely private. This browser-based approach also means faster processing without waiting for server responses."
            faqs={[
              {
                question: "What types of images work best?",
                answer: "Images with clear subject-background contrast work best. Well-lit photos with distinct edges produce the cleanest results. Complex backgrounds or images where subject and background colors are similar may require manual mask editing."
              },
              {
                question: "Can I edit the result if the AI misses some areas?",
                answer: "Yes, use the 'Edit Mask' button after initial processing. You can use the Erase brush (E key) to remove areas or Restore brush (R key) to bring back areas. Adjust brush size with [ and ] keys."
              },
              {
                question: "Which output format should I choose?",
                answer: "PNG is best for transparent backgrounds. JPG is smaller and suitable when you don't need transparency. WebP offers a good balance of quality and file size for web use."
              },
              {
                question: "Why is processing taking a while?",
                answer: "The AI model runs in your browser, which requires loading the model on first use (~25MB). Subsequent images process faster. Processing time depends on image size and your device's capabilities - you can see the exact time after processing completes."
              }
            ]}
          />
        </div>
      </ToolLayout>
    </>
  );
};

export default BackgroundRemover;