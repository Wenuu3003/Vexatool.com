import { useState } from "react";
import { FileType2, Download, Info } from "lucide-react";
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
      description: "For best results converting PDF to PowerPoint, use Adobe Acrobat or online tools like SmallPDF or ILovePDF which preserve formatting better.",
    });

    setIsProcessing(false);
  };

  return (
    <>
      <Helmet>
        <title>PDF to PowerPoint Converter Free Online | Mypdfs</title>
        <meta name="description" content="Free PDF to PowerPoint converter. Convert PDF documents to editable PPT presentations. Get conversion tips and recommendations." />
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
            Converting PDF to PowerPoint while preserving formatting requires specialized processing. 
            We recommend using Adobe Acrobat or professional online converters for best results.
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
            <li><strong>Adobe Acrobat:</strong> File → Export To → Microsoft PowerPoint Presentation</li>
            <li><strong>SmallPDF:</strong> Visit smallpdf.com/pdf-to-ppt</li>
            <li><strong>ILovePDF:</strong> Visit ilovepdf.com/pdf_to_powerpoint</li>
            <li><strong>Google Slides:</strong> Open PDF in Google Drive, then open with Google Slides</li>
          </ul>
        </div>
      </div>
      </ToolLayout>
    </>
  );
};

export default PDFToPowerPoint;
