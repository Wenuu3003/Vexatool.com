import { useState } from "react";
import { Presentation, Download, Info } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Helmet } from "react-helmet";

const PPTToPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.pptx') || selectedFile.name.endsWith('.ppt')) {
        setFile(selectedFile);
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
        description: "Please select a PowerPoint file to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Note: Full PPTX to PDF conversion requires server-side processing
    // This provides guidance for the user
    toast({
      title: "Conversion Note",
      description: "For best results, use Microsoft PowerPoint or Google Slides to export as PDF. This ensures all formatting is preserved.",
    });

    setIsProcessing(false);
  };

  return (
    <>
      <Helmet>
        <title>PowerPoint to PDF Converter Free Online | Mypdfs</title>
        <meta name="description" content="Free PowerPoint to PDF converter. Convert PPT and PPTX presentations to PDF format. Easy conversion guide included." />
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
            For the best conversion quality, we recommend using Microsoft PowerPoint's "Save as PDF" feature 
            or Google Slides' "Download as PDF" option. This preserves all animations, fonts, and formatting.
          </AlertDescription>
        </Alert>

        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept=".ppt,.pptx"
            onChange={handleFileChange}
            className="hidden"
            id="ppt-upload"
          />
          <label htmlFor="ppt-upload" className="cursor-pointer">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Presentation className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              {file ? file.name : "Click to select PowerPoint file"}
            </p>
            <p className="text-sm text-muted-foreground">
              Supports .ppt and .pptx files
            </p>
          </label>
        </div>

        {file && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
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
                  Get Conversion Tips
                </>
              )}
            </Button>
          </div>
        )}

        <div className="bg-muted/30 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">How to convert PowerPoint to PDF:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Open your PowerPoint file in Microsoft PowerPoint</li>
            <li>Go to File → Save As (or Export)</li>
            <li>Select "PDF" as the file format</li>
            <li>Click Save</li>
          </ol>
          <p className="text-sm text-muted-foreground">
            <strong>Using Google Slides?</strong> Open your file, go to File → Download → PDF Document
          </p>
        </div>
      </div>
      </ToolLayout>
    </>
  );
};

export default PPTToPDF;
