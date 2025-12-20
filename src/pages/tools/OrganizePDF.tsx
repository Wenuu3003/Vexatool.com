import { useState } from "react";
import { LayoutGrid, Download, GripVertical } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { PDFDocument } from "pdf-lib";
import { toast } from "@/hooks/use-toast";

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
      console.error("Organize error:", error);
      toast({
        title: "Error",
        description: "Failed to organize PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
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
    </ToolLayout>
  );
};

export default OrganizePDF;
