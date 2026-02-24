import { useState } from "react";
import { LayoutGrid, Download, GripVertical } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { PDFDocument } from "pdf-lib";
import { toast } from "@/hooks/use-toast";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";

const OrganizePDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const handleFileChange = async (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      try {
        const arrayBuffer = await newFiles[0].arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const count = pdf.getPageCount();
        setTotalPages(count);
        setPageOrder(Array.from({ length: count }, (_, i) => i));
      } catch {
        setTotalPages(0);
        setPageOrder([]);
      }
    } else {
      setTotalPages(0);
      setPageOrder([]);
    }
  };

  const movePage = (from: number, to: number) => {
    const newOrder = [...pageOrder];
    const [removed] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, removed);
    setPageOrder(newOrder);
  };

  const handleOrganize = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to organize.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdf, pageOrder);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "organized.pdf";
      link.click();

      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "PDF pages reorganized successfully.",
      });

      setFiles([]);
      setPageOrder([]);
      setTotalPages(0);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Organize error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to organize PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const seoContent = {
    toolName: "Organize PDF",
    whatIs: "Organize PDF is a free online tool that allows you to reorder pages within your PDF documents using a simple drag-and-drop interface. Whether you need to rearrange pages that were scanned out of order, reorganize a report, or customize the page sequence of a presentation, this tool makes it quick and easy without requiring any software installation.",
    howToUse: [
      "Upload your PDF file by clicking the upload area or dragging and dropping.",
      "View the page tiles showing the current order of your PDF pages.",
      "Drag and drop the page tiles to rearrange them in your desired order.",
      "Click 'Save & Download' to create your reorganized PDF.",
      "Your new PDF will download with pages in the new order."
    ],
    features: [
      "Intuitive drag-and-drop interface",
      "Visual page representation for easy organization",
      "Works with PDFs of any size",
      "Maintains original page quality",
      "No page limit restrictions",
      "Instant processing and download"
    ],
    safetyNote: "Your PDF files are processed entirely in your browser using secure client-side technology. No files are uploaded to any server during the reorganization process, ensuring complete privacy for your documents.",
    faqs: [
      { question: "Can I delete pages while organizing?", answer: "This tool focuses on reordering pages. To delete specific pages, use our Split PDF tool to extract only the pages you need, then merge them if necessary." },
      { question: "Will reorganizing affect my PDF quality?", answer: "No, reorganizing only changes the page order. All content, formatting, and quality remain exactly the same as the original document." },
      { question: "How do I move a page to a specific position?", answer: "Simply drag the page tile and drop it in the desired position. The other pages will automatically shift to accommodate the moved page." },
      { question: "Can I undo my changes?", answer: "The original PDF remains unchanged until you download. Simply refresh the page or re-upload your file to start over with the original page order." }
    ]
  };

  return (
    <>
      <CanonicalHead 
        title="Organize PDF Pages Free Online - Reorder PDF | VexaTool"
        description="Free online PDF organizer. Reorder, rearrange, and reorganize PDF pages with drag and drop."
        keywords="organize PDF, reorder PDF pages, rearrange PDF, PDF page order, sort PDF pages, free PDF organizer"
      />
      <ToolLayout
        title="Organize PDF"
        description="Reorder pages in your PDF document"
        icon={LayoutGrid}
        colorClass="bg-tool-organize"
      >
      <FileUpload
        files={files}
        onFilesChange={handleFileChange}
        colorClass="bg-tool-organize"
      />

      {files.length > 0 && totalPages > 0 && (
        <div className="mt-8 max-w-2xl mx-auto space-y-6">
          <div className="p-4 bg-card rounded-lg border border-border">
            <h3 className="font-medium text-foreground mb-4">
              Drag to reorder pages ({totalPages} pages)
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {pageOrder.map((pageIndex, orderIndex) => (
                <div
                  key={orderIndex}
                  className="flex items-center justify-center gap-1 p-3 bg-muted rounded-lg cursor-move hover:bg-primary/10 transition-colors"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", orderIndex.toString())}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const from = parseInt(e.dataTransfer.getData("text/plain"));
                    movePage(from, orderIndex);
                  }}
                >
                  <GripVertical className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm font-medium">{pageIndex + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={handleOrganize}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Save & Download
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
};

export default OrganizePDF;
