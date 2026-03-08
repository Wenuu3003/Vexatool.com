import { useState, useEffect, useRef, useCallback } from "react";
import { Unlock, Download, Key, Shield, ShieldCheck, ShieldX, AlertCircle, Eye, FileText, CheckCircle2, Lock, Upload } from "lucide-react";
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
import * as pdfjsLib from "pdfjs-dist";
import jsPDF from "jspdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type ProtectionStatus = "checking" | "password-protected" | "restriction-only" | "not-protected" | "error";
type ProcessStep = "idle" | "decrypting" | "rendering" | "building" | "done";

const isPasswordException = (err: unknown) => {
  const error = err as { name?: string; code?: number; message?: string };
  const msg = (error?.message || "").toLowerCase();
  return (
    error?.name === "PasswordException" ||
    error?.code === pdfjsLib.PasswordResponses?.NEED_PASSWORD ||
    error?.code === pdfjsLib.PasswordResponses?.INCORRECT_PASSWORD ||
    msg.includes("password") ||
    msg.includes("encrypted")
  );
};

const getPasswordCandidates = (rawPassword: string) => {
  const trimmed = rawPassword.trim();
  return Array.from(new Set([rawPassword, trimmed].filter((value) => value.length > 0)));
};

const openPdfWithFallbackPasswords = async (data: Uint8Array, rawPassword: string) => {
  const candidates = getPasswordCandidates(rawPassword);

  if (candidates.length === 0) {
    return pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;
  }

  let lastPasswordError: unknown = null;

  for (const candidate of candidates) {
    try {
      return await pdfjsLib.getDocument({ data, password: candidate, useSystemFonts: true }).promise;
    } catch (err) {
      if (!isPasswordException(err)) {
        throw err;
      }
      lastPasswordError = err;
    }
  }

  throw lastPasswordError || new Error("INVALID_PDF_PASSWORD");
};

const UnlockPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [password, setPassword] = useState("");
  const [protectionStatus, setProtectionStatus] = useState<ProtectionStatus | null>(null);
  const [unlockedBlob, setUnlockedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [processStep, setProcessStep] = useState<ProcessStep>("idle");
  const [progress, setProgress] = useState(0);
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [currentPreviewPage, setCurrentPreviewPage] = useState(0);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewPages.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrl, previewPages]);

  // Detect protection when file is uploaded
  useEffect(() => {
    const detectProtection = async () => {
      if (files.length === 0) {
        setProtectionStatus(null);
        setUnlockedBlob(null);
        setPreviewUrl(null);
        setShowPreview(false);
        setPreviewPages([]);
        return;
      }

      setProtectionStatus("checking");

      try {
        const arrayBuffer = await files[0].arrayBuffer();
        const data = new Uint8Array(arrayBuffer);

        try {
          const loadingTask = pdfjsLib.getDocument({ data, useSystemFonts: true });
          const pdf = await loadingTask.promise;
          setPageCount(pdf.numPages);

          const perms = await pdf.getPermissions();
          if (perms && perms.length > 0) {
            setProtectionStatus("restriction-only");
          } else {
            setProtectionStatus("not-protected");
          }
          pdf.destroy();
        } catch (err) {
          if (isPasswordException(err)) {
            setProtectionStatus("password-protected");
          } else {
            try {
              const loadingTask2 = pdfjsLib.getDocument({ data, password: "", useSystemFonts: true });
              const pdf2 = await loadingTask2.promise;
              setPageCount(pdf2.numPages);
              setProtectionStatus("restriction-only");
              pdf2.destroy();
            } catch {
              setProtectionStatus("password-protected");
            }
          }
        }
      } catch (error) {
        console.error("Detection error:", error);
        setProtectionStatus("error");
      }
    };

    detectProtection();
  }, [files]);

  const renderPageToCanvas = useCallback(async (
    pdf: pdfjsLib.PDFDocumentProxy,
    pageNum: number,
    scale: number = 2
  ): Promise<HTMLCanvasElement> => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas;
  }, []);

  const handleUnlock = async () => {
    if (files.length === 0) {
      toast({ title: "No file selected", description: "Please upload a PDF file first.", variant: "destructive" });
      return;
    }

    if (protectionStatus === "password-protected" && password.length === 0) {
      toast({ title: "Password required", description: "Please enter the PDF password.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setUnlockedBlob(null);
    setShowPreview(false);
    setPreviewPages([]);
    setProgress(0);
    setProcessStep("decrypting");

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      let pdf: pdfjsLib.PDFDocumentProxy;
      try {
        pdf = await openPdfWithFallbackPasswords(data, password);
      } catch (err) {
        if (isPasswordException(err)) {
          if (password.length === 0) {
            toast({ title: "Password required", description: "This PDF is password-protected. Please enter the password.", variant: "destructive" });
          } else {
            toast({ title: "Incorrect password", description: "The password is incorrect. Check uppercase/lowercase and try again.", variant: "destructive" });
          }
          setProcessStep("idle");
          return;
        }
        throw err;
      }

      const totalPages = pdf.numPages;
      setPageCount(totalPages);
      setProcessStep("rendering");
      setProgress(10);

      // Step 2: Render all pages to canvas (this strips all encryption/restrictions)
      const renderedPages: HTMLCanvasElement[] = [];
      const previewUrls: string[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const canvas = await renderPageToCanvas(pdf, i, 2);
        renderedPages.push(canvas);

        // Generate preview image for first 3 pages
        if (i <= 3) {
          const previewCanvas = await renderPageToCanvas(pdf, i, 1.5);
          const previewBlob = await new Promise<Blob>((resolve) => {
            previewCanvas.toBlob((b) => resolve(b!), "image/png");
          });
          previewUrls.push(URL.createObjectURL(previewBlob));
        }

        setProgress(10 + Math.round((i / totalPages) * 60));
      }

      setPreviewPages(previewUrls);
      setProcessStep("building");
      setProgress(75);

      // Step 3: Build a new clean PDF from rendered pages using jsPDF
      const firstPage = renderedPages[0];
      const pdfDoc = new jsPDF({
        orientation: firstPage.width > firstPage.height ? "landscape" : "portrait",
        unit: "px",
        format: [firstPage.width, firstPage.height],
        compress: true,
      });

      for (let i = 0; i < renderedPages.length; i++) {
        const canvas = renderedPages[i];
        const imgData = canvas.toDataURL("image/jpeg", 0.92);

        if (i > 0) {
          pdfDoc.addPage([canvas.width, canvas.height], canvas.width > canvas.height ? "landscape" : "portrait");
        }

        pdfDoc.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
        setProgress(75 + Math.round(((i + 1) / renderedPages.length) * 20));
      }

      setProgress(95);

      const pdfBlob = pdfDoc.output("blob");

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(pdfBlob);

      setUnlockedBlob(pdfBlob);
      setPreviewUrl(url);
      setShowPreview(true);
      setProcessStep("done");
      setProgress(100);

      pdf.destroy();

      toast({ title: "PDF Unlocked Successfully!", description: `All ${totalPages} pages unlocked. Restrictions completely removed.` });
    } catch (error) {
      console.error("Unlock error:", error);
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
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Downloaded!", description: "Your unlocked PDF has been saved." });
  };

  const handleReset = () => {
    setFiles([]);
    setPassword("");
    setProtectionStatus(null);
    setUnlockedBlob(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewPages.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrl(null);
    setShowPreview(false);
    setPageCount(0);
    setProcessStep("idle");
    setProgress(0);
    setPreviewPages([]);
    setCurrentPreviewPage(0);
  };

  const getStepLabel = () => {
    switch (processStep) {
      case "decrypting": return "Decrypting PDF...";
      case "rendering": return `Rendering pages... (${Math.round(progress)}%)`;
      case "building": return "Building unlocked PDF...";
      case "done": return "Complete!";
      default: return "";
    }
  };

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
        description: "Could not analyze this PDF. The file may be corrupted.",
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
