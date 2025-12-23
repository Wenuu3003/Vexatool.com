import { useState, useRef, useEffect, useCallback } from "react";
import { QrCode, Download, Upload, Cloud, Image, Type } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import { Helmet } from "react-helmet";

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
        description: "Failed to generate QR code.",
        variant: "destructive",
      });
    }
  }, [getQRContent, size, logo, logoSize, darkColor, lightColor]);

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

  return (
    <>
      <Helmet>
        <title>QR Code Generator Free Online - Create Custom QR Codes | Mypdfs</title>
        <meta name="description" content="Free QR code generator. Create custom QR codes with logos and colors. Generate QR codes for URLs, text, and images instantly." />
        <meta name="keywords" content="QR code generator, create QR code, free QR code, custom QR code, QR code with logo, QR maker" />
        <link rel="canonical" href="https://mypdfs.lovable.app/qr-code-generator" />
      </Helmet>
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text" className="gap-2">
                  <Type className="w-4 h-4" />
                  Text/URL
                </TabsTrigger>
                <TabsTrigger value="image" className="gap-2">
                  <Image className="w-4 h-4" />
                  Image
                </TabsTrigger>
                <TabsTrigger value="drive" className="gap-2">
                  <Cloud className="w-4 h-4" />
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

              <TabsContent value="image" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Upload Image to QR Code</Label>
                  <p className="text-sm text-muted-foreground">
                    Upload an image and generate a QR code that links to it
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={imageInputRef}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {isLoading ? "Loading..." : "Upload Image"}
                    </Button>
                    {uploadedImageUrl && (
                      <Button variant="destructive" onClick={clearImage}>
                        Clear
                      </Button>
                    )}
                  </div>
                  {uploadedImageUrl && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Image uploaded! QR code will link to your image.
                      </p>
                      <img 
                        src={uploadedImageUrl} 
                        alt="Uploaded" 
                        className="mt-2 max-h-24 rounded"
                      />
                    </div>
                  )}
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
            {qrDataUrl ? (
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
                  {activeTab === "image" && "Upload an image to generate a QR code"}
                  {activeTab === "drive" && "Paste a Google Drive link to generate a QR code"}
                </p>
              </div>
            )}
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
      </ToolLayout>
    </>
  );
};

export default QRCodeGenerator;
