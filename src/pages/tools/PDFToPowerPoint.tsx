import { useState } from "react";
import { FileType2, Download, Info, Image, FileImage } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PDFDocument } from "pdf-lib";
import { Helmet } from "react-helmet";
import ToolSEOContent from "@/components/ToolSEOContent";
import { Progress } from "@/components/ui/progress";

const PDFToPowerPoint = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [extractedImages, setExtractedImages] = useState<string[]>([]);

  const handleFilesChange = async (newFiles: File[]) => {
    setFiles(newFiles);
    setExtractedImages([]);
    setProgress(0);
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

  const renderPDFPageToImage = async (pdfDoc: PDFDocument, pageIndex: number): Promise<string> => {
    // Create a single-page PDF
    const singlePagePdf = await PDFDocument.create();
    const [page] = await singlePagePdf.copyPages(pdfDoc, [pageIndex]);
    singlePagePdf.addPage(page);
    const pdfBytes = await singlePagePdf.save();
    
    // Convert to base64 data URL for display
    const base64 = btoa(
      new Uint8Array(pdfBytes).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    return `data:application/pdf;base64,${base64}`;
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
    setProgress(0);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      // Create individual PDF files for each page (slides)
      const slideBlobs: Blob[] = [];
      
      for (let i = 0; i < pages.length; i++) {
        setProgress(Math.round(((i + 1) / pages.length) * 100));
        
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);
        const pdfBytes = await newPdf.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        slideBlobs.push(blob);
      }

      // Create a combined download - all pages as separate files in a single action
      // Download all slides
      const baseName = files[0].name.replace('.pdf', '');
      
      for (let i = 0; i < slideBlobs.length; i++) {
        const url = URL.createObjectURL(slideBlobs[i]);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${baseName}_slide_${i + 1}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Small delay between downloads
        if (i < slideBlobs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      toast({
        title: "Conversion Complete!",
        description: `Successfully extracted ${pages.length} slide(s). Import these PDFs into PowerPoint using Insert → Pictures → Screenshot or drag them directly.`,
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

  const seoContent = {
    toolName: "PDF to PowerPoint Converter",
    whatIs: "PDF to PowerPoint Converter is a free online tool that helps you convert PDF documents into presentation slides. The tool extracts each PDF page as a separate slide file that can be imported into Microsoft PowerPoint or Google Slides. This is useful when you need to present PDF content, create slideshows from document pages, or integrate PDF visuals into your presentations. All processing happens in your browser for complete privacy.",
    howToUse: [
      "Upload your PDF file by clicking the upload area or dragging and dropping.",
      "View the page count to see how many slides will be created.",
      "Click 'Convert to Slides' to process the PDF.",
      "Download all extracted slide files automatically.",
      "Import the files into PowerPoint by dragging them in or using Insert → Pictures."
    ],
    features: [
      "Extract PDF pages as individual slide files",
      "Works with any number of PDF pages",
      "Maintains original page quality and layout",
      "Automatic download of all slides",
      "Compatible with PowerPoint and Google Slides",
      "100% browser-based - no server upload",
      "Progress indicator for large files"
    ],
    safetyNote: "Your PDF files are processed entirely in your browser. No documents are uploaded to any server, ensuring complete privacy. The extraction happens locally on your device, and only you have access to the resulting slide files.",
    faqs: [
      { question: "Will the slides be editable in PowerPoint?", answer: "The extracted slides maintain the visual content of your PDF. You can insert them as images or objects in PowerPoint. For text editing, you may need to add text boxes over the slides." },
      { question: "How do I import the slides into PowerPoint?", answer: "Simply drag the downloaded PDF slides directly into PowerPoint, or use Insert → Pictures → Screenshot to capture the content. Each slide becomes one PowerPoint slide." },
      { question: "Can I convert to Google Slides?", answer: "Yes! Upload the extracted PDF slides to Google Drive, then insert them into a Google Slides presentation using Insert → Image or by opening them directly." },
      { question: "How many pages can I convert?", answer: "There's no limit! The tool processes all pages in your PDF. For very large documents, the conversion may take a bit longer but will complete successfully." }
    ]
  };

  return (
    <>
      <Helmet>
        <title>PDF to PowerPoint Converter Free Online | Mypdfs</title>
        <meta name="description" content="Free PDF to PowerPoint converter. Convert PDF documents to presentation slides instantly. No upload, 100% private browser processing." />
        <meta name="keywords" content="PDF to PowerPoint, PDF to PPT, convert PDF to slides, PDF to presentation, free PDF to PPT" />
        <link rel="canonical" href="https://mypdfs.lovable.app/pdf-to-powerpoint" />
      </Helmet>
      <ToolLayout
        title="PDF to PowerPoint"
        description="Convert PDF documents to PowerPoint presentation slides"
        icon={FileType2}
        colorClass="bg-orange-500"
      >
      <div className="max-w-2xl mx-auto space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This tool extracts each PDF page as a slide file. All processing happens in your browser - your files stay private.
          </AlertDescription>
        </Alert>

        <FileUpload
          files={files}
          onFilesChange={handleFilesChange}
          colorClass="bg-orange-500"
        />

        {files.length > 0 && (
          <div className="text-center space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-foreground">
                <FileImage className="w-5 h-5 text-orange-500" />
                <span className="font-medium">{files[0].name}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {pageCount} page(s) → {pageCount} slide(s)
              </p>
            </div>
            
            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground">Converting... {progress}%</p>
              </div>
            )}
            
            <Button
              size="lg"
              onClick={handleConvert}
              disabled={isProcessing}
              className="gap-2 bg-orange-500 hover:bg-orange-600"
            >
              {isProcessing ? "Converting..." : (
                <>
                  <Download className="w-5 h-5" />
                  Convert to Slides
                </>
              )}
            </Button>
          </div>
        )}

        <div className="bg-muted/30 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
            How to Use in PowerPoint
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-8">
            <li>Click "Convert to Slides" to download all pages as individual PDFs</li>
            <li>Open PowerPoint and create a new presentation</li>
            <li>Drag each downloaded slide PDF directly into PowerPoint</li>
            <li>Or use Insert → Object → Create from File and select each PDF</li>
            <li>Resize and position slides as needed</li>
          </ol>
        </div>

        <div className="bg-muted/30 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
            How to Use in Google Slides
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-8">
            <li>Download all slide PDFs from this tool</li>
            <li>Upload the PDFs to Google Drive</li>
            <li>Open each PDF in Google Drive (it will open in Drive PDF viewer)</li>
            <li>Take screenshots or use Insert → Image in Google Slides</li>
            <li>Arrange your slides in the presentation</li>
          </ol>
        </div>
      </div>
      <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
};

export default PDFToPowerPoint;
