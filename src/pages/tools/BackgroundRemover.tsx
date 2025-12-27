import { useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import { Eraser, Upload, Download, Loader2, ImageIcon } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { removeBackground, loadImage, convertBlobToFormat } from "@/lib/backgroundRemoval";

type OutputFormat = "png" | "jpeg" | "webp";

const BackgroundRemover = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("png");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResultBlob(null);
    setResultUrl(null);
    setProgress(0);
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

    try {
      const img = await loadImage(file);
      setProgress(5);

      const blob = await removeBackground(img, setProgress);
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      toast.success("Background removed successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to remove background. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!resultBlob) return;

    try {
      let downloadBlob = resultBlob;

      if (outputFormat !== "png") {
        downloadBlob = await convertBlobToFormat(resultBlob, outputFormat);
      }

      const url = URL.createObjectURL(downloadBlob);
      const a = document.createElement("a");
      a.href = url;
      const baseName = file?.name.replace(/\.[^/.]+$/, "") || "image";
      a.download = `${baseName}-no-bg.${outputFormat}`;
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

  return (
    <>
      <Helmet>
        <title>Remove Image Background Free Online | AI Background Remover</title>
        <meta
          name="description"
          content="Remove background from any image instantly using AI. Free online tool to make transparent PNG, JPG, or WebP images. No signup required."
        />
        <meta
          name="keywords"
          content="remove background, background remover, transparent background, AI background removal, free background remover"
        />
      </Helmet>

      <ToolLayout
        title="Background Remover"
        description="Remove background from images instantly using AI"
        icon={Eraser}
        colorClass="bg-gradient-to-br from-purple-500 to-pink-500"
        category="ImageApplication"
      >
        <div className="max-w-4xl mx-auto space-y-6">
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

          {/* Preview and Result */}
          {file && (
            <div className="space-y-6">
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

                {/* Result Image */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Result</h3>
                  <div
                    className="relative aspect-square rounded-xl overflow-hidden flex items-center justify-center"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)",
                      backgroundSize: "20px 20px",
                      backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                    }}
                  >
                    {resultUrl ? (
                      <img
                        src={resultUrl}
                        alt="Result"
                        className="max-w-full max-h-full object-contain"
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
                    <span className="text-muted-foreground">Processing...</span>
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

                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setResultBlob(null);
                    setResultUrl(null);
                    setProgress(0);
                  }}
                >
                  Upload New Image
                </Button>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="bg-muted/30 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              How It Works
            </h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                Upload any image (JPG, PNG, or WebP)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                Our AI automatically detects and removes the background
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                Download your image with transparent background in PNG, JPG, or WebP
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              All processing happens in your browser. Your images are never uploaded to any server.
            </p>
          </div>
        </div>
      </ToolLayout>
    </>
  );
};

export default BackgroundRemover;
