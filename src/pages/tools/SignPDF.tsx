import { useState, useCallback, useEffect, useRef } from "react";
import { PenTool, Download, Type, ZoomIn, ZoomOut, Plus, Upload } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument } from "pdf-lib";
import { useFileHistory } from "@/hooks/useFileHistory";
import { AdPlaceholder } from "@/components/AdBanner";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";
import { pdfjsLib } from "@/lib/pdfWorker";
import SignatureCanvas from "@/components/sign-pdf/SignatureCanvas";
import PDFPageView from "@/components/sign-pdf/PDFPageView";
import type { SignatureObject, PageDimensions, SignatureFontStyle } from "@/components/sign-pdf/types";
import { SIGNATURE_FONTS } from "@/components/sign-pdf/types";

const SIGNATURE_BOX = {
  width: 0.25,
  height: 0.08,
};

const SignPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [signatureType, setSignatureType] = useState<"draw" | "type" | "upload">("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [fontStyle, setFontStyle] = useState<SignatureFontStyle>("script");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [signatures, setSignatures] = useState<SignatureObject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { saveFileHistory } = useFileHistory();

  useEffect(() => {
    if (files.length === 0) {
      setPdfDoc(null);
      setNumPages(0);
      setSignatures([]);
      return;
    }

    let cancelled = false;
    let loadedDoc: pdfjsLib.PDFDocumentProxy | null = null;

    const loadPdf = async () => {
      setIsLoading(true);
      try {
        const arrayBuffer = await files[0].arrayBuffer();
        const doc = await pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          useSystemFonts: true,
          stopAtErrors: false,
        }).promise;

        loadedDoc = doc;

        if (!cancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setSignatures([]);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message.toLowerCase() : "";
          const description = message.includes("password") || message.includes("encrypted")
            ? "This PDF is protected. Please unlock it first, then sign it."
            : "This PDF could not be opened. Try a different file or repair it first.";

          toast({ title: "Unable to open PDF", description, variant: "destructive" });
          setFiles([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
      if (loadedDoc) {
        void loadedDoc.destroy();
      }
    };
  }, [files, toast]);

  const loadSignatureFont = useCallback(async (style: SignatureFontStyle) => {
    const fontDef = SIGNATURE_FONTS[style];
    if (!("fonts" in document)) return;

    try {
      await Promise.race([
        Promise.all([
          document.fonts.load(`600 96px ${fontDef.fontFamily}`),
          document.fonts.ready,
        ]),
        new Promise<void>((resolve) => window.setTimeout(resolve, 1500)),
      ]);
    } catch {
      // Fall back to the closest available local font if the webfont is delayed.
    }
  }, []);

  const renderTypedSignatureToImage = useCallback(async (
    text: string,
    style: SignatureFontStyle,
    widthPx: number,
    heightPx: number
  ): Promise<string> => {
    await loadSignatureFont(style);

    const canvas = document.createElement("canvas");
    const scale = 3;
    const safeWidth = Math.max(1, widthPx);
    const safeHeight = Math.max(1, heightPx);

    canvas.width = safeWidth * scale;
    canvas.height = safeHeight * scale;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Signature canvas could not be created");
    }

    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, safeWidth, safeHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "hsl(221 39% 18%)";

    const fontDef = SIGNATURE_FONTS[style];
    const italic = fontDef.className.includes("italic") ? "italic " : "";
    const maxTextWidth = safeWidth * 0.9;
    let fontSize = Math.max(24, safeHeight * 0.72);

    while (fontSize > 18) {
      ctx.font = `${italic}${fontSize}px ${fontDef.fontFamily}`;
      if (ctx.measureText(text).width <= maxTextWidth) {
        break;
      }
      fontSize -= 2;
    }

    ctx.font = `${italic}${fontSize}px ${fontDef.fontFamily}`;
    ctx.fillText(text, safeWidth / 2, safeHeight / 2 + fontSize * 0.06);

    return canvas.toDataURL("image/png");
  }, [loadSignatureFont]);

  const handlePageClick = useCallback(async (pageIndex: number, xRatio: number, yRatio: number) => {
    const signatureText = typedSignature.trim();
    const hasSignature =
      signatureType === "draw" ? signatureDataUrl :
      signatureType === "upload" ? uploadedSignature :
      signatureText;

    if (!hasSignature) {
      toast({
        title: "No signature",
        description: "Create a signature first, then click on the page to place it.",
        variant: "destructive",
      });
      return;
    }

    let renderedSignature: string | undefined =
      signatureType === "draw" ? signatureDataUrl ?? undefined :
      signatureType === "upload" ? uploadedSignature ?? undefined :
      undefined;

    if (signatureType === "type") {
      try {
        renderedSignature = await renderTypedSignatureToImage(signatureText, fontStyle, 1200, 360);
      } catch {
        toast({
          title: "Signature rendering failed",
          description: "We couldn't prepare that typed signature. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    const newSig: SignatureObject = {
      id: `sig-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: signatureType,
      dataUrl: renderedSignature,
      text: signatureType === "type" ? signatureText : undefined,
      fontStyle: signatureType === "type" ? fontStyle : undefined,
      pageIndex,
      x: Math.max(0, Math.min(1 - SIGNATURE_BOX.width, xRatio - SIGNATURE_BOX.width / 2)),
      y: Math.max(0, Math.min(1 - SIGNATURE_BOX.height, yRatio - SIGNATURE_BOX.height / 2)),
      width: SIGNATURE_BOX.width,
      height: SIGNATURE_BOX.height,
      locked: false,
    };

    setSignatures((prev) => [...prev, newSig]);
    toast({ title: "Signature placed", description: "Drag to reposition, resize from the corner, or click again to add another." });
  }, [fontStyle, renderTypedSignatureToImage, signatureDataUrl, signatureType, toast, typedSignature, uploadedSignature]);

  const handleSignatureMoved = useCallback((id: string, x: number, y: number) => {
    setSignatures((prev) => prev.map((signature) => signature.id === id ? { ...signature, x, y } : signature));
  }, []);

  const handleSignatureResized = useCallback((id: string, width: number, height: number) => {
    setSignatures((prev) => prev.map((signature) => signature.id === id ? { ...signature, width, height } : signature));
  }, []);

  const handleSignatureRemoved = useCallback((id: string) => {
    setSignatures((prev) => prev.filter((signature) => signature.id !== id));
  }, []);

  const handleSignatureToggleLock = useCallback((id: string) => {
    setSignatures((prev) => prev.map((signature) => signature.id === id ? { ...signature, locked: !signature.locked } : signature));
  }, []);

  const handlePageDimensions = useCallback((_pageIndex: number, _dims: PageDimensions) => {
    // Dimensions are tracked inside each page view; keep the callback for component compatibility.
  }, []);

  const handleSignatureUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!/^image\/(png|jpeg|jpg|webp)$/i.test(file.type)) {
      toast({ title: "Unsupported file", description: "Please upload a PNG, JPG, or WebP signature image.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Signature image must be under 10MB.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) {
        toast({ title: "Upload failed", description: "Could not read the signature image.", variant: "destructive" });
        return;
      }
      setUploadedSignature(result);
      toast({ title: "Signature uploaded", description: "Click on the PDF to place it." });
    };
    reader.onerror = () => {
      toast({ title: "Upload failed", description: "Could not read the signature image.", variant: "destructive" });
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleExport = async () => {
    if (files.length === 0 || signatures.length === 0) {
      toast({ title: "Nothing to export", description: "Please place at least one signature first.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdfLibDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
        updateMetadata: false,
      });
      const pages = pdfLibDoc.getPages();

      for (const sig of signatures) {
        const page = pages[sig.pageIndex];
        if (!page) continue;

        const { width: pageWidth, height: pageHeight } = page.getSize();
        const signatureWidth = sig.width * pageWidth;
        const signatureHeight = sig.height * pageHeight;

        let imageDataUrl = sig.dataUrl;

        if (!imageDataUrl && sig.type === "type" && sig.text) {
          imageDataUrl = await renderTypedSignatureToImage(
            sig.text,
            sig.fontStyle || "script",
            Math.max(900, Math.round(signatureWidth * 4)),
            Math.max(260, Math.round(signatureHeight * 4))
          );
        }

        if (!imageDataUrl) continue;

        const isJpeg = imageDataUrl.startsWith("data:image/jpeg") || imageDataUrl.startsWith("data:image/jpg");
        const signatureImage = isJpeg
          ? await pdfLibDoc.embedJpg(imageDataUrl)
          : await pdfLibDoc.embedPng(imageDataUrl);
        page.drawImage(signatureImage, {
          x: sig.x * pageWidth,
          y: pageHeight - (sig.y + sig.height) * pageHeight,
          width: signatureWidth,
          height: signatureHeight,
        });
      }

      const pdfBytes = await pdfLibDoc.save({ useObjectStreams: false });
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `signed_${files[0].name}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      await saveFileHistory(files[0].name, "pdf", "sign");
      toast({ title: "Signed PDF ready", description: "Your signed PDF was downloaded successfully." });
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      let description = "We couldn't finish signing this PDF. Please try again.";

      if (message.includes("password") || message.includes("encrypted")) {
        description = "This PDF has editing restrictions. Unlock it first, then sign it.";
      } else if (message.includes("invalid") || message.includes("parse") || message.includes("corrupt")) {
        description = "This PDF appears damaged. Repair it first, then try signing again.";
      } else if (message.includes("png") || message.includes("image") || message.includes("canvas")) {
        description = "The signature image could not be prepared. Please redraw or retype the signature and try again.";
      }

      console.error("Sign PDF export error:", error);
      toast({ title: "Sign PDF failed", description, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const seoContent = {
    toolName: "Sign PDF",
    whatIs: "Sign PDF is a free online tool that lets you electronically sign PDF documents in seconds — no printer, scanner, or account required. Draw your signature with a mouse or finger, type it in an elegant signature font, or upload an existing PNG/JPG image of your handwritten signature with full transparency support. Place it anywhere on any page, drag to reposition, and resize from the corner handle for a perfect fit. The entire signing process runs 100% inside your browser using client-side PDF rendering, so your contracts, NDAs, offer letters, HR forms, and financial agreements never leave your device.",
    howToUse: [
      "Upload your PDF file by clicking the upload area or dragging and dropping.",
      "Choose Draw, Type, or Upload signature mode.",
      "Draw your signature, type your name, or upload a PNG/JPG of your handwritten signature.",
      "Click on any page in the PDF preview to place your signature.",
      "Drag the signature to reposition, or use the corner handle to resize. Lock it to prevent accidental moves.",
      "Click 'Download Signed PDF' to export with all signatures embedded."
    ],
    features: [
      "Draw signatures with mouse, touchpad, or touchscreen.",
      "Type-to-signature with elegant italic styling.",
      "Upload PNG, JPG, or WebP signature images with transparency preserved.",
      "Place signatures on any page by clicking.",
      "Drag to reposition and resize from the corner handle.",
      "Lock placed signatures to prevent accidental moves.",
      "Zoom in/out for precise placement.",
      "Multiple signatures on multiple pages.",
      "High-quality PDF export preserving original formatting.",
      "Works on desktop and mobile with smooth touch controls.",
      "No account or payment required."
    ],
    safetyNote: "Your PDF files and signatures are processed entirely in your browser using client-side JavaScript. No documents, signature images, or personal data are uploaded to any server — making it safe for confidential contracts, legal paperwork, and financial documents.",
    faqs: [
      { question: "How do I sign a PDF online for free?", answer: "Upload your PDF, choose Draw, Type, or Upload, create your signature, then click on any page to place it. Drag to reposition, resize from the corner, and click Download Signed PDF when finished." },
      { question: "Can I upload my own handwritten signature?", answer: "Yes. Switch to the Upload tab and select a PNG, JPG, or WebP image of your handwritten signature. PNG transparency is preserved so only your signature appears on the PDF, not a white box." },
      { question: "Where will my signature appear on the PDF?", answer: "Click anywhere on a PDF page to drop the signature at that exact position. You can then drag it to fine-tune the placement or resize it from the corner handle." },
      { question: "Can I resize my signature after placing it?", answer: "Yes. Hover over a placed signature and drag the corner handle to resize it while preserving the aspect ratio." },
      { question: "Can I sign multiple pages or add multiple signatures?", answer: "Yes. Place as many signatures as you need across any pages — for example, initials on each page and a full signature on the last." },
      { question: "Does signing work on mobile phones and tablets?", answer: "Yes. The drawing canvas, drag, and resize controls are fully touch-optimized for iPhone, iPad, and Android devices." },
      { question: "Are electronic signatures legally binding?", answer: "In most jurisdictions — including under the U.S. ESIGN Act, UETA, and the EU eIDAS regulation — electronic signatures on PDFs are legally valid for the vast majority of business and personal documents. Always check the rules in your country for specific document types." },
      { question: "Is it safe to sign confidential documents here?", answer: "Yes. All processing happens inside your browser. Your PDF and your signature image are never uploaded to our servers — nothing leaves your device." },
      { question: "Will the signed PDF have a watermark or VexaTool branding?", answer: "No. The exported PDF is clean, with only your signatures embedded — no watermarks, no logos, no tracking." },
      { question: "What file types can I upload as a signature image?", answer: "PNG (recommended for transparency), JPG/JPEG, and WebP up to 10MB." },
      { question: "Is there a file size limit for the PDF?", answer: "No strict limit, but files under 100MB give the smoothest experience in the browser." }
    ]
  };

  return (
    <>
      <CanonicalHead
        title="Sign PDF Online Free - Add Digital Signature | VexaTool"
        description="Free online PDF signing tool. Add your signature to PDF documents. Draw or type your signature easily."
        keywords="sign PDF, e-signature PDF, digital signature, add signature to PDF, free PDF signer"
      />
      <ToolLayout
        title="Sign PDF"
        description="Add your signature to PDF documents"
        icon={PenTool}
        colorClass="bg-tool-sign"
      >
        <div className="space-y-6">
          <AdPlaceholder className="h-20" />

          {!pdfDoc && (
            <FileUpload
              files={files}
              onFilesChange={setFiles}
              colorClass="bg-tool-sign"
              multiple={false}
            />
          )}

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-muted-foreground">Loading PDF...</p>
            </div>
          )}

          {pdfDoc && (
            <div className="space-y-4">
              {/* Signature creation panel */}
              <div className="max-w-2xl mx-auto">
                <Tabs value={signatureType} onValueChange={(v) => setSignatureType(v as "draw" | "type" | "upload")}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="draw">
                      <PenTool className="w-4 h-4 mr-2" />
                      Draw
                    </TabsTrigger>
                    <TabsTrigger value="type">
                      <Type className="w-4 h-4 mr-2" />
                      Type
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="draw" className="mt-4">
                    <SignatureCanvas onSignatureChange={setSignatureDataUrl} />
                  </TabsContent>

                  <TabsContent value="type" className="mt-4">
                    <div className="bg-card p-4 rounded-lg border border-border space-y-4">
                      <p className="text-sm text-muted-foreground">Type your signature</p>
                      <Input
                        value={typedSignature}
                        onChange={(e) => setTypedSignature(e.target.value)}
                        placeholder="Your name..."
                        className="text-xl"
                      />
                      <div className="flex gap-2">
                        {(Object.entries(SIGNATURE_FONTS) as [SignatureFontStyle, typeof SIGNATURE_FONTS[SignatureFontStyle]][]).map(([key, font]) => (
                          <button
                            key={key}
                            onClick={() => setFontStyle(key)}
                            className={`flex-1 px-3 py-2 rounded border text-sm transition-colors ${
                              fontStyle === key
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-card text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            <span style={{ fontFamily: font.fontFamily }} className={font.className}>
                              {font.label}
                            </span>
                          </button>
                        ))}
                      </div>
                      {typedSignature && (
                        <div className="p-4 bg-muted/30 rounded text-center">
                          <span
                            className={`text-2xl text-foreground ${SIGNATURE_FONTS[fontStyle].className}`}
                            style={{ fontFamily: SIGNATURE_FONTS[fontStyle].fontFamily }}
                          >
                            {typedSignature}
                          </span>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="mt-4">
                    <div className="bg-card p-4 rounded-lg border border-border space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Upload a PNG, JPG, or WebP image of your handwritten signature. PNG transparency is preserved.
                      </p>
                      <input
                        ref={uploadInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleSignatureUpload}
                        className="hidden"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => uploadInputRef.current?.click()}>
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadedSignature ? "Replace image" : "Choose signature image"}
                        </Button>
                        {uploadedSignature && (
                          <Button variant="ghost" onClick={() => setUploadedSignature(null)}>
                            Remove
                          </Button>
                        )}
                      </div>
                      {uploadedSignature && (
                        <div className="p-4 bg-[repeating-conic-gradient(hsl(var(--muted))_0_25%,transparent_0_50%)] bg-[length:16px_16px] rounded text-center">
                          <img
                            src={uploadedSignature}
                            alt="Uploaded signature preview"
                            className="max-h-24 mx-auto object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <p className="text-sm text-muted-foreground mt-2 text-center">
                  <Plus className="w-3 h-3 inline mr-1" />
                  Click on any page below to place your signature
                </p>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground w-16 text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setFiles([])} className="ml-4">
                  Change File
                </Button>
              </div>

              {/* PDF Pages */}
              <div className="overflow-auto max-h-[70vh] bg-muted/30 rounded-lg p-4">
                {Array.from({ length: numPages }, (_, i) => (
                  <PDFPageView
                    key={i}
                    pdf={pdfDoc}
                    pageNumber={i + 1}
                    zoom={zoom}
                    signatures={signatures}
                    onSignatureMoved={handleSignatureMoved}
                    onSignatureResized={handleSignatureResized}
                    onSignatureRemoved={handleSignatureRemoved}
                    onSignatureToggleLock={handleSignatureToggleLock}
                    onPageClick={handlePageClick}
                    onPageDimensions={handlePageDimensions}
                  />
                ))}
              </div>

              {/* Export button */}
              <div className="max-w-2xl mx-auto">
                <Button
                  onClick={handleExport}
                  disabled={isProcessing || signatures.length === 0}
                  className="w-full bg-tool-sign hover:bg-tool-sign/90"
                >
                  {isProcessing ? "Processing..." : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Signed PDF ({signatures.length} signature{signatures.length !== 1 ? 's' : ''})
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <AdPlaceholder className="h-20" />
        </div>
        <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
};

export default SignPDF;
