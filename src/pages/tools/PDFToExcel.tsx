import { useState } from "react";
import { Table, Download, Info } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PDFDocument } from "pdf-lib";

const PDFToExcel = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);

  const handleFilesChange = async (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      try {
        const arrayBuffer = await newFiles[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setPageCount(pdfDoc.getPageCount());
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    toast({
      title: "Conversion Tip",
      description: "For best results converting PDF tables to Excel, use Adobe Acrobat or specialized tools that can recognize table structures.",
    });

    setIsProcessing(false);
  };

  return (
    <ToolLayout
      title="PDF to Excel"
      description="Convert PDF tables and data to Excel spreadsheets"
      icon={Table}
      colorClass="bg-green-500"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Converting PDF to Excel with accurate table recognition requires specialized OCR and table detection. 
            We recommend using Adobe Acrobat or professional online converters for best results.
          </AlertDescription>
        </Alert>

        <FileUpload
          files={files}
          onFilesChange={handleFilesChange}
          colorClass="bg-green-500"
        />

        {files.length > 0 && (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              PDF has {pageCount} page(s) to extract data from
            </p>
            <Button
              size="lg"
              onClick={handleConvert}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? "Processing..." : (
                <>
                  <Download className="w-5 h-5" />
                  Get Conversion Tips
                </>
              )}
            </Button>
          </div>
        )}

        <div className="bg-muted/30 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">Recommended conversion methods:</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li><strong>Adobe Acrobat:</strong> File → Export To → Spreadsheet → Microsoft Excel Workbook</li>
            <li><strong>SmallPDF:</strong> Visit smallpdf.com/pdf-to-excel</li>
            <li><strong>ILovePDF:</strong> Visit ilovepdf.com/pdf_to_excel</li>
            <li><strong>Tabula:</strong> Free open-source tool for extracting tables from PDFs</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Tip:</strong> If your PDF contains scanned images of tables, you'll need a tool with OCR capabilities.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default PDFToExcel;
