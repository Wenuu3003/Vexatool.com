import { useState } from "react";
import { RotateCw, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { PDFDocument, degrees } from "pdf-lib";
import { toast } from "@/hooks/use-toast";

const RotatePDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState(90);

  const handleRotate = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to rotate.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      const pages = pdf.getPages();
      pages.forEach((page) => {
        page.setRotation(degrees(page.getRotation().angle + rotation));
      });

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "rotated.pdf";
      link.click();

      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "Your PDF has been rotated successfully.",
      });

      setFiles([]);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Rotate error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to rotate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Rotate PDF"
      description="Rotate all pages in your PDF document"
      icon={RotateCw}
      colorClass="bg-tool-rotate"
    >
      <FileUpload
        files={files}
        onFilesChange={setFiles}
        colorClass="bg-tool-rotate"
      />

      {files.length > 0 && (
        <div className="mt-8 max-w-md mx-auto space-y-4">
          <div className="flex justify-center gap-2">
            {[90, 180, 270].map((deg) => (
              <Button
                key={deg}
                variant={rotation === deg ? "default" : "outline"}
                onClick={() => setRotation(deg)}
              >
                {deg}°
              </Button>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={handleRotate}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                "Rotating..."
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Rotate & Download
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
};

export default RotatePDF;
