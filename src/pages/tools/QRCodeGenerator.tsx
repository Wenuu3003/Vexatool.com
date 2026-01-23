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

  const generateQR = useCallback(async () => {
    const content = getQRContent();
    if (!content) {
      setQrDataUrl(null);
      return;
    }

    // QR codes have a max data capacity. Data URLs are too long.
    // For image tab, we should inform the user this feature needs a hosted URL
    if (activeTab === "image" && content.startsWith("data:")) {
      toast({
        title: "Image QR Limitation",
        description: "QR codes cannot store full images. Please use Text/URL tab with a link to your hosted image instead.",
        variant: "destructive",
      });
      setQrDataUrl(null);
      return;
    }

    // Check content length - QR codes have practical limits (~2000 chars for reliable scanning)
    if (content.length > 2000) {
      toast({
        title: "Content too long",
        description: "QR code content is too long. Please use a shorter URL or text.",
        variant: "destructive",
      });
      setQrDataUrl(null);
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
            
            setQrDataUrl(canvas.toDataURL("image/png"));
          };
          img.onerror = () => {
            setQrDataUrl(canvas.toDataURL("image/png"));
          };
          img.src = logo;
        }
      } else {
        setQrDataUrl(canvas.toDataURL("image/png"));
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
    }
  }, [getQRContent, activeTab, size, logo, logoSize, darkColor, lightColor]);

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

  const downloadQR = (format: 'png' | 'svg') => {
    if (!qrDataUrl) return;
    const content = getQRContent();

    if (format === 'png') {
      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = "qrcode.png";
      link.click();
    } else {
      QRCode.toString(content, { type: 'svg', width: size, color: { dark: darkColor, light: lightColor } }, (err, svg) => {
        if (err) {
          toast({
            title: "Error",
            description: "Failed to generate SVG.",
            variant: "destructive",
          });
          return;
        }
        const blob = new Blob([svg], { type: "image/svg+xml" });
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
        title="QR Code Generator Free Online - Create Custom QR Codes | Mypdfs"
        description="Free QR code generator. Create custom QR codes with logos and colors. Generate QR codes for URLs and text."
        keywords="QR code generator, create QR code, free QR code, custom QR code, QR code with logo, QR maker"
      />
      <ToolLayout
        title="QR Code Generator"
        description="Generate custom QR codes from text, images, or Google Drive links"
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
                  <img src={qrDataUrl} alt="QR Code" className="max-w-full" />
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
          toolName="QR Code Generator"
          whatIs="QR (Quick Response) codes are two-dimensional barcodes that can store various types of information including URLs, text, contact details, and more. Our free QR code generator creates custom codes instantly that can be scanned by any smartphone camera. Perfect for business cards, marketing materials, product packaging, event tickets, and digital sharing, QR codes bridge the gap between physical and digital content seamlessly."
          howToUse={[
            "Enter your URL, text, or content in the appropriate tab.",
            "Customize colors and add a logo if desired using the options panel.",
            "Preview your QR code in real-time as you make changes.",
            "Download your QR code in PNG or SVG format for use anywhere."
          ]}
          features={[
            "Generate QR codes from URLs, text, images, or Google Drive links.",
            "Batch generation for multiple URLs at once.",
            "Customizable colors for foreground and background.",
            "Add your logo to the center of the QR code.",
            "Adjustable size and logo dimensions.",
            "Download in PNG or SVG format for any use case."
          ]}
          safetyNote="All QR code generation happens directly in your browser. The content you encode is not sent to any external servers. Your URLs, text, and data remain completely private throughout the generation process."
          faqs={[
            {
              question: "What can I encode in a QR code?",
              answer: "You can encode URLs, plain text, email addresses, phone numbers, WiFi credentials, and more. Most commonly, QR codes link to websites, but they can contain any text up to about 2,000 characters."
            },
            {
              question: "Should I use PNG or SVG format?",
              answer: "PNG is best for digital use like websites and social media. SVG is scalable and ideal for print materials where you need the QR code at various sizes without quality loss."
            },
            {
              question: "Will adding a logo affect scanning?",
              answer: "QR codes have error correction that allows them to scan even with logos. Keep logos at 30% or smaller of the QR code size for reliable scanning. Always test your code after adding a logo."
            },
            {
              question: "How small can I print my QR code?",
              answer: "For reliable scanning, QR codes should be at least 2cm x 2cm (0.8 inches) for close-range scanning. For billboards or signs viewed from a distance, scale up proportionally."
            }
          ]}
        />
      </div>
      </ToolLayout>
    </>
  );
};

export default QRCodeGenerator;
