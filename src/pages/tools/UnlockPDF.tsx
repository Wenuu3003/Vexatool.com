import { useState, useEffect } from "react";
import { Unlock, Download, AlertCircle, Key, Shield, ShieldCheck, ShieldX } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDocument } from "pdf-lib";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
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

  return (
    <>
      <Helmet>
        <title>Unlock PDF Free Online - Remove PDF Password | Mypdfs</title>
        <meta name="description" content="Free online PDF unlocker. Remove password protection from PDF files. Automatically detects protection type." />
        <meta name="keywords" content="unlock PDF, remove PDF password, PDF unlocker, decrypt PDF, remove PDF protection" />
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
      </ToolLayout>
    </>
  );
};

export default UnlockPDF;