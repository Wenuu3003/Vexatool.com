import { useState } from "react";
import { FileDown, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const CompressPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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
      // Note: True PDF compression requires server-side processing
      // This is a placeholder that downloads the original file
      // In production, you would send to a backend service
      
      const file = files[0];
      const url = URL.createObjectURL(file);

      const link = document.createElement("a");
      link.href = url;
      link.download = `compressed_${file.name}`;
      link.click();

      URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: "Note: Full compression requires server-side processing. File downloaded as-is.",
      });

      setFiles([]);
    } catch (error) {
      console.error("Compress error:", error);
      toast({
        title: "Error",
        description: "Failed to process PDF. Please try again.",
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
        </div>
      )}
    </ToolLayout>
  );
};

export default CompressPDF;
