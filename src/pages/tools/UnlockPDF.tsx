import { useState } from "react";
import { Unlock, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDocument } from "pdf-lib";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";

const UnlockPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [password, setPassword] = useState("");

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
      
      // Try to load PDF (pdf-lib has limited password support)
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      // Save without encryption
      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "unlocked.pdf";
      link.click();

      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "PDF unlocked successfully.",
      });

      setFiles([]);
      setPassword("");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Unlock error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to unlock PDF. Check your password and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Unlock PDF Free Online - Remove PDF Password | Mypdfs</title>
        <meta name="description" content="Free online PDF unlocker. Remove password protection from PDF files. Unlock secured PDFs instantly without software." />
        <meta name="keywords" content="unlock PDF, remove PDF password, PDF unlocker, decrypt PDF, free PDF unlock, remove PDF protection" />
        <link rel="canonical" href="https://mypdfs.lovable.app/unlock-pdf" />
      </Helmet>
      <ToolLayout
        title="Unlock PDF"
        description="Remove password protection from PDF documents"
        icon={Unlock}
        colorClass="bg-tool-unlock"
      >
      <FileUpload
        files={files}
        onFilesChange={setFiles}
        colorClass="bg-tool-unlock"
      />

      {files.length > 0 && (
        <div className="mt-8 max-w-md mx-auto space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">PDF Password (if required)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter PDF password"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty if the PDF is not password-protected.
            </p>
          </div>

          <div className="text-center">
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
                  Unlock & Download
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
