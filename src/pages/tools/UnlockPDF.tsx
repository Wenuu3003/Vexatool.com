import { useState } from "react";
import { Unlock, Download, AlertCircle } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { PDFDocument } from "pdf-lib";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { Alert, AlertDescription } from "@/components/ui/alert";

const UnlockPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUnlock = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to unlock.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      
      // Try to load PDF with ignoreEncryption - this removes restrictions but NOT password protection
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      // Save without encryption/restrictions
      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `unlocked_${files[0].name}`;
      link.click();

      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "PDF restrictions removed successfully.",
      });

      setFiles([]);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Unlock error:", error);
      }
      toast({
        title: "Cannot unlock this PDF",
        description: "This PDF requires a password to open. This tool can only remove restrictions from PDFs you can already view.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Unlock PDF Free Online - Remove PDF Restrictions | Mypdfs</title>
        <meta name="description" content="Free online PDF unlocker. Remove copy, print, and edit restrictions from PDF files. Works for PDFs with owner password restrictions." />
        <meta name="keywords" content="unlock PDF, remove PDF restrictions, PDF unlocker, remove print restriction, remove copy restriction" />
        <link rel="canonical" href="https://mypdfs.lovable.app/unlock-pdf" />
      </Helmet>
      <ToolLayout
        title="Unlock PDF"
        description="Remove copy, print, and edit restrictions from PDF documents"
        icon={Unlock}
        colorClass="bg-tool-unlock"
      >
        <Alert className="mb-6 max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>What this tool does:</strong> Removes restrictions like copy, print, and edit locks from PDFs.<br />
            <strong>Important:</strong> If your PDF requires a password to <em>open</em> it, you need the password. This tool cannot bypass open-password protection.
          </AlertDescription>
        </Alert>

        <FileUpload
          files={files}
          onFilesChange={setFiles}
          colorClass="bg-tool-unlock"
        />

        {files.length > 0 && (
          <div className="mt-8 max-w-md mx-auto space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Click below to remove restrictions from your PDF.
              </p>
              <Button
                size="lg"
                onClick={handleUnlock}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Remove Restrictions & Download
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </ToolLayout>
    </>
  );
};

export default UnlockPDF;
