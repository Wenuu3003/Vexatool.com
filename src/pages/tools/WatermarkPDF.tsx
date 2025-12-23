import { useState } from "react";
import { Droplets, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { degrees } from "pdf-lib";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PDFDocument, rgb } from "pdf-lib";
import { toast } from "@/hooks/use-toast";

const WatermarkPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState([30]);

  const handleWatermark = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to watermark.",
        variant: "destructive",
      });
      return;
    }

    if (!watermarkText.trim()) {
      toast({
        title: "No watermark text",
        description: "Please enter watermark text.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      const pages = pdf.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const fontSize = Math.min(width, height) / 10;

        page.drawText(watermarkText, {
          x: width / 2 - (watermarkText.length * fontSize) / 4,
          y: height / 2,
          size: fontSize,
          color: rgb(0.5, 0.5, 0.5),
          opacity: opacity[0] / 100,
          rotate: degrees(-45),
        });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "watermarked.pdf";
      link.click();

      URL.revokeObjectURL(url);

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

  return (
    <ToolLayout
      title="Watermark PDF"
      description="Add text watermark to your PDF documents"
      icon={Droplets}
      colorClass="bg-tool-watermark"
    >
      <FileUpload
        files={files}
        onFilesChange={setFiles}
        colorClass="bg-tool-watermark"
      />

      {files.length > 0 && (
        <div className="mt-8 max-w-md mx-auto space-y-6">
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
            <Label>Opacity: {opacity[0]}%</Label>
            <Slider
              value={opacity}
              onValueChange={setOpacity}
              min={10}
              max={100}
              step={5}
            />
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={handleWatermark}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                "Processing..."
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
    </ToolLayout>
  );
};

export default WatermarkPDF;
