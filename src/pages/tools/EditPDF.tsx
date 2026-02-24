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
    toolName: "Free Online PDF Editor with OCR",
    whatIs: "The Mypdfs Professional PDF Editor is the most comprehensive free online tool for editing PDF documents directly in your browser – no software installation needed. Our advanced editor handles both regular text-based PDFs and scanned documents through integrated OCR (Optical Character Recognition) technology powered by Tesseract.js. Edit existing text, correct typos, update outdated information, add annotations, insert logos and images, apply professional watermarks, draw shapes, and highlight important content – all from one intuitive interface. Unlike basic PDF editors, our precision alignment engine ensures that when you replace text, the new content appears in exactly the right position, maintaining your document's professional appearance. Perfect for editing contracts, invoices, certificates, forms, letters, reports, and any PDF document that needs quick modifications. Your files are processed entirely on your device using secure client-side JavaScript, meaning sensitive documents like financial records, legal papers, medical forms, and confidential business materials never leave your computer.",
    howToUse: [
      "Click the upload area or drag-and-drop your PDF file onto the page to begin editing.",
      "The editor automatically detects whether your PDF contains selectable text or is a scanned image.",
      "For text-based PDFs: Click 'Extract PDF Text' in the right panel to enable text selection and inline editing.",
      "For scanned PDFs: Click 'Run OCR' to detect and extract text from scanned pages using optical character recognition.",
      "Select any text block to edit, delete, or replace it with new content – the precision engine maintains perfect alignment.",
      "Use the toolbar to add new elements: text boxes, rectangles, circles, lines, arrows, or freehand annotations.",
      "Insert images, company logos, or signatures using the Image tool (keyboard shortcut: I).",
      "Apply text or image watermarks to single pages or entire documents (keyboard shortcut: W).",
      "Navigate between pages using the thumbnail sidebar; rotate, delete, duplicate, or reorder pages as needed.",
      "Undo mistakes with Ctrl+Z (Cmd+Z on Mac) and redo with Ctrl+Y (Cmd+Y on Mac) – up to 50 steps.",
      "Click 'Download PDF' when finished to preview your edits and save the high-quality output file."
    ],
    features: [
      "Industry-leading OCR technology powered by Tesseract.js for editing scanned PDFs and image-based documents.",
      "Precise text selection with automatic baseline alignment for pixel-perfect text replacement.",
      "Smart text editing that preserves original font sizes, line spacing, and document layout.",
      "Rich text formatting: choose fonts, sizes, bold, italic, underline, and any color.",
      "Professional drawing tools: rectangles, circles, lines, arrows with customizable stroke and fill colors.",
      "Freehand annotation: pen, highlighter, and underline tools with adjustable brush size and opacity.",
      "Image insertion supporting PNG, JPG, SVG formats with resize, rotate, and opacity controls.",
      "Watermarking system with text or image watermarks, tiling patterns, and adjustable transparency.",
      "Complete page management: rotate 90°/180°/270°, delete pages, duplicate, reorder via drag-and-drop.",
      "Insert blank pages anywhere in your document for additional content or spacing.",
      "Smooth zoom controls: scroll-to-zoom, fit-to-width, fit-to-page, and preset zoom levels.",
      "50-level undo/redo history with full keyboard shortcut support for efficient editing.",
      "Element locking to prevent accidental modifications to finished elements.",
      "High-fidelity PDF export preserving original resolution, embedded fonts, and vector graphics.",
      "Responsive design optimized for desktops, tablets, and mobile devices.",
      "No watermarks added to your exported files – professional results every time.",
      "100% secure local processing – your files never upload to any external server."
    ],
    safetyNote: "Every PDF you edit is processed entirely within your web browser using secure client-side JavaScript libraries. Your documents never leave your device and are not transmitted to any external server. We use industry-trusted libraries: PDF.js for rendering and pdf-lib for export. All file data is automatically cleared from browser memory when you close the editor or navigate away. We have no access to your documents and store no user data. This client-side approach provides enterprise-grade security without requiring registration, subscriptions, or personal information. Perfect for editing confidential contracts, financial statements, legal documents, medical records, and any sensitive files.",
    faqs: [
      { question: "Can I edit and replace existing text directly in a PDF?", answer: "Yes! For text-based PDFs with selectable text, click 'Extract PDF Text' to enable editing mode, then click any text block to select and modify it. Our precision alignment engine covers the original text and places your new text in the exact same position, preserving the document's professional layout." },
      { question: "How do I edit scanned PDFs or image-based documents?", answer: "Scanned PDFs require OCR (Optical Character Recognition) to convert images into editable text. After uploading your scanned document, click 'Run OCR' in the right panel. The OCR engine analyzes each page, detects text regions, and makes them editable just like a regular PDF. OCR accuracy is highest for clear, well-scanned English documents." },
      { question: "Will editing preserve my PDF's original quality and formatting?", answer: "Absolutely. Our editor uses pdf-lib for high-fidelity export, preserving the original DPI, embedded fonts, and vector graphics. Text replacements use our baseline alignment engine to match original line heights, spacing, and positioning exactly." },
      { question: "Is this PDF editor really free with no hidden costs?", answer: "Yes, the Mypdfs PDF Editor is 100% free with no hidden fees, subscriptions, or premium tiers. We don't add watermarks to your exported files. The tool is free because all processing happens in your browser – we don't need expensive servers to handle your files." },
      { question: "How does the text replacement alignment work technically?", answer: "When you edit text, the editor creates a white redaction patch over the original text and positions your replacement text using font-metric baseline alignment. This calculates the exact line height, character spacing, and position to ensure your new text appears in precisely the right location." },
      { question: "Can I add my company logo, electronic signature, or custom watermark?", answer: "Yes! Use the Image tool (press I) to insert logos, photos, or scanned signatures anywhere on your document. For watermarks, use the Watermark tool (press W) to add text or image watermarks with adjustable opacity, position, rotation, and tiling options. Watermarks can be applied to single pages or all pages at once." },
      { question: "What file types can I upload and download?", answer: "You can upload standard PDF files (.pdf). The edited document exports as a high-quality PDF file. For inserting images into your PDF, PNG, JPG, JPEG, and SVG formats are all supported." },
      { question: "Does the PDF editor work on mobile phones and tablets?", answer: "Yes! Our editor features a fully responsive design that adapts to any screen size. While we recommend larger screens for complex editing tasks, basic operations like text editing, annotations, and page management work smoothly on tablets and smartphones." }
    ]
  };

  return (
    <>
      <CanonicalHead 
        title="PDF Editor Online Free – Edit PDF Without Watermark | VexaTool"
        description="Free online PDF editor India. Edit text, add images, OCR scanned documents. No watermark, no signup. Best free PDF editing tool for students & professionals."
        keywords="PDF editor online free, edit PDF without watermark, online PDF editor India, free PDF editing tool, modify PDF text, OCR PDF editor, PDF editor for students, best free PDF editor"
      />
      
      {/* FAQ Schema */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      
      <ToolLayout
        title="PDF Editor Online Free – No Watermark"
        description="Edit text, add images, OCR scanned documents. Free online PDF editor for students & professionals."
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
