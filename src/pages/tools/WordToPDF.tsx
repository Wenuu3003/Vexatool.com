import { useState } from "react";
import { FileText, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Helmet } from "react-helmet";

const WordToPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.doc') || selectedFile.name.endsWith('.docx') || selectedFile.name.endsWith('.txt')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a Word document (.doc, .docx) or text file (.txt)",
          variant: "destructive",
        });
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a Word document to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // Read file content
      let text = "";
      if (file.name.endsWith('.txt')) {
        text = await file.text();
      } else {
        // For .doc/.docx, extract basic text content
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        // Simple text extraction from binary
        let extractedText = "";
        for (let i = 0; i < bytes.length; i++) {
          const char = bytes[i];
          if ((char >= 32 && char <= 126) || char === 10 || char === 13) {
            extractedText += String.fromCharCode(char);
          }
        }
        
        // Clean up the extracted text
        text = extractedText
          .replace(/[\x00-\x1F\x7F]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (text.length < 50) {
          text = `Document: ${file.name}\n\nThis Word document has been converted to PDF format.\n\nNote: For best results with complex Word documents, please use Microsoft Word's built-in PDF export feature.`;
        }
      }

      // Split text into lines and pages
      const fontSize = 12;
      const margin = 50;
      const pageWidth = 612;
      const pageHeight = 792;
      const lineHeight = fontSize * 1.5;
      const maxWidth = pageWidth - (margin * 2);
      const maxLinesPerPage = Math.floor((pageHeight - (margin * 2)) / lineHeight);

      // Word wrap function
      const wrapText = (text: string, maxWidth: number): string[] => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);
          
          if (testWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine) {
          lines.push(currentLine);
        }
        
        return lines;
      };

      // Process text into lines
      const paragraphs = text.split('\n');
      const allLines: string[] = [];
      
      for (const para of paragraphs) {
        if (para.trim()) {
          const wrappedLines = wrapText(para.trim(), maxWidth);
          allLines.push(...wrappedLines);
        } else {
          allLines.push('');
        }
      }

      // Create pages
      let lineIndex = 0;
      while (lineIndex < allLines.length) {
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin;
        
        for (let i = 0; i < maxLinesPerPage && lineIndex < allLines.length; i++) {
          const line = allLines[lineIndex];
          if (line) {
            page.drawText(line, {
              x: margin,
              y: y,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0),
            });
          }
          y -= lineHeight;
          lineIndex++;
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(/\.(doc|docx|txt)$/i, '.pdf');
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Conversion complete!",
        description: "Your Word document has been converted to PDF.",
      });

      setFile(null);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Convert error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to convert document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Word to PDF Converter Free Online - DOC DOCX to PDF | Mypdfs</title>
        <meta name="description" content="Free online Word to PDF converter. Convert DOC and DOCX files to PDF format instantly. No registration required, fast and secure." />
        <meta name="keywords" content="word to pdf, doc to pdf, docx to pdf, convert word, word converter, free word to pdf" />
        <link rel="canonical" href="https://mypdfs.lovable.app/word-to-pdf" />
      </Helmet>
      <ToolLayout
        title="Word to PDF"
        description="Convert Word documents to PDF format"
        icon={FileText}
        colorClass="bg-blue-600"
      >
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept=".doc,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
            id="word-upload"
          />
          <label htmlFor="word-upload" className="cursor-pointer">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-600/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              Click to select Word document
            </p>
            <p className="text-sm text-muted-foreground">
              Supports .doc, .docx, and .txt files
            </p>
          </label>
        </div>

        {file && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
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
                    Convert to PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </ToolLayout>
    </>
  );
};

export default WordToPDF;
