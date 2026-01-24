import {
  Layers,
  Scissors,
  FileDown,
  FileType2,
  FileEdit,
  PenTool,
  Droplets,
  RotateCw,
  Unlock,
  Lock,
  LayoutGrid,
  Wrench,
  Image,
  QrCode,
  ScanLine,
  Code,
  Presentation,
  Table,
  Calculator,
  Coins,
  BarChart3,
  Cloud,
  ImageDown,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Eraser,
  MessageSquare,
  SpellCheck,
  FileUser,
  Hash,
  Youtube,
  Crop,
  RefreshCw,
  Cake,
  Heart,
  Percent,
  Scale,
  AlignLeft,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { ToolCard } from "./ToolCard";

const tools = [
  // AI Tools - Top Priority
  {
    title: "AI Text Generator",
    description: "Generate creative content, articles, and stories using AI. Perfect for writers and marketers.",
    icon: MessageSquare,
    colorClass: "bg-gradient-to-br from-violet-500 to-purple-600",
    href: "/ai-text-generator",
  },
  {
    title: "AI Grammar & Rewrite",
    description: "Fix grammar, improve clarity, and rewrite text professionally with AI assistance.",
    icon: SpellCheck,
    colorClass: "bg-gradient-to-br from-blue-500 to-cyan-500",
    href: "/ai-grammar-tool",
  },
  {
    title: "AI Resume Builder",
    description: "Create professional resumes with AI-powered suggestions and formatting.",
    icon: FileUser,
    colorClass: "bg-gradient-to-br from-emerald-500 to-teal-500",
    href: "/ai-resume-builder",
  },
  {
    title: "Hashtag Generator",
    description: "Generate trending hashtags for Instagram, Twitter, TikTok, and more.",
    icon: Hash,
    colorClass: "bg-gradient-to-br from-pink-500 to-rose-500",
    href: "/hashtag-generator",
  },
  {
    title: "YouTube Generator",
    description: "Create SEO-optimized YouTube titles, descriptions, and tags with AI.",
    icon: Youtube,
    colorClass: "bg-gradient-to-br from-red-500 to-red-600",
    href: "/youtube-generator",
  },
  {
    title: "WhatsApp Chat Analyzer",
    description: "Analyze WhatsApp chats for love, friendship & fun insights. Viral-worthy results!",
    icon: MessageCircle,
    colorClass: "bg-gradient-to-br from-green-500 to-emerald-600",
    href: "/whatsapp-analyzer",
  },
  // Image Tools
  {
    title: "Image Resizer",
    description: "Resize images for passport, social media, and custom dimensions. Quick and easy.",
    icon: Crop,
    colorClass: "bg-gradient-to-br from-orange-500 to-amber-500",
    href: "/image-resizer",
  },
  {
    title: "Image Converter",
    description: "Convert images between PNG, JPG, WebP, and more formats instantly.",
    icon: RefreshCw,
    colorClass: "bg-gradient-to-br from-indigo-500 to-blue-500",
    href: "/image-format-converter",
  },
  {
    title: "Background Remover",
    description: "Remove background from any image using AI. Download as PNG, JPG, or WebP.",
    icon: Eraser,
    colorClass: "bg-gradient-to-br from-purple-500 to-pink-500",
    href: "/background-remover",
  },
  {
    title: "Compress Images",
    description: "Reduce image file sizes while maintaining quality. Supports JPG, PNG, WebP.",
    icon: ImageDown,
    colorClass: "bg-teal-500",
    href: "/compress-image",
  },
  // Calculator Tools - Age Calculator merged into Love Calculator
  {
    title: "BMI Calculator",
    description: "Calculate your Body Mass Index and get health recommendations.",
    icon: Heart,
    colorClass: "bg-gradient-to-br from-red-400 to-pink-500",
    href: "/bmi-calculator",
  },
  {
    title: "EMI Calculator",
    description: "Calculate loan EMI, total interest, and monthly payments instantly.",
    icon: Percent,
    colorClass: "bg-gradient-to-br from-green-500 to-emerald-500",
    href: "/emi-calculator",
  },
  {
    title: "GST Calculator",
    description: "Calculate GST amounts, inclusive and exclusive prices for Indian taxes.",
    icon: Percent,
    colorClass: "bg-gradient-to-br from-orange-400 to-amber-500",
    href: "/gst-calculator",
  },
  {
    title: "Unit Converter",
    description: "Convert between length, weight, temperature, area, and more units.",
    icon: Scale,
    colorClass: "bg-gradient-to-br from-cyan-500 to-blue-500",
    href: "/unit-converter",
  },
  {
    title: "Word Counter",
    description: "Count words, characters, sentences, and paragraphs. Estimate reading time.",
    icon: AlignLeft,
    colorClass: "bg-gradient-to-br from-slate-500 to-gray-600",
    href: "/word-counter",
  },
  // Utility Tools
  {
    title: "QR Code Scanner",
    description: "Scan QR codes from images or camera. Fast and accurate detection.",
    icon: ScanLine,
    colorClass: "bg-violet-500",
    href: "/qr-code-scanner",
  },
  {
    title: "QR Code Generator",
    description: "Create custom QR codes with logos, colors, and instant download.",
    icon: QrCode,
    colorClass: "bg-purple-500",
    href: "/qr-code-generator",
  },
  {
    title: "Currency Converter",
    description: "Convert between world currencies with exchange rates.",
    icon: Coins,
    colorClass: "bg-emerald-500",
    href: "/currency-converter",
  },
  {
    title: "SEO Analyzer",
    description: "Analyze and optimize your website and YouTube videos for SEO.",
    icon: BarChart3,
    colorClass: "bg-blue-600",
    href: "/seo-tool",
  },
  {
    title: "Calculator",
    description: "A powerful calculator for all your mathematical needs.",
    icon: Calculator,
    colorClass: "bg-indigo-500",
    href: "/calculator",
  },
  {
    title: "PIN Code Generator",
    description: "Generate & find Indian PIN codes by state, district, city. Bulk generate, reverse lookup.",
    icon: MapPin,
    colorClass: "bg-gradient-to-br from-pink-500 to-purple-600",
    href: "/pincode-generator",
  },
  // File Compression Tools
  {
    title: "File Compressor",
    description: "Compress any file or image to reduce size. Supports multiple formats.",
    icon: FileArchive,
    colorClass: "bg-rose-500",
    href: "/file-compressor",
  },
  {
    title: "Compress PDF",
    description: "Reduce file size while optimizing for maximal PDF quality.",
    icon: FileDown,
    colorClass: "bg-tool-compress",
    href: "/compress-pdf",
  },
  // PDF Core Tools
  {
    title: "Merge PDF",
    description: "Combine PDFs in the order you want with the easiest PDF merger available.",
    icon: Layers,
    colorClass: "bg-tool-merge",
    href: "/merge-pdf",
  },
  {
    title: "Split PDF",
    description: "Separate one page or a whole set for easy conversion into independent PDF files.",
    icon: Scissors,
    colorClass: "bg-tool-split",
    href: "/split-pdf",
  },
  {
    title: "Edit PDF",
    description: "Add text, images, shapes or freehand annotations to a PDF document.",
    icon: FileEdit,
    colorClass: "bg-tool-edit",
    href: "/edit-pdf",
  },
  {
    title: "Sign PDF",
    description: "Sign yourself or request electronic signatures from others.",
    icon: PenTool,
    colorClass: "bg-tool-sign",
    href: "/sign-pdf",
  },
  {
    title: "Watermark",
    description: "Stamp an image or text over your PDF in seconds.",
    icon: Droplets,
    colorClass: "bg-tool-watermark",
    href: "/watermark-pdf",
  },
  {
    title: "Rotate PDF",
    description: "Rotate your PDFs the way you need them. Rotate multiple PDFs at once!",
    icon: RotateCw,
    colorClass: "bg-tool-rotate",
    href: "/rotate-pdf",
  },
  {
    title: "Unlock PDF",
    description: "Remove PDF password security for freedom to use your PDFs.",
    icon: Unlock,
    colorClass: "bg-tool-unlock",
    href: "/unlock-pdf",
  },
  {
    title: "Protect PDF",
    description: "Protect PDF files with a password to prevent unauthorized access.",
    icon: Lock,
    colorClass: "bg-tool-protect",
    href: "/protect-pdf",
  },
  {
    title: "Organize PDF",
    description: "Sort pages of your PDF file however you like. Delete or add pages.",
    icon: LayoutGrid,
    colorClass: "bg-tool-organize",
    href: "/organize-pdf",
  },
  {
    title: "Repair PDF",
    description: "Repair a damaged PDF and recover data from corrupt PDF files.",
    icon: Wrench,
    colorClass: "bg-tool-repair",
    href: "/repair-pdf",
  },
  // PDF Conversion Tools
  {
    title: "PDF to Word",
    description: "Easily convert your PDF files into easy to edit DOC and DOCX documents.",
    icon: FileType2,
    colorClass: "bg-tool-convert",
    href: "/pdf-to-word",
  },
  {
    title: "Word to PDF",
    description: "Convert Word documents (DOC, DOCX) to PDF format instantly.",
    icon: FileText,
    colorClass: "bg-blue-600",
    href: "/word-to-pdf",
  },
  {
    title: "PDF to Excel",
    description: "Extract tables and data from PDF to Excel spreadsheets.",
    icon: Table,
    colorClass: "bg-green-500",
    href: "/pdf-to-excel",
  },
  {
    title: "Excel to PDF",
    description: "Convert Excel spreadsheets to PDF documents.",
    icon: Table,
    colorClass: "bg-green-600",
    href: "/excel-to-pdf",
  },
  {
    title: "Word to Excel",
    description: "Convert Word documents to Excel spreadsheet format (CSV).",
    icon: FileSpreadsheet,
    colorClass: "bg-green-600",
    href: "/word-to-excel",
  },
  {
    title: "Excel to Word",
    description: "Convert Excel spreadsheets to Word document format (RTF).",
    icon: FileText,
    colorClass: "bg-blue-600",
    href: "/excel-to-word",
  },
  {
    title: "PDF to PowerPoint",
    description: "Convert PDF documents to editable PowerPoint presentations.",
    icon: Presentation,
    colorClass: "bg-orange-500",
    href: "/pdf-to-powerpoint",
  },
  {
    title: "PowerPoint to PDF",
    description: "Convert PPT and PPTX presentations to PDF format.",
    icon: Presentation,
    colorClass: "bg-orange-600",
    href: "/ppt-to-pdf",
  },
  {
    title: "PDF to HTML",
    description: "Convert PDF documents to HTML web pages.",
    icon: Code,
    colorClass: "bg-orange-500",
    href: "/pdf-to-html",
  },
  {
    title: "HTML to PDF",
    description: "Convert HTML code and web pages to PDF documents.",
    icon: Code,
    colorClass: "bg-orange-500",
    href: "/html-to-pdf",
  },
  // Image Conversion Tools
  {
    title: "PDF to Image",
    description: "Convert PDF pages to JPG or PNG images instantly.",
    icon: Image,
    colorClass: "bg-purple-500",
    href: "/pdf-to-image",
  },
  {
    title: "PDF to JPG",
    description: "Convert PDF pages to high-quality JPG/JPEG images.",
    icon: Image,
    colorClass: "bg-amber-500",
    href: "/pdf-to-jpg",
  },
  {
    title: "PDF to PNG",
    description: "Convert PDF pages to transparent PNG images.",
    icon: Image,
    colorClass: "bg-cyan-500",
    href: "/pdf-to-png",
  },
  {
    title: "Image to PDF",
    description: "Convert JPG, PNG, and other images to PDF documents.",
    icon: Image,
    colorClass: "bg-blue-500",
    href: "/image-to-pdf",
  },
  {
    title: "JPG to PDF",
    description: "Convert JPG/JPEG images to PDF. Combine multiple JPGs into one PDF.",
    icon: Image,
    colorClass: "bg-amber-500",
    href: "/jpg-to-pdf",
  },
  {
    title: "PNG to PDF",
    description: "Convert PNG images to PDF. Combine multiple PNGs into one PDF.",
    icon: Image,
    colorClass: "bg-cyan-500",
    href: "/png-to-pdf",
  },
  // Cloud Tools
  {
    title: "Google Drive to PDF",
    description: "Convert Google Docs, Sheets, Slides and Drive files to PDF format.",
    icon: Cloud,
    colorClass: "bg-blue-400",
    href: "/google-drive-to-pdf",
  },
];

export const ToolsGrid = () => {
  return (
    <section id="tools-grid" className="py-12 md:py-16 bg-background" aria-labelledby="tools-section-heading">
      <div className="container mx-auto px-4">
        <h2 id="tools-section-heading" className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
          All Free Online Tools
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
          Choose from our collection of 30+ free tools for PDF editing, QR codes, file conversion, and more.
        </p>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          role="list"
          aria-label="PDF and utility tools"
        >
          {tools.map((tool, index) => (
            <div
              key={tool.title}
              className="animate-fade-in"
              style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s` }}
              role="listitem"
            >
              <ToolCard {...tool} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
