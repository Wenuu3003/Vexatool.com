import { useState, useEffect, useCallback } from "react";
import { Unlock, Download, Key, Shield, ShieldCheck, ShieldX, AlertCircle, Eye, FileText, CheckCircle2, Lock } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  downloadBlob,
  getUnlockStepLabel,
  inspectPdfDocument,
  unlockPdfFile,
  UnlockPdfError,
  validatePdfFile,
  type PdfLogger,
  type ProcessStep,
  type ProtectionStatus,
} from "@/lib/pdf-unlock";

const UnlockPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [password, setPassword] = useState("");
  const [protectionStatus, setProtectionStatus] = useState<ProtectionStatus | null>(null);
  const [analysisMessage, setAnalysisMessage] = useState<string | null>(null);
  const [unlockedBlob, setUnlockedBlob] = useState<Blob | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [processStep, setProcessStep] = useState<ProcessStep>("idle");
  const [progress, setProgress] = useState(0);
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [currentPreviewPage, setCurrentPreviewPage] = useState(0);

  const logEvent = useCallback<PdfLogger>((event, payload) => {
    console.log("[UnlockPDF]", event, payload ?? {});
  }, []);

  useEffect(() => {
    return () => {
      previewPages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewPages]);

  useEffect(() => {
    const detectProtection = async () => {
      if (files.length === 0) {
        setProtectionStatus(null);
        setAnalysisMessage(null);
        setUnlockedBlob(null);
        setShowPreview(false);
        setPreviewPages([]);
        setPageCount(0);
        return;
      }

      const file = files[0];
      setProtectionStatus("checking");
      setAnalysisMessage(null);
      logEvent("detection-start", {
        name: file.name,
        type: file.type || "unknown",
        size: file.size,
      });

      try {
        const validation = await validatePdfFile(file);

        logEvent("file-validation", {
          valid: validation.valid,
          mimeType: validation.mimeType,
          extensionMatches: validation.extensionMatches,
          header: validation.header,
          hasPdfHeader: validation.hasPdfHeader,
        });

        if (!validation.valid) {
          setProtectionStatus("error");
          setAnalysisMessage(validation.message ?? "Invalid PDF file.");
          return;
        }

        const data = new Uint8Array(await file.arrayBuffer());
        const inspection = await inspectPdfDocument(data, { logger: logEvent });

        setProtectionStatus(inspection.protectionStatus);
        setPageCount(inspection.pageCount);

        logEvent("inspection-complete", {
          protectionStatus: inspection.protectionStatus,
          pageCount: inspection.pageCount,
          hasRestrictions: inspection.hasRestrictions,
          encryptionMarkersDetected: inspection.encryptionMarkersDetected,
          failure: inspection.failure,
        });

        if (inspection.protectionStatus === "error") {
          setAnalysisMessage(
            inspection.failure?.kind === "unsupported-encryption" || inspection.failure?.kind === "library-limitation"
              ? "This PDF uses an encryption mode not fully compatible with this browser engine."
              : inspection.failure?.kind === "corrupted-pdf"
                ? "This file appears corrupted or malformed."
                : "Could not analyze this PDF safely."
          );
        }
      } catch (error) {
        const classified = error instanceof UnlockPdfError
          ? error
          : new UnlockPdfError("unknown", "Unexpected analysis failure", {}, error);

        logEvent("detection-failed", {
          kind: classified.kind,
          details: classified.details,
          rawError: String((classified.rawError as Error)?.message || classified.rawError || ""),
        });

        setProtectionStatus("error");
        setAnalysisMessage(
          classified.kind === "corrupted-pdf"
            ? "This file appears corrupted or malformed."
            : classified.kind === "unsupported-encryption" || classified.kind === "library-limitation"
              ? "This PDF uses encryption not fully supported in this browser engine."
              : "Could not inspect the uploaded PDF."
        );
      }
    };

    detectProtection();
  }, [files, logEvent]);

  const handleUnlock = async () => {
    if (files.length === 0) {
      toast({ title: "No file selected", description: "Please upload a PDF file first.", variant: "destructive" });
      return;
    }

    const file = files[0];

    setIsProcessing(true);
    setUnlockedBlob(null);
    setShowPreview(false);
    previewPages.forEach((url) => URL.revokeObjectURL(url));
    setPreviewPages([]);
    setProgress(0);
    setProcessStep("decrypting");

    try {
      const result = await unlockPdfFile(file, {
        password,
        logger: logEvent,
        onProgress: ({ step, progress: nextProgress, detail }) => {
          setProcessStep(step);
          setProgress(nextProgress);
          if (detail) {
            logEvent("progress", { step, progress: nextProgress, detail });
          }
        },
      });

      if (result.protectionStatus === "not-protected") {
        downloadBlob(result.blob, file.name);
        setProcessStep("done");
        setProgress(100);
        toast({
          title: "No password needed",
          description: "This PDF is already unprotected. Downloaded original file.",
        });
        return;
      }

      const nextPreviewUrls = result.previewBlobs.map((blob) => URL.createObjectURL(blob));
      setPreviewPages(nextPreviewUrls);
      setPageCount(result.pageCount);
      setUnlockedBlob(result.blob);
      setShowPreview(true);
      setProcessStep("done");
      setProgress(100);

      logEvent("unlock-success", {
        pageCount: result.pageCount,
        outputSize: result.blob.size,
        passwordUsedLength: result.passwordUsed?.length,
      });

      toast({
        title: "PDF Unlocked Successfully!",
        description: `All ${result.pageCount} pages unlocked. Restrictions removed.`,
      });
    } catch (error) {
      const classified = error instanceof UnlockPdfError
        ? error
        : new UnlockPdfError("unknown", "Unexpected unlock failure", {}, error);

      logEvent("unlock-failed", {
        kind: classified.kind,
        details: classified.details,
        rawError: String((classified.rawError as Error)?.message || classified.rawError || ""),
      });

      switch (classified.kind) {
        case "incorrect-password":
          toast({
            title: "Incorrect password",
            description: "Password validation failed. Check case, spaces, and hidden characters.",
            variant: "destructive",
          });
          break;
        case "password-required":
          toast({
            title: "Password required",
            description: "This PDF needs a password before it can be unlocked.",
            variant: "destructive",
          });
          break;
        case "unsupported-encryption":
        case "library-limitation":
          toast({
            title: "Encryption compatibility issue",
            description: "This PDF encryption is not fully supported by the browser PDF engine.",
            variant: "destructive",
          });
          break;
        case "corrupted-pdf":
          toast({
            title: "Corrupted PDF",
            description: "The file appears corrupted or malformed and cannot be processed.",
            variant: "destructive",
          });
          break;
        case "not-a-pdf":
          toast({
            title: "Invalid file",
            description: classified.message,
            variant: "destructive",
          });
          break;
        case "render-failed":
          toast({
            title: "Rendering failed",
            description: "One or more pages could not be rendered for export.",
            variant: "destructive",
          });
          break;
        case "export-failed":
          toast({
            title: "Export failed",
            description: "PDF could be decrypted but failed while building output file.",
            variant: "destructive",
          });
          break;
        default:
          toast({
            title: "PDF processing failed",
            description: "The file could not be parsed by the current browser PDF engine.",
            variant: "destructive",
          });
      }

      setProcessStep("idle");
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!unlockedBlob) return;
    const originalName = files[0]?.name ?? "document.pdf";
    downloadBlob(unlockedBlob, `unlocked_${originalName}`);
    toast({ title: "Downloaded!", description: "Your unlocked PDF has been saved." });
  };

  const handleReset = () => {
    setFiles([]);
    setPassword("");
    setProtectionStatus(null);
    setAnalysisMessage(null);
    setUnlockedBlob(null);
    previewPages.forEach((url) => URL.revokeObjectURL(url));
    setShowPreview(false);
    setPageCount(0);
    setProcessStep("idle");
    setProgress(0);
    setPreviewPages([]);
    setCurrentPreviewPage(0);
  };

  const getStepLabel = () => getUnlockStepLabel(processStep, progress);

  const getStatusCard = () => {
    if (!protectionStatus || protectionStatus === "checking") return null;

    const statusConfig = {
      "password-protected": {
        icon: ShieldX,
        title: "Password Protected PDF",
        description: "This PDF requires a password to open. Enter the password below to unlock it.",
        bgClass: "bg-destructive/10 border-destructive/30 text-destructive",
      },
      "restriction-only": {
        icon: Shield,
        title: "Restrictions Detected",
        description: "This PDF has copy/print/edit restrictions. Click 'Unlock PDF' to remove all restrictions instantly.",
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
        description: analysisMessage ?? "Could not analyze this PDF.",
        bgClass: "bg-muted border-muted-foreground/30 text-muted-foreground",
      },
    };

    const config = statusConfig[protectionStatus];
    const Icon = config.icon;

    return (
      <Card className={`max-w-lg mx-auto mt-6 border ${config.bgClass}`}>
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
    toolName: "Unlock PDF - Remove Password & Restrictions",
    whatIs: "Unlock PDF is a free online tool that removes password protection and all restrictions (copy, print, edit) from PDF documents — just like SmallPDF. Upload any PDF, enter the password if required, and instantly get a completely clean, unrestricted version with a live multi-page preview before downloading. The tool decrypts the PDF using your browser's built-in PDF rendering engine, then rebuilds a brand-new clean PDF with zero restrictions. Your files and passwords never leave your device.",
    howToUse: [
      "Upload your PDF file using the drag-and-drop area or file browser.",
      "The tool automatically detects whether the PDF is password-protected, has restrictions, or is unprotected.",
      "If password-protected, enter the correct document password in the input field.",
      "Click 'Unlock PDF' to decrypt and rebuild the PDF without any restrictions.",
      "Preview multiple pages of the unlocked PDF directly in your browser.",
      "Click 'Download Unlocked PDF' to save the unrestricted file to your device."
    ],
    features: [
      "Full decryption of password-protected PDFs using the correct password.",
      "Removes ALL restrictions: copy, print, edit, form-fill, annotation, extraction.",
      "Rebuilds a completely new PDF with zero encryption or permission flags.",
      "Live multi-page preview of the unlocked PDF before downloading.",
      "Progress bar showing decryption, rendering, and rebuild steps.",
      "Automatic detection of protection type — password, restrictions, or none.",
      "100% client-side processing — files and passwords never leave your browser.",
      "No registration, account, or watermarks. Completely free.",
      "Works with all PDF encryption types including AES-128 and AES-256.",
      "Handles PDFs of any size with real-time progress updates."
    ],
    safetyNote: "Your PDF files and passwords are processed entirely in your browser using JavaScript. No data is sent to any server, ensuring complete privacy and security. Only use this tool on PDFs you own or have authorization to modify.",
    faqs: [
      { question: "Can I unlock a PDF without knowing the password?", answer: "If the PDF only has restriction-level protection (copy/print/edit disabled), yes — the tool removes those restrictions automatically without needing a password. However, if the PDF has an open password (required to view), you must enter the correct password." },
      { question: "How does this tool actually unlock PDFs?", answer: "The tool uses your browser's PDF rendering engine to decrypt and render each page, then rebuilds a brand-new clean PDF from the rendered content. This completely strips all encryption, permissions, and restrictions from the output file." },
      { question: "How do I know if my PDF needs a password?", answer: "After uploading, the tool automatically analyzes your PDF and shows a color-coded status card. Red means password-protected (needs password), yellow means restriction-only (no password needed), and green means no protection at all." },
      { question: "Will unlocking change my PDF content?", answer: "The visual content remains identical. The tool re-renders each page at high resolution (2x scale) to maintain quality. However, since the PDF is rebuilt from rendered images, selectable text may become image-based." },
      { question: "Can I preview the PDF before downloading?", answer: "Yes! After unlocking, you can preview up to 3 pages of the unlocked PDF directly in your browser. Navigate between preview pages to verify the content before downloading." },
      { question: "Is it legal to remove PDF passwords?", answer: "You should only unlock PDFs that you own or have explicit authorization to modify. Removing protection from copyrighted material without permission may violate copyright laws." },
      { question: "What types of PDF encryption does this tool support?", answer: "This tool supports all standard PDF encryption types including RC4, AES-128, and AES-256 encryption. It handles both user passwords (open password) and owner passwords (restriction password)." },
      { question: "Does this tool add watermarks?", answer: "No. VexaTool never adds watermarks, branding, or any modifications to your documents." },
      { question: "Why does my password not work?", answer: "Ensure you enter the exact password including correct capitalization, spaces, and special characters. Some PDFs have separate owner and user passwords — try both." },
      { question: "How many pages can I unlock?", answer: "There is no page limit. The tool processes the entire PDF regardless of size. A progress bar shows real-time status during processing. Very large PDFs (100+ pages) may take a minute or two." }
    ]
  };

  return (
    <>
      <CanonicalHead
        title="Unlock PDF Free Online - Remove PDF Password & Restrictions | VexaTool"
        description="Free online PDF unlocker. Remove password protection and restrictions from PDF files instantly. Preview unlocked PDF before downloading. 100% secure, browser-based."
        keywords="unlock PDF, remove PDF password, PDF unlocker, decrypt PDF, remove PDF protection, PDF password remover, remove PDF restrictions"
      />
      <ToolLayout
        title="Unlock PDF"
        description="Remove password protection and restrictions from PDF documents"
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

            {files.length > 0 && protectionStatus && protectionStatus !== "checking" && protectionStatus !== "error" && (
              <div className="mt-6 max-w-lg mx-auto space-y-5">
                {/* Always show password field for password-protected PDFs */}
                {protectionStatus === "password-protected" && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                      <Key className="w-4 h-4" />
                      Enter PDF Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter the document password"
                        className="pl-10"
                        onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                )}

                {/* Progress indicator */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{getStepLabel()}</span>
                      <span className="text-muted-foreground font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {protectionStatus !== "not-protected" && (
                    <Button
                      size="lg"
                      onClick={handleUnlock}
                      disabled={isProcessing || (protectionStatus === "password-protected" && !password.trim())}
                      className="gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Unlocking...
                        </>
                      ) : (
                        <>
                          <Unlock className="w-5 h-5" />
                          Unlock PDF
                        </>
                      )}
                    </Button>
                  )}

                  {protectionStatus === "not-protected" && (
                    <Button size="lg" onClick={() => {
                      // For unprotected PDFs, just let them download the original
                      const url = URL.createObjectURL(files[0]);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = files[0].name;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                      toast({ title: "Downloaded!", description: "Your PDF has been saved." });
                    }} className="gap-2">
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
                  <h3 className="font-semibold text-green-700 dark:text-green-400">PDF Unlocked Successfully!</h3>
                  <p className="text-sm text-green-600/80 dark:text-green-400/80">
                    {pageCount} page{pageCount !== 1 ? "s" : ""} • All restrictions removed • Ready to download
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Multi-page Preview */}
            {previewPages.length > 0 && (
              <div className="border border-border rounded-xl overflow-hidden bg-muted/30">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Preview — Page {currentPreviewPage + 1} of {pageCount}
                    </span>
                  </div>
                  {previewPages.length > 1 && (
                    <div className="flex gap-1">
                      {previewPages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPreviewPage(idx)}
                          className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${
                            idx === currentPreviewPage
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted-foreground/10 text-muted-foreground"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-center p-4 bg-muted/20">
                  <img
                    src={previewPages[currentPreviewPage]}
                    alt={`Page ${currentPreviewPage + 1} preview`}
                    className="max-w-full h-auto shadow-lg rounded-md"
                    style={{ maxHeight: "600px" }}
                  />
                </div>
              </div>
            )}

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
