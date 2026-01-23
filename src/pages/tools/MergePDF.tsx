import { useState } from "react";
import { Layers, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { PDFDocument } from "pdf-lib";
import { toast } from "@/hooks/use-toast";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";

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
      <CanonicalHead 
        title="Merge PDF Files Online Free - Combine PDFs | Mypdfs"
        description="Free online PDF merger. Combine multiple PDF files into one document. Easy to use, no registration required."
        keywords="merge PDF, combine PDF, join PDF files, PDF merger, free PDF combine, online PDF merger"
      />
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

      <ToolSEOContent
        toolName="Merge PDF"
        whatIs="PDF merging is the process of combining multiple PDF documents into a single unified file. This is essential for organizing related documents, creating comprehensive reports, or consolidating paperwork for easier sharing and management. Our free online PDF merger allows you to combine unlimited PDF files quickly and securely, maintaining the original quality and formatting of each document. The merged output preserves all pages, bookmarks, and interactive elements from the source files."
        howToUse={[
          "Click the upload area or drag and drop multiple PDF files you want to merge.",
          "Arrange the files in your preferred order by reordering them if needed.",
          "Click the 'Merge & Download' button to combine all selected PDFs.",
          "Your merged PDF will download automatically as a single document."
        ]}
        features={[
          "Combine up to 20 PDF files in a single operation.",
          "Maintains original quality, formatting, and page layouts.",
          "Preserves bookmarks, hyperlinks, and interactive form fields.",
          "Fast browser-based processing without external uploads.",
          "No file size limits for individual documents.",
          "Free to use with no registration required."
        ]}
        safetyNote="All PDF processing occurs directly in your browser using secure client-side technology. Your documents are never uploaded to external servers, ensuring complete privacy and data security. Once merging is complete, files are immediately available for download without being stored anywhere."
        faqs={[
          {
            question: "How many PDF files can I merge at once?",
            answer: "You can merge up to 20 PDF files in a single operation. For larger batches, you can merge files in groups and then combine the resulting PDFs."
          },
          {
            question: "Will the merged PDF maintain the original formatting?",
            answer: "Yes, our merger preserves all original formatting, fonts, images, and layouts from each source PDF. The final document looks exactly like the originals combined."
          },
          {
            question: "Can I change the order of pages in the merged PDF?",
            answer: "You can arrange the order of files before merging. For more detailed page organization, use our Organize PDF tool after merging."
          },
          {
            question: "Is there a maximum file size for merging?",
            answer: "There is no strict limit, but browser memory constraints may affect very large files. For best results, we recommend individual files under 50MB each."
          }
        ]}
      />
      </ToolLayout>
    </>
  );
};

export default MergePDF;
