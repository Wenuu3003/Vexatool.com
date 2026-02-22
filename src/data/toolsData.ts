import { 
  Layers, Scissors, FileDown, FileType2, FileEdit, 
  RotateCw, Unlock, Lock, Image, QrCode, ScanLine, 
  Presentation, Table, Calculator, 
  ImageDown, FileText, FileSpreadsheet, Eraser, 
  Crop, RefreshCw, Heart, Percent, 
  Scale, AlignLeft, MapPin, Cake, LucideIcon, Wrench
} from "lucide-react";

export interface ToolData {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  icon: LucideIcon;
  colorClass: string;
  href: string;
  category: string;
  previewImage?: string;
  features: string[];
  seoKeywords: string[];
}

export const toolCategories = [
  { id: "pdf", name: "PDF Tools", icon: FileEdit },
  { id: "image", name: "Image Tools", icon: Image },
  { id: "calculator", name: "Calculators", icon: Calculator },
  { id: "qr", name: "QR Tools", icon: QrCode },
  { id: "utility", name: "Utilities", icon: Wrench },
  { id: "document", name: "Document Converters", icon: FileSpreadsheet },
];

export const toolsData: ToolData[] = [
  // PDF Tools
  {
    id: "edit-pdf",
    title: "PDF Editor",
    description: "Professional online PDF editor. Edit text, add images, annotate, fill forms, and modify documents without software installation.",
    shortDescription: "Edit PDFs online – text, images, annotations.",
    icon: FileEdit,
    colorClass: "bg-gradient-to-br from-blue-500 to-indigo-600",
    href: "/edit-pdf",
    category: "pdf",
    previewImage: "/previews/edit-pdf-preview.webp",
    features: ["Edit text directly", "Add images & logos", "Professional annotations", "No software needed"],
    seoKeywords: ["PDF editor online free", "edit PDF without watermark", "online PDF editor India", "free PDF editing tool"]
  },
  {
    id: "merge-pdf",
    title: "Merge PDF",
    description: "Combine multiple PDF files into one document. Drag and drop to reorder pages before merging.",
    shortDescription: "Combine PDFs in the order you want.",
    icon: Layers,
    colorClass: "bg-gradient-to-br from-green-500 to-emerald-600",
    href: "/merge-pdf",
    category: "pdf",
    previewImage: "/previews/merge-pdf-preview.webp",
    features: ["Drag & drop", "Reorder pages", "Batch merge", "Preview"],
    seoKeywords: ["merge PDF online free", "combine PDF files", "PDF merger", "join PDF"]
  },
  {
    id: "split-pdf",
    title: "Split PDF",
    description: "Separate one page or a whole set into independent PDF files. Extract specific pages easily.",
    shortDescription: "Separate pages into independent PDF files.",
    icon: Scissors,
    colorClass: "bg-gradient-to-br from-orange-500 to-red-500",
    href: "/split-pdf",
    category: "pdf",
    previewImage: "/previews/split-pdf-preview.webp",
    features: ["Page selection", "Range split", "Extract pages", "Batch split"],
    seoKeywords: ["split PDF", "separate PDF", "extract PDF pages", "PDF splitter"]
  },
  {
    id: "compress-pdf",
    title: "Compress PDF",
    description: "Reduce PDF file size while optimizing for maximum quality. Perfect for email attachments and web uploads.",
    shortDescription: "Reduce PDF file size while optimizing quality.",
    icon: FileDown,
    colorClass: "bg-gradient-to-br from-purple-500 to-violet-600",
    href: "/compress-pdf",
    category: "pdf",
    previewImage: "/previews/compress-pdf-preview.webp",
    features: ["Smart compression", "Quality presets", "Batch process", "Size preview"],
    seoKeywords: ["compress PDF free", "reduce PDF size", "PDF compressor", "shrink PDF"]
  },
  {
    id: "pdf-to-word",
    title: "PDF to Word",
    description: "Convert PDF files into editable DOC and DOCX documents. Preserve formatting and layout.",
    shortDescription: "Convert PDF files to editable Word documents.",
    icon: FileType2,
    colorClass: "bg-gradient-to-br from-blue-600 to-blue-700",
    href: "/pdf-to-word",
    category: "pdf",
    previewImage: "/previews/pdf-to-word-preview.webp",
    features: ["Layout preservation", "Font matching", "Table extraction", "Batch convert"],
    seoKeywords: ["PDF to Word", "convert PDF", "PDF to DOCX", "PDF converter"]
  },
  {
    id: "word-to-pdf",
    title: "Word to PDF",
    description: "Convert Word documents (DOC, DOCX) to PDF format instantly. Perfect formatting every time.",
    shortDescription: "Convert Word documents to PDF format.",
    icon: FileText,
    colorClass: "bg-gradient-to-br from-blue-500 to-cyan-500",
    href: "/word-to-pdf",
    category: "pdf",
    previewImage: "/previews/word-to-pdf-preview.webp",
    features: ["Perfect formatting", "Font embedding", "Batch convert", "Fast processing"],
    seoKeywords: ["Word to PDF", "DOCX to PDF", "convert Word", "Word converter"]
  },
  {
    id: "unlock-pdf",
    title: "Unlock PDF",
    description: "Remove PDF password security for freedom to use your PDFs. Unlock protected documents.",
    shortDescription: "Remove PDF password security.",
    icon: Unlock,
    colorClass: "bg-gradient-to-br from-amber-500 to-orange-500",
    href: "/unlock-pdf",
    category: "pdf",
    previewImage: "/previews/unlock-pdf-preview.webp",
    features: ["Password removal", "Batch unlock", "Secure process", "No data stored"],
    seoKeywords: ["unlock PDF", "remove password", "PDF unlocker", "decrypt PDF"]
  },
  {
    id: "protect-pdf",
    title: "Protect PDF",
    description: "Protect PDF files with a password to prevent unauthorized access. Set permissions for printing and editing.",
    shortDescription: "Protect PDF files with a password.",
    icon: Lock,
    colorClass: "bg-gradient-to-br from-red-500 to-pink-500",
    href: "/protect-pdf",
    category: "pdf",
    previewImage: "/previews/protect-pdf-preview.webp",
    features: ["Password protection", "Permissions", "Encryption", "Batch protect"],
    seoKeywords: ["protect PDF", "password PDF", "encrypt PDF", "secure PDF"]
  },
  {
    id: "rotate-pdf",
    title: "Rotate PDF",
    description: "Rotate your PDFs the way you need them. Rotate individual pages or entire documents.",
    shortDescription: "Rotate your PDFs the way you need them.",
    icon: RotateCw,
    colorClass: "bg-gradient-to-br from-teal-500 to-green-500",
    href: "/rotate-pdf",
    category: "pdf",
    previewImage: "/previews/rotate-pdf-preview.webp",
    features: ["90° rotation", "Page selection", "Batch rotate", "Preview"],
    seoKeywords: ["rotate PDF", "turn PDF", "flip PDF", "PDF rotation"]
  },
  {
    id: "jpg-to-pdf",
    title: "JPG to PDF",
    description: "Convert JPG/JPEG images to PDF. Combine multiple JPGs into one PDF document.",
    shortDescription: "Convert JPG images to PDF.",
    icon: Image,
    colorClass: "bg-gradient-to-br from-amber-500 to-yellow-500",
    href: "/jpg-to-pdf",
    category: "pdf",
    previewImage: "/previews/jpg-to-pdf-preview.webp",
    features: ["Multiple JPGs", "Page order", "Compression", "Quality settings"],
    seoKeywords: ["JPG to PDF", "JPEG to PDF", "convert JPG", "image to PDF"]
  },
  {
    id: "pdf-to-jpg",
    title: "PDF to JPG",
    description: "Convert PDF pages to high-quality JPG/JPEG images. Perfect for sharing and editing.",
    shortDescription: "Convert PDF pages to high-quality JPG images.",
    icon: Image,
    colorClass: "bg-gradient-to-br from-pink-500 to-rose-500",
    href: "/pdf-to-jpg",
    category: "pdf",
    previewImage: "/previews/pdf-to-jpg-preview.webp",
    features: ["High quality", "All pages", "DPI control", "Batch convert"],
    seoKeywords: ["PDF to JPG", "PDF to JPEG", "convert PDF to image", "PDF image"]
  },

  // Image Tools
  {
    id: "image-resizer",
    title: "Image Resize Tool",
    description: "Resize images for any purpose. Quick and easy resizing with quality preservation for social media, documents, and more.",
    shortDescription: "Resize images for any purpose with quality preservation.",
    icon: Crop,
    colorClass: "bg-gradient-to-br from-orange-500 to-amber-500",
    href: "/image-resizer",
    category: "image",
    previewImage: "/previews/image-resizer-preview.webp",
    features: ["Preset sizes", "Custom dimensions", "Quality control", "Batch resize"],
    seoKeywords: ["image resizer", "resize photo", "photo resizer online", "image dimensions"]
  },
  {
    id: "compress-image",
    title: "Image Compressor",
    description: "Reduce image file sizes while maintaining quality. Supports JPG, PNG, WebP with smart compression algorithms.",
    shortDescription: "Reduce image file sizes while maintaining quality.",
    icon: ImageDown,
    colorClass: "bg-gradient-to-br from-teal-500 to-cyan-500",
    href: "/compress-image",
    category: "image",
    previewImage: "/previews/compress-image-preview.webp",
    features: ["Smart compression", "Quality slider", "Batch process", "Multiple formats"],
    seoKeywords: ["compress image", "reduce image size", "image compressor", "photo compression"]
  },
  {
    id: "image-format-converter",
    title: "Image Converter",
    description: "Convert images between PNG, JPG, WebP, and more formats instantly. Maintain quality while changing formats.",
    shortDescription: "Convert images between PNG, JPG, WebP formats.",
    icon: RefreshCw,
    colorClass: "bg-gradient-to-br from-indigo-500 to-blue-500",
    href: "/image-format-converter",
    category: "image",
    previewImage: "/previews/image-converter-preview.webp",
    features: ["JPG to PNG", "PNG to JPG", "WebP support", "Batch convert"],
    seoKeywords: ["image converter", "PNG to JPG", "JPG to PNG", "format converter"]
  },
  {
    id: "image-to-pdf",
    title: "Image to PDF",
    description: "Convert JPG, PNG, and other images to PDF documents. Combine multiple images into one PDF.",
    shortDescription: "Convert images to PDF documents.",
    icon: Image,
    colorClass: "bg-gradient-to-br from-blue-500 to-violet-500",
    href: "/image-to-pdf",
    category: "image",
    previewImage: "/previews/image-to-pdf-preview.webp",
    features: ["Multiple images", "Page ordering", "Size control", "Batch convert"],
    seoKeywords: ["image to PDF", "JPG to PDF", "convert images", "photo to PDF"]
  },
  {
    id: "background-remover",
    title: "Background Remover",
    description: "Remove background from any image. Download as PNG with transparent background, JPG, or WebP format.",
    shortDescription: "Remove background from any image instantly.",
    icon: Eraser,
    colorClass: "bg-gradient-to-br from-purple-500 to-pink-500",
    href: "/background-remover",
    category: "image",
    previewImage: "/previews/background-remover-preview.webp",
    features: ["Transparent PNG", "Custom backgrounds", "High quality", "Instant results"],
    seoKeywords: ["background remover", "remove background", "transparent image", "bg remover"]
  },

  // Calculator Tools
  {
    id: "love-calculator",
    title: "Love & Age Calculator",
    description: "Calculate love compatibility with zodiac & numerology. Find your exact age with birthday wishes and life wisdom tips.",
    shortDescription: "Calculate love compatibility and exact age.",
    icon: Heart,
    colorClass: "bg-gradient-to-br from-pink-500 to-rose-500",
    href: "/love-calculator",
    category: "calculator",
    previewImage: "/previews/love-calculator-preview.webp",
    features: ["Love percentage", "Zodiac match", "Age calculator", "Birthday wishes"],
    seoKeywords: ["love calculator", "compatibility test", "zodiac compatibility", "age calculator"]
  },
  {
    id: "bmi-calculator",
    title: "BMI Calculator",
    description: "Calculate your Body Mass Index and get personalized health recommendations based on your height and weight.",
    shortDescription: "Calculate your Body Mass Index and get health tips.",
    icon: Scale,
    colorClass: "bg-gradient-to-br from-red-400 to-pink-500",
    href: "/bmi-calculator",
    category: "calculator",
    previewImage: "/previews/bmi-calculator-preview.webp",
    features: ["BMI calculation", "Health categories", "Recommendations", "History tracking"],
    seoKeywords: ["BMI calculator", "body mass index", "weight calculator", "health calculator"]
  },
  {
    id: "age-calculator",
    title: "Age Calculator",
    description: "Calculate your exact age in years, months, and days. Get birthday wishes and fun age facts.",
    shortDescription: "Calculate your exact age in years, months, days.",
    icon: Cake,
    colorClass: "bg-gradient-to-br from-violet-500 to-purple-600",
    href: "/age-calculator",
    category: "calculator",
    previewImage: "/previews/age-calculator-preview.webp",
    features: ["Exact age", "Birthday wishes", "Age in days", "Fun facts"],
    seoKeywords: ["age calculator", "birthday calculator", "how old am I", "exact age"]
  },
  {
    id: "percentage-calculator",
    title: "Percentage Calculator",
    description: "Calculate percentages quickly. Find percentage of a number, percentage change, increase or decrease, and more.",
    shortDescription: "Calculate percentages quickly and easily.",
    icon: Percent,
    colorClass: "bg-gradient-to-br from-green-500 to-emerald-500",
    href: "/percentage-calculator",
    category: "calculator",
    features: ["Percentage of number", "Percentage change", "Increase/decrease", "Discount calculator"],
    seoKeywords: ["percentage calculator", "percent calculator", "calculate percentage", "percentage change"]
  },
  {
    id: "emi-calculator",
    title: "EMI Calculator",
    description: "Calculate loan EMI, total interest, and monthly payments instantly. Plan your finances with detailed amortization schedules.",
    shortDescription: "Calculate loan EMI, total interest, and payments.",
    icon: Percent,
    colorClass: "bg-gradient-to-br from-emerald-500 to-teal-500",
    href: "/emi-calculator",
    category: "calculator",
    previewImage: "/previews/emi-calculator-preview.webp",
    features: ["EMI calculation", "Amortization", "Interest breakdown", "Comparison"],
    seoKeywords: ["EMI calculator", "loan calculator", "mortgage calculator", "interest calculator"]
  },

  // QR Tools
  {
    id: "qr-code-generator",
    title: "QR Code Generator",
    description: "Create custom QR codes with logos, colors, and instant download. Generate QR codes for URLs, text, WiFi, and more.",
    shortDescription: "Create custom QR codes with logos and colors.",
    icon: QrCode,
    colorClass: "bg-gradient-to-br from-blue-500 to-indigo-600",
    href: "/qr-code-generator",
    category: "qr",
    previewImage: "/previews/qr-code-generator-preview.webp",
    features: ["Custom colors", "Logo embedding", "Multiple formats", "Bulk generation"],
    seoKeywords: ["QR code generator free", "create QR code online", "QR code for website", "QR code generator India"]
  },
  {
    id: "qr-code-scanner",
    title: "QR Code Scanner",
    description: "Scan QR codes from images or camera. Fast and accurate detection with support for all QR code types.",
    shortDescription: "Scan QR codes from images or camera.",
    icon: ScanLine,
    colorClass: "bg-gradient-to-br from-violet-500 to-purple-600",
    href: "/qr-code-scanner",
    category: "qr",
    previewImage: "/previews/qr-code-scanner-preview.webp",
    features: ["Camera scan", "Image upload", "History", "Copy results"],
    seoKeywords: ["QR scanner", "QR code reader", "scan QR code", "QR code scanner"]
  },

  // Utility Tools
  {
    id: "pincode-generator",
    title: "PIN Code Generator",
    description: "Generate & find Indian PIN codes by state, district, city. Bulk generate and reverse lookup postal codes.",
    shortDescription: "Generate & find Indian PIN codes by location.",
    icon: MapPin,
    colorClass: "bg-gradient-to-br from-pink-500 to-purple-600",
    href: "/pincode-generator",
    category: "utility",
    previewImage: "/previews/pincode-generator-preview.webp",
    features: ["State lookup", "Reverse search", "Bulk generate", "Post office details"],
    seoKeywords: ["PIN code", "postal code", "Indian PIN", "pincode finder"]
  },
  {
    id: "word-counter",
    title: "Word Counter",
    description: "Count words, characters, sentences, and paragraphs. Estimate reading time and analyze text density.",
    shortDescription: "Count words, characters, and estimate reading time.",
    icon: AlignLeft,
    colorClass: "bg-gradient-to-br from-slate-500 to-gray-600",
    href: "/word-counter",
    category: "utility",
    previewImage: "/previews/word-counter-preview.webp",
    features: ["Word count", "Character count", "Reading time", "Keyword density"],
    seoKeywords: ["word counter", "character counter", "text analyzer", "word count tool"]
  },

  // Document Converters
  {
    id: "pdf-to-excel",
    title: "PDF to Excel",
    description: "Extract tables and data from PDF to Excel spreadsheets. Accurate data extraction for business and finance.",
    shortDescription: "Extract tables and data from PDF to Excel.",
    icon: Table,
    colorClass: "bg-gradient-to-br from-green-500 to-emerald-500",
    href: "/pdf-to-excel",
    category: "document",
    previewImage: "/previews/pdf-to-excel-preview.webp",
    features: ["Table detection", "Data accuracy", "Multiple sheets", "Batch convert"],
    seoKeywords: ["PDF to Excel online", "convert PDF to Excel free", "free PDF to XLS converter", "extract tables from PDF"]
  },
  {
    id: "excel-to-pdf",
    title: "Excel to PDF",
    description: "Convert Excel spreadsheets to PDF documents. Preserve cell formatting and formulas display.",
    shortDescription: "Convert Excel spreadsheets to PDF.",
    icon: Table,
    colorClass: "bg-gradient-to-br from-green-600 to-teal-600",
    href: "/excel-to-pdf",
    category: "document",
    previewImage: "/previews/excel-to-pdf-preview.webp",
    features: ["Formatting preserved", "Multiple sheets", "Page setup", "Fast conversion"],
    seoKeywords: ["Excel to PDF", "XLSX to PDF", "convert Excel", "spreadsheet to PDF"]
  },
  {
    id: "pdf-to-powerpoint",
    title: "PDF to PowerPoint",
    description: "Convert PDF documents to editable PowerPoint presentations. Extract slides and content.",
    shortDescription: "Convert PDF to editable PowerPoint presentations.",
    icon: Presentation,
    colorClass: "bg-gradient-to-br from-orange-500 to-red-500",
    href: "/pdf-to-powerpoint",
    category: "document",
    previewImage: "/previews/pdf-to-powerpoint-preview.webp",
    features: ["Slide extraction", "Image preservation", "Text editing", "Batch convert"],
    seoKeywords: ["PDF to PowerPoint", "PDF to PPT", "convert PDF", "presentation converter"]
  },
];

export function getToolsByCategory(category: string): ToolData[] {
  return toolsData.filter(tool => tool.category === category);
}

export function getToolById(id: string): ToolData | undefined {
  return toolsData.find(tool => tool.id === id);
}

export function searchTools(query: string): ToolData[] {
  const lowerQuery = query.toLowerCase();
  return toolsData.filter(tool => 
    tool.title.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery) ||
    tool.seoKeywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
  );
}
