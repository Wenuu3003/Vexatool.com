import { useState, useRef, useCallback } from "react";
import { FileEdit, Plus, Type, Image, Download, Trash2, Move } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { useFileHistory } from "@/hooks/useFileHistory";
import { AdPlaceholder } from "@/components/AdBanner";
import { Helmet } from "react-helmet";

interface TextAnnotation {
  id: string;
  text: string;
  x: number;
  y: number;
  page: number;
  fontSize: number;
}

const EditPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [annotations, setAnnotations] = useState<TextAnnotation[]>([]);
  const [newText, setNewText] = useState("");
  const [fontSize, setFontSize] = useState(12);
  const { toast } = useToast();
  const { saveFileHistory } = useFileHistory();

  const addTextAnnotation = () => {
    if (!newText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to add",
        variant: "destructive",
      });
      return;
    }

    const annotation: TextAnnotation = {
      id: Date.now().toString(),
      text: newText,
      x: 50,
      y: 700,
      page: 0,
      fontSize: fontSize,
    };

    setAnnotations([...annotations, annotation]);
    setNewText("");
    toast({
      title: "Text Added",
      description: "Text annotation will be added to page 1",
    });
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }

    if (annotations.length === 0) {
      toast({
        title: "No edits",
        description: "Please add at least one text annotation",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (const annotation of annotations) {
        const pageIndex = Math.min(annotation.page, pages.length - 1);
        const page = pages[pageIndex];
        
        page.drawText(annotation.text, {
          x: annotation.x,
          y: annotation.y,
          size: annotation.fontSize,
          font: font,
          color: rgb(0, 0, 0),
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

      setAnnotations([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to edit PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Edit PDF Online Free - Add Text & Annotations | Mypdfs</title>
        <meta name="description" content="Free online PDF editor. Add text, annotations, and images to your PDF documents. Easy to use, no software required." />
        <meta name="keywords" content="edit PDF, PDF editor, add text to PDF, annotate PDF, free PDF editor, online PDF edit" />
        <link rel="canonical" href="https://mypdfs.lovable.app/edit-pdf" />
      </Helmet>
      <ToolLayout
        title="Edit PDF"
        description="Add text, images, and annotations to your PDF"
        icon={FileEdit}
        colorClass="bg-tool-edit"
      >
      <div className="space-y-6">
        <AdPlaceholder className="h-20" />
        
        <FileUpload
          files={files}
          onFilesChange={setFiles}
          colorClass="bg-tool-edit"
          multiple={false}
        />

        {files.length > 0 && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-card p-4 rounded-lg border border-border space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Type className="w-4 h-4" />
                Add Text
              </h3>
              
              <div className="flex gap-2">
                <Input
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Enter text to add..."
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-20"
                  min={8}
                  max={72}
                />
                <Button onClick={addTextAnnotation} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {annotations.length > 0 && (
              <div className="bg-card p-4 rounded-lg border border-border space-y-2">
                <h4 className="font-medium text-foreground">Annotations ({annotations.length})</h4>
                {annotations.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm text-foreground truncate flex-1">{a.text}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAnnotation(a.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={handleProcess}
              disabled={isProcessing || annotations.length === 0}
              className="w-full bg-tool-edit hover:bg-tool-edit/90"
            >
              {isProcessing ? (
                "Processing..."
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
      </ToolLayout>
    </>
  );
};

export default EditPDF;
