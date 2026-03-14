import { useState } from "react";
import { FileType2, Download, Info, FileImage, Loader2, Shield } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";
import { pdfjsLib } from "@/lib/pdfWorker";
import { Document, Packer, Paragraph, ImageRun, HeadingLevel } from "docx";
import JSZip from "jszip";

const PDFToPowerPoint = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");

  const handleFilesChange = async (newFiles: File[]) => {
    setFiles(newFiles);
    setProgress(0);
    if (newFiles.length > 0) {
      try {
        const arrayBuffer = await newFiles[0].arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        setPageCount(pdf.numPages);
        pdf.destroy();
      } catch {
        toast({
          title: "Error loading PDF",
          description: "Could not read the PDF file. It may be corrupted or password-protected.",
          variant: "destructive",
        });
        setPageCount(0);
      }
    } else {
      setPageCount(0);
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
    setProgress(5);
    setProgressLabel("Loading PDF...");

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const numPages = pdf.numPages;

      // Render each page as an image
      const slideImages: Uint8Array[] = [];
      const slideDimensions: { width: number; height: number }[] = [];

      for (let i = 1; i <= numPages; i++) {
        setProgress(Math.round(5 + (i / numPages) * 70));
        setProgressLabel(`Rendering page ${i} of ${numPages}...`);

        const page = await pdf.getPage(i);
        const scale = 2; // High quality
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;

        await page.render({ canvasContext: ctx, viewport }).promise;

        // Convert to JPEG for smaller file size
        const jpegBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.88);
        });

        slideImages.push(new Uint8Array(await jpegBlob.arrayBuffer()));
        slideDimensions.push({ width: viewport.width, height: viewport.height });

        // Cleanup
        canvas.width = 0;
        canvas.height = 0;
      }

      pdf.destroy();

      setProgress(80);
      setProgressLabel("Building presentation ZIP...");

      // Create a ZIP file containing numbered JPEG slides + a README
      const zip = new JSZip();
      const baseName = files[0].name.replace('.pdf', '');

      // Add a simple instructions file
      zip.file("HOW_TO_USE.txt",
`${baseName} - Converted Slides
${"=".repeat(40)}

These JPEG images are high-quality renders of each page from your PDF.

To create a PowerPoint presentation:
1. Open PowerPoint → New Blank Presentation
2. Go to Insert → Photo Album → New Photo Album
3. Select all the slide images from this folder
4. Click "Create" — each image becomes a slide

Or in Google Slides:
1. Create a new presentation
2. For each slide: Insert → Image → Upload from computer
3. Select the corresponding slide image

Total slides: ${numPages}
`);

      for (let i = 0; i < slideImages.length; i++) {
        zip.file(`${baseName}_slide_${String(i + 1).padStart(3, '0')}.jpg`, slideImages[i]);
      }

      setProgress(90);
      setProgressLabel("Compressing...");

      const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });

      // Download
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseName}_slides.zip`;
      link.click();
      URL.revokeObjectURL(url);

      setProgress(100);
      setProgressLabel("Done!");

      toast({
        title: "Conversion Complete!",
        description: `${numPages} slide image(s) exported. Open the ZIP and follow the included instructions to import into PowerPoint.`,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Conversion error:", error);
      }
      const msg = error instanceof Error ? error.message : "";
      toast({
        title: "Conversion failed",
        description: msg.includes("password")
          ? "This PDF is password-protected. Unlock it first using our Unlock PDF tool."
          : "Could not convert the PDF. The file may be corrupted.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const seoContent = {
    toolName: "PDF to PowerPoint Converter",
    whatIs: "PDF to PowerPoint Converter is a free online tool that renders each page of your PDF as a high-quality image and packages them into a ready-to-use slide pack. Unlike tools that just split PDFs, this converter actually renders the visual content at 2× resolution, creating crisp JPEG images that you can directly import into Microsoft PowerPoint or Google Slides as individual slides. The included instructions file walks you through the quick import process.",
    howToUse: [
      "Upload your PDF file by clicking the upload area or dragging and dropping.",
      "View the page count to confirm the number of slides.",
      "Click 'Convert to Slides' to render all pages as images.",
      "Download the ZIP file containing all slide images.",
      "Follow the included HOW_TO_USE.txt to import into PowerPoint or Google Slides."
    ],
    features: [
      "Renders actual PDF page content as high-quality JPEG images",
      "2× resolution for crisp, presentation-ready slides",
      "ZIP package with numbered slides and import instructions",
      "Works with any PDF — text, images, charts, diagrams",
      "Compatible with PowerPoint, Google Slides, and Keynote",
      "Progress tracking for multi-page documents",
      "100% browser-based — no server upload required"
    ],
    safetyNote: "Your PDF files are processed entirely in your browser. No documents are uploaded to any server, ensuring complete privacy. The rendering happens locally on your device, and only you have access to the resulting slide images.",
    faqs: [
      { question: "Are the slides editable in PowerPoint?", answer: "The slides are imported as images, preserving the exact visual appearance of your PDF pages. To edit text, you can add text boxes over the slide images in PowerPoint." },
      { question: "What resolution are the slide images?", answer: "Each page is rendered at 2× scale, producing high-resolution images suitable for presentations on HD displays and projectors." },
      { question: "How do I import into PowerPoint?", answer: "The ZIP file includes a HOW_TO_USE.txt with step-by-step instructions. The quickest method is: Insert → Photo Album → New Photo Album → select all images → Create." },
      { question: "Can I convert to Google Slides?", answer: "Yes! After downloading the ZIP, create a new Google Slides presentation and use Insert → Image for each slide." },
      { question: "Is there a page limit?", answer: "No strict limit. The tool handles documents of any length, though very large PDFs may take longer to render." }
    ]
  };

  return (
    <>
      <CanonicalHead
        title="PDF to PowerPoint Converter Free Online | VexaTool"
        description="Free PDF to PowerPoint converter. Convert PDF pages to high-quality slide images for PowerPoint and Google Slides. 100% private."
        keywords="PDF to PowerPoint, PDF to PPT, convert PDF to slides, PDF to presentation, free PDF to PPT"
      />
      <ToolLayout
        title="PDF to PowerPoint"
        description="Convert PDF pages to high-quality slide images for presentations"
        icon={FileType2}
        colorClass="bg-orange-500"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Each PDF page is rendered as a high-quality image and packaged in a ZIP file with import instructions for PowerPoint and Google Slides.
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
                  {pageCount} page(s) → {pageCount} high-quality slide image(s)
                </p>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">{progressLabel}</p>
                </div>
              )}

              <Button
                size="lg"
                onClick={handleConvert}
                disabled={isProcessing}
                className="gap-2 bg-orange-500 hover:bg-orange-600"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Convert to Slides
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="bg-orange-50/50 dark:bg-orange-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Secure & Private</h4>
                <p className="text-sm text-muted-foreground">
                  Your PDF is rendered locally in your browser. No files are uploaded to any server.
                </p>
              </div>
            </div>
          </div>
        </div>
        <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
};

export default PDFToPowerPoint;
