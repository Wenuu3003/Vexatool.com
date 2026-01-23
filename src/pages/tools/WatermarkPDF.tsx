import { useState } from "react";
import { Droplets, Download, Image, Type, Upload } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { degrees } from "pdf-lib";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PDFDocument, rgb } from "pdf-lib";
import { toast } from "@/hooks/use-toast";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";
import { useFileHistory } from "@/hooks/useFileHistory";

type WatermarkPosition = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "tile";

const WatermarkPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState([30]);
  const [rotation, setRotation] = useState<number>(-45);
  const [position, setPosition] = useState<WatermarkPosition>("center");
  const [fontSize, setFontSize] = useState([40]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState([30]);
  const { saveFileHistory } = useFileHistory();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file",
          description: "Please select an image file (PNG, JPG, etc.)",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getPositionCoordinates = (pageWidth: number, pageHeight: number, watermarkWidth: number, watermarkHeight: number) => {
    const margin = 50;
    switch (position) {
      case "top-left":
        return { x: margin, y: pageHeight - margin - watermarkHeight };
      case "top-right":
        return { x: pageWidth - margin - watermarkWidth, y: pageHeight - margin - watermarkHeight };
      case "bottom-left":
        return { x: margin, y: margin };
      case "bottom-right":
        return { x: pageWidth - margin - watermarkWidth, y: margin };
      case "center":
      default:
        return { x: (pageWidth - watermarkWidth) / 2, y: (pageHeight - watermarkHeight) / 2 };
    }
  };

  const handleWatermark = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to watermark.",
        variant: "destructive",
      });
      return;
    }

    if (watermarkType === "text" && !watermarkText.trim()) {
      toast({
        title: "No watermark text",
        description: "Please enter watermark text.",
        variant: "destructive",
      });
      return;
    }

    if (watermarkType === "image" && !imageFile) {
      toast({
        title: "No image selected",
        description: "Please select an image for the watermark.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPages();

      if (watermarkType === "text") {
        // Text watermark
        for (const page of pages) {
          const { width, height } = page.getSize();
          const currentFontSize = fontSize[0];
          const textWidth = watermarkText.length * currentFontSize * 0.5;
          const textHeight = currentFontSize;

          if (position === "tile") {
            // Tile pattern
            const spacingX = 200;
            const spacingY = 150;
            for (let x = 0; x < width; x += spacingX) {
              for (let y = 0; y < height; y += spacingY) {
                page.drawText(watermarkText, {
                  x: x,
                  y: y,
                  size: currentFontSize * 0.6,
                  color: rgb(0.5, 0.5, 0.5),
                  opacity: opacity[0] / 100,
                  rotate: degrees(rotation),
                });
              }
            }
          } else {
            const { x, y } = getPositionCoordinates(width, height, textWidth, textHeight);
            page.drawText(watermarkText, {
              x: position === "center" ? x + textWidth / 2 : x,
              y: position === "center" ? y : y,
              size: currentFontSize,
              color: rgb(0.5, 0.5, 0.5),
              opacity: opacity[0] / 100,
              rotate: degrees(rotation),
            });
          }
        }
      } else if (watermarkType === "image" && imageFile) {
        // Image watermark
        const imageBytes = await imageFile.arrayBuffer();
        let image;
        
        if (imageFile.type === "image/png") {
          image = await pdf.embedPng(imageBytes);
        } else if (imageFile.type === "image/jpeg" || imageFile.type === "image/jpg") {
          image = await pdf.embedJpg(imageBytes);
        } else {
          // Convert other formats to PNG via canvas
          const img = new window.Image();
          img.src = URL.createObjectURL(imageFile);
          await new Promise((resolve) => { img.onload = resolve; });
          
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          
          const pngDataUrl = canvas.toDataURL("image/png");
          const pngBase64 = pngDataUrl.split(",")[1];
          const pngBytes = Uint8Array.from(atob(pngBase64), c => c.charCodeAt(0));
          image = await pdf.embedPng(pngBytes);
        }

        for (const page of pages) {
          const { width: pageWidth, height: pageHeight } = page.getSize();
          const scale = imageScale[0] / 100;
          const imgWidth = image.width * scale;
          const imgHeight = image.height * scale;

          if (position === "tile") {
            // Tile pattern for image
            const spacingX = imgWidth + 100;
            const spacingY = imgHeight + 100;
            for (let x = 0; x < pageWidth; x += spacingX) {
              for (let y = 0; y < pageHeight; y += spacingY) {
                page.drawImage(image, {
                  x: x,
                  y: y,
                  width: imgWidth * 0.5,
                  height: imgHeight * 0.5,
                  opacity: opacity[0] / 100,
                });
              }
            }
          } else {
            const { x, y } = getPositionCoordinates(pageWidth, pageHeight, imgWidth, imgHeight);
            page.drawImage(image, {
              x: x,
              y: y,
              width: imgWidth,
              height: imgHeight,
              opacity: opacity[0] / 100,
            });
          }
        }
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "watermarked.pdf";
      link.click();

      URL.revokeObjectURL(url);

      await saveFileHistory(files[0].name, "pdf", "watermark-pdf");

      toast({
        title: "Success!",
        description: "Watermark added successfully.",
      });

      setFiles([]);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Watermark error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to add watermark. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const seoContent = {
    toolName: "Watermark PDF",
    whatIs: "Watermark PDF is a free online tool that allows you to add text or image watermarks to your PDF documents. Watermarks are useful for branding, protecting intellectual property, marking documents as confidential, or indicating document status like 'DRAFT' or 'APPROVED'. The tool lets you customize the watermark text, add logos/symbols as image watermarks, adjust opacity, position, rotation, and size to achieve the perfect look for your documents.",
    howToUse: [
      "Upload your PDF file by clicking the upload area or dragging and dropping.",
      "Choose watermark type: Text for custom text or Image for logos/symbols.",
      "For text: Enter your desired watermark text (e.g., 'CONFIDENTIAL', 'DRAFT', your company name).",
      "For image: Upload your logo or symbol image (PNG, JPG supported).",
      "Adjust the opacity, position, and size settings to control watermark appearance.",
      "Click 'Add Watermark & Download' to process your PDF.",
      "Your watermarked PDF will download automatically."
    ],
    features: [
      "Text watermarks with custom text",
      "Image/logo watermarks (PNG, JPG)",
      "Adjustable opacity from subtle to prominent",
      "Multiple position options: center, corners, or tile pattern",
      "Custom rotation angles",
      "Adjustable font size for text",
      "Scalable image watermarks",
      "Applies to all pages automatically",
      "Maintains original PDF quality",
      "Secure client-side processing"
    ],
    safetyNote: "Your PDF files are processed entirely in your browser using secure client-side technology. No files are uploaded to any server, ensuring complete privacy. Your documents remain confidential, and only you have access to the watermarked output.",
    faqs: [
      { question: "Can I add my company logo as a watermark?", answer: "Yes! Use the Image tab to upload your logo (PNG or JPG format). You can adjust the size, opacity, and position to place it exactly where you want on every page." },
      { question: "Where does the watermark appear on each page?", answer: "You can choose from multiple positions: center (diagonal), top-left, top-right, bottom-left, bottom-right, or tile (repeating pattern across the entire page)." },
      { question: "Will the watermark affect text readability?", answer: "You can adjust the opacity to balance visibility and readability. Lower opacity (20-40%) works well for documents that need to remain easily readable, while higher opacity provides stronger protection." },
      { question: "Can I remove watermarks later?", answer: "Watermarks added with this tool are embedded into the PDF. To get the original document, you would need to keep a copy of the unwatermarked file before processing." },
      { question: "What image formats are supported for watermarks?", answer: "PNG and JPG/JPEG images are directly supported. Other formats will be automatically converted for compatibility." }
    ]
  };

  return (
    <>
      <CanonicalHead 
        title="Add Watermark to PDF Free Online | Text & Image Watermarks | Mypdfs"
        description="Free online PDF watermark tool. Add text or image watermarks to protect your PDF documents."
        keywords="watermark PDF, add watermark, PDF stamp, protect PDF, text watermark, image watermark, logo watermark"
      />
      <ToolLayout
        title="Watermark PDF"
        description="Add text or image watermark to your PDF documents"
        icon={Droplets}
        colorClass="bg-tool-watermark"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <FileUpload
            files={files}
            onFilesChange={setFiles}
            colorClass="bg-tool-watermark"
            accept=".pdf"
            multiple={false}
          />

          {files.length > 0 && (
            <div className="space-y-6 bg-card p-6 rounded-xl border border-border">
              <Tabs value={watermarkType} onValueChange={(v) => setWatermarkType(v as "text" | "image")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" className="gap-2">
                    <Type className="w-4 h-4" />
                    Text Watermark
                  </TabsTrigger>
                  <TabsTrigger value="image" className="gap-2">
                    <Image className="w-4 h-4" />
                    Image/Logo
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="watermarkText">Watermark Text</Label>
                    <Input
                      id="watermarkText"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="Enter watermark text"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Font Size: {fontSize[0]}pt</Label>
                    <Slider
                      value={fontSize}
                      onValueChange={setFontSize}
                      min={12}
                      max={120}
                      step={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rotation: {rotation}°</Label>
                    <Slider
                      value={[rotation]}
                      onValueChange={(v) => setRotation(v[0])}
                      min={-90}
                      max={90}
                      step={5}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="image" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Upload Logo/Image</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        {imagePreview ? (
                          <div className="space-y-2">
                            <img 
                              src={imagePreview} 
                              alt="Watermark preview" 
                              className="max-h-24 mx-auto object-contain"
                            />
                            <p className="text-sm text-muted-foreground">{imageFile?.name}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload logo or image
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG supported</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {imageFile && (
                    <div className="space-y-2">
                      <Label>Image Scale: {imageScale[0]}%</Label>
                      <Slider
                        value={imageScale}
                        onValueChange={setImageScale}
                        min={10}
                        max={100}
                        step={5}
                      />
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Common options */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label>Opacity: {opacity[0]}%</Label>
                  <Slider
                    value={opacity}
                    onValueChange={setOpacity}
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Position</Label>
                  <RadioGroup value={position} onValueChange={(v) => setPosition(v as WatermarkPosition)} className="grid grid-cols-3 gap-2">
                    {[
                      { value: "center", label: "Center" },
                      { value: "top-left", label: "Top Left" },
                      { value: "top-right", label: "Top Right" },
                      { value: "bottom-left", label: "Bottom Left" },
                      { value: "bottom-right", label: "Bottom Right" },
                      { value: "tile", label: "Tile (Repeat)" },
                    ].map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2 bg-muted/30 p-2 rounded-lg">
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <Label htmlFor={opt.value} className="text-xs cursor-pointer">{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              <div className="text-center pt-4">
                <Button
                  size="lg"
                  onClick={handleWatermark}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Add Watermark & Download
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          <ToolSEOContent {...seoContent} />
        </div>
      </ToolLayout>
    </>
  );
};

export default WatermarkPDF;
