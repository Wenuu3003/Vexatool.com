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
    whatIs: "The MyPDFs Professional PDF Editor is a comprehensive free online tool designed for editing PDF documents without any software installation. Our editor supports both text-based PDFs and scanned documents through integrated OCR (Optical Character Recognition) technology. Whether you need to correct typos, update outdated information, add annotations, insert images, or apply watermarks to your documents, our PDF editor handles it all directly in your browser. The tool processes your files locally using client-side JavaScript, meaning your sensitive documents never leave your device. This makes it perfect for editing confidential contracts, legal documents, certificates, and personal files. Our precision alignment engine ensures that replaced text matches the original formatting, maintaining document integrity for professional results.",
    howToUse: [
      "Upload your PDF file by clicking the upload area or dragging and dropping the file onto the page.",
      "Wait for the editor to automatically detect whether your PDF is text-based (selectable text) or scanned (image-based).",
      "For text-based PDFs: Click the 'Extract PDF Text' button in the right panel to enable text selection and editing mode.",
      "For scanned PDFs: Click the 'Run OCR' button to perform optical character recognition and detect text from the scanned images.",
      "Click on any detected text block to select it. You can then edit the text directly, delete it, or replace it with new content.",
      "Use the toolbar to add new elements: text boxes, rectangles, circles, lines, arrows, or freehand drawings.",
      "Insert images or your company logo using the Image tool (keyboard shortcut: I key).",
      "Apply watermarks to a single page or all pages using the Watermark tool (keyboard shortcut: W key).",
      "Use the page thumbnails panel on the left to navigate between pages, rotate, delete, duplicate, or reorder pages.",
      "Press Ctrl+Z (Cmd+Z on Mac) to undo changes and Ctrl+Y (Cmd+Y on Mac) to redo.",
      "When finished, click 'Download PDF' to preview your changes and save the edited document in high quality."
    ],
    features: [
      "Advanced OCR technology powered by Tesseract.js for editing scanned and image-based PDFs",
      "Precise text selection and editing with automatic baseline alignment for accurate positioning",
      "Smart text replacement that maintains original font size and layout consistency",
      "Add fully editable text with customizable font family, size, bold, italic, underline, and color",
      "Draw geometric shapes including rectangles, circles, lines, and arrows with stroke and fill options",
      "Freehand drawing tools: pen, highlighter, and underline with adjustable brush size and opacity",
      "Insert images and logos (PNG, JPG, SVG formats) with resize, rotate, and opacity controls",
      "Professional watermarking with text or image watermarks, custom position, opacity, and tiling",
      "Complete page management: rotate (90°, 180°, 270°), delete, duplicate, reorder via drag-and-drop",
      "Add blank pages anywhere in your document for additional content",
      "Intuitive zoom controls: scroll to zoom, fit to width, fit to page, and preset zoom levels",
      "50-level undo/redo history with keyboard shortcuts (Ctrl+Z, Ctrl+Y)",
      "Lock and unlock elements to prevent accidental modifications during editing",
      "High-quality PDF export preserving original DPI, fonts, and vector graphics",
      "Responsive mobile-friendly design that works on tablets and smartphones",
      "No watermarks added to exported files - your documents remain clean and professional",
      "100% secure local processing - files never uploaded to any server"
    ],
    safetyNote: "Your PDF files are processed entirely within your web browser using secure client-side technology. This means your documents never leave your device and are not uploaded to any external server. We use industry-standard JavaScript libraries including PDF.js for rendering and pdf-lib for export. All processing happens locally on your computer, ensuring complete privacy for sensitive documents like contracts, financial records, legal papers, medical documents, and personal files. When you close the editor or navigate away from the page, all file data is automatically cleared from browser memory. We do not store, track, or have access to any of your uploaded documents. This approach provides enterprise-level security without requiring any account registration or personal information.",
    faqs: [
      { question: "Can I replace existing text in a PDF online?", answer: "Yes, you can edit and replace existing text in text-based PDFs. Upload your PDF, click 'Extract PDF Text' to enable text selection mode, then click on any text block to modify it. The editor uses a precision alignment engine to ensure your new text appears in the exact position of the original." },
      { question: "How do I edit scanned PDF files or image-based documents?", answer: "Scanned PDFs require OCR (Optical Character Recognition) to convert image-based text into editable content. After uploading your scanned PDF, click 'Run OCR' in the right panel. The OCR engine will analyze each page and detect text, which you can then select and edit just like a regular PDF." },
      { question: "Will the original PDF quality and formatting be preserved?", answer: "Yes, our editor is designed to preserve the original layout, resolution, and clarity of your document. We use pdf-lib for high-fidelity export, maintaining the original DPI and vector graphics. Text replacements use our baseline alignment engine to match the original line height and spacing." },
      { question: "Is this PDF editor really free and safe to use?", answer: "Yes, MyPDFs PDF Editor is completely free with no hidden costs, subscriptions, or watermarks on exported files. Security-wise, all processing happens locally in your browser - your files are never uploaded to any server. This makes it safe for confidential documents." },
      { question: "How does the text replacement alignment work?", answer: "When you select text to replace, the editor covers the original text with a white patch (redaction layer) and places your new text in the same position using our font-metric baseline alignment system. This ensures the new text matches the original line height and spacing accurately." },
      { question: "Can I add my company logo, signature, or custom watermark?", answer: "Yes! Use the Image tool (I key) to insert logos, photos, or scanned signatures. For watermarks, use the Watermark tool (W key) to add text or image watermarks with customizable opacity, position, and tiling options. Watermarks can be applied to the current page only or all pages at once." },
      { question: "What file formats can I upload and download?", answer: "You can upload standard PDF files (.pdf). The edited document is exported as a high-quality PDF file. For images to insert into your PDF, you can use PNG, JPG, JPEG, and SVG formats." },
      { question: "Does the editor work on mobile devices and tablets?", answer: "Yes, our PDF editor features a responsive design that works on tablets and smartphones. While we recommend a larger screen for complex editing tasks, basic operations like text editing, adding annotations, and page management work well on mobile devices." }
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
