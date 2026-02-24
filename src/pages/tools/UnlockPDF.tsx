import { useState, useEffect } from "react";
import { Unlock, Download, AlertCircle, Key, Shield, ShieldCheck, ShieldX } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDocument } from "pdf-lib";
import { toast } from "@/hooks/use-toast";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

type ProtectionStatus = "checking" | "password-protected" | "restriction-only" | "not-protected" | "error";

const UnlockPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [password, setPassword] = useState("");
  const [protectionStatus, setProtectionStatus] = useState<ProtectionStatus | null>(null);

  // Detect protection when file is uploaded
  useEffect(() => {
    const detectProtection = async () => {
      if (files.length === 0) {
        setProtectionStatus(null);
        return;
      }

      setProtectionStatus("checking");

      try {
        const arrayBuffer = await files[0].arrayBuffer();
        
        // First try to load without any options to see if it's encrypted
        try {
          const pdf = await PDFDocument.load(arrayBuffer);
          // If we get here, the PDF loaded without issues
          setProtectionStatus("not-protected");
        } catch (firstError) {
          // Try with ignoreEncryption to see if it's just restrictions
          try {
            await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            // If this works, it has restrictions but no password to open
            setProtectionStatus("restriction-only");
          } catch (secondError) {
            // Truly password protected
            setProtectionStatus("password-protected");
          }
        }
      } catch (error) {
        console.error("Detection error:", error);
        setProtectionStatus("error");
      }
    };

    detectProtection();
  }, [files]);

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
      
      const loadOptions: { password?: string; ignoreEncryption?: boolean } = {};
      
      if (password.trim()) {
        loadOptions.password = password.trim();
      } else {
        loadOptions.ignoreEncryption = true;
      }

      const pdf = await PDFDocument.load(arrayBuffer, loadOptions);

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
        description: "PDF unlocked and saved without protection.",
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
          description: "Please enter the correct password to unlock this PDF.",
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

  const getStatusCard = () => {
    if (!protectionStatus || protectionStatus === "checking") return null;

    const statusConfig = {
      "password-protected": {
        icon: ShieldX,
        title: "Password Protected",
        description: "This PDF requires a password to open. Enter the password below to unlock it.",
        variant: "destructive" as const,
        bgClass: "bg-destructive/10 border-destructive/30",
      },
      "restriction-only": {
        icon: Shield,
        title: "Restrictions Detected",
        description: "This PDF has copy/print/edit restrictions but can be opened. Click unlock to remove restrictions.",
        variant: "default" as const,
        bgClass: "bg-yellow-500/10 border-yellow-500/30",
      },
      "not-protected": {
        icon: ShieldCheck,
        title: "No Protection",
        description: "This PDF is not protected. You can download it as-is or re-save it.",
        variant: "default" as const,
        bgClass: "bg-green-500/10 border-green-500/30",
      },
      "error": {
        icon: AlertCircle,
        title: "Detection Failed",
        description: "Could not analyze this PDF. Try uploading again or proceed with unlock.",
        variant: "default" as const,
        bgClass: "bg-muted border-muted-foreground/30",
      },
    };

    const config = statusConfig[protectionStatus];
    const Icon = config.icon;

    return (
      <Card className={`max-w-md mx-auto mt-6 ${config.bgClass}`}>
        <CardContent className="flex items-start gap-3 p-4">
          <Icon className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold">{config.title}</h4>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const seoContent = {
    toolName: "Unlock PDF",
    whatIs: "Unlock PDF is a free online tool that removes password protection and restrictions from PDF documents, giving you full access to open, copy, print, and edit your files. Whether your PDF requires a password to open or has restrictions preventing copying and printing, this tool can help — provided you have the authorization to do so. It automatically detects the type of protection on your PDF and displays a clear status indicator, then guides you through the appropriate unlocking process. The entire operation runs securely in your browser, so neither your documents nor your passwords are ever sent to any external server. This is invaluable when you have a legitimately owned document whose password you have but need a clean, unrestricted copy for archiving, printing, or sharing.",
    howToUse: [
      "Upload your password-protected or restricted PDF file using the upload area.",
      "Wait for the automatic protection analysis — the tool detects the type of security applied.",
      "Review the status card: password-protected, restriction-only, or no protection detected.",
      "If password-protected, enter the document password in the input field.",
      "Click 'Unlock & Download' to remove protection and download the unlocked PDF.",
      "Your unlocked PDF will download automatically, ready for unrestricted use."
    ],
    features: [
      "Automatic detection of protection type — password, restrictions, or none.",
      "Clear visual status cards showing the exact protection level of your PDF.",
      "Remove password protection (with the correct password) for full access.",
      "Remove copy, print, and edit restrictions without needing a password.",
      "Fast client-side processing with instant download of the unlocked file.",
      "Works with any PDF file regardless of the software used to create it.",
      "No registration, account, or payment required.",
      "Your passwords and files never leave your browser."
    ],
    safetyNote: "Your PDF files and passwords are processed entirely in your browser. No files or credentials are sent to any server, ensuring complete privacy and security. The tool only works with PDFs where you have authorization to remove protection. Always ensure you have the legal right to modify the document's protection settings.",
    faqs: [
      { question: "Can I unlock a PDF without knowing the password?", answer: "No, if a PDF is password-protected to open, you need the correct password. The tool can remove restriction-only protection (like print/copy/edit restrictions) without a password." },
      { question: "What is the difference between password protection and restrictions?", answer: "Password protection requires a password to open the PDF at all. Restrictions prevent specific actions like copying text, printing, or editing, but allow the PDF to be opened and read. This tool handles both types." },
      { question: "Is it legal to unlock PDFs?", answer: "You should only unlock PDFs that you own or have explicit authorization to modify. Removing protection from copyrighted material without permission may violate copyright laws in your jurisdiction." },
      { question: "Will unlocking affect my PDF content?", answer: "No, unlocking only removes the protection layer. Your PDF content, formatting, images, and quality remain completely unchanged." },
      { question: "What does the 'Restrictions Detected' status mean?", answer: "This means the PDF can be opened without a password but has limitations on copying, printing, or editing. Click 'Unlock & Download' to get a version with all restrictions removed." },
      { question: "Can I unlock multiple PDFs at once?", answer: "The tool processes one file at a time. Simply repeat the process for each PDF you need to unlock." },
      { question: "What if the tool says 'No Protection'?", answer: "If your PDF shows no protection, it is already fully accessible. You can still download it through the tool, which re-saves it as a clean copy." },
      { question: "Does unlocking add any watermarks?", answer: "No. MyPDFs never adds watermarks, branding, or any modifications to your documents." },
      { question: "Can I re-protect the PDF after unlocking?", answer: "Yes! Use our Protect PDF tool to add a new password to the unlocked document." },
      { question: "Why does my password not work?", answer: "Ensure you are entering the exact password including correct capitalization and special characters. Some PDFs have separate owner and user passwords — try both if available." }
    ]
  };

  return (
    <>
      <CanonicalHead 
        title="Unlock PDF Free Online - Remove PDF Password | VexaTool"
        description="Free online PDF unlocker. Remove password protection from PDF files. Automatically detects protection type."
        keywords="unlock PDF, remove PDF password, PDF unlocker, decrypt PDF, remove PDF protection"
      />
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

        {protectionStatus === "checking" && (
          <div className="text-center mt-6">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Analyzing PDF protection...
            </div>
          </div>
        )}

        {getStatusCard()}

        {files.length > 0 && protectionStatus && protectionStatus !== "checking" && (
          <div className="mt-6 max-w-md mx-auto space-y-6">
            {protectionStatus === "password-protected" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  PDF Password (Required)
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter the PDF password"
                />
              </div>
            )}

            <div className="text-center">
              <Button
                size="lg"
                onClick={handleUnlock}
                disabled={isProcessing || (protectionStatus === "password-protected" && !password.trim())}
                className="gap-2"
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    {protectionStatus === "not-protected" ? "Download PDF" : "Unlock & Download"}
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

export default UnlockPDF;