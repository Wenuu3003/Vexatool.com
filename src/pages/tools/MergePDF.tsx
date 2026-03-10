import { useState, useCallback } from "react";
import { Layers, Download, AlertTriangle, CheckCircle } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { PDFDocument } from "pdf-lib";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";

interface FileStatus {
  name: string;
  pages: number;
  status: "pending" | "loading" | "ready" | "error";
  error?: string;
}

const MergePDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");

  const handleFilesChange = useCallback(async (newFiles: File[]) => {
    setFiles(newFiles);
    
    // Pre-validate each file
    const statuses: FileStatus[] = [];
    for (const file of newFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const header = new Uint8Array(arrayBuffer.slice(0, 5));
        const headerStr = String.fromCharCode(...header);
        
        if (!headerStr.startsWith("%PDF")) {
          statuses.push({
            name: file.name,
            pages: 0,
            status: "error",
            error: "Not a valid PDF file",
          });
          continue;
        }

        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        statuses.push({
          name: file.name,
          pages: pdf.getPageCount(),
          status: "ready",
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        const isEncrypted =
          message.includes("encrypted") || message.includes("password");
        statuses.push({
          name: file.name,
          pages: 0,
          status: "error",
          error: isEncrypted
            ? "Password-protected — unlock it first"
            : "Could not read this PDF",
        });
      }
    }
    setFileStatuses(statuses);
  }, []);

  const readyCount = fileStatuses.filter((s) => s.status === "ready").length;
  const hasErrors = fileStatuses.some((s) => s.status === "error");
  const totalPages = fileStatuses.reduce((sum, s) => sum + s.pages, 0);

  const handleMerge = async () => {
    if (readyCount < 2) {
      toast({
        title: "Not enough valid files",
        description: "At least 2 readable PDF files are needed to merge.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProgressLabel("Creating merged document…");

    try {
      const mergedPdf = await PDFDocument.create();
      let processedFiles = 0;

      for (let i = 0; i < files.length; i++) {
        const status = fileStatuses[i];
        if (status.status !== "ready") continue;

        setProgressLabel(`Processing "${files[i].name}" (${processedFiles + 1}/${readyCount})…`);

        const arrayBuffer = await files[i].arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));

        processedFiles++;
        setProgress(Math.round((processedFiles / readyCount) * 90));
      }

      setProgressLabel("Saving merged PDF…");
      setProgress(92);

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      setProgress(98);

      const link = document.createElement("a");
      link.href = url;
      link.download = `merged_${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      setProgress(100);
      setProgressLabel("Done!");

      toast({
        title: "Merge complete!",
        description: `${processedFiles} files merged into ${mergedPdf.getPageCount()} pages.`,
      });

      setFiles([]);
      setFileStatuses([]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "";
      if (import.meta.env.DEV) {
        console.error("Merge error:", error);
      }

      let description = "Failed to merge PDFs. Please try again.";
      if (message.includes("encrypted") || message.includes("password")) {
        description =
          "One or more files are password-protected. Please unlock them first using the Unlock PDF tool.";
      } else if (message.includes("Invalid") || message.includes("parse")) {
        description =
          "One or more files appear to be corrupted. Try repairing them with the Repair PDF tool.";
      }

      toast({
        title: "Merge failed",
        description,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressLabel("");
    }
  };

  return (
    <>
      <CanonicalHead
        title="Merge PDF Online Free – Combine Multiple PDFs Into One | VexaTool"
        description="Free online PDF merger. Combine multiple PDF files into one document instantly. No signup, no watermarks, 100% secure browser-based processing. Best free PDF merge tool in India."
        keywords="merge PDF online, combine PDF free, join PDF files, PDF merger online, free PDF combine, merge PDF India, combine multiple PDFs, how to merge PDF without software, secure PDF merging, best PDF merger online"
      />
      <ToolLayout
        title="Merge PDF Online Free"
        description="Combine multiple PDF files into one document — fast, free, no signup required"
        icon={Layers}
        colorClass="bg-tool-merge"
      >
        <FileUpload
          files={files}
          onFilesChange={handleFilesChange}
          multiple
          maxFiles={20}
          colorClass="bg-tool-merge"
        />

        {/* Per-file validation feedback */}
        {fileStatuses.length > 0 && (
          <div className="mt-4 max-w-2xl mx-auto space-y-2">
            <p className="text-sm text-muted-foreground">
              {readyCount} of {fileStatuses.length} file(s) ready • {totalPages} total pages
            </p>
            {fileStatuses
              .filter((s) => s.status === "error")
              .map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 text-sm rounded-lg bg-destructive/10 border border-destructive/20"
                >
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <span className="text-destructive">
                    <strong>{s.name}:</strong> {s.error}
                  </span>
                </div>
              ))}
            {readyCount === fileStatuses.length && fileStatuses.length >= 2 && (
              <div className="flex items-center gap-2 p-2 text-sm rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-green-700 dark:text-green-400">
                  All files validated and ready to merge
                </span>
              </div>
            )}
          </div>
        )}

        {readyCount >= 2 && (
          <div className="mt-6 max-w-md mx-auto space-y-4">
            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  {progressLabel}
                </p>
              </div>
            )}
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleMerge}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  "Merging…"
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Merge & Download ({readyCount} files, {totalPages} pages)
                  </>
                )}
              </Button>
              {hasErrors && !isProcessing && (
                <p className="text-xs text-muted-foreground mt-2">
                  Files with errors will be skipped
                </p>
              )}
            </div>
          </div>
        )}

        <ToolSEOContent
          toolName="Merge PDF"
          whatIs="PDF merging is the process of combining two or more separate PDF documents into a single, unified file. It's one of the most common document tasks — whether you're a student bundling assignment pages for a college portal, a professional compiling reports for a client presentation, or a job seeker combining your resume, cover letter, and certificates into one clean attachment. The concept is straightforward: your original files remain unchanged in content, but they're stitched together page by page into one downloadable PDF. Our free Merge PDF tool at VexaTool handles this entire process directly inside your web browser. Your files are never uploaded to any external server — the merging happens locally using client-side JavaScript, which means sensitive documents like Aadhaar cards, PAN cards, salary slips, contracts, and medical records stay completely private on your device. There's no registration, no daily usage limit, and no watermark added to your output. You get a clean, professional merged document every single time. Unlike desktop software that requires installation and often costs ₹1,500 or more per month, VexaTool works on any device with a browser — phones, tablets, laptops, Chromebooks — without downloading anything. Whether you're using a budget smartphone on a 3G connection or a high-end laptop with broadband, the experience is the same: fast, reliable, and completely free."
          howToUse={[
            "Open the Merge PDF tool on VexaTool — no account creation or login needed.",
            "Click the upload area or drag and drop your PDF files. You can add up to 20 files at once.",
            "Review the file list and rearrange them in your preferred order. The merged PDF will follow this exact sequence.",
            "Click the 'Merge & Download' button. Processing happens instantly in your browser.",
            "Your merged PDF downloads automatically — ready to share, email, upload, or print.",
            "Open the merged file to verify all pages, formatting, and images appear correctly.",
          ]}
          features={[
            "Combine up to 20 PDF files in a single operation with zero quality loss — fonts, images, hyperlinks, and bookmarks are fully preserved.",
            "100% browser-based processing — your files never leave your device, making this one of the most private PDF merge tools available online.",
            "No file size limits on individual documents — handle large reports, presentations, scanned documents, and image-heavy PDFs without restrictions.",
            "No registration, no login, no email verification — the tool is ready the moment the page loads.",
            "No watermarks, branding, or modifications added to your output — unlike many competitors that stamp their logo on free-tier results.",
            "Works on all devices and browsers — desktop, mobile, tablet. Fully responsive and optimized for slower connections.",
            "Drag-and-drop file ordering lets you control the exact page sequence before merging.",
            "Unlimited daily usage — merge as many times as you need without hitting daily caps or cooldown periods.",
          ]}
          safetyNote="Your privacy is our foundational principle. The entire PDF merging process runs locally inside your web browser using secure client-side JavaScript. Your documents are never uploaded to any server, never stored on any cloud, and never accessible to anyone — including us. Once you close the browser tab, all processed data is gone. This approach makes VexaTool one of the safest options for merging sensitive documents like identification cards, financial statements, legal agreements, and medical records. We follow GDPR-compliant practices and maintain a transparent privacy policy that explains exactly how every tool works."
          faqs={[
            { question: "How many PDF files can I merge at once?", answer: "You can merge up to 20 PDF files in a single operation. If you have more files, merge them in batches — combine the first 20 into one PDF, then merge that result with the next batch. There's no limit on how many times you can use the tool." },
            { question: "Will the merged PDF maintain the original formatting?", answer: "Yes — completely. Our merger preserves all original formatting, fonts, images, hyperlinks, bookmarks, and page layouts from each source PDF. The final document looks exactly like the originals placed one after another. Nothing is altered, compressed, or degraded." },
            { question: "Can I change the order of pages in the merged PDF?", answer: "You can arrange the order of files before merging, which determines the page sequence. For more detailed page-level reorganization after merging — like moving individual pages or deleting specific pages — use our Organize PDF or Edit PDF tool." },
            { question: "Is there a maximum file size for merging?", answer: "There's no strict file size limit. However, since processing happens in your browser, very large files (over 100 MB each) may take longer depending on your device's memory and processing power. For most everyday documents — reports, forms, certificates — the tool handles them instantly." },
            { question: "Can I merge PDFs on my phone or tablet?", answer: "Absolutely. VexaTool is fully responsive and works on any smartphone or tablet browser — Chrome, Safari, Firefox, Samsung Internet. Just open the tool, select files from your phone's storage, and merge. No app installation required." },
            { question: "Do I need to create an account to merge PDFs?", answer: "No. You don't need any account, registration, email verification, or login. Visit the page, upload your files, merge, and download. It works the same way every time — completely free and anonymous." },
            { question: "Will there be a watermark on the merged PDF?", answer: "Never. Unlike many other online PDF tools that add watermarks or branding to free-tier output, VexaTool never modifies your document. The merged PDF is clean and professional — exactly what you'd expect from a premium tool." },
            { question: "Are my files safe during the merge process?", answer: "Yes. All processing happens locally in your web browser using client-side JavaScript. Your files are never sent to any server, never stored anywhere, and never accessible to anyone. This makes VexaTool one of the most private PDF merge tools available online." },
            { question: "Can I merge password-protected PDFs?", answer: "Password-protected PDFs need to be unlocked before merging. Use our Unlock PDF tool to remove the password protection first, then merge the unlocked files. This ensures the merge process can read all pages correctly." },
            { question: "What if the merge process fails or seems slow?", answer: "If merging fails, try refreshing the page and re-uploading the files. Ensure the PDFs aren't corrupted — you can verify by opening them individually first. Very large or complex files with heavy images may take 10-30 seconds depending on your device. If issues persist, try using a different browser or clearing your browser cache." },
          ]}
        />
      </ToolLayout>
    </>
  );
};

export default MergePDF;
