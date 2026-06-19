import { useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { compressPDFToTarget, type TargetCompressResult } from "@/lib/pdfCompress";

const PRESETS_KB: Array<{ id: string; label: string; bytes: number }> = [
  { id: "50", label: "50 KB", bytes: 50 * 1024 },
  { id: "100", label: "100 KB", bytes: 100 * 1024 },
  { id: "200", label: "200 KB", bytes: 200 * 1024 },
  { id: "300", label: "300 KB", bytes: 300 * 1024 },
  { id: "500", label: "500 KB", bytes: 500 * 1024 },
  { id: "1024", label: "1 MB", bytes: 1024 * 1024 },
  { id: "custom", label: "Custom", bytes: 0 },
];

const CompressPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [presetId, setPresetId] = useState<string>("200");
  const [customValue, setCustomValue] = useState<string>("250");
  const [customUnit, setCustomUnit] = useState<"KB" | "MB">("KB");
  const [result, setResult] = useState<TargetCompressResult | null>(null);
  const [pendingDownload, setPendingDownload] = useState<TargetCompressResult | null>(null);
  const [showQualityWarning, setShowQualityWarning] = useState(false);
  const [showImpossible, setShowImpossible] = useState(false);

  const targetBytes = useMemo(() => {
    if (presetId === "custom") {
      const n = parseFloat(customValue);
      if (!isFinite(n) || n <= 0) return 0;
      return Math.round(n * (customUnit === "MB" ? 1024 * 1024 : 1024));
    }
    const p = PRESETS_KB.find((p) => p.id === presetId);
    return p ? p.bytes : 0;
  }, [presetId, customValue, customUnit]);

  const triggerDownload = (r: TargetCompressResult, originalName: string) => {
    const blob = new Blob([r.bytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = r.reduced ? `compressed_${originalName}` : originalName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCompress = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to compress.",
        variant: "destructive",
      });
      return;
    }
    if (!targetBytes || targetBytes < 5 * 1024) {
      toast({
        title: "Invalid target size",
        description: "Please enter a target size of at least 5 KB.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const r = await compressPDFToTarget(arrayBuffer, {
        targetBytes,
        onProgress: (current, total) => {
          setProgress(Math.round((current / total) * 100));
        },
      });
      setResult(r);

      // Decision tree based on outcome.
      if (!r.achievedTarget) {
        // Target not achievable while preserving readability.
        setPendingDownload(r);
        setShowImpossible(true);
        return;
      }

      // Achieved. Warn when we pushed to very low quality (final size ≤ 60% of target
      // AND target is below 25% of original — i.e. aggressive shrink).
      const aggressive =
        r.targetSize < r.originalSize * 0.25 &&
        r.presetUsed != null &&
        r.presetUsed.dpi <= 90;
      if (aggressive) {
        setPendingDownload(r);
        setShowQualityWarning(true);
        return;
      }

      triggerDownload(r, file.name);
      toast({
        title: "Compression complete",
        description: `${formatSize(r.originalSize)} → ${formatSize(r.compressedSize)} (${(((r.originalSize - r.compressedSize) / r.originalSize) * 100).toFixed(1)}% smaller)`,
      });
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
        description="Compress PDF to an exact size — 50 KB, 100 KB, 200 KB, 1 MB or any custom KB/MB. Free, in-browser, with quality warnings and nearest-achievable-size suggestions."
        keywords="compress PDF to 100 KB, compress PDF to 200 KB, compress PDF to specific size, reduce PDF size online, PDF compressor free, shrink PDF, custom size PDF compressor, compress PDF India"
      />
      <ToolLayout
        title="Compress PDF to Exact Size – 50 KB, 100 KB, 200 KB or Custom"
        description="Pick a target size in KB or MB. We compress in your browser to the highest quality that fits — with a warning if your target isn't achievable."
        icon={FileDown}
        colorClass="bg-tool-compress"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Target File Size</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {PRESETS_KB.map((opt) => {
                const active = presetId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPresetId(opt.id)}
                    disabled={isProcessing}
                    className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                      active
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/50"
                    } disabled:opacity-50`}
                    aria-pressed={active}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {presetId === "custom" && (
              <div className="flex items-center gap-2 pt-2">
                <Input
                  type="number"
                  inputMode="decimal"
                  min={1}
                  step="any"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  disabled={isProcessing}
                  className="max-w-[140px]"
                  aria-label="Custom target size"
                />
                <div className="inline-flex rounded-md border border-border overflow-hidden">
                  {(["KB", "MB"] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setCustomUnit(u)}
                      disabled={isProcessing}
                      className={`px-3 py-2 text-sm ${
                        customUnit === u ? "bg-primary text-primary-foreground" : "bg-background"
                      }`}
                      aria-pressed={customUnit === u}
                    >
                      {u}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  Target: {targetBytes ? formatSize(targetBytes) : "—"}
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              We compress in your browser to the highest quality that fits your target size. Image-heavy PDFs shrink the most.
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
                  <p className="text-sm text-muted-foreground">
                    Optimising… {progress}%
                  </p>
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
                {targetBytes ? <> · Target: {formatSize(targetBytes)}</> : null}
              </p>
              {result && !showQualityWarning && !showImpossible && (
                <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-4 text-left">
                  <h3 className="text-sm font-semibold mb-2">Compression Result</h3>
                  <dl className="grid grid-cols-2 gap-y-1 text-sm">
                    <dt className="text-muted-foreground">Original Size</dt>
                    <dd className="text-right">{formatSize(result.originalSize)}</dd>
                    <dt className="text-muted-foreground">Compressed Size</dt>
                    <dd className="text-right font-medium">{formatSize(result.compressedSize)}</dd>
                    <dt className="text-muted-foreground">Size Saved</dt>
                    <dd className="text-right">
                      {formatSize(Math.max(0, result.originalSize - result.compressedSize))}
                    </dd>
                    <dt className="text-muted-foreground">Reduction</dt>
                    <dd className="text-right font-medium text-primary">
                      {result.originalSize > 0
                        ? `${(((result.originalSize - result.compressedSize) / result.originalSize) * 100).toFixed(1)}%`
                        : "0%"}
                    </dd>
                  </dl>
                </div>
              )}
            </div>
          )}
        </div>

        <AlertDialog open={showQualityWarning} onOpenChange={setShowQualityWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Quality may be reduced significantly</AlertDialogTitle>
              <AlertDialogDescription>
                Reaching {pendingDownload ? formatSize(pendingDownload.targetSize) : ""} from{" "}
                {pendingDownload ? formatSize(pendingDownload.originalSize) : ""} required strong
                image down-sampling. Text will stay readable, but images may look soft.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setPendingDownload(null);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <Button
                variant="outline"
                onClick={() => {
                  if (!pendingDownload || files.length === 0) return;
                  // Recommend roughly 2x the requested target (or 30% of original, whichever is smaller).
                  const recommended = Math.min(
                    Math.round(pendingDownload.targetSize * 2),
                    Math.round(pendingDownload.originalSize * 0.3)
                  );
                  setShowQualityWarning(false);
                  setPendingDownload(null);
                  setPresetId("custom");
                  setCustomValue(String(Math.max(50, Math.round(recommended / 1024))));
                  setCustomUnit("KB");
                  toast({
                    title: "Recommended size applied",
                    description: `Target adjusted to ~${formatSize(recommended)}. Click Compress again.`,
                  });
                }}
              >
                Use Recommended Size
              </Button>
              <AlertDialogAction
                onClick={() => {
                  if (pendingDownload && files[0]) {
                    triggerDownload(pendingDownload, files[0].name);
                  }
                  setPendingDownload(null);
                }}
              >
                Continue & Download
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showImpossible} onOpenChange={setShowImpossible}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Target size cannot be achieved</AlertDialogTitle>
              <AlertDialogDescription>
                The smallest file we can produce while keeping this PDF readable is{" "}
                <strong>{pendingDownload ? formatSize(pendingDownload.minAchievableSize) : ""}</strong>.
                You requested {pendingDownload ? formatSize(pendingDownload.targetSize) : ""}, which
                would corrupt document integrity. Try a nearest achievable size of around{" "}
                <strong>
                  {pendingDownload
                    ? formatSize(Math.ceil(pendingDownload.minAchievableSize / 1024) * 1024)
                    : ""}
                </strong>
                .
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingDownload(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (pendingDownload && files[0]) {
                    triggerDownload(pendingDownload, files[0].name);
                  }
                  setPendingDownload(null);
                }}
              >
                Download Smallest Possible
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ToolSEOContent
          toolName="Compress PDF"
          whatIs="PDF compression reduces the file size of a PDF document while keeping the text readable and the layout intact. Large PDFs are slow to email, painful to upload to government portals, and eat up storage on your phone or laptop. VexaTool's Compress PDF tool uses target-size compression: you pick the exact size you want — 50 KB, 100 KB, 200 KB, 1 MB or any custom KB/MB value — and a binary-search engine finds the highest quality preset that fits inside your target. Everything runs in your browser, so invoices, assignments and ID proofs never leave your device. If your target is too small to be achievable while keeping the PDF readable, the tool tells you the nearest achievable size instead of producing a broken file, and a quality warning appears when aggressive down-sampling is required."
          howToUse={[
            "Upload your PDF file from your device.",
            "Pick a target size preset (50 KB, 100 KB, 200 KB, 300 KB, 500 KB, 1 MB) or choose Custom and type any KB/MB value.",
            "Click 'Compress & Download'. The engine tries multiple quality settings and picks the best fit for your target.",
            "Review the compression result panel — original size, compressed size, bytes saved and reduction %. If a warning appears, accept the recommended size or continue with the smallest possible file."
          ]}
          features={[
            "Target-size compression — set the exact KB or MB you want, not a vague Low/Medium/High slider.",
            "Presets for the sizes portals ask for most: 50 KB, 100 KB, 200 KB, 300 KB, 500 KB and 1 MB.",
            "Custom KB/MB input for any size requirement.",
            "Quality warning system — alerts you when reaching the target requires strong image down-sampling.",
            "Nearest achievable size suggestion when a target is mathematically impossible to hit without corrupting the file.",
            "Compression result panel showing original size, compressed size, bytes saved and reduction %.",
            "100% in-browser processing — files are never uploaded to any server."
          ]}
          safetyNote="Your PDF is processed entirely inside your browser. Nothing is uploaded, stored, or shared with any server, so your documents stay 100% private. The original file on your device is never modified — you only get an additional, smaller copy to download."
          faqs={[
            { question: "How does target-size compression work?", answer: "You choose the exact size you want (e.g. 100 KB or 1 MB). The engine first tries a lossless re-save, then runs a binary search across a ladder of image resolutions (DPI) and JPEG quality settings, picking the highest-quality preset whose output still fits inside your target." },
            { question: "What if my target size is too small?", answer: "The tool probes the lowest-quality preset to find the smallest readable size it can produce. If your target is below that floor, a 'Target size cannot be achieved' dialog tells you the nearest achievable size — so you never get a corrupted PDF." },
            { question: "What is the quality warning?", answer: "When reaching a small target requires strong image down-sampling (low DPI), the tool shows a 'Quality may be reduced significantly' dialog. You can accept a recommended larger size, continue and download anyway, or cancel." },
            { question: "Can I enter a custom size in KB or MB?", answer: "Yes. Pick the 'Custom' preset, type any number, and switch between KB and MB. The minimum accepted target is 5 KB." },
            { question: "What does the compression result panel show?", answer: "After every successful compression you see the original size, the compressed size, the exact bytes saved and the reduction percentage — so you can verify the file fits your portal's limit before uploading." },
            { question: "Is it safe to compress PDFs online?", answer: "Yes. The tool runs entirely inside your browser — your PDF is never uploaded to a server, so even sensitive documents like ID proofs, invoices or contracts stay private." },
            { question: "Does this tool work on mobile?", answer: "Yes. Compress PDF works on Android and iPhone browsers (Chrome, Safari, Edge) just like it does on a laptop — no app install needed." }
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
                  How to Merge PDF Files Online — Complete Guide
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
