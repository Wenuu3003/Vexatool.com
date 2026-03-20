import { useState, useCallback, useEffect } from "react";
import { PenTool, Download, Type, ZoomIn, ZoomOut, Plus } from "lucide-react";
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
  const [signatureType, setSignatureType] = useState<"draw" | "type">("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [fontStyle, setFontStyle] = useState<SignatureFontStyle>("script");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
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
    const hasSignature = signatureType === "draw" ? signatureDataUrl : signatureText;

    if (!hasSignature) {
      toast({
        title: "No signature",
        description: "Create a signature first, then click on the page to place it.",
        variant: "destructive",
      });
      return;
    }

    let renderedSignature = signatureType === "draw" ? signatureDataUrl ?? undefined : undefined;

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
    toast({ title: "Signature placed", description: "Drag to reposition or click again to add another." });
  }, [fontStyle, renderTypedSignatureToImage, signatureDataUrl, signatureType, toast, typedSignature]);

  const handleSignatureMoved = useCallback((id: string, x: number, y: number) => {
    setSignatures((prev) => prev.map((signature) => signature.id === id ? { ...signature, x, y } : signature));
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

        const signatureImage = await pdfLibDoc.embedPng(imageDataUrl);
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
    whatIs: "Sign PDF is a free online tool that allows you to add your personal signature to PDF documents quickly and securely. Whether you need to sign a contract, authorize an agreement, approve a form, or endorse a document, this tool eliminates the need to print, hand-sign, scan, and re-upload. You can either draw your signature using your mouse, touchpad, or touchscreen, or type your name to create an elegant styled signature. The entire process happens within your browser — your documents and signatures are never uploaded to any server, making it safe for confidential contracts, legal paperwork, HR documents, and financial agreements.",
    howToUse: [
      "Upload your PDF file by clicking the upload area or dragging and dropping.",
      "Choose between 'Draw Signature' or 'Type Signature' mode.",
      "Draw or type your signature in the panel.",
      "Click on any page in the PDF preview to place your signature.",
      "Drag signatures to reposition them. Use lock to prevent accidental moves.",
      "Click 'Download Signed PDF' to export with all signatures embedded."
    ],
    features: [
      "Draw signatures with mouse, touchpad, or touchscreen.",
      "Type-to-signature with elegant italic styling.",
      "Place signatures on any page by clicking.",
      "Drag to reposition, lock to prevent accidental moves.",
      "Zoom in/out for precise placement.",
      "Multiple signatures on multiple pages.",
      "High-quality PDF export preserving original formatting.",
      "No account or payment required."
    ],
    safetyNote: "Your PDF files and signatures are processed entirely in your browser. No documents or personal data are uploaded to any server.",
    faqs: [
      { question: "Where will my signature appear?", answer: "Click anywhere on a PDF page to place your signature. You can drag it to reposition." },
      { question: "Can I sign multiple pages?", answer: "Yes! Click on any page to add signatures. You can place multiple signatures across different pages." },
      { question: "Can I move my signature after placing it?", answer: "Yes, drag the signature to reposition it. Use the lock button to prevent accidental moves." },
      { question: "Does the signature work on mobile?", answer: "Yes! The drawing canvas and page interactions are fully touch-optimized." },
      { question: "Will the signed PDF have a watermark?", answer: "No. VexaTool never adds watermarks or branding to your documents." },
      { question: "Is there a file size limit?", answer: "No strict limit, but files under 100MB work best." }
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
                <Tabs value={signatureType} onValueChange={(v) => setSignatureType(v as "draw" | "type")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="draw">
                      <PenTool className="w-4 h-4 mr-2" />
                      Draw Signature
                    </TabsTrigger>
                    <TabsTrigger value="type">
                      <Type className="w-4 h-4 mr-2" />
                      Type Signature
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
