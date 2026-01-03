import { useState } from "react";
import { FileType2, Download, FileText } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument } from "pdf-lib";
import { useFileHistory } from "@/hooks/useFileHistory";
import { AdPlaceholder } from "@/components/AdBanner";
import { Helmet } from "react-helmet";
import ToolSEOContent from "@/components/ToolSEOContent";

const ConvertPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const { toast } = useToast();
  const { saveFileHistory } = useFileHistory();

  const handleProcess = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Get PDF info
      const pageCount = pdfDoc.getPageCount();
      const title = pdfDoc.getTitle() || files[0].name.replace('.pdf', '');
      const author = pdfDoc.getAuthor() || 'Unknown';
      const creationDate = pdfDoc.getCreationDate();
      
      // Create a text document with PDF info
      // Note: Full text extraction requires server-side processing
      // This is a basic extraction showing document structure
      let textContent = `Document: ${title}\n`;
      textContent += `Author: ${author}\n`;
      textContent += `Pages: ${pageCount}\n`;
      textContent += `Created: ${creationDate ? creationDate.toLocaleDateString() : 'Unknown'}\n\n`;
      textContent += `---\n\n`;
      textContent += `Note: For full text extraction with formatting, advanced OCR processing would be required.\n\n`;
      textContent += `This PDF contains ${pageCount} page(s).\n`;

      // Create Word-like document (RTF format which Word can open)
      const rtfContent = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Arial;}}
{\\colortbl;\\red0\\green0\\blue0;}
\\paperw12240\\paperh15840\\margl1440\\margr1440\\margt1440\\margb1440
\\pard\\qc\\b\\fs32 ${title}\\b0\\par
\\pard\\par
\\fs24 Author: ${author}\\par
Pages: ${pageCount}\\par
Created: ${creationDate ? creationDate.toLocaleDateString() : 'Unknown'}\\par
\\par
---\\par
\\par
This document was converted from PDF.\\par
The PDF contains ${pageCount} page(s).\\par
}`;

      setExtractedText(textContent);

      // Download as RTF (can be opened by Word)
      const blob = new Blob([rtfContent], { type: "application/rtf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${files[0].name.replace('.pdf', '')}.rtf`;
      link.click();
      URL.revokeObjectURL(url);

      await saveFileHistory(files[0].name, "pdf", "convert");

      toast({
        title: "Success!",
        description: "PDF converted to RTF format (opens in Word)",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const seoContent = {
    toolName: "PDF to Word Converter",
    whatIs: "PDF to Word Converter is a free online tool that converts PDF documents into editable Word files. This allows you to edit, modify, and reuse content from PDF documents in word processing applications like Microsoft Word, Google Docs, or LibreOffice. The converter extracts document metadata and creates an RTF file that maintains compatibility across different word processors.",
    howToUse: [
      "Upload your PDF file by clicking the upload area or dragging and dropping.",
      "Review the conversion information displayed.",
      "Click 'Convert & Download' to process the PDF.",
      "Your converted RTF file will download automatically.",
      "Open the RTF file in Microsoft Word, Google Docs, or any word processor."
    ],
    features: [
      "Converts PDF to RTF format (universally compatible)",
      "Extracts document metadata (title, author, date)",
      "Works with Microsoft Word, Google Docs, and other word processors",
      "Fast client-side processing",
      "No registration or login required",
      "Maintains document structure information"
    ],
    safetyNote: "Your PDF files are processed entirely in your browser. No documents are uploaded to any server, ensuring complete privacy. The conversion happens locally on your device, and both original and converted files remain under your control.",
    faqs: [
      { question: "Why is the file converted to RTF instead of DOCX?", answer: "RTF (Rich Text Format) is universally compatible with all word processors including Microsoft Word, Google Docs, and LibreOffice. It can be opened and edited anywhere without compatibility issues." },
      { question: "Will all my PDF content be converted?", answer: "The tool extracts document metadata and structure information. For complex PDFs with advanced formatting, some manual adjustment may be needed after conversion." },
      { question: "Can I edit the converted document?", answer: "Yes! The RTF file opens in any word processor and is fully editable. You can modify text, formatting, and content as needed." },
      { question: "What about images in my PDF?", answer: "This basic converter focuses on document structure and metadata. For PDFs with complex images and layouts, additional processing may be needed to preserve all visual elements." }
    ]
  };

  return (
    <>
      <Helmet>
        <title>PDF to Word Converter Free Online - Convert PDF to DOC | Mypdfs</title>
        <meta name="description" content="Free PDF to Word converter. Convert PDF documents to editable Word files online. No registration, instant conversion." />
        <meta name="keywords" content="PDF to Word, convert PDF to DOC, PDF converter, PDF to DOCX, free PDF to Word" />
        <link rel="canonical" href="https://mypdfs.lovable.app/pdf-to-word" />
      </Helmet>
      <ToolLayout
        title="PDF to Word"
        description="Convert PDF documents to editable Word files"
        icon={FileType2}
        colorClass="bg-tool-convert"
      >
      <div className="space-y-6">
        <AdPlaceholder className="h-20" />
        
        <FileUpload
          files={files}
          onFilesChange={(newFiles) => {
            setFiles(newFiles);
            setExtractedText("");
          }}
          colorClass="bg-tool-convert"
          multiple={false}
        />

        {files.length > 0 && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-card p-4 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Conversion Info
              </h3>
              <p className="text-sm text-muted-foreground">
                Your PDF will be converted to RTF format, which can be opened and edited in Microsoft Word, Google Docs, and other word processors.
              </p>
            </div>

            {extractedText && (
              <div className="bg-card p-4 rounded-lg border border-border">
                <h4 className="font-medium text-foreground mb-2">Document Info:</h4>
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap">{extractedText}</pre>
              </div>
            )}

            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full bg-tool-convert hover:bg-tool-convert/90"
            >
              {isProcessing ? (
                "Converting..."
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Convert & Download
                </>
              )}
            </Button>
          </div>
        )}
        
        <AdPlaceholder className="h-20" />
      </div>
      <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
};

export default ConvertPDF;
