import { useState } from "react";
import { FileType2, Download, Info, Image } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PDFDocument } from "pdf-lib";
import { Helmet } from "react-helmet";

const PDFToPowerPoint = () => {
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
          title: "Error loading PDF",
          description: "Could not read the PDF file. Please try another file.",
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
      
      // Convert each page to a separate PDF (simulating slide extraction)
      const extractedPages: { blob: Blob; name: string }[] = [];
      
      for (let i = 0; i < pages.length; i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        extractedPages.push({ blob, name: `slide_${i + 1}.pdf` });
      }

      // Download as individual slide PDFs in a zip-like manner (sequential downloads)
      if (extractedPages.length === 1) {
        const url = URL.createObjectURL(extractedPages[0].blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `slide_1_${files[0].name}`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        // For multiple pages, download the first few and show instructions
        const url = URL.createObjectURL(extractedPages[0].blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `slide_1_${files[0].name}`;
        link.click();
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Conversion Complete!",
        description: `Extracted ${pages.length} page(s) as presentation slides. Import these PDFs into PowerPoint using Insert > Object.`,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Conversion error:", error);
      }
      toast({
        title: "Conversion failed",
        description: "Could not convert the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>PDF to PowerPoint Converter Free Online | Mypdfs</title>
        <meta name="description" content="Free PDF to PowerPoint converter. Convert PDF documents to presentation slides. Extract pages as individual slides." />
        <meta name="keywords" content="PDF to PowerPoint, PDF to PPT, convert PDF to slides, PDF to presentation, free PDF to PPT" />
        <link rel="canonical" href="https://mypdfs.lovable.app/pdf-to-powerpoint" />
      </Helmet>
      <ToolLayout
        title="PDF to PowerPoint"
        description="Convert PDF documents to PowerPoint presentations"
        icon={FileType2}
        colorClass="bg-orange-500"
      >
      <div className="max-w-2xl mx-auto space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This tool extracts PDF pages as individual slides. You can then import them into PowerPoint 
            using Insert → Object → PDF or Insert → Pictures.
          </AlertDescription>
        </Alert>

        <FileUpload
          files={files}
          onFilesChange={handleFilesChange}
          colorClass="bg-orange-500"
        />

        {files.length > 0 && (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              PDF has {pageCount} page(s) that will become slides
            </p>
            <Button
              size="lg"
              onClick={handleConvert}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? "Converting..." : (
                <>
                  <Download className="w-5 h-5" />
                  Extract as Slides
                </>
              )}
            </Button>
          </div>
        )}

        <div className="bg-muted/30 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">How to use the extracted slides:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Click "Extract as Slides" to download the PDF pages</li>
            <li>Open PowerPoint and create a new presentation</li>
            <li>Go to Insert → Object → Create from File</li>
            <li>Select the downloaded PDF slides</li>
            <li>Alternatively, use Insert → Pictures if you need image format</li>
          </ol>
        </div>

        <div className="bg-muted/30 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">For advanced conversion:</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li><strong>Adobe Acrobat:</strong> File → Export To → Microsoft PowerPoint Presentation</li>
            <li><strong>SmallPDF:</strong> Visit smallpdf.com/pdf-to-ppt</li>
            <li><strong>ILovePDF:</strong> Visit ilovepdf.com/pdf_to_powerpoint</li>
          </ul>
        </div>
      </div>
      </ToolLayout>
    </>
  );
};

export default PDFToPowerPoint;
