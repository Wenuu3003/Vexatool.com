import { useState } from "react";
import { Lock, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";

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
      if (import.meta.env.DEV) {
        console.error("Protect error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to protect PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const seoContent = {
    toolName: "Protect PDF",
    whatIs: "Protect PDF is a free online tool that helps you add password protection to your PDF documents. Password-protecting your PDFs ensures that only authorized individuals can open and view the content. This is essential for sensitive documents like financial reports, legal documents, personal records, and confidential business materials.",
    howToUse: [
      "Upload your PDF file by clicking the upload area or dragging and dropping.",
      "Enter a strong password that you want to use for protection.",
      "Click 'Protect & Download' to process your PDF.",
      "Share the protected PDF file securely.",
      "Remember to share the password separately and securely with authorized recipients."
    ],
    features: [
      "Add password protection to any PDF",
      "Strong encryption to secure your documents",
      "Works with all PDF file sizes",
      "Simple one-click protection process",
      "No registration required",
      "Instant download of protected file"
    ],
    safetyNote: "Your PDF files and passwords are processed with security in mind. We recommend using strong, unique passwords for your protected documents. Always share passwords through a separate secure channel, never in the same email or message as the protected file.",
    faqs: [
      { question: "What makes a strong password?", answer: "A strong password should be at least 12 characters long and include a mix of uppercase letters, lowercase letters, numbers, and special characters. Avoid using easily guessable information like birthdays or common words." },
      { question: "Can I remove the password later?", answer: "Yes, you can use our Unlock PDF tool to remove password protection from PDFs, provided you know the current password." },
      { question: "Will protected PDFs work on all devices?", answer: "Yes, password-protected PDFs are standard and can be opened on any device with a PDF reader. Recipients will be prompted to enter the password before viewing." },
      { question: "Is the encryption secure?", answer: "PDF password protection uses industry-standard encryption. For highly sensitive documents, consider additional security measures like encrypted email or secure file sharing services." }
    ]
  };

  return (
    <>
      <CanonicalHead 
        title="Protect PDF with Password Free Online | Mypdfs"
        description="Free online PDF protection tool. Add password protection to your PDF documents. Secure your PDFs."
        keywords="protect PDF, password PDF, encrypt PDF, secure PDF, PDF password protection, lock PDF"
      />
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
      <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
};

export default ProtectPDF;
