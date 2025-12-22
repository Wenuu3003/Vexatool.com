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
  Code,
  Presentation,
  Table,
  Calculator,
  Tags,
  Coins,
  BarChart3,
} from "lucide-react";
import { ToolCard } from "./ToolCard";

const tools = [
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
    title: "Compress PDF",
    description: "Reduce file size while optimizing for maximal PDF quality.",
    icon: FileDown,
    colorClass: "bg-tool-compress",
    href: "/compress-pdf",
  },
  {
    title: "PDF to Word",
    description: "Easily convert your PDF files into easy to edit DOC and DOCX documents.",
    icon: FileType2,
    colorClass: "bg-tool-convert",
    href: "/pdf-to-word",
  },
  {
    title: "PDF to PowerPoint",
    description: "Convert PDF documents to editable PowerPoint presentations.",
    icon: Presentation,
    colorClass: "bg-orange-500",
    href: "/pdf-to-powerpoint",
  },
  {
    title: "PDF to Excel",
    description: "Extract tables and data from PDF to Excel spreadsheets.",
    icon: Table,
    colorClass: "bg-green-500",
    href: "/pdf-to-excel",
  },
  {
    title: "Image to PDF",
    description: "Convert JPG, PNG, and other images to PDF documents.",
    icon: Image,
    colorClass: "bg-blue-500",
    href: "/image-to-pdf",
  },
  {
    title: "PowerPoint to PDF",
    description: "Convert PPT and PPTX presentations to PDF format.",
    icon: Presentation,
    colorClass: "bg-orange-600",
    href: "/ppt-to-pdf",
  },
  {
    title: "Excel to PDF",
    description: "Convert Excel spreadsheets to PDF documents.",
    icon: Table,
    colorClass: "bg-green-600",
    href: "/excel-to-pdf",
  },
  {
    title: "HTML to PDF",
    description: "Convert HTML code and web pages to PDF documents.",
    icon: Code,
    colorClass: "bg-orange-500",
    href: "/html-to-pdf",
  },
  {
    title: "QR Code Generator",
    description: "Generate QR codes for URLs, text, or any data instantly.",
    icon: QrCode,
    colorClass: "bg-purple-500",
    href: "/qr-code-generator",
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
    description: "Stamp an image or text over your PDF in seconds. Choose the typography, transparency and position.",
    icon: Droplets,
    colorClass: "bg-tool-watermark",
    href: "/watermark-pdf",
  },
  {
    title: "Rotate PDF",
    description: "Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!",
    icon: RotateCw,
    colorClass: "bg-tool-rotate",
    href: "/rotate-pdf",
  },
  {
    title: "Unlock PDF",
    description: "Remove PDF password security, giving you the freedom to use your PDFs as you want.",
    icon: Unlock,
    colorClass: "bg-tool-unlock",
    href: "/unlock-pdf",
  },
  {
    title: "Protect PDF",
    description: "Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.",
    icon: Lock,
    colorClass: "bg-tool-protect",
    href: "/protect-pdf",
  },
  {
    title: "Organize PDF",
    description: "Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages.",
    icon: LayoutGrid,
    colorClass: "bg-tool-organize",
    href: "/organize-pdf",
  },
  {
    title: "Repair PDF",
    description: "Repair a damaged PDF and recover data from corrupt PDF. Fix PDF files.",
    icon: Wrench,
    colorClass: "bg-tool-repair",
    href: "/repair-pdf",
  },
  {
    title: "Calculator",
    description: "A powerful calculator for all your mathematical needs.",
    icon: Calculator,
    colorClass: "bg-indigo-500",
    href: "/calculator",
  },
  {
    title: "Tags Generator",
    description: "Generate relevant tags and hashtags for your content and SEO.",
    icon: Tags,
    colorClass: "bg-pink-500",
    href: "/tags-generator",
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
];

export const ToolsGrid = () => {
  return (
    <section id="tools-grid" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <div
              key={tool.title}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ToolCard {...tool} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
