import { useState, useRef } from "react";
import { Presentation, Download, Info, Upload } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Helmet } from "react-helmet";
import ToolSEOContent from "@/components/ToolSEOContent";

const PPTToPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileName = selectedFile.name.toLowerCase();
      if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
        setFile(selectedFile);
        toast({
          title: "File selected",
          description: `${selectedFile.name} is ready for conversion guidance.`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a PowerPoint file (.ppt or .pptx)",
          variant: "destructive",
        });
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PowerPoint file first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Create a downloadable copy of the original file with instructions
    const blob = new Blob([file], { type: file.type });
    const url = URL.createObjectURL(blob);
    
    // Provide the file back with clear instructions
    toast({
      title: "Conversion Instructions",
      description: "Your PowerPoint file is ready. Follow the steps below to convert it to PDF using PowerPoint or Google Slides.",
    });

    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fileName = droppedFile.name.toLowerCase();
      if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
        setFile(droppedFile);
        toast({
          title: "File selected",
          description: `${droppedFile.name} is ready for conversion guidance.`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a PowerPoint file (.ppt or .pptx)",
          variant: "destructive",
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const seoContent = {
    toolName: "PowerPoint to PDF Converter",
    whatIs: "PowerPoint to PDF Converter provides guidance on converting your PPT and PPTX presentations to PDF format. For the best results with preserved formatting, animations references, and slide layouts, we recommend using Microsoft PowerPoint's built-in export feature or Google Slides. This page provides step-by-step instructions and links to reliable online conversion services.",
    howToUse: [
      "Select your PowerPoint file (.ppt or .pptx).",
      "Follow the conversion guide for your preferred method.",
      "For PowerPoint: File → Save As → Choose PDF format.",
      "For Google Slides: File → Download → PDF Document.",
      "For online tools: Use the recommended services listed below."
    ],
    features: [
      "Detailed conversion instructions for multiple methods",
      "Microsoft PowerPoint conversion guide",
      "Google Slides free alternative guide",
      "Links to trusted online converters",
      "Tips for preserving formatting",
      "Supports .ppt and .pptx files"
    ],
    safetyNote: "When using Microsoft PowerPoint or Google Slides for conversion, your files are processed by those trusted applications. For online converters, we recommend reputable services that process files securely and delete them after conversion. Always check the privacy policy of any online service you use.",
    faqs: [
      { question: "Which method gives the best results?", answer: "Microsoft PowerPoint provides the best conversion quality as it's the native application. Google Slides is an excellent free alternative that handles most presentations well." },
      { question: "Will my animations be preserved?", answer: "PDF is a static format, so animations won't play. However, each slide state can be captured. For animation notes, consider exporting multiple slides per animation step." },
      { question: "Can I convert presentations with videos?", answer: "Videos cannot be embedded in PDFs. The video frames visible on slides will appear as static images. Consider exporting the video separately if needed." },
      { question: "What about fonts and special formatting?", answer: "PowerPoint's native export embeds fonts and preserves formatting best. Online converters may substitute unavailable fonts, so check your output carefully." }
    ]
  };

  return (
    <>
      <Helmet>
        <title>PowerPoint to PDF Converter Free Online | Mypdfs</title>
        <meta name="description" content="Free PowerPoint to PDF converter guide. Learn how to convert PPT and PPTX presentations to PDF format easily." />
        <meta name="keywords" content="PowerPoint to PDF, PPT to PDF, PPTX to PDF, convert presentation, free PPT converter" />
        <link rel="canonical" href="https://mypdfs.lovable.app/ppt-to-pdf" />
      </Helmet>
      <ToolLayout
        title="PowerPoint to PDF"
        description="Convert PPT and PPTX files to PDF"
        icon={Presentation}
        colorClass="bg-orange-600"
      >
      <div className="max-w-2xl mx-auto space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            PowerPoint to PDF conversion requires Microsoft PowerPoint or Google Slides for best results. 
            Upload your file here and follow our step-by-step guide below.
          </AlertDescription>
        </Alert>

        <div 
          className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".ppt,.pptx"
            onChange={handleFileChange}
            className="hidden"
            id="ppt-upload"
          />
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
            {file ? (
              <Presentation className="w-8 h-8 text-orange-500" />
            ) : (
              <Upload className="w-8 h-8 text-orange-500" />
            )}
          </div>
          <p className="text-lg font-medium text-foreground mb-2">
            {file ? file.name : "Click or drag to select PowerPoint file"}
          </p>
          <p className="text-sm text-muted-foreground">
            Supports .ppt and .pptx files
          </p>
        </div>

        {file && (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
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
                  Get Conversion Guide
                </>
              )}
            </Button>
          </div>
        )}

        <div className="bg-muted/30 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">1</span>
            Using Microsoft PowerPoint (Recommended)
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-8">
            <li>Open your PowerPoint file</li>
            <li>Click <strong>File</strong> → <strong>Save As</strong> or <strong>Export</strong></li>
            <li>Choose <strong>PDF</strong> as the file format</li>
            <li>Click <strong>Save</strong></li>
          </ol>
        </div>

        <div className="bg-muted/30 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">2</span>
            Using Google Slides (Free Alternative)
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-8">
            <li>Go to <a href="https://slides.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">slides.google.com</a></li>
            <li>Click <strong>Blank</strong> to create a new presentation</li>
            <li>Click <strong>File</strong> → <strong>Import slides</strong></li>
            <li>Upload your PowerPoint file</li>
            <li>Click <strong>File</strong> → <strong>Download</strong> → <strong>PDF Document</strong></li>
          </ol>
        </div>

        <div className="bg-muted/30 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">3</span>
            Using Online Converters
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-8">
            <li><strong>SmallPDF:</strong> <a href="https://smallpdf.com/ppt-to-pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">smallpdf.com/ppt-to-pdf</a></li>
            <li><strong>ILovePDF:</strong> <a href="https://www.ilovepdf.com/powerpoint_to_pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ilovepdf.com/powerpoint_to_pdf</a></li>
          </ul>
        </div>
      </div>
      <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
};

export default PPTToPDF;
