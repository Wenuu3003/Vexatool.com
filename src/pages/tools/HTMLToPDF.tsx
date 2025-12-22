import { useState } from "react";
import { Code, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const HTMLToPDF = () => {
  const [html, setHtml] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConvert = async () => {
    if (!html.trim()) {
      toast({
        title: "No HTML content",
        description: "Please enter HTML content to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create a hidden iframe to render HTML
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = '800px';
      iframe.style.height = '1100px';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error('Could not access iframe document');

      // Write HTML content
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>${html}</body>
        </html>
      `);
      iframeDoc.close();

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use browser's print to PDF functionality
      const printWindow = iframe.contentWindow;
      if (printWindow) {
        printWindow.print();
      }

      document.body.removeChild(iframe);

      toast({
        title: "Print dialog opened",
        description: "Select 'Save as PDF' in the print dialog to save your PDF.",
      });
    } catch (error) {
      console.error("Convert error:", error);
      toast({
        title: "Error",
        description: "Failed to convert HTML to PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="HTML to PDF"
      description="Convert HTML code to PDF documents"
      icon={Code}
      colorClass="bg-orange-500"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <Label htmlFor="html-content">Enter HTML Content</Label>
          <Textarea
            id="html-content"
            placeholder="<h1>Hello World</h1><p>Enter your HTML here...</p>"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />
        </div>

        {html.trim() && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <h3 className="font-medium mb-2">Preview</h3>
              <div 
                className="bg-white p-4 rounded border min-h-[200px]"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>

            <div className="text-center">
              <Button
                size="lg"
                onClick={handleConvert}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Convert to PDF
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Uses browser print dialog - select "Save as PDF"
              </p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default HTMLToPDF;
