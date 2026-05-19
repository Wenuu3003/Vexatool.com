import { useState, useRef, useEffect, useCallback } from "react";
import { QrCode, Download, Upload, Cloud, Image, Type, List, Trash2, X } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import ToolSEOContent from "@/components/ToolSEOContent";
import { CanonicalHead } from "@/components/CanonicalHead";

interface BatchQRItem {
  url: string;
  dataUrl: string | null;
  error?: string;
}

const QRCodeGenerator = () => {
  const [text, setText] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [finalDataUrl, setFinalDataUrl] = useState<string | null>(null);
  const [size, setSize] = useState(256);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState([30]);
  const [darkColor, setDarkColor] = useState("#000000");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [activeTab, setActiveTab] = useState("text");
  const [driveLink, setDriveLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [batchUrls, setBatchUrls] = useState("");
  const [batchQRCodes, setBatchQRCodes] = useState<BatchQRItem[]>([]);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  // Label below QR
  const [labelText, setLabelText] = useState("");
  const [labelFontSize, setLabelFontSize] = useState([16]);
  const [labelBold, setLabelBold] = useState(false);
  const [labelColor, setLabelColor] = useState("#000000");
  const [labelSpacing, setLabelSpacing] = useState([12]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const getQRContent = useCallback(() => {
    switch (activeTab) {
      case "text":
        return text.trim();
      case "drive":
        return driveLink.trim();
      case "image":
        return uploadedImageUrl || "";
      default:
        return "";
    }
  }, [activeTab, text, driveLink, uploadedImageUrl]);

  // Compose QR image + optional label into final image
  const composeFinalImage = useCallback((qrDataUrlSrc: string) => {
    const trimmedLabel = labelText.trim();
    if (!trimmedLabel) {
      setFinalDataUrl(qrDataUrlSrc);
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      const padding = 16;
      const spacing = labelSpacing[0];
      const fontSize = labelFontSize[0];
      const fontWeight = labelBold ? 'bold' : 'normal';
      const maxTextWidth = size - padding * 2;

      // Measure text to handle wrapping
      const measureCanvas = document.createElement('canvas');
      const mCtx = measureCanvas.getContext('2d')!;
      mCtx.font = `${fontWeight} ${fontSize}px Arial, sans-serif`;

      // Word-wrap
      const words = trimmedLabel.split(/\s+/);
      const lines: string[] = [];
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (mCtx.measureText(testLine).width > maxTextWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      // Truncate to max 3 lines
      if (lines.length > 3) {
        lines.length = 3;
        lines[2] = lines[2].slice(0, -3) + '...';
      }

      const lineHeight = fontSize * 1.3;
      const textBlockHeight = lines.length * lineHeight;
      const totalHeight = size + spacing + textBlockHeight + padding;

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = size;
      finalCanvas.height = totalHeight;
      const ctx = finalCanvas.getContext('2d')!;

      // Background
      ctx.fillStyle = lightColor;
      ctx.fillRect(0, 0, size, totalHeight);

      // Draw QR
      ctx.drawImage(img, 0, 0, size, size);

      // Draw label
      ctx.fillStyle = labelColor;
      ctx.font = `${fontWeight} ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const textY = size + spacing;
      lines.forEach((line, i) => {
        ctx.fillText(line, size / 2, textY + i * lineHeight);
      });

      setFinalDataUrl(finalCanvas.toDataURL('image/png'));
    };
    img.src = qrDataUrlSrc;
  }, [labelText, labelFontSize, labelBold, labelColor, labelSpacing, size, lightColor]);

  const generateQR = useCallback(async () => {
    const content = getQRContent();
    if (!content) {
      setQrDataUrl(null);
      setFinalDataUrl(null);
      return;
    }

    if (activeTab === "image" && content.startsWith("data:")) {
      toast({
        title: "Image QR Limitation",
        description: "QR codes cannot store full images. Please use Text/URL tab with a link to your hosted image instead.",
        variant: "destructive",
      });
      setQrDataUrl(null);
      setFinalDataUrl(null);
      return;
    }

    if (content.length > 2000) {
      toast({
        title: "Content too long",
        description: "QR code content is too long. Please use a shorter URL or text.",
        variant: "destructive",
      });
      setQrDataUrl(null);
      setFinalDataUrl(null);
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      
      await QRCode.toCanvas(canvas, content, {
        width: size,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        errorCorrectionLevel: logo ? 'H' : 'M',
      });

      if (logo) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const img = document.createElement("img");
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const logoSizeValue = (size * logoSize[0]) / 100;
            const logoX = (size - logoSizeValue) / 2;
            const logoY = (size - logoSizeValue) / 2;
            
            ctx.fillStyle = lightColor;
            ctx.fillRect(logoX - 4, logoY - 4, logoSizeValue + 8, logoSizeValue + 8);
            ctx.drawImage(img, logoX, logoY, logoSizeValue, logoSizeValue);
            
            const qrOnly = canvas.toDataURL("image/png");
            setQrDataUrl(qrOnly);
            composeFinalImage(qrOnly);
          };
          img.onerror = () => {
            const qrOnly = canvas.toDataURL("image/png");
            setQrDataUrl(qrOnly);
            composeFinalImage(qrOnly);
          };
          img.src = logo;
        }
      } else {
        const qrOnly = canvas.toDataURL("image/png");
        setQrDataUrl(qrOnly);
        composeFinalImage(qrOnly);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("QR generation error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to generate QR code. Content may be too long.",
        variant: "destructive",
      });
      setQrDataUrl(null);
      setFinalDataUrl(null);
    }
  }, [getQRContent, activeTab, size, logo, logoSize, darkColor, lightColor, composeFinalImage]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Logo must be smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    setIsLoading(true);
    
    // Use client-side data URL instead of server upload for security
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedImageUrl(dataUrl);
      setIsLoading(false);
      toast({
        title: "Image loaded!",
        description: "QR code will contain your image data.",
      });
    };
    reader.onerror = () => {
      setIsLoading(false);
      toast({
        title: "Load failed",
        description: "Could not load image. Please try again.",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogo(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setUploadedImageUrl(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const downloadQR = (format: 'png' | 'svg' | 'jpg' | 'pdf') => {
    if (!qrDataUrl) return;
    const content = getQRContent();

    if (format === 'png') {
      const link = document.createElement("a");
      link.href = finalDataUrl || qrDataUrl;
      link.download = "qrcode.png";
      link.click();
    } else if (format === 'jpg') {
      const srcUrl = finalDataUrl || qrDataUrl;
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        // JPG has no transparency — fill white background to preserve light color
        ctx.fillStyle = lightColor || "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const jpgUrl = canvas.toDataURL("image/jpeg", 0.95);
        const link = document.createElement("a");
        link.href = jpgUrl;
        link.download = "qrcode.jpg";
        link.click();
        toast({ title: "Downloaded!", description: "QR code saved as JPG." });
      };
      img.onerror = () => {
        toast({ title: "Error", description: "Failed to generate JPG.", variant: "destructive" });
      };
      img.src = srcUrl;
      return;
    } else if (format === 'pdf') {
      const srcUrl = finalDataUrl || qrDataUrl;
      const img = new window.Image();
      img.onload = () => {
        try {
          const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
          const pageW = pdf.internal.pageSize.getWidth();
          const pageH = pdf.internal.pageSize.getHeight();
          // White background
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pageW, pageH, "F");
          // Scale QR to fit nicely, max 60% of page width
          const maxW = pageW * 0.6;
          const aspect = img.height / img.width;
          const drawW = Math.min(maxW, img.width);
          const drawH = drawW * aspect;
          const x = (pageW - drawW) / 2;
          const y = (pageH - drawH) / 2;
          pdf.addImage(srcUrl, "PNG", x, y, drawW, drawH);
          pdf.save("qrcode.pdf");
          toast({ title: "Downloaded!", description: "QR code saved as PDF." });
        } catch {
          toast({ title: "Error", description: "Failed to generate PDF.", variant: "destructive" });
        }
      };
      img.onerror = () => {
        toast({ title: "Error", description: "Failed to generate PDF.", variant: "destructive" });
      };
      img.src = srcUrl;
      return;
    } else {
      QRCode.toString(content, { type: 'svg', width: size, color: { dark: darkColor, light: lightColor } }, (err, svgContent) => {
        if (err) {
          toast({
            title: "Error",
            description: "Failed to generate SVG.",
            variant: "destructive",
          });
          return;
        }

        // Inject label text into SVG if present
        const trimmedLabel = labelText.trim();
        let finalSvg = svgContent;
        if (trimmedLabel) {
          const fontSize = labelFontSize[0];
          const fontWeight = labelBold ? 'bold' : 'normal';
          const spacing = labelSpacing[0];
          // Parse original SVG dimensions
          const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
          const widthMatch = svgContent.match(/width="(\d+)"/);
          const svgW = widthMatch ? parseInt(widthMatch[1]) : size;
          const vb = viewBoxMatch ? viewBoxMatch[1].split(/\s+/).map(Number) : [0, 0, svgW, svgW];
          const scale = vb[2] / svgW;
          const scaledFontSize = fontSize * scale;
          const scaledSpacing = spacing * scale;
          const lineHeight = scaledFontSize * 1.3;

          // Word-wrap label
          const maxCharsPerLine = Math.floor((vb[2] - 16 * scale) / (scaledFontSize * 0.6));
          const words = trimmedLabel.split(/\s+/);
          const lines: string[] = [];
          let currentLine = '';
          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (testLine.length > maxCharsPerLine && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);
          if (lines.length > 3) {
            lines.length = 3;
            lines[2] = lines[2].slice(0, -3) + '...';
          }

          const textBlockHeight = lines.length * lineHeight + scaledSpacing;
          const newHeight = vb[3] + textBlockHeight;

          // Build text elements
          const textElements = lines.map((line, i) => {
            const y = vb[3] + scaledSpacing + i * lineHeight + scaledFontSize;
            const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<text x="${vb[2] / 2}" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${scaledFontSize}" font-weight="${fontWeight}" fill="${labelColor}">${escaped}</text>`;
          }).join('\n');

          // Update SVG: expand viewBox/height and append text
          finalSvg = svgContent
            .replace(/viewBox="[^"]*"/, `viewBox="${vb[0]} ${vb[1]} ${vb[2]} ${newHeight}"`)
            .replace(/height="[^"]*"/, `height="${Math.ceil(newHeight / scale)}"`)
            .replace('</svg>', `${textElements}\n</svg>`);
        }

        const blob = new Blob([finalSvg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "qrcode.svg";
        link.click();
        URL.revokeObjectURL(url);
      });
    }

    toast({
      title: "Downloaded!",
      description: `QR code saved as ${format.toUpperCase()}.`,
    });
  };

  // Batch QR generation
  const generateBatchQR = async () => {
    const urls = batchUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urls.length === 0) {
      toast({
        title: "No URLs",
        description: "Please enter at least one URL.",
        variant: "destructive",
      });
      return;
    }

    if (urls.length > 50) {
      toast({
        title: "Too many URLs",
        description: "Maximum 50 URLs allowed per batch.",
        variant: "destructive",
      });
      return;
    }

    setIsBatchGenerating(true);
    const results: BatchQRItem[] = [];

    for (const url of urls) {
      if (url.length > 2000) {
        results.push({ url, dataUrl: null, error: "URL too long" });
        continue;
      }

      try {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;

        await QRCode.toCanvas(canvas, url, {
          width: size,
          margin: 2,
          color: { dark: darkColor, light: lightColor },
          errorCorrectionLevel: 'M',
        });

        results.push({ url, dataUrl: canvas.toDataURL("image/png") });
      } catch {
        results.push({ url, dataUrl: null, error: "Failed to generate" });
      }
    }

    setBatchQRCodes(results);
    setIsBatchGenerating(false);

    const successCount = results.filter(r => r.dataUrl).length;
    toast({
      title: "Batch Complete",
      description: `Generated ${successCount} of ${urls.length} QR codes.`,
    });
  };

  const downloadBatchQR = (item: BatchQRItem, index: number) => {
    if (!item.dataUrl) return;
    const link = document.createElement("a");
    link.href = item.dataUrl;
    const filename = item.url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    link.download = `qrcode_${index + 1}_${filename}.png`;
    link.click();
  };

  const downloadAllBatchQR = async () => {
    const validCodes = batchQRCodes.filter(item => item.dataUrl);
    if (validCodes.length === 0) return;

    for (let i = 0; i < validCodes.length; i++) {
      const item = validCodes[i];
      if (item.dataUrl) {
        const link = document.createElement("a");
        link.href = item.dataUrl;
        const filename = item.url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        link.download = `qrcode_${i + 1}_${filename}.png`;
        link.click();
        // Small delay to prevent browser blocking multiple downloads
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    toast({
      title: "Downloaded!",
      description: `${validCodes.length} QR codes downloaded.`,
    });
  };

  const removeBatchItem = (index: number) => {
    setBatchQRCodes(prev => prev.filter((_, i) => i !== index));
  };

  const clearBatch = () => {
    setBatchQRCodes([]);
    setBatchUrls("");
  };

  return (
    <>
      <CanonicalHead
        title="Free QR Code Generator with Logo & Label | VexaTool"
        description="Create custom QR codes with center logos, branded labels, and custom colors. Download PNG or SVG. Free, private, browser-based QR generator for business and personal use."
        keywords="QR code generator free, QR code with logo, QR code with text below, custom QR code maker, QR code label, QR code generator India, WhatsApp QR code, UPI QR code, branded QR code"
      />
      <ToolLayout
        title="Free QR Code Generator — Logo, Label & Colors"
        description="Generate branded QR codes with center logos, custom text labels below, and color customization. Download as PNG or SVG — 100% free and private."
        icon={QrCode}
        colorClass="bg-purple-500"
      >
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="text" className="gap-1 text-xs sm:text-sm">
                  <Type className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Text/URL</span>
                  <span className="sm:hidden">URL</span>
                </TabsTrigger>
                <TabsTrigger value="batch" className="gap-1 text-xs sm:text-sm">
                  <List className="w-3 h-3 sm:w-4 sm:h-4" />
                  Batch
                </TabsTrigger>
                <TabsTrigger value="image" className="gap-1 text-xs sm:text-sm">
                  <Image className="w-3 h-3 sm:w-4 sm:h-4" />
                  Image
                </TabsTrigger>
                <TabsTrigger value="drive" className="gap-1 text-xs sm:text-sm">
                  <Cloud className="w-3 h-3 sm:w-4 sm:h-4" />
                  Drive
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-text">Enter URL or text</Label>
                  <Input
                    id="qr-text"
                    placeholder="https://example.com or any text..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="text-lg"
                  />
                </div>
              </TabsContent>

              <TabsContent value="batch" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="batch-urls">Enter URLs (one per line)</Label>
                  <Textarea
                    id="batch-urls"
                    placeholder={"https://example.com\nhttps://google.com\nhttps://github.com"}
                    value={batchUrls}
                    onChange={(e) => setBatchUrls(e.target.value)}
                    className="min-h-[120px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter up to 50 URLs, one per line. Each will generate a separate QR code.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={generateBatchQR} 
                    disabled={isBatchGenerating || !batchUrls.trim()}
                    className="gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    {isBatchGenerating ? "Generating..." : "Generate All"}
                  </Button>
                  {batchQRCodes.length > 0 && (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={downloadAllBatchQR}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download All
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={clearBatch}
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Upload Image</Label>
                    <p className="text-sm text-muted-foreground">
                      Upload an image to host it and generate a QR code linking to it
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      ref={imageInputRef}
                      className="hidden"
                    />
                    <div className="flex gap-2 items-center">
                      <Button
                        variant="outline"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isLoading}
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {isLoading ? "Uploading..." : "Upload Image"}
                      </Button>
                      {imageFile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="truncate max-w-[150px]">{imageFile.name}</span>
                          <Button variant="ghost" size="icon" onClick={clearImage} className="h-6 w-6">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-muted"></div>
                    <span className="px-3 text-xs text-muted-foreground">OR</span>
                    <div className="flex-grow border-t border-muted"></div>
                  </div>

                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input
                      placeholder="https://example.com/your-image.jpg"
                      value={uploadedImageUrl || ""}
                      onChange={(e) => {
                        setUploadedImageUrl(e.target.value);
                        setImageFile(null);
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste a direct link to your image from any hosting service
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="drive" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="drive-link">Google Drive Link</Label>
                  <Input
                    id="drive-link"
                    placeholder="Paste your Google Drive file link..."
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste any Google Drive share link to generate a QR code for it
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label>Size: {size}px</Label>
              <Slider
                value={[size]}
                onValueChange={(val) => setSize(val[0])}
                min={128}
                max={512}
                step={32}
              />
            </div>

            <div className="space-y-3">
              <Label>Colors</Label>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border"
                  />
                  <span className="text-sm">Dark</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border"
                  />
                  <span className="text-sm">Light</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Add Logo/Image to Center</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                ref={logoInputRef}
                className="hidden"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => logoInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {logo ? "Change Logo" : "Upload Logo"}
                </Button>
                {logo && (
                  <Button variant="destructive" onClick={removeLogo}>
                    Remove
                  </Button>
                )}
              </div>
              {logo && (
                <div className="space-y-2">
                  <Label>Logo Size: {logoSize[0]}%</Label>
                  <Slider
                    value={logoSize}
                    onValueChange={setLogoSize}
                    min={15}
                    max={40}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: Keep logo size under 30% for best scanning reliability
                  </p>
                </div>
              )}
            </div>

            {/* Label Below QR */}
            <div className="space-y-3 border-t border-border pt-4">
              <Label htmlFor="label-text">Label Below QR Code</Label>
              <Input
                id="label-text"
                placeholder="e.g. Scan to visit our website"
                value={labelText}
                onChange={(e) => setLabelText(e.target.value)}
                maxLength={120}
              />
              {labelText.trim() && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Font Size: {labelFontSize[0]}px</Label>
                      <Slider
                        value={labelFontSize}
                        onValueChange={setLabelFontSize}
                        min={10}
                        max={28}
                        step={1}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Spacing: {labelSpacing[0]}px</Label>
                      <Slider
                        value={labelSpacing}
                        onValueChange={setLabelSpacing}
                        min={4}
                        max={32}
                        step={2}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={labelColor}
                        onChange={(e) => setLabelColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border"
                      />
                      <span className="text-xs text-muted-foreground">Color</span>
                    </div>
                    <Button
                      variant={labelBold ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLabelBold(!labelBold)}
                      className="h-8 px-3 text-xs font-bold"
                    >
                      B
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center justify-center space-y-6">
            {activeTab === "batch" ? (
              batchQRCodes.length > 0 ? (
                <div className="w-full space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  <p className="text-sm text-muted-foreground text-center">
                    {batchQRCodes.filter(r => r.dataUrl).length} QR codes generated
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {batchQRCodes.map((item, index) => (
                      <div 
                        key={index} 
                        className="relative group bg-card border rounded-lg p-2 flex flex-col items-center"
                      >
                        {item.dataUrl ? (
                          <>
                            <img 
                              src={item.dataUrl} 
                              alt={`QR ${index + 1}`} 
                              className="w-full max-w-[100px] rounded"
                            />
                            <p className="text-xs text-muted-foreground mt-1 truncate w-full text-center" title={item.url}>
                              {item.url.length > 20 ? item.url.substring(0, 20) + '...' : item.url}
                            </p>
                            <div className="flex gap-1 mt-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => downloadBatchQR(item, index)}
                                className="h-7 px-2 text-xs"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => removeBatchItem(index)}
                                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-xs text-destructive">{item.error || "Failed"}</p>
                            <p className="text-xs text-muted-foreground truncate w-full" title={item.url}>
                              {item.url.substring(0, 15)}...
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <List className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Enter URLs and click "Generate All" to create multiple QR codes</p>
                </div>
              )
            ) : qrDataUrl ? (
              <>
                <div className="p-4 bg-white rounded-xl shadow-lg">
                  <img src={finalDataUrl || qrDataUrl} alt="QR Code" className="max-w-full" />
                </div>
                
                <div className="flex gap-4">
                  <Button onClick={() => downloadQR('png')} className="gap-2">
                    <Download className="w-4 h-4" />
                    Download PNG
                  </Button>
                  <Button variant="outline" onClick={() => downloadQR('svg')} className="gap-2">
                    <Download className="w-4 h-4" />
                    Download SVG
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <QrCode className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>
                  {activeTab === "text" && "Enter text or URL to generate a QR code"}
                  {activeTab === "image" && "Enter an image URL to generate a QR code"}
                  {activeTab === "drive" && "Paste a Google Drive link to generate a QR code"}
                </p>
              </div>
            )}
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <ToolSEOContent
          toolName="Free QR Code Generator with Logo & Label"
          whatIs="VexaTool's QR Code Generator lets you create fully branded QR codes in seconds — right inside your browser, with no sign-up and no data leaving your device. You can encode any URL, plain text, WhatsApp link, UPI payment address, WiFi credentials, or contact card (vCard) into a scannable QR code. What sets this tool apart is the ability to add a custom center logo and a readable text label below the QR code, making it ideal for business cards, product packaging, restaurant table tents, event passes, and shop counters. Customize foreground and background colors to match your brand palette, adjust logo size for optimal scan reliability, and choose font size, weight, color, and spacing for the label text. Download your finished QR code as a high-resolution PNG for digital sharing or as a scalable SVG for professional print at any size — both formats include your logo and label exactly as previewed. The batch mode handles up to 50 QR codes at once for larger campaigns. Used daily by shop owners, event organizers, freelancers, and marketing teams across India."
          howToUse={[
            "Select your input type — URL/Text, Batch, Image, or Google Drive link — using the tabs at the top.",
            "Type or paste the content you want to encode (a website URL, WhatsApp link, UPI address, or any text).",
            "Optionally upload a brand logo — it will be placed in the center of the QR code automatically.",
            "Add a text label below the QR code (e.g. your business name, 'Scan to Pay', or a product label). Adjust font size, weight, color, and spacing.",
            "Customize foreground and background colors to match your brand identity.",
            "Preview the QR code live as you make changes — what you see is exactly what you'll download.",
            "Click Download PNG for digital use or Download SVG for print-quality output. Both include the logo and label."
          ]}
          features={[
            "Custom text label below the QR code — perfect for adding a business name, product label, or call-to-action like 'Scan to Pay'.",
            "Center logo merge — upload any image to place your brand logo inside the QR code without breaking scannability.",
            "Full label formatting — choose font size, bold/normal weight, text color, and spacing between QR and label.",
            "Color customization — set foreground (dark) and background (light) colors to match any brand palette.",
            "Multiple input types — encode URLs, plain text, WhatsApp links, UPI payment addresses, WiFi details, and contact cards.",
            "Batch generation — create up to 50 QR codes at once from a list of URLs for marketing campaigns or inventory.",
            "Dual download formats — PNG for digital (social media, websites, emails) and SVG for print (business cards, posters, banners).",
            "Real-time live preview — see your QR code update instantly as you change text, colors, logo, or label.",
            "100% browser-based and private — no data is uploaded to any server, no account required, no watermarks."
          ]}
          safetyNote="Every QR code is generated entirely in your browser using client-side JavaScript. The URLs, WhatsApp numbers, UPI addresses, logos, and labels you use are never sent to any external server. Your data stays on your device from start to finish. This makes VexaTool safe for encoding sensitive business information, payment details, and private contact data."
          faqs={[
            { question: "How do I add text below the QR code?", answer: "After generating your QR code, scroll down to the 'Label Below QR Code' section in the controls panel. Type your desired text — for example, your business name or 'Scan Me'. The label appears below the QR in the live preview and is included in both PNG and SVG downloads." },
            { question: "Will the label appear in downloaded PNG and SVG?", answer: "Yes. The text label you add is composited directly into the downloaded image. Both PNG and SVG exports include the label with the exact font size, color, weight, and spacing you set in the preview." },
            { question: "Can I add a logo in the center of the QR code?", answer: "Yes. Click 'Upload Logo' and select any image file (PNG, JPG, or SVG). The logo is placed in the center of the QR code. You can adjust its size using the logo size slider. Keep the logo at 30% or smaller for reliable scanning." },
            { question: "Will the QR still scan after adding a logo and label?", answer: "Yes. QR codes use error correction that tolerates partial obstruction. The logo stays within the safe center area, and the label is placed outside the QR code entirely — below it, with proper spacing. Always do a quick scan test on your phone after generating." },
            { question: "What can I encode in a QR code?", answer: "You can encode website URLs, plain text, email addresses, phone numbers, WhatsApp links (wa.me format), UPI payment links (upi://pay?pa=...), WiFi credentials, and vCard contacts. QR codes support up to about 2,000 characters." },
            { question: "Can I create WhatsApp, UPI, or contact QR codes?", answer: "Yes. For WhatsApp, enter https://wa.me/91XXXXXXXXXX. For UPI, enter upi://pay?pa=yourUPI@bank&pn=YourName. For contacts, paste a vCard string. The generated QR opens the correct app when scanned." },
            { question: "Is QR generation private and browser-based?", answer: "Completely. All processing happens in your browser — no data, logos, or labels are uploaded to any server. Your URLs, payment details, and business information remain 100% private." },
            { question: "Should I download PNG or SVG?", answer: "Use PNG for digital channels like websites, social media, and email signatures. Use SVG when you need the QR code for print — it scales to any size (business cards, banners, posters) without losing quality. Both include your logo and label." },
            { question: "Can I generate multiple QR codes at once?", answer: "Yes. Switch to the Batch tab, paste up to 50 URLs (one per line), and generate all QR codes simultaneously. You can download each one individually." },
            { question: "Is this QR code generator really free?", answer: "Yes — completely free with no hidden costs, no daily limits, no premium tier, and no watermarks on your generated QR codes. Use it as often as you need." }
          ]}
        />
      </div>
      </ToolLayout>
    </>
  );
};

export default QRCodeGenerator;
