import { useState, useEffect, useRef } from "react";
import { Unlock, Download, Key, Shield, ShieldCheck, ShieldX, AlertCircle, Eye, FileText, CheckCircle2 } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDocument } from "pdf-lib";
import { toast } from "@/hooks/use-toast";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";
import { Card, CardContent } from "@/components/ui/card";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type ProtectionStatus = "checking" | "password-protected" | "restriction-only" | "not-protected" | "error";

const UnlockPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [password, setPassword] = useState("");
  const [protectionStatus, setProtectionStatus] = useState<ProtectionStatus | null>(null);
  const [unlockedBlob, setUnlockedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Detect protection when file is uploaded
  useEffect(() => {
    const detectProtection = async () => {
      if (files.length === 0) {
        setProtectionStatus(null);
        setUnlockedBlob(null);
        setPreviewUrl(null);
        setShowPreview(false);
        return;
      }

      setProtectionStatus("checking");

      try {
        const arrayBuffer = await files[0].arrayBuffer();

        try {
          const pdf = await PDFDocument.load(arrayBuffer);
          setPageCount(pdf.getPageCount());
          setProtectionStatus("not-protected");
        } catch {
          try {
            await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            setProtectionStatus("restriction-only");
          } catch {
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

  const renderPreview = async (blob: Blob) => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPageCount(pdf.numPages);
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });

      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
        }
      }
    } catch (err) {
      console.error("Preview render error:", err);
    }
  };

  const handleRemovePassword = async () => {
    if (files.length === 0) {
      toast({ title: "No file selected", description: "Please upload a PDF file first.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setUnlockedBlob(null);
    setShowPreview(false);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const loadOptions: { password?: string; ignoreEncryption?: boolean } = {};

      if (protectionStatus === "password-protected") {
        if (!password.trim()) {
          toast({ title: "Password required", description: "Enter the PDF password to remove protection.", variant: "destructive" });
          setIsProcessing(false);
          return;
        }
        loadOptions.password = password.trim();
      } else {
        loadOptions.ignoreEncryption = true;
      }

      const pdf = await PDFDocument.load(arrayBuffer, loadOptions);
      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });

      if (previewUrl) URL.revokeObjectURL(previewUrl);

      const url = URL.createObjectURL(blob);
      setUnlockedBlob(blob);
      setPreviewUrl(url);
      setShowPreview(true);

      await renderPreview(blob);

      toast({ title: "Password removed successfully!", description: "Your PDF is now unlocked. Preview it below or download directly." });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";

      if (errorMessage.includes("password") || errorMessage.includes("encrypted")) {
        toast({ title: "Incorrect password", description: "The password you entered is wrong. Please try again.", variant: "destructive" });
      } else {
        toast({ title: "Cannot process this PDF", description: "The file may be corrupted or use unsupported encryption.", variant: "destructive" });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!unlockedBlob || !previewUrl) return;
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = `unlocked_${files[0].name}`;
    link.click();
    toast({ title: "Downloaded!", description: "Your unlocked PDF has been saved." });
  };

  const handleReset = () => {
    setFiles([]);
    setPassword("");
    setProtectionStatus(null);
    setUnlockedBlob(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setShowPreview(false);
    setPageCount(0);
  };

  const getStatusCard = () => {
    if (!protectionStatus || protectionStatus === "checking") return null;

    const statusConfig = {
      "password-protected": {
        icon: ShieldX,
        title: "Password Protected PDF",
        description: "This PDF requires a password to open. Enter the password below and click 'Remove Password'.",
        bgClass: "bg-destructive/10 border-destructive/30 text-destructive",
      },
      "restriction-only": {
        icon: Shield,
        title: "Restrictions Detected",
        description: "This PDF has copy/print/edit restrictions. Click 'Remove Password' to remove all restrictions.",
        bgClass: "bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400",
      },
      "not-protected": {
        icon: ShieldCheck,
        title: "No Protection Detected",
        description: "This PDF has no password or restrictions. You can download it as-is.",
        bgClass: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400",
      },
      "error": {
        icon: AlertCircle,
        title: "Analysis Failed",
        description: "Could not analyze this PDF. The file may be corrupted.",
        bgClass: "bg-muted border-muted-foreground/30 text-muted-foreground",
      },
    };

    const config = statusConfig[protectionStatus];
    const Icon = config.icon;

    return (
      <Card className={`max-w-lg mx-auto mt-6 ${config.bgClass}`}>
        <CardContent className="flex items-start gap-3 p-4">
          <Icon className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">{config.title}</h4>
            <p className="text-xs opacity-80">{config.description}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const seoContent = {
    toolName: "Unlock PDF - Remove Password",
    whatIs: "Unlock PDF is a free online tool that removes password protection and restrictions from PDF documents. Upload any PDF, enter the password if required, and instantly get an unlocked version with a live preview before downloading. The entire process runs securely in your browser — your files and passwords never leave your device. Whether your PDF has an open password or just copy/print/edit restrictions, this tool handles both scenarios with a clear status indicator and one-click password removal.",
    howToUse: [
      "Upload your PDF file using the drag-and-drop area or file browser.",
      "The tool automatically detects whether the PDF is password-protected, has restrictions, or is unprotected.",
      "If password-protected, enter the correct document password in the input field.",
      "Click 'Remove Password' to strip all protection from the PDF.",
      "Preview the unlocked PDF directly in your browser to verify the content.",
      "Click 'Download Unlocked PDF' to save the unrestricted file to your device."
    ],
    features: [
      "Automatic detection of protection type — password, restrictions, or none.",
      "Clear visual status indicator showing exact protection level.",
      "Enter password and remove it in one click.",
      "Live preview of the unlocked PDF before downloading.",
      "Shows page count and file details after processing.",
      "Remove copy, print, and edit restrictions without needing a password.",
      "100% client-side processing — files never leave your browser.",
      "No registration, account, or watermarks. Completely free.",
      "Works with all PDF versions and encryption types supported by pdf-lib."
    ],
    safetyNote: "Your PDF files and passwords are processed entirely in your browser using JavaScript. No data is sent to any server, ensuring complete privacy and security. Only use this tool on PDFs you own or have authorization to modify.",
    faqs: [
      { question: "Can I unlock a PDF without knowing the password?", answer: "No. If a PDF has an open password, you must enter the correct password. However, if the PDF only has restriction-level protection (copy/print/edit disabled), the tool can remove those restrictions without a password." },
      { question: "How do I know if my PDF needs a password?", answer: "After uploading, the tool automatically analyzes your PDF and shows a color-coded status card. Red means password-protected, yellow means restriction-only, and green means no protection." },
      { question: "Will unlocking change my PDF content?", answer: "No. Unlocking only removes the protection layer. Your text, images, formatting, and quality remain completely unchanged." },
      { question: "Can I preview the PDF before downloading?", answer: "Yes! After removing the password, a live preview of the first page is displayed along with the total page count. You can verify the content before downloading." },
      { question: "Is it legal to remove PDF passwords?", answer: "You should only unlock PDFs that you own or have explicit authorization to modify. Removing protection from copyrighted material without permission may violate copyright laws." },
      { question: "What types of PDF protection can this tool remove?", answer: "This tool can remove open passwords (with correct password entry) and restriction-level protection including copy, print, and edit restrictions." },
      { question: "Does this tool add watermarks?", answer: "No. VexaTool never adds watermarks, branding, or any modifications to your documents." },
      { question: "Can I re-protect the PDF after unlocking?", answer: "Yes! Use our Protect PDF tool to add a new password to the unlocked document." },
      { question: "Why does my password not work?", answer: "Ensure you enter the exact password including correct capitalization and special characters. Some PDFs have separate owner and user passwords — try both." },
      { question: "How many pages can I unlock?", answer: "There is no page limit. The tool processes the entire PDF regardless of size, though very large files may take a few extra seconds." }
    ]
  };

  return (
    <>
      <CanonicalHead
        title="Unlock PDF Free Online - Remove PDF Password & Restrictions | VexaTool"
        description="Free online PDF unlocker. Remove password protection from PDF files instantly. Preview unlocked PDF before downloading. 100% secure, browser-based."
        keywords="unlock PDF, remove PDF password, PDF unlocker, decrypt PDF, remove PDF protection, PDF password remover"
      />
      <ToolLayout
        title="Unlock PDF"
        description="Remove password protection from PDF documents"
        icon={Unlock}
        colorClass="bg-tool-unlock"
      >
        {!showPreview ? (
          <>
            <FileUpload files={files} onFilesChange={setFiles} colorClass="bg-tool-unlock" />

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
              <div className="mt-6 max-w-lg mx-auto space-y-5">
                {/* Password input for protected PDFs */}
                {protectionStatus === "password-protected" && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                      <Key className="w-4 h-4" />
                      Enter PDF Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter the document password"
                      onKeyDown={(e) => e.key === "Enter" && handleRemovePassword()}
                    />
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {protectionStatus !== "not-protected" && (
                    <Button
                      size="lg"
                      onClick={handleRemovePassword}
                      disabled={isProcessing || (protectionStatus === "password-protected" && !password.trim())}
                      className="gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Unlock className="w-5 h-5" />
                          Remove Password
                        </>
                      )}
                    </Button>
                  )}

                  {protectionStatus === "not-protected" && (
                    <Button size="lg" onClick={handleRemovePassword} className="gap-2">
                      <Download className="w-5 h-5" />
                      Download PDF
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Success state with preview and download */
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Success banner */}
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="flex items-center gap-3 p-4">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-700 dark:text-green-400">Password Removed Successfully!</h3>
                  <p className="text-sm text-green-600/80 dark:text-green-400/80">
                    {pageCount} page{pageCount !== 1 ? "s" : ""} unlocked • Ready to download
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <div className="border border-border rounded-xl overflow-hidden bg-muted/30">
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Preview — Page 1 of {pageCount}</span>
              </div>
              <div className="flex justify-center p-4 bg-muted/20">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto shadow-lg rounded-md"
                  style={{ maxHeight: "500px" }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={handleDownload} className="gap-2">
                <Download className="w-5 h-5" />
                Download Unlocked PDF
              </Button>
              <Button size="lg" variant="outline" onClick={handleReset} className="gap-2">
                <FileText className="w-5 h-5" />
                Unlock Another PDF
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
