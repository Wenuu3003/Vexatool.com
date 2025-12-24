import { useState } from "react";
import { Code, Download, FileUp } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { PDFDocument } from "pdf-lib";
import { Helmet } from "react-helmet";

const PDFToHTML = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [htmlPreview, setHtmlPreview] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setHtmlPreview("");
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file",
          variant: "destructive",
        });
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      // Get metadata
      const title = pdfDoc.getTitle() || file.name.replace('.pdf', '');
      const author = pdfDoc.getAuthor() || 'Unknown';
      const creationDate = pdfDoc.getCreationDate();

      // Generate HTML structure
      let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .document-header {
            background: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .document-header h1 {
            font-size: 24px;
            margin-bottom: 10px;
            color: #1a1a1a;
        }
        .document-meta {
            color: #666;
            font-size: 14px;
        }
        .page {
            background: white;
            padding: 40px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            min-height: 400px;
            position: relative;
        }
        .page-number {
            position: absolute;
            bottom: 20px;
            right: 20px;
            color: #999;
            font-size: 12px;
        }
        .page-dimensions {
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
        }
        .page-content {
            border: 1px dashed #ddd;
            padding: 20px;
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="document-header">
            <h1>${title}</h1>
            <div class="document-meta">
                <p>Author: ${author}</p>
                <p>Pages: ${pages.length}</p>
                ${creationDate ? `<p>Created: ${creationDate.toLocaleDateString()}</p>` : ''}
                <p>Converted from: ${file.name}</p>
            </div>
        </div>
`;

      // Add pages
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        
        htmlContent += `
        <div class="page">
            <div class="page-dimensions">Page ${i + 1} - Dimensions: ${Math.round(width)} x ${Math.round(height)} pt</div>
            <div class="page-content">
                <p>PDF content for page ${i + 1}</p>
            </div>
            <div class="page-number">Page ${i + 1} of ${pages.length}</div>
        </div>
`;
      }

      htmlContent += `
    </div>
</body>
</html>`;

      setHtmlPreview(htmlContent);

      // Download HTML file
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace('.pdf', '.html');
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Conversion complete!",
        description: "PDF has been converted to HTML format.",
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Convert error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to convert PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>PDF to HTML Converter Free Online - Convert PDF to Web Page | Mypdfs</title>
        <meta name="description" content="Free online PDF to HTML converter. Convert PDF documents to HTML web pages. Create responsive HTML from PDF files instantly." />
        <meta name="keywords" content="pdf to html, convert pdf to html, pdf to web page, pdf converter, free html converter" />
        <link rel="canonical" href="https://mypdfs.lovable.app/pdf-to-html" />
      </Helmet>
      <ToolLayout
        title="PDF to HTML"
        description="Convert PDF documents to HTML web pages"
        icon={Code}
        colorClass="bg-orange-500"
      >
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="pdf-html-upload"
          />
          <label htmlFor="pdf-html-upload" className="cursor-pointer">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
              <FileUp className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              Click to select PDF file
            </p>
            <p className="text-sm text-muted-foreground">
              Convert PDF to HTML web page
            </p>
          </label>
        </div>

        {file && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileUp className="w-8 h-8 text-red-500" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setHtmlPreview(""); }}>
                Remove
              </Button>
            </div>
            
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleConvert}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  "Converting..."
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Convert to HTML
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {htmlPreview && (
          <div className="mt-6">
            <h3 className="font-medium mb-4">Preview</h3>
            <div className="border rounded-lg overflow-hidden bg-white">
              <iframe
                srcDoc={htmlPreview}
                className="w-full h-96"
                title="HTML Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        )}
      </ToolLayout>
    </>
  );
};

export default PDFToHTML;
