import { useState } from "react";
import { Scissors, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDocument } from "pdf-lib";
import { toast } from "@/hooks/use-toast";

const SplitPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageRange, setPageRange] = useState("");
  const [totalPages, setTotalPages] = useState<number | null>(null);

  const handleFileChange = async (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      try {
        const arrayBuffer = await newFiles[0].arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        setTotalPages(pdf.getPageCount());
      } catch {
        setTotalPages(null);
      }
    } else {
      setTotalPages(null);
    }
  };

  const parsePageRange = (range: string, maxPages: number): number[] => {
    const pages: number[] = [];
    const parts = range.split(",");

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [start, end] = trimmed.split("-").map((n) => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
            if (!pages.includes(i - 1)) pages.push(i - 1);
          }
        }
      } else {
        const num = parseInt(trimmed);
        if (!isNaN(num) && num >= 1 && num <= maxPages && !pages.includes(num - 1)) {
          pages.push(num - 1);
        }
      }
    }

    return pages.sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to split.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const maxPages = pdf.getPageCount();

      const pageIndices = pageRange
        ? parsePageRange(pageRange, maxPages)
        : pdf.getPageIndices();

      if (pageIndices.length === 0) {
        toast({
          title: "Invalid page range",
          description: "Please enter a valid page range.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdf, pageIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "split.pdf";
      link.click();

      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: `Extracted ${pageIndices.length} page(s) successfully.`,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Split error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to split PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Split PDF"
      description="Extract specific pages from your PDF document"
      icon={Scissors}
      colorClass="bg-tool-split"
    >
      <FileUpload
        files={files}
        onFilesChange={handleFileChange}
        colorClass="bg-tool-split"
      />

      {files.length > 0 && totalPages && (
        <div className="mt-8 max-w-md mx-auto space-y-4">
          <div className="p-4 bg-card rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-2">
              Total pages: <span className="font-semibold text-foreground">{totalPages}</span>
            </p>
            <Label htmlFor="pageRange" className="text-sm font-medium">
              Page range (e.g., 1-3, 5, 7-10)
            </Label>
            <Input
              id="pageRange"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              placeholder="Leave empty to extract all pages"
              className="mt-2"
            />
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={handleSplit}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Split & Download
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
};

export default SplitPDF;
