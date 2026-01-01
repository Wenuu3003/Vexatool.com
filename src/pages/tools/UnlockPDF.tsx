import { useState } from "react";
import { Unlock, Download, AlertCircle, Key } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDocument } from "pdf-lib";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
      
      // Try to load PDF with password if provided, or with ignoreEncryption for restriction-only PDFs
      const loadOptions: { password?: string; ignoreEncryption?: boolean } = {};
      
      if (password.trim()) {
        loadOptions.password = password.trim();
      } else {
        loadOptions.ignoreEncryption = true;
      }

      const pdf = await PDFDocument.load(arrayBuffer, loadOptions);

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
        description: "PDF unlocked and saved without password protection.",
      });

      setFiles([]);
      setPassword("");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Unlock error:", error);
      }
      
      const errorMessage = error instanceof Error ? error.message : "";
      
      if (errorMessage.includes("password") || errorMessage.includes("encrypted")) {
        toast({
          title: "Incorrect or missing password",
          description: "This PDF requires a password to open. Please enter the correct password.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Cannot unlock this PDF",
          description: "Failed to process the PDF. Please check if the file is valid.",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Unlock PDF Free Online - Remove PDF Password | Mypdfs</title>
        <meta name="description" content="Free online PDF unlocker. Remove password protection from PDF files. Enter your password to unlock and save PDF without restrictions." />
        <meta name="keywords" content="unlock PDF, remove PDF password, PDF unlocker, decrypt PDF, remove PDF protection" />
        <link rel="canonical" href="https://mypdfs.lovable.app/unlock-pdf" />
      </Helmet>
      <ToolLayout
        title="Unlock PDF"
        description="Remove password protection from PDF documents"
        icon={Unlock}
        colorClass="bg-tool-unlock"
      >
        <Alert className="mb-6 max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How it works:</strong> Enter the PDF password to unlock and save without protection.<br />
            <strong>No password?</strong> Leave empty to try removing edit/print restrictions only.
          </AlertDescription>
        </Alert>

        <FileUpload
          files={files}
          onFilesChange={setFiles}
          colorClass="bg-tool-unlock"
        />

        {files.length > 0 && (
          <div className="mt-8 max-w-md mx-auto space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                PDF Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter PDF password"
              />
              <p className="text-xs text-muted-foreground">
                If your PDF asks for a password when opening, enter it here.
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
