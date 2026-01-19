import { useState, useCallback } from "react";
import { FileEdit, Download, RotateCcw } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { useFileHistory } from "@/hooks/useFileHistory";
import { AdPlaceholder } from "@/components/AdBanner";
import { Helmet } from "react-helmet";
import ToolSEOContent from "@/components/ToolSEOContent";
import PDFCanvasEditor, { TextElement } from "@/components/pdf/PDFCanvasEditor";

const EditPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const { toast } = useToast();
  const { saveFileHistory } = useFileHistory();

  const handleReset = useCallback(() => {
    setTextElements([]);
    setSelectedElement(null);
    toast({
      title: "Reset",
      description: "All text elements have been cleared",
    });
  }, [toast]);

  const handleProcess = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }

    if (textElements.length === 0) {
      toast({
        title: "No edits",
        description: "Please add at least one text element",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // Map font families to pdf-lib standard fonts
      const fontMap: Record<string, typeof StandardFonts[keyof typeof StandardFonts]> = {
        "Helvetica": StandardFonts.Helvetica,
        "Times-Roman": StandardFonts.TimesRoman,
        "Courier": StandardFonts.Courier,
      };

      // Embed all needed fonts
      const embeddedFonts: Record<string, Awaited<ReturnType<typeof pdfDoc.embedFont>>> = {};
      for (const family of Object.keys(fontMap)) {
        embeddedFonts[family] = await pdfDoc.embedFont(fontMap[family]);
      }

      for (const element of textElements) {
        const pageIndex = Math.min(element.page, pages.length - 1);
        const page = pages[pageIndex];
        const { height: pageHeight } = page.getSize();

        // Get the font for this element
        const font = embeddedFonts[element.fontFamily] || embeddedFonts["Helvetica"];

        // Parse color from hex to RGB
        const hexColor = element.color.replace("#", "");
        const r = parseInt(hexColor.substring(0, 2), 16) / 255;
        const g = parseInt(hexColor.substring(2, 4), 16) / 255;
        const b = parseInt(hexColor.substring(4, 6), 16) / 255;

        // Calculate scale factor (we rendered at a specific scale, need to convert back)
        // The canvas was rendered at a scale that fits container, we need to map back to PDF coords
        const viewport = page.getSize();
        
        // Assuming canvas was rendered at scale to fit ~600px width
        const canvasScale = Math.min(560 / viewport.width, 1.5);
        
        // Convert canvas coordinates to PDF coordinates
        const pdfX = element.x / canvasScale;
        // PDF y-coordinates are from bottom, canvas from top
        const pdfY = pageHeight - (element.y / canvasScale) - (element.fontSize / canvasScale);

        page.drawText(element.text, {
          x: pdfX,
          y: pdfY,
          size: element.fontSize / canvasScale,
          font: font,
          color: rgb(r, g, b),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `edited_${files[0].name}`;
      link.click();
      URL.revokeObjectURL(url);

      await saveFileHistory(files[0].name, "pdf", "edit");

      toast({
        title: "Success!",
        description: "PDF edited and downloaded",
      });

      setTextElements([]);
      setSelectedElement(null);
    } catch (error) {
      console.error("Error editing PDF:", error);
      toast({
        title: "Error",
        description: "Failed to edit PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const seoContent = {
    toolName: "Edit PDF",
    whatIs: "Edit PDF is a powerful free online visual PDF editor that allows you to add text directly onto your PDF pages. Click anywhere on the document to add text, drag to reposition, and customize fonts, sizes, and colors. All editing is done visually with a live preview, making it easy to place text exactly where you need it.",
    howToUse: [
      "Upload your PDF file by clicking the upload area or dragging and dropping.",
      "Click anywhere on the PDF page where you want to add text.",
      "Double-click the text element to edit the content.",
      "Use the toolbar to change font family, size, and color.",
      "Drag text elements to reposition them anywhere on the page.",
      "Add multiple text elements across different pages.",
      "Click 'Download Edited PDF' to save your changes."
    ],
    features: [
      "Visual WYSIWYG PDF editing",
      "Click-to-add text anywhere on the page",
      "Drag and drop text repositioning",
      "Multiple font families (Helvetica, Times, Courier)",
      "Adjustable font sizes (8-72 points)",
      "Six color options for text",
      "Multi-page PDF support with page navigation",
      "Touch-friendly for mobile devices",
      "Live preview of all changes"
    ],
    safetyNote: "Your PDF files are processed entirely in your browser using secure client-side technology. No files are uploaded to any server, ensuring your documents remain completely private. The tool uses pdf-lib and pdf.js libraries for reliable PDF editing and rendering.",
    faqs: [
      { question: "Can I add text to any page in my PDF?", answer: "Yes! Use the page navigation buttons to switch between pages and add text to any page in your document." },
      { question: "How do I move text after adding it?", answer: "Simply click and drag any text element to move it to a new position. You can also see a list of all text elements below the PDF preview." },
      { question: "Can I edit the text after adding it?", answer: "Yes, double-click on any text element to edit its content. You can also change the font, size, and color using the toolbar that appears when you select a text element." },
      { question: "What fonts are available?", answer: "The editor includes three professional fonts: Helvetica (clean and modern), Times New Roman (classic serif), and Courier (monospace). These fonts are embedded in the PDF for universal compatibility." },
      { question: "Does this work on mobile devices?", answer: "Yes! The editor is fully touch-friendly. Tap to add text, touch and drag to move elements, and double-tap to edit." }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Edit PDF Online Free - Visual PDF Editor | Mypdfs</title>
        <meta name="description" content="Free online visual PDF editor. Click to add text anywhere, drag to move, customize fonts and colors. Easy WYSIWYG PDF editing, no software required." />
        <meta name="keywords" content="edit PDF, PDF editor, add text to PDF, visual PDF editor, WYSIWYG PDF, free PDF editor, online PDF edit, drag drop PDF" />
        <link rel="canonical" href="https://mypdfs.lovable.app/edit-pdf" />
      </Helmet>
      <ToolLayout
        title="Edit PDF"
        description="Visual PDF editor - click to add text, drag to move"
        icon={FileEdit}
        colorClass="bg-tool-edit"
      >
        <div className="space-y-6">
          <AdPlaceholder className="h-20" />

          {files.length === 0 ? (
            <FileUpload
              files={files}
              onFilesChange={setFiles}
              colorClass="bg-tool-edit"
              multiple={false}
              accept=".pdf"
            />
          ) : (
            <div className="space-y-4">
              {/* File info and actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <FileEdit className="w-5 h-5 text-tool-edit" />
                  <div>
                    <p className="font-medium text-foreground">{files[0].name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(files[0].size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFiles([]);
                      setTextElements([]);
                      setSelectedElement(null);
                    }}
                  >
                    Change File
                  </Button>
                  {textElements.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              {/* PDF Canvas Editor */}
              <PDFCanvasEditor
                file={files[0]}
                textElements={textElements}
                onTextElementsChange={setTextElements}
                selectedElement={selectedElement}
                onSelectElement={setSelectedElement}
              />

              {/* Download Button */}
              <Button
                onClick={handleProcess}
                disabled={isProcessing || textElements.length === 0}
                className="w-full bg-tool-edit hover:bg-tool-edit/90"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download Edited PDF
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

export default EditPDF;
