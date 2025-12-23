import { useState } from "react";
import { Layers, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { PDFDocument } from "pdf-lib";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";

const MergePDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMerge = async () => {
    if (files.length < 2) {
      toast({
        title: "Not enough files",
        description: "Please select at least 2 PDF files to merge.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "merged.pdf";
      link.click();

      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "Your PDFs have been merged successfully.",
      });

      setFiles([]);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Merge error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to merge PDFs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Merge PDF Files Online Free - Combine PDFs | Mypdfs</title>
        <meta name="description" content="Free online PDF merger. Combine multiple PDF files into one document. Easy to use, no registration required. Merge PDFs instantly." />
        <meta name="keywords" content="merge PDF, combine PDF, join PDF files, PDF merger, free PDF combine, online PDF merger" />
        <link rel="canonical" href="https://mypdfs.lovable.app/merge-pdf" />
      </Helmet>
      <ToolLayout
        title="Merge PDF"
        description="Combine multiple PDF files into one document"
        icon={Layers}
        colorClass="bg-tool-merge"
      >
      <FileUpload
        files={files}
        onFilesChange={setFiles}
        multiple
        maxFiles={20}
        colorClass="bg-tool-merge"
      />

      {files.length >= 2 && (
        <div className="mt-8 text-center">
          <Button
            size="lg"
            onClick={handleMerge}
            disabled={isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              "Merging..."
            ) : (
              <>
                <Download className="w-5 h-5" />
                Merge & Download
              </>
            )}
          </Button>
        </div>
      )}
      </ToolLayout>
    </>
  );
};

export default MergePDF;
