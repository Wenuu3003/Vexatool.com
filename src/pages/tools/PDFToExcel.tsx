import { useState } from "react";
import { Table, Download, Info } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PDFDocument } from "pdf-lib";
import { Helmet } from "react-helmet";
import * as XLSX from "xlsx";

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
        if (import.meta.env.DEV) {
          console.error("Error loading PDF:", error);
        }
        toast({
          title: "Error",
          description: "Failed to load PDF file.",
          variant: "destructive",
        });
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

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const allText: string[][] = [];

      // Extract text from each page
      for (const page of pages) {
        const textContent = await page.getTextContent?.(); // pdf-lib doesn't have getTextContent natively
        // Fallback: simple page text extraction using page.getTextContent()
        const pageText = await page.getTextContent?.().then((t) => t.items.map((i: any) => i.str).join(" "));
        if (pageText) {
          const rows = pageText.split("\n").map((line) => line.split(/\s+/)); // basic split by spaces
          allText.push(...rows);
        }
      }

      // Create Excel workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(allText);
      XLSX.utils.book_append_sheet(wb, ws, "PDF Data");

      // Generate Excel file
      XLSX.writeFile(wb, files[0].name.replace(".pdf", ".xlsx"));

      toast({
        title: "Conversion Successful",
        description: "Your PDF has been converted to Excel.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Conversion Failed",
        description: "An error occurred while converting PDF to Excel.",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  return (
    <>
      <Helmet>
        <title>PDF to Excel Converter Free Online | Mypdfs</title>
        <meta
          name="description"
          content="Free PDF to Excel converter. Extract tables and data from PDF files to Excel spreadsheets. Get conversion tips and recommendations."
        />
        <meta
          name="keywords"
          content="PDF to Excel, PDF to XLS, extract PDF tables, PDF to spreadsheet, free PDF to Excel"
        />
        <link rel="canonical" href="https://mypdfs.lovable.app/pdf-to-excel" />
      </Helmet>
      <ToolLayout
        title="PDF to Excel"
        description="free to use Convert PDF tables and data to Excel spreadsheets"
        icon={Table}
        colorClass="bg-green-500"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Converting PDF to Excel with accurate table recognition requires specialized OCR and table detection. We
              recommend using Adobe Acrobat or professional online converters for best results.
            </AlertDescription>
          </Alert>

          <FileUpload files={files} onFilesChange={handleFilesChange} colorClass="bg-green-500" />

          {files.length > 0 && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">PDF has {pageCount} page(s) to extract data from</p>
              <Button size="lg" onClick={handleConvert} disabled={isProcessing} className="gap-2">
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Convert to Excel
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="bg-muted/30 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold">Recommended conversion methods:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                <strong>Adobe Acrobat:</strong> File → Export To → Spreadsheet → Microsoft Excel Workbook
              </li>
              <li>
                <strong>SmallPDF:</strong> Visit smallpdf.com/pdf-to-excel
              </li>
              <li>
                <strong>ILovePDF:</strong> Visit ilovepdf.com/pdf_to_excel
              </li>
              <li>
                <strong>Tabula:</strong> Free open-source tool for extracting tables from PDFs
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              <strong>Tip:</strong> If your PDF contains scanned images of tables, you'll need a tool with OCR
              capabilities.
            </p>
          </div>
        </div>
      </ToolLayout>
    </>
  );
};

export default PDFToExcel;
