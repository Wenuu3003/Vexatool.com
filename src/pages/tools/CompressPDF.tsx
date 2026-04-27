import { useState } from "react";
import { FileDown, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { CanonicalHead } from "@/components/CanonicalHead";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import ToolSEOContent from "@/components/ToolSEOContent";
import { compressPDFSmart, type CompressionLevel } from "@/lib/pdfCompress";

const CompressPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [level, setLevel] = useState<CompressionLevel>("medium");
  const [progress, setProgress] = useState(0);

  const handleCompress = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to compress.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const originalSize = file.size;

      const result = await compressPDFSmart(arrayBuffer, {
        level,
        onProgress: (current, total) => {
          setProgress(Math.round((current / total) * 100));
        },
      });

      // Safety net: if for any reason output is larger, send the original.
      const finalBytes = result.reduced ? result.bytes : new Uint8Array(arrayBuffer);
      const finalSize = finalBytes.byteLength;
      const savings = ((originalSize - finalSize) / originalSize) * 100;

      setCompressedSize(finalSize);

      const compressedBlob = new Blob([finalBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(compressedBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.reduced ? `compressed_${file.name}` : file.name;
      link.click();
      URL.revokeObjectURL(url);

      if (result.reduced && savings >= 1) {
        toast({
          title: "Compression complete!",
          description: `File size reduced by ${savings.toFixed(1)}% (${formatSize(originalSize)} → ${formatSize(finalSize)})`,
        });
      } else {
        toast({
          title: "This PDF is already optimized",
          description: `No further reduction possible. Original file downloaded unchanged (${formatSize(originalSize)}).`,
        });
      }

      setFiles([]);
      setCompressedSize(null);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Compress error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to compress PDF. The file may be corrupted or password-protected.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  return (
    <>
      <CanonicalHead 
        title="Compress PDF Online Free | Reduce PDF Size Fast"
        description="Compress PDF files online for free. Reduce file size quickly without losing quality. Fast, secure, and works on all devices."
        keywords="compress PDF free, reduce PDF size online, PDF compressor free, shrink PDF, optimize PDF, free PDF compression, compress PDF India, reduce PDF file size"
      />
      <ToolLayout
        title="Compress PDF Online for Free – Reduce File Size Fast & Secure"
        description="Shrink PDF files in seconds — right in your browser, with no uploads and no signup."
        icon={FileDown}
        colorClass="bg-tool-compress"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Compression Level</Label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: "low", title: "Low", subtitle: "Best quality" },
                { id: "medium", title: "Medium", subtitle: "Balanced" },
                { id: "high", title: "High", subtitle: "Smallest file" },
              ] as const).map((opt) => {
                const active = level === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLevel(opt.id)}
                    disabled={isProcessing}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      active
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/50"
                    } disabled:opacity-50`}
                    aria-pressed={active}
                  >
                    <div className="font-medium text-sm">{opt.title}</div>
                    <div className="text-xs text-muted-foreground">{opt.subtitle}</div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Medium works best for most PDFs. Choose High for image-heavy or scanned documents.
            </p>
          </div>

          <FileUpload
            files={files}
            onFilesChange={setFiles}
            colorClass="bg-tool-compress"
          />

          {files.length > 0 && (
            <div className="mt-8 text-center space-y-4">
              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full max-w-md mx-auto" />
                  <p className="text-sm text-muted-foreground">Compressing page {Math.ceil((progress / 100) * files.length) || 1}...</p>
                </div>
              )}
              <Button
                size="lg"
                onClick={handleCompress}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  "Compressing..."
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Compress & Download
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                Current file size: {formatSize(files[0].size)}
              </p>
              {compressedSize && (
                <p className="text-sm text-primary font-medium">
                  Compressed size: {formatSize(compressedSize)}
                </p>
              )}
            </div>
          )}
        </div>

        <ToolSEOContent
          toolName="Compress PDF"
          whatIs="PDF compression reduces the file size of a PDF document while keeping the text readable and the layout intact. Large PDFs are slow to email, painful to upload to government portals, and eat up storage on your phone or laptop. This free online Compress PDF tool from VexaTool shrinks your file directly in your browser — nothing is sent to a server. Your invoices, assignments, ID proofs and reports stay on your device the entire time. Pick a compression level (Low, Medium or High), and the tool optimizes images, strips unused metadata and rewrites the PDF structure to give you a smaller file you can share over WhatsApp, Gmail, or any portal in seconds."
          howToUse={[
            "Upload your PDF file from your device.",
            "Choose a compression level — Low, Medium or High.",
            "Click 'Compress & Download' to process the file.",
            "Download your reduced-size PDF instantly."
          ]}
          features={[
            "Fast compression — most PDFs finish in just a few seconds.",
            "Multiple compression levels (Low, Medium, High) to match your need.",
            "No signup, no email, and no daily limits — completely free.",
            "Secure by design — files are never uploaded to any server.",
            "Works smoothly on mobile, tablet, and desktop browsers.",
            "Best for students, office workers, and anyone sharing PDFs online."
          ]}
          safetyNote="Your PDF is processed entirely inside your browser. Nothing is uploaded, stored, or shared with any server, so your documents stay 100% private. The original file on your device is never modified — you only get an additional, smaller copy to download."
          faqs={[
            { question: "How does PDF compression work?", answer: "The tool re-encodes images inside your PDF at a lower resolution, removes unused metadata, and rewrites the file with object streams. The result is a smaller PDF that still looks the same when opened." },
            { question: "Will quality reduce after compression?", answer: "At Low and Medium levels the quality difference is barely noticeable. High compression slightly softens images to give you the smallest possible file. Text always stays sharp." },
            { question: "Is it safe to compress PDFs online?", answer: "Yes. This tool runs entirely inside your browser — your PDF is never uploaded to a server, so even sensitive documents like ID proofs, invoices, or contracts stay private." },
            { question: "Why is my PDF not reducing much?", answer: "If your PDF is mostly text, or has already been optimized, there is very little to compress. In that case the tool tells you 'This PDF is already optimized' and gives you back the original file." },
            { question: "Does this tool work on mobile?", answer: "Yes. The Compress PDF tool works on Android and iPhone browsers (Chrome, Safari, Edge) just like it does on a laptop — no app install needed." }
          ]}
        />

        {/* Quick benefits + internal links + CTA — content only, no logic changes */}
        <section className="mt-12 space-y-8 text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">Why Use Our Compress PDF Tool?</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li><strong>Students:</strong> Submit assignments, projects and scanned answer sheets within college portal size limits.</li>
              <li><strong>Email attachments:</strong> Stay under Gmail/Outlook 25 MB limits without splitting your document.</li>
              <li><strong>Office sharing:</strong> Send contracts, invoices and reports faster over WhatsApp, Slack or Teams.</li>
              <li><strong>Faster uploads:</strong> Reduce upload time on slow networks and government portals.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3">Related PDF Tools & Guides</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                Combine multiple PDFs into one with the{" "}
                <Link to="/merge-pdf" className="text-primary hover:underline">Merge PDF tool</Link>.
              </li>
              <li>
                Convert your compressed PDF into an editable document using{" "}
                <Link to="/pdf-to-word" className="text-primary hover:underline">PDF to Word</Link>.
              </li>
              <li>
                Read our guide:{" "}
                <Link to="/blog/how-to-merge-pdf-files-online-complete-guide" className="text-primary hover:underline">
                  How to Manage and Share PDF Files Efficiently
                </Link>.
              </li>
            </ul>
          </div>

          <div className="text-center pt-4">
            <Button
              size="lg"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="gap-2"
            >
              <FileDown className="w-5 h-5" />
              Try Compress PDF Now
            </Button>
          </div>
        </section>
      </ToolLayout>
    </>
  );
};

export default CompressPDF;
