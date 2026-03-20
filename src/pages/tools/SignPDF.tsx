import { useState, useCallback, useRef, useEffect } from "react";
import { PenTool, Download, Type, ZoomIn, ZoomOut, Plus } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { useFileHistory } from "@/hooks/useFileHistory";
import { AdPlaceholder } from "@/components/AdBanner";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";
import { pdfjsLib } from "@/lib/pdfWorker";
import SignatureCanvas from "@/components/sign-pdf/SignatureCanvas";
import PDFPageView from "@/components/sign-pdf/PDFPageView";
import type { SignatureObject, PageDimensions, SignatureFontStyle } from "@/components/sign-pdf/types";
import { SIGNATURE_FONTS } from "@/components/sign-pdf/types";

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
  const [pageDimensions, setPageDimensions] = useState<Map<number, PageDimensions>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { saveFileHistory } = useFileHistory();

  // Load PDF when file changes
  useEffect(() => {
    if (files.length === 0) {
      setPdfDoc(null);
      setNumPages(0);
      setSignatures([]);
      return;
    }

    let cancelled = false;
    const loadPdf = async () => {
      setIsLoading(true);
      try {
        const arrayBuffer = await files[0].arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        if (!cancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setSignatures([]);
        }
      } catch {
        if (!cancelled) {
          toast({ title: "Error", description: "Failed to load PDF", variant: "destructive" });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    loadPdf();
    return () => { cancelled = true; };
  }, [files]);

  const handlePageClick = useCallback((pageIndex: number, xRatio: number, yRatio: number) => {
    const hasSignature = signatureType === "draw" ? signatureDataUrl : typedSignature.trim();
    if (!hasSignature) {
      toast({ title: "No signature", description: "Create a signature first, then click on the page to place it", variant: "destructive" });
      return;
    }

    const sigWidth = 0.25;
    const sigHeight = 0.08;
    const newSig: SignatureObject = {
      id: `sig-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: signatureType,
      dataUrl: signatureType === "draw" ? signatureDataUrl! : undefined,
      text: signatureType === "type" ? typedSignature : undefined,
      fontStyle: signatureType === "type" ? fontStyle : undefined,
      pageIndex,
      x: Math.max(0, Math.min(1 - sigWidth, xRatio - sigWidth / 2)),
      y: Math.max(0, Math.min(1 - sigHeight, yRatio - sigHeight / 2)),
      width: sigWidth,
      height: sigHeight,
      locked: false,
    };
    setSignatures(prev => [...prev, newSig]);
    toast({ title: "Signature placed!", description: "Drag to reposition, or click the page again to add another." });
  }, [signatureType, signatureDataUrl, typedSignature, toast]);

  const handleSignatureMoved = useCallback((id: string, x: number, y: number) => {
    setSignatures(prev => prev.map(s => s.id === id ? { ...s, x, y } : s));
  }, []);

  const handleSignatureRemoved = useCallback((id: string) => {
    setSignatures(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleSignatureToggleLock = useCallback((id: string) => {
    setSignatures(prev => prev.map(s => s.id === id ? { ...s, locked: !s.locked } : s));
  }, []);

  const handlePageDimensions = useCallback((pageIndex: number, dims: PageDimensions) => {
    setPageDimensions(prev => {
      const next = new Map(prev);
      next.set(pageIndex, dims);
      return next;
    });
  }, []);

  /**
   * Render a typed signature to a PNG data-URL using an off-screen canvas,
   * so the chosen font style is baked into the image and preserved in the PDF.
   */
  const renderTypedSignatureToImage = (
    text: string,
    style: SignatureFontStyle,
    widthPx: number,
    heightPx: number
  ): string => {
    const canvas = document.createElement("canvas");
    const scale = 3; // hi-DPI sharpness
    canvas.width = widthPx * scale;
    canvas.height = heightPx * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);
    ctx.clearRect(0, 0, widthPx, heightPx);

    const fontDef = SIGNATURE_FONTS[style];
    const fontSize = Math.max(16, heightPx * 0.5);
    const italic = fontDef.className.includes("italic") ? "italic " : "";
    ctx.font = `${italic}${fontSize}px ${fontDef.fontFamily}`;
    ctx.fillStyle = "rgb(0, 0, 128)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, widthPx / 2, heightPx / 2);

    return canvas.toDataURL("image/png");
  };

  const handleExport = async () => {
    if (files.length === 0 || signatures.length === 0) {
      toast({ title: "Nothing to export", description: "Please add at least one signature", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdfLibDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfLibDoc.getPages();

      for (const sig of signatures) {
        const page = pages[sig.pageIndex];
        if (!page) continue;
        const { width: pw, height: ph } = page.getSize();
        const sigW = sig.width * pw;
        const sigH = sig.height * ph;

        if (sig.type === "type" && sig.text) {
          // Render typed signature as an image so the chosen font style is preserved
          const dataUrl = renderTypedSignatureToImage(
            sig.text,
            sig.fontStyle || "script",
            Math.round(sigW),
            Math.round(sigH)
          );
          const sigImage = await pdfLibDoc.embedPng(dataUrl);
          page.drawImage(sigImage, {
            x: sig.x * pw,
            y: ph - (sig.y + sig.height) * ph,
            width: sigW,
            height: sigH,
          });
        } else if (sig.type === "draw" && sig.dataUrl) {
          const sigImage = await pdfLibDoc.embedPng(sig.dataUrl);
          page.drawImage(sigImage, {
            x: sig.x * pw,
            y: ph - (sig.y + sig.height) * ph,
            width: sigW,
            height: sigH,
          });
        }
      }

      const pdfBytes = await pdfLibDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `signed_${files[0].name}`;
      link.click();
      URL.revokeObjectURL(url);

      await saveFileHistory(files[0].name, "pdf", "sign");
      toast({ title: "Success!", description: "Signed PDF downloaded" });
    } catch (error) {
      console.error("Export error:", error);
      toast({ title: "Error", description: "Failed to export signed PDF", variant: "destructive" });
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
