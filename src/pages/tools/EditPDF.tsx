import { useState, useCallback, lazy, Suspense } from "react";
import { FileEdit, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet";
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

  // FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Can I replace existing text in a PDF online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can replace existing text in a PDF if it is text-based. Upload the PDF, select the text, delete it and type new text in the same position."
        }
      },
      {
        "@type": "Question",
        "name": "Can I edit scanned PDF files?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, scanned PDFs can be edited using OCR technology which converts scanned images into editable text."
        }
      },
      {
        "@type": "Question",
        "name": "Will the original PDF quality be preserved?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, the editor preserves the original layout, clarity and formatting while editing."
        }
      },
      {
        "@type": "Question",
        "name": "Is this PDF editor free and safe?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, this PDF editor is free to use and files are processed securely without permanent storage."
        }
      },
      {
        "@type": "Question",
        "name": "How does OCR work for scanned PDFs?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "OCR (Optical Character Recognition) analyzes the scanned image and identifies text patterns, converting them into selectable and editable text that you can modify or replace."
        }
      },
      {
        "@type": "Question",
        "name": "Can I add images and signatures to my PDF?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can add images, logos, and signatures to your PDF. Simply use the image tool to upload and position your graphics anywhere on the document."
        }
      }
    ]
  };

  const seoContent = {
    toolName: "Professional PDF Editor with OCR",
    whatIs: "Our Professional PDF Editor is a powerful free online tool that allows you to edit PDF documents with advanced features including OCR (Optical Character Recognition) for scanned documents. Edit text-based PDFs by selecting and replacing existing text, or use OCR to convert scanned documents into editable text. Add new text with full formatting options, insert shapes, draw freehand, highlight content, add images and logos, apply watermarks, and manage pages. All editing is done visually with a live preview, undo/redo support, and high-quality PDF export.",
    howToUse: [
      "Upload your PDF file by clicking the upload area or dragging and dropping.",
      "The editor automatically detects if your PDF is text-based or scanned.",
      "For text-based PDFs: Click 'Extract PDF Text' to enable text selection and editing.",
      "For scanned PDFs: Click 'Run OCR' to detect text using optical character recognition.",
      "Click on any detected text to edit, delete, or replace it with new content.",
      "Use the toolbar to add new text, shapes, images, drawings, or watermarks.",
      "Use the page thumbnails on the left to navigate, rotate, reorder, or delete pages.",
      "Press Ctrl+Z to undo and Ctrl+Y to redo changes at any time.",
      "Click 'Download PDF' to save your edited document in high quality."
    ],
    features: [
      "OCR technology for editing scanned and image-based PDFs",
      "Select, edit, delete, and replace existing PDF text",
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
      "Mobile-friendly responsive design",
      "No watermarks on exported files",
      "100% secure - files processed locally in your browser"
    ],
    safetyNote: "Your PDF files are processed entirely in your browser using secure client-side technology. No files are uploaded to any server, ensuring your documents remain completely private. Files are automatically cleared when you close the editor or leave the page.",
    faqs: [
      { question: "Can I replace existing text in a PDF online?", answer: "Yes, you can replace existing text in a PDF if it is text-based. Upload the PDF, click 'Extract PDF Text', then click on any text to edit or replace it." },
      { question: "Can I edit scanned PDF files?", answer: "Yes, scanned PDFs can be edited using OCR technology which converts scanned images into editable text. Click 'Run OCR' after uploading your scanned PDF." },
      { question: "Will the original PDF quality be preserved?", answer: "Yes, the editor preserves the original layout, clarity and formatting while editing. All exports maintain the original DPI and resolution." },
      { question: "Is this PDF editor free and safe?", answer: "Yes, this PDF editor is completely free to use and files are processed securely in your browser without any server uploads." },
      { question: "How does the text replacement work?", answer: "When you select text to replace, the editor covers the original text with a white patch and places your new text in the same position, maintaining the document's layout." },
      { question: "Can I add my company logo or watermark?", answer: "Yes! Use the Image tool (I key) to add logos, or the Watermark tool (W key) to add text or image watermarks. Watermarks can be applied to all pages with opacity and position controls." }
    ]
  };

  return (
    <>
      <CanonicalHead 
        title="Edit PDF Online – Replace Text, OCR Scanned PDFs | Free PDF Editor"
        description="Free online PDF editor to edit and replace text, add new content, OCR scanned PDFs, insert images, watermark, sign and download high-quality PDFs instantly."
        keywords="PDF editor, edit PDF online, OCR PDF, replace PDF text, scanned PDF editor, add text to PDF, PDF watermark, free PDF editor, online PDF editor"
      />
      
      {/* FAQ Schema */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      
      <ToolLayout
        title="Edit PDF Online – Replace Text, OCR Scanned PDFs"
        description="Free online PDF editor with OCR. Edit, replace, and add text to any PDF including scanned documents."
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
                  Edit text-based PDFs directly or use OCR for scanned documents. Replace, delete, or add new content.
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
                  <h3 className="font-medium text-sm">Edit & Replace Text</h3>
                  <p className="text-xs text-muted-foreground">Select & modify existing text</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl mb-2">📝</div>
                  <h3 className="font-medium text-sm">OCR Technology</h3>
                  <p className="text-xs text-muted-foreground">Edit scanned PDFs</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl mb-2">🖼️</div>
                  <h3 className="font-medium text-sm">Add Images</h3>
                  <p className="text-xs text-muted-foreground">Logos, photos, signatures</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl mb-2">💧</div>
                  <h3 className="font-medium text-sm">Watermarks</h3>
                  <p className="text-xs text-muted-foreground">Text or image watermarks</p>
                </div>
              </div>
              
              {/* Additional info */}
              <div className="bg-muted/20 rounded-lg p-4 mt-4">
                <h3 className="font-medium mb-2">Supported PDF Types</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-primary">Text-Based PDFs</p>
                    <p className="text-muted-foreground">
                      PDFs with selectable text can be edited directly. Click on text to select, delete, or replace it.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-primary">Scanned PDFs</p>
                    <p className="text-muted-foreground">
                      Image-based or scanned PDFs use OCR to detect text. High accuracy for English documents.
                    </p>
                  </div>
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
