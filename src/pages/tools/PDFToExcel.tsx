import { useState } from "react";
import { Table, Download, Info } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PDFDocument } from "pdf-lib";
import { Helmet } from "react-helmet";
import ToolSEOContent from "@/components/ToolSEOContent";

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
    <>
      <Helmet>
        <title>PDF to Excel Converter Free Online | Mypdfs</title>
        <meta name="description" content="Free PDF to Excel converter. Extract tables and data from PDF files to Excel spreadsheets. Get conversion tips and recommendations." />
        <meta name="keywords" content="PDF to Excel, PDF to XLS, extract PDF tables, PDF to spreadsheet, free PDF to Excel" />
        <link rel="canonical" href="https://mypdfs.lovable.app/pdf-to-excel" />
      </Helmet>
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

        <ToolSEOContent
          toolName="PDF to Excel"
          whatIs="PDF to Excel conversion extracts tabular data from PDF documents and converts it into editable spreadsheet format. This is essential for working with financial reports, invoices, data tables, and any PDF containing structured information you need to analyze or modify in Excel. While browser-based extraction has limitations with complex layouts, this tool provides guidance on the best methods for accurate table extraction and points you to reliable solutions for your specific needs."
          howToUse={[
            "Upload your PDF file containing tables or data you want to extract.",
            "Review the file information displayed after upload.",
            "Click 'Get Conversion Tips' for guidance on the best conversion method.",
            "Follow the recommended approach based on your PDF's complexity."
          ]}
          features={[
            "Upload and analyze PDF files containing tabular data.",
            "Provides expert guidance on optimal conversion methods.",
            "Links to reliable specialized conversion tools.",
            "Supports scanned PDFs with OCR recommendations.",
            "Free analysis with no registration required.",
            "Works with complex multi-page documents."
          ]}
          safetyNote="Your uploaded PDF files are processed locally in your browser for analysis. When following external tool recommendations, review each service's privacy policy. For highly sensitive documents, consider desktop software options that process files offline."
          faqs={[
            {
              question: "Why can't I directly convert PDF to Excel here?",
              answer: "Accurate table extraction from PDFs requires sophisticated OCR and layout analysis. We recommend specialized tools that handle complex formatting, merged cells, and scanned documents reliably."
            },
            {
              question: "What if my PDF contains scanned images of tables?",
              answer: "Scanned PDFs require OCR (Optical Character Recognition) technology. Tools like Adobe Acrobat or online services with OCR capabilities can recognize and extract text from images."
            },
            {
              question: "Which tool is best for PDF to Excel conversion?",
              answer: "Adobe Acrobat provides the most accurate results for complex layouts. For free options, Tabula works well for simple tables, while online services like SmallPDF or ILovePDF handle most common use cases."
            },
            {
              question: "Can I convert multiple PDFs to Excel at once?",
              answer: "Batch conversion is available in Adobe Acrobat and some online services. Upload multiple files or use their batch processing features for efficiency."
            }
          ]}
        />
      </div>
      </ToolLayout>
    </>
  );
};

export default PDFToExcel;
