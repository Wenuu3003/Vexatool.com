import { useState, useCallback, lazy, Suspense } from "react";
import { FileEdit, ArrowLeft, ScanText, LayoutGrid, Shield, Smartphone } from "lucide-react";
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

  // FAQ Schema for SEO — 10 detailed, unique questions
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I edit text in a PDF online for free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Upload your PDF to the VexaTool PDF Editor. For text-based PDFs the editor automatically extracts selectable text. Click any text block in the sidebar or directly on the page to select it, then edit or replace the content. For scanned documents, run the built-in OCR first. All processing happens in your browser — no signup, no watermark, completely free."
        }
      },
      {
        "@type": "Question",
        "name": "Can I edit scanned or image-based PDF files?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. The editor includes a dual-pass OCR engine powered by Tesseract.js. After uploading a scanned PDF, click 'Run OCR' to detect text regions. The OCR uses image preprocessing (grayscale conversion, contrast enhancement, binarization) for high accuracy even on faint or low-quality scans. Detected text becomes fully editable."
        }
      },
      {
        "@type": "Question",
        "name": "What is block-based PDF editing?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Block-based editing groups individual words into meaningful regions — paragraphs, table rows, form fields, or single lines — so you can select and replace an entire section at once instead of editing word by word. The VexaTool editor automatically detects the best grouping mode (Auto, Paragraph, Table, or Form) based on your document's layout."
        }
      },
      {
        "@type": "Question",
        "name": "What are the segmentation modes (Auto, Paragraph, Table, Form)?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "These modes control how detected text is grouped into editable blocks. 'Auto' analyses the page layout and picks the best strategy. 'Paragraph' groups lines with similar indentation into multi-line blocks. 'Table' creates tighter, row-level or cell-level blocks for tabular data. 'Form' detects label-value pairs common in structured forms. You can switch modes at any time from the OCR panel."
        }
      },
      {
        "@type": "Question",
        "name": "Does the PDF editor work on mobile phones and tablets?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. The editor is fully responsive with touch-friendly controls, pinch-to-zoom, swipe page navigation, and slide-out panels for pages and text editing. It adapts to any screen size. For complex multi-page editing we recommend a tablet or desktop, but basic text edits, annotations, and OCR work well on smartphones."
        }
      },
      {
        "@type": "Question",
        "name": "Are my PDF files stored on your servers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Every file you upload is processed entirely inside your web browser using client-side JavaScript. Your PDF never leaves your device — it is not uploaded to any server. When you close the editor or navigate away, all file data is cleared from browser memory. This makes the editor safe for confidential documents like contracts, medical records, legal papers, and financial statements."
        }
      },
      {
        "@type": "Question",
        "name": "Is this PDF editor really free? Are there hidden costs or watermarks?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The VexaTool PDF Editor is 100% free with no hidden fees, no premium tier, and no watermarks on exported files. Because all processing happens locally in your browser, there are no server costs to pass on. You get professional-grade editing with zero cost."
        }
      },
      {
        "@type": "Question",
        "name": "How does the text replacement engine keep alignment accurate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "When you replace a text block, the editor places a white redaction mask over the original content and positions your new text using font-metric baseline alignment. It calculates the exact ascent, line height, and character width so the replacement text sits in precisely the same position as the original — both on screen and in the exported PDF."
        }
      },
      {
        "@type": "Question",
        "name": "What happens when I click Download PDF?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Clicking Download opens a preview dialog showing your edits. On confirmation, the editor writes all changes (text replacements, images, shapes, watermarks, redactions, drawings) into the original PDF structure using pdf-lib, preserving the original resolution, embedded fonts, and vector graphics. The result downloads as a standard PDF file — no quality loss."
        }
      },
      {
        "@type": "Question",
        "name": "Can I add images, signatures, and watermarks to my PDF?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Use the Image tool (keyboard shortcut I) to insert logos, photos, or scanned signatures in PNG, JPG, or SVG format. The Watermark tool (shortcut W) adds text or image watermarks with adjustable opacity, position, rotation, and tiling. You can apply watermarks to the current page or all pages at once."
        }
      }
    ]
  };

  const seoContent = {
    toolName: "Free Online PDF Editor with Block-Based OCR Editing",
    whatIs: "The VexaTool PDF Editor is a professional-grade, free online tool that lets you edit any PDF document directly in your browser — no software installation, no signup, no watermarks. It handles both text-based and scanned PDFs through an integrated OCR engine powered by Tesseract.js. What sets this editor apart is its block-based editing workflow: instead of struggling with tiny word-level overlays, the editor intelligently groups detected text into paragraphs, table rows, form fields, or single lines. You select an entire block, edit or replace the text in a sidebar panel, and the precision alignment engine places your new content in exactly the right position. The editor supports four segmentation modes — Auto, Paragraph, Table, and Form — so it adapts to any document structure: contracts, invoices, government forms, academic certificates, railway lists, hospital records, or spreadsheet-style tables. Add images, logos, electronic signatures, freehand annotations, shapes, and professional watermarks. Manage multi-page documents with thumbnail navigation, page rotation, reordering, duplication, and deletion. Every file is processed entirely on your device using secure client-side JavaScript — your documents never leave your computer, making it safe for confidential financial, legal, and medical files. Works on desktops, tablets, and mobile phones.",
    howToUse: [
      "Upload your PDF by clicking the upload area or dragging and dropping the file.",
      "The editor automatically detects whether your PDF is text-based or scanned and shows the appropriate options.",
      "For text-based PDFs: text is auto-extracted. Switch to the 'Edit Text' tab in the sidebar to see detected blocks.",
      "For scanned PDFs: click 'Run OCR' in the 'OCR & Props' tab. The dual-pass OCR engine detects text with image preprocessing for maximum accuracy.",
      "Choose a segmentation mode — Auto (recommended), Paragraph, Table, or Form — to control how text is grouped into editable blocks.",
      "Click any block in the sidebar or directly on the page to select it. The selected region highlights on the canvas.",
      "Click 'Edit' to modify the text, then 'Replace' to apply. The editor covers the original text and positions your replacement with pixel-perfect alignment.",
      "Use the toolbar to add text boxes, shapes (rectangles, circles, lines, arrows), images, signatures, or watermarks.",
      "Navigate pages using the thumbnail panel, bottom page strip, or keyboard arrows (← → PageUp PageDown).",
      "Click 'Download PDF' to preview and save. The exported file preserves original quality with no watermarks."
    ],
    features: [
      "Block-based text editing: select and replace entire paragraphs, table rows, or form fields instead of individual words.",
      "Four intelligent segmentation modes (Auto, Paragraph, Table, Form) that adapt to any document layout.",
      "Dual-pass OCR engine with image preprocessing (grayscale, contrast, binarization) for high-accuracy scanned PDF editing.",
      "Precision baseline alignment engine ensuring replacement text matches original positioning in both preview and export.",
      "Multi-line text replacement with automatic line-height matching and white background masking.",
      "Visual block highlights on the canvas with hover previews and selection indicators showing block type (paragraph, cell, line, field).",
      "Rich text formatting: multiple font families, sizes (7pt–72pt), bold, italic, underline, custom colors, letter spacing, and alignment.",
      "Professional drawing tools: freehand pen, highlighter, brush with adjustable opacity and size, plus eraser.",
      "Image insertion (PNG, JPG, SVG) for logos, photos, and electronic signatures with resize, rotate, and opacity controls.",
      "Text and image watermarks with tiling, rotation, and per-page or all-pages application.",
      "Complete page management: rotate, delete, duplicate, reorder via drag-and-drop, and insert blank pages.",
      "50-level undo/redo history with full keyboard shortcut support (Ctrl+Z / Ctrl+Y).",
      "Responsive design with touch-friendly controls, pinch-to-zoom, and slide-out panels for mobile editing.",
      "100% client-side processing — files never leave your device. No server uploads, no data storage.",
      "High-fidelity PDF export preserving original resolution, embedded fonts, and vector graphics. No watermarks added.",
      "Keyboard shortcuts for every tool: V (select), T (text), R (rectangle), P (pen), X (redact), I (image), W (watermark)."
    ],
    safetyNote: "Your PDF is processed entirely within your web browser using client-side JavaScript libraries (PDF.js for rendering, pdf-lib for export, Tesseract.js for OCR). No file data is transmitted to any server — your documents stay on your device at all times. When you close the editor or navigate away, all file data is automatically cleared from browser memory. We have zero access to your documents and store no user data whatsoever. This architecture provides enterprise-grade security without requiring registration, subscriptions, or personal information. It is safe for editing confidential contracts, financial statements, legal papers, medical records, Aadhaar-related documents, government forms, and any sensitive files. No cookies or tracking are involved in file processing.",
    faqs: [
      {
        question: "How do I edit text in a PDF online for free?",
        answer: "Upload your PDF to VexaTool. For text-based PDFs, text is auto-extracted into editable blocks. For scanned PDFs, click 'Run OCR' to detect text. Select any block, click Edit, modify the text, and click Replace. The editor covers the original and places your new text in the exact same position. Download the edited PDF — no signup, no watermark, completely free."
      },
      {
        question: "Can I edit scanned or image-based PDF files?",
        answer: "Yes. The editor includes a dual-pass OCR engine that converts scanned images into editable text. It uses image preprocessing (grayscale conversion, contrast enhancement, binarization) to detect even faint or low-quality text. After OCR, each detected region becomes a clickable, editable block in the sidebar."
      },
      {
        question: "What is block-based PDF editing and how does it work?",
        answer: "Block-based editing groups individual words into meaningful regions — paragraphs, table rows, form fields, or single lines — so you can select and replace an entire section at once. The editor automatically analyses your document's layout and applies the best grouping. You can also manually choose Paragraph, Table, or Form mode for precise control."
      },
      {
        question: "What are the segmentation modes (Auto, Paragraph, Table, Form)?",
        answer: "These modes control how OCR-detected or extracted text is grouped. Auto analyses the layout and picks the best strategy. Paragraph groups nearby lines into multi-line blocks. Table creates tight row-level or cell-level blocks for tabular data. Form detects label-value pairs in structured forms. Switch modes instantly from the OCR panel."
      },
      {
        question: "Does the PDF editor work on mobile phones and tablets?",
        answer: "Yes. The editor is fully responsive with touch-friendly controls, pinch-to-zoom, swipe navigation, and slide-out panels. It works on any screen size. For complex multi-page editing a larger screen is recommended, but basic text editing, annotations, and OCR work well on smartphones."
      },
      {
        question: "Are my files stored on your servers? Is it safe for confidential documents?",
        answer: "No files are ever uploaded to any server. All processing happens locally in your browser using JavaScript. When you close the editor, all data is cleared from memory. This makes it safe for confidential contracts, financial records, legal documents, medical files, and government forms."
      },
      {
        question: "Is this PDF editor really free? Are there hidden costs or watermarks?",
        answer: "100% free with no hidden fees, no premium tier, and no watermarks on exported files. Because everything runs in your browser, there are no server costs. You get professional-grade editing at zero cost."
      },
      {
        question: "How does the text replacement keep alignment accurate in the exported PDF?",
        answer: "The editor uses font-metric baseline alignment. It calculates the exact ascent, line height, and character width of the original text, then positions replacement text at the same coordinates. A white redaction mask covers the original content. This ensures both the on-screen preview and the exported PDF match perfectly."
      },
      {
        question: "What happens when I click Download PDF?",
        answer: "A preview dialog shows your edits. On confirmation, the editor writes all changes (text, images, shapes, watermarks, redactions, drawings) into the original PDF structure using pdf-lib. The result downloads as a standard PDF preserving original resolution, fonts, and vector graphics — no quality loss."
      },
      {
        question: "Can I add images, signatures, and watermarks to my PDF?",
        answer: "Yes. Use the Image tool (press I) to insert logos, photos, or scanned signatures in PNG, JPG, or SVG format. The Watermark tool (press W) adds text or image watermarks with adjustable opacity, rotation, and tiling. Watermarks can be applied to one page or all pages at once."
      }
    ]
  };

  return (
    <>
      <CanonicalHead
        title="Edit PDF Online Free – Block-Based Text Editor with OCR | VexaTool"
        description="Free online PDF editor with block-based text editing and OCR. Edit text in scanned PDFs, replace paragraphs, table rows, form fields. No watermark, no signup. Works on mobile."
        keywords="edit PDF online free, PDF editor no watermark, edit scanned PDF OCR, block-based PDF editing, free PDF text editor, online PDF editor India, edit PDF on mobile, replace text in PDF, PDF editor for students, OCR PDF editor free"
      />

      {/* FAQ Schema */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <ToolLayout
        title="Edit PDF Online Free – Block-Based Text Editor"
        description="Edit text, replace paragraphs, OCR scanned documents. Block-based editing for tables, forms & structured PDFs. No watermark."
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
                  Edit text-based PDFs directly or use OCR for scanned documents. Select entire paragraphs, table rows, or form fields — not just individual words.
                </p>
              </div>
              <FileUpload
                files={files}
                onFilesChange={handleFileChange}
                colorClass="bg-tool-edit"
                multiple={false}
                accept=".pdf"
              />

              {/* Feature highlights — updated for block-based editing */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <LayoutGrid className="w-7 h-7 mx-auto mb-2 text-primary" />
                  <h3 className="font-medium text-sm">Block-Based Editing</h3>
                  <p className="text-xs text-muted-foreground">Select & replace full paragraphs, rows, cells</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <ScanText className="w-7 h-7 mx-auto mb-2 text-primary" />
                  <h3 className="font-medium text-sm">Dual-Pass OCR</h3>
                  <p className="text-xs text-muted-foreground">Edit scanned PDFs with high accuracy</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <Shield className="w-7 h-7 mx-auto mb-2 text-primary" />
                  <h3 className="font-medium text-sm">100% Private</h3>
                  <p className="text-xs text-muted-foreground">Files never leave your device</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <Smartphone className="w-7 h-7 mx-auto mb-2 text-primary" />
                  <h3 className="font-medium text-sm">Works on Mobile</h3>
                  <p className="text-xs text-muted-foreground">Responsive touch-friendly editor</p>
                </div>
              </div>

              {/* Supported PDF types + segmentation modes */}
              <div className="bg-muted/20 rounded-lg p-4 mt-4">
                <h3 className="font-medium mb-3">Supported PDF Types & Editing Modes</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-primary">Text-Based PDFs</p>
                    <p className="text-muted-foreground">
                      PDFs with selectable text are auto-extracted into editable blocks. Click any block to select, edit, or replace it instantly.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-primary">Scanned / Image PDFs</p>
                    <p className="text-muted-foreground">
                      Scanned documents are processed with dual-pass OCR and image preprocessing for high-accuracy text detection, even on faint or low-contrast scans.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="font-medium text-sm mb-2">Intelligent Segmentation Modes</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                    <span className="bg-background rounded px-2 py-1 text-center"><strong className="text-foreground">Auto</strong> — best for most documents</span>
                    <span className="bg-background rounded px-2 py-1 text-center"><strong className="text-foreground">Paragraph</strong> — multi-line text blocks</span>
                    <span className="bg-background rounded px-2 py-1 text-center"><strong className="text-foreground">Table</strong> — row &amp; cell-level blocks</span>
                    <span className="bg-background rounded px-2 py-1 text-center"><strong className="text-foreground">Form</strong> — label-value field pairs</span>
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
