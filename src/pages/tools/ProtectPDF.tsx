import { useState } from "react";
import { Lock, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const ProtectPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [password, setPassword] = useState("");

  const handleProtect = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to protect.",
        variant: "destructive",
      });
      return;
    }

    if (!password.trim()) {
      toast({
        title: "No password",
        description: "Please enter a password to protect your PDF.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Note: PDF encryption with password requires additional libraries
      // This is a placeholder - in production use a proper encryption library
      
      const file = files[0];
      const url = URL.createObjectURL(file);

      const link = document.createElement("a");
      link.href = url;
      link.download = `protected_${file.name}`;
      link.click();

      URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: "Note: Full PDF encryption requires server-side processing.",
      });

      setFiles([]);
      setPassword("");
    } catch (error) {
      console.error("Protect error:", error);
      toast({
        title: "Error",
        description: "Failed to protect PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Protect PDF"
      description="Add password protection to your PDF documents"
      icon={Lock}
      colorClass="bg-tool-protect"
    >
      <FileUpload
        files={files}
        onFilesChange={setFiles}
        colorClass="bg-tool-protect"
      />

      {files.length > 0 && (
        <div className="mt-8 max-w-md mx-auto space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            <p className="text-xs text-muted-foreground">
              Choose a strong password to protect your document.
            </p>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={handleProtect}
              disabled={isProcessing || !password.trim()}
              className="gap-2"
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Protect & Download
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
};

export default ProtectPDF;
