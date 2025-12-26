import { useState, useRef, useCallback, useEffect } from "react";
import { PenTool, Download, Trash2, Type } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { useFileHistory } from "@/hooks/useFileHistory";
import { AdPlaceholder } from "@/components/AdBanner";
import { Helmet } from "react-helmet";

const SignPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [signatureType, setSignatureType] = useState<"draw" | "type">("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { saveFileHistory } = useFileHistory();

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL("image/png"));
    }
  };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Fill with white background for proper PNG export
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl(null);
  }, []);

  // Initialize canvas with white background when component mounts or tab changes
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleProcess = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }

    const hasSignature = signatureType === "draw" ? signatureDataUrl : typedSignature.trim();
    if (!hasSignature) {
      toast({
        title: "No signature",
        description: "Please add a signature first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
      const { width, height } = lastPage.getSize();

      if (signatureType === "type" && typedSignature) {
        const font = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
        lastPage.drawText(typedSignature, {
          x: width - 200,
          y: 50,
          size: 24,
          font,
          color: rgb(0, 0, 0.5),
        });
      } else if (signatureDataUrl) {
        const signatureImage = await pdfDoc.embedPng(signatureDataUrl);
        const signatureDims = signatureImage.scale(0.3);
        lastPage.drawImage(signatureImage, {
          x: width - signatureDims.width - 50,
          y: 30,
          width: signatureDims.width,
          height: signatureDims.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `signed_${files[0].name}`;
      link.click();
      URL.revokeObjectURL(url);

      await saveFileHistory(files[0].name, "pdf", "sign");

      toast({
        title: "Success!",
        description: "Signed PDF downloaded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign PDF Online Free - Add Digital Signature | Mypdfs</title>
        <meta name="description" content="Free online PDF signing tool. Add your signature to PDF documents. Draw or type your signature easily. No registration required." />
        <meta name="keywords" content="sign PDF, e-signature PDF, digital signature, add signature to PDF, free PDF signer" />
        <link rel="canonical" href="https://mypdfs.lovable.app/sign-pdf" />
      </Helmet>
      <ToolLayout
        title="Sign PDF"
        description="Add your signature to PDF documents"
        icon={PenTool}
        colorClass="bg-tool-sign"
      >
      <div className="space-y-6">
        <AdPlaceholder className="h-20" />
        
        <FileUpload
          files={files}
          onFilesChange={setFiles}
          colorClass="bg-tool-sign"
          multiple={false}
        />

        {files.length > 0 && (
          <div className="max-w-2xl mx-auto space-y-4">
            <Tabs value={signatureType} onValueChange={(v) => setSignatureType(v as "draw" | "type")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="draw">
                  <PenTool className="w-4 h-4 mr-2" />
                  Draw Signature
                </TabsTrigger>
                <TabsTrigger value="type">
                  <Type className="w-4 h-4 mr-2" />
                  Type Signature
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="draw" className="mt-4">
                <div className="bg-card p-4 rounded-lg border border-border space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Draw your signature below</p>
                    <Button variant="outline" size="sm" onClick={clearCanvas}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                  <canvas
                    ref={(el) => {
                      (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = el;
                      if (el) {
                        const ctx = el.getContext("2d");
                        if (ctx) {
                          ctx.fillStyle = "#ffffff";
                          ctx.fillRect(0, 0, el.width, el.height);
                        }
                      }
                    }}
                    width={400}
                    height={150}
                    className="w-full border border-border rounded cursor-crosshair"
                    style={{ backgroundColor: "#ffffff" }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="type" className="mt-4">
                <div className="bg-card p-4 rounded-lg border border-border space-y-4">
                  <p className="text-sm text-muted-foreground">Type your signature</p>
                  <Input
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder="Your name..."
                    className="text-xl italic"
                  />
                  {typedSignature && (
                    <div className="p-4 bg-muted/30 rounded text-center">
                      <span className="text-2xl italic text-foreground">{typedSignature}</span>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full bg-tool-sign hover:bg-tool-sign/90"
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Signed PDF
                </>
              )}
            </Button>
          </div>
        )}
        
        <AdPlaceholder className="h-20" />
      </div>
      </ToolLayout>
    </>
  );
};

export default SignPDF;
