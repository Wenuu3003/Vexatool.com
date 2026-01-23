import { useState, useCallback, lazy, Suspense } from "react";
import { FileEdit, Download, ArrowLeft } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AdPlaceholder } from "@/components/AdBanner";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";

// Lazy load the heavy editor component
const ProfessionalPDFEditor = lazy(() => 
  import("@/components/pdf-editor/ProfessionalPDFEditor").then(m => ({ 
    default: m.ProfessionalPDFEditor 
  }))
);

const EditPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      setIsEditing(true);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsEditing(false);
    setFiles([]);
  }, []);

  const seoContent = {
    toolName: "Professional PDF Editor",
    whatIs: "Our Professional PDF Editor is a powerful free online tool that allows you to edit PDF documents with advanced features. Add text with full formatting options, insert shapes (rectangles, circles, lines, arrows), draw freehand, highlight content, add images and logos, apply watermarks, and manage pages. All editing is done visually with a live preview, undo/redo support, and high-quality PDF export.",
    howToUse: [
      "Upload your PDF file by clicking the upload area or dragging and dropping.",
      "Use the toolbar to select editing tools: text, shapes, drawing, images, or watermarks.",
      "Click anywhere on the PDF to add elements - click to add text, drag to draw shapes.",
      "Select any element to access the properties panel for detailed customization.",
      "Use the page thumbnails on the left to navigate, rotate, reorder, or delete pages.",
      "Press Ctrl+Z to undo and Ctrl+Y to redo changes at any time.",
      "Click 'Download PDF' to save your edited document in high quality."
    ],
    features: [
      "Add editable text with font family, size, bold, italic, underline, and color options",
      "Draw shapes: rectangles, circles, lines, and arrows with customizable stroke and fill",
      "Freehand drawing with pen, highlighter, and underline tools",
      "Add images and logos (PNG, JPG, SVG) with resize and opacity controls",
      "Apply text or image watermarks with position, opacity, and tiling options",
      "Page management: rotate, delete, duplicate, reorder, and add blank pages",
      "Zoom controls: zoom in/out, fit to width, and fit to page",
      "Full undo/redo support with keyboard shortcuts (Ctrl+Z, Ctrl+Y)",
      "Lock/unlock elements to prevent accidental changes",
      "High-quality PDF export preserving original DPI and layout",
      "Mobile-friendly responsive design"
    ],
    safetyNote: "Your PDF files are processed entirely in your browser using secure client-side technology. No files are uploaded to any server, ensuring your documents remain completely private. Files are automatically cleared when you close the editor or leave the page.",
    faqs: [
      { question: "Can I add text to any page in my PDF?", answer: "Yes! Use the page thumbnails on the left to navigate between pages. Each page can have unlimited text, shapes, images, and drawings." },
      { question: "How do I add shapes to my PDF?", answer: "Click on the shape tool (rectangle, circle, line, or arrow) in the toolbar, then click and drag on the PDF to draw the shape. Use the properties panel to customize colors and stroke width." },
      { question: "Can I add my company logo or watermark?", answer: "Yes! Use the Image tool (I key) to add logos, or the Watermark tool (W key) to add text or image watermarks. Watermarks can be applied to all pages with opacity and position controls." },
      { question: "Is there an undo feature?", answer: "Yes! Full undo/redo support is available. Use Ctrl+Z to undo and Ctrl+Y to redo, or click the undo/redo buttons in the toolbar." },
      { question: "Will the edited PDF maintain quality?", answer: "Absolutely! The editor preserves the original PDF quality and DPI. All edits are rendered at high resolution for professional results." },
      { question: "Can I reorder or delete pages?", answer: "Yes! The page thumbnails panel on the left allows you to rotate, delete, duplicate, reorder (drag and drop), and add blank pages to your PDF." }
    ]
  };

  return (
    <>
      <CanonicalHead 
        title="Professional PDF Editor Online Free - Edit PDF with Text, Shapes, Images | Mypdfs"
        description="Free professional PDF editor online. Add text, shapes, drawings, images, watermarks. Rotate, delete, reorder pages. High-quality export."
        keywords="PDF editor, edit PDF online, add text to PDF, PDF shapes, PDF watermark, PDF page editor, free PDF editor, professional PDF editor"
      />
      <ToolLayout
        title="Professional PDF Editor"
        description="Full-featured PDF editor with text, shapes, images, watermarks, and page management"
        icon={FileEdit}
        colorClass="bg-tool-edit"
      >
        <div className="space-y-6">
          <AdPlaceholder className="h-20" />

          {!isEditing ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">Upload a PDF to Start Editing</h2>
                <p className="text-muted-foreground">
                  Add text, shapes, images, watermarks, and manage pages with our professional editor
                </p>
              </div>
              <FileUpload
                files={files}
                onFilesChange={handleFileChange}
                colorClass="bg-tool-edit"
                multiple={false}
                accept=".pdf"
              />
              
              {/* Feature highlights */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl mb-2">✏️</div>
                  <h3 className="font-medium text-sm">Add Text</h3>
                  <p className="text-xs text-muted-foreground">Fonts, sizes, colors</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl mb-2">🔷</div>
                  <h3 className="font-medium text-sm">Draw Shapes</h3>
                  <p className="text-xs text-muted-foreground">Rectangles, circles, arrows</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl mb-2">🖼️</div>
                  <h3 className="font-medium text-sm">Add Images</h3>
                  <p className="text-xs text-muted-foreground">Logos, photos, graphics</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl mb-2">💧</div>
                  <h3 className="font-medium text-sm">Watermarks</h3>
                  <p className="text-xs text-muted-foreground">Text or image watermarks</p>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {/* Back button */}
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleClose}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Upload
                </Button>
                <div className="flex items-center gap-2">
                  <FileEdit className="w-5 h-5 text-tool-edit" />
                  <span className="font-medium">{files[0]?.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ({(files[0]?.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              </div>

              {/* Editor */}
              <Suspense fallback={
                <div className="flex items-center justify-center h-[600px] bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading editor...</p>
                  </div>
                </div>
              }>
                <ProfessionalPDFEditor 
                  file={files[0]} 
                  onClose={handleClose}
                />
              </Suspense>
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
