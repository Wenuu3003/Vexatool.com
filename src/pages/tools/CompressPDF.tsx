import { useState } from "react";
import { FileDown, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { PDFDocument } from "pdf-lib";

const CompressPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);

  const handleCompress = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to compress.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });

      // Compress by removing unused objects and optimizing
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });

      const compressedBlob = new Blob([new Uint8Array(compressedBytes)], { type: "application/pdf" });
      const originalSize = file.size;
      const newSize = compressedBlob.size;
      const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
      
      setCompressedSize(newSize);

      // Create download link
      const url = URL.createObjectURL(compressedBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `compressed_${file.name}`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Compression complete!",
        description: `File size reduced by ${savings}% (${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(newSize / 1024 / 1024).toFixed(2)} MB)`,
      });

      setFiles([]);
      setCompressedSize(null);
    } catch (error) {
      console.error("Compress error:", error);
      toast({
        title: "Error",
        description: "Failed to compress PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Compress PDF"
      description="Reduce the file size of your PDF documents"
      icon={FileDown}
      colorClass="bg-tool-compress"
    >
      <FileUpload
        files={files}
        onFilesChange={setFiles}
        colorClass="bg-tool-compress"
      />

      {files.length > 0 && (
        <div className="mt-8 text-center">
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
                <Download className="w-5 h-5" />
                Compress & Download
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Current file size: {(files[0].size / 1024 / 1024).toFixed(2)} MB
          </p>
          {compressedSize && (
            <p className="text-sm text-green-600 mt-2">
              Compressed size: {(compressedSize / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
      )}
    </ToolLayout>
  );
};

export default CompressPDF;
