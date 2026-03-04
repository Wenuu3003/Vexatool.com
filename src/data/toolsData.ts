import { 
  Layers, Scissors, FileDown, FileType2, FileEdit, 
  RotateCw, Unlock, Lock, Image, QrCode, ScanLine, 
  Presentation, Table, Calculator, 
  ImageDown, FileText, FileSpreadsheet, Eraser, 
  Crop, RefreshCw, Heart, Percent, 
  Scale, AlignLeft, MapPin, Cake, LucideIcon, Wrench,
  PenTool, Droplets, FolderSync, Wrench as WrenchIcon, 
  ImageIcon, Smartphone, CreditCard, Briefcase, FileCheck,
  DollarSign, Ruler, Code, HardDrive, FileImage
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
  {
    id: "sign-pdf",
    title: "Sign PDF",
    description: "Add digital signatures to PDF documents. Draw, type, or upload your signature and place it anywhere on the document.",
    shortDescription: "Add digital signatures to PDF documents.",
    icon: PenTool,
    colorClass: "bg-gradient-to-br from-indigo-500 to-purple-600",
    href: "/sign-pdf",
    category: "pdf",
    previewImage: "/previews/sign-pdf-preview.webp",
    features: ["Draw signature", "Type signature", "Upload signature", "Place anywhere"],
    seoKeywords: ["sign PDF", "digital signature", "e-sign PDF", "PDF signature"]
  },
  {
    id: "watermark-pdf",
    title: "Watermark PDF",
    description: "Add text or image watermarks to PDF documents. Customize opacity, rotation, position and tiling.",
    shortDescription: "Add text or image watermarks to PDFs.",
    icon: Droplets,
    colorClass: "bg-gradient-to-br from-cyan-500 to-blue-500",
    href: "/watermark-pdf",
    category: "pdf",
    previewImage: "/previews/watermark-pdf-preview.webp",
    features: ["Text watermark", "Image watermark", "Opacity control", "Tile pattern"],
    seoKeywords: ["watermark PDF", "add watermark", "PDF watermark", "stamp PDF"]
  },
  {
    id: "organize-pdf",
    title: "Organize PDF",
    description: "Rearrange, delete, and organize PDF pages. Drag and drop pages to reorder your document.",
    shortDescription: "Rearrange and organize PDF pages.",
    icon: FolderSync,
    colorClass: "bg-gradient-to-br from-lime-500 to-green-600",
    href: "/organize-pdf",
    category: "pdf",
    previewImage: "/previews/organize-pdf-preview.webp",
    features: ["Drag & drop", "Delete pages", "Reorder", "Preview"],
    seoKeywords: ["organize PDF", "rearrange PDF pages", "reorder PDF", "PDF organizer"]
  },
  {
    id: "repair-pdf",
    title: "Repair PDF",
    description: "Fix corrupted or damaged PDF files. Recover content from broken PDFs.",
    shortDescription: "Fix corrupted or damaged PDF files.",
    icon: FileCheck,
    colorClass: "bg-gradient-to-br from-yellow-500 to-orange-500",
    href: "/repair-pdf",
    category: "pdf",
    previewImage: "/previews/repair-pdf-preview.webp",
    features: ["Fix corruption", "Recover content", "Batch repair", "Preview result"],
    seoKeywords: ["repair PDF", "fix PDF", "recover PDF", "damaged PDF"]
  },
  {
    id: "pdf-to-image",
    title: "PDF to Image",
    description: "Convert PDF pages to high-quality images in various formats including JPG, PNG, and WebP.",
    shortDescription: "Convert PDF pages to images.",
    icon: FileImage,
    colorClass: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
    href: "/pdf-to-image",
    category: "pdf",
    previewImage: "/previews/pdf-to-image-preview.webp",
    features: ["Multiple formats", "High quality", "All pages", "DPI control"],
    seoKeywords: ["PDF to image", "convert PDF to image", "PDF to picture", "PDF image converter"]
  },
  {
    id: "pdf-to-png",
    title: "PDF to PNG",
    description: "Convert PDF pages to PNG images with transparency support. High-quality lossless conversion.",
    shortDescription: "Convert PDF pages to PNG images.",
    icon: Image,
    colorClass: "bg-gradient-to-br from-emerald-500 to-green-600",
    href: "/pdf-to-png",
    category: "pdf",
    previewImage: "/previews/pdf-to-png-preview.webp",
    features: ["Transparency", "Lossless", "High quality", "Batch convert"],
    seoKeywords: ["PDF to PNG", "convert PDF to PNG", "PDF PNG converter", "PDF to transparent image"]
  },
  {
    id: "pdf-to-html",
    title: "PDF to HTML",
    description: "Convert PDF documents to HTML web pages. Preserve layout and formatting for web publishing.",
    shortDescription: "Convert PDF documents to HTML pages.",
    icon: Code,
    colorClass: "bg-gradient-to-br from-sky-500 to-blue-600",
    href: "/pdf-to-html",
    category: "pdf",
    previewImage: "/previews/pdf-to-html-preview.webp",
    features: ["Layout preserved", "CSS styling", "Responsive", "Clean code"],
    seoKeywords: ["PDF to HTML", "convert PDF to HTML", "PDF HTML converter", "PDF to web page"]
  },
  {
    id: "png-to-pdf",
    title: "PNG to PDF",
    description: "Convert PNG images to PDF documents. Combine multiple PNGs into one professional PDF.",
    shortDescription: "Convert PNG images to PDF documents.",
    icon: Image,
    colorClass: "bg-gradient-to-br from-green-500 to-teal-500",
    href: "/png-to-pdf",
    category: "pdf",
    previewImage: "/previews/png-to-pdf-preview.webp",
    features: ["Multiple PNGs", "Page sizing", "Quality control", "Batch convert"],
    seoKeywords: ["PNG to PDF", "convert PNG to PDF", "image to PDF", "PNG PDF converter"]
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
  {
    id: "file-compressor",
    title: "File Compressor",
    description: "Compress files to reduce size. Supports images and documents with smart compression.",
    shortDescription: "Compress files to reduce size instantly.",
    icon: FileDown,
    colorClass: "bg-gradient-to-br from-sky-500 to-blue-500",
    href: "/file-compressor",
    category: "image",
    previewImage: "/previews/file-compressor-preview.webp",
    features: ["Smart compression", "Multiple formats", "Batch process", "Quality control"],
    seoKeywords: ["file compressor", "compress files", "reduce file size", "file compression"]
  },
  {
    id: "whatsapp-dp-resize",
    title: "WhatsApp DP Resizer",
    description: "Resize images to perfect WhatsApp display picture dimensions. Crop and fit photos for WhatsApp profile.",
    shortDescription: "Resize photos for WhatsApp profile picture.",
    icon: Smartphone,
    colorClass: "bg-gradient-to-br from-green-500 to-emerald-500",
    href: "/whatsapp-dp-resize",
    category: "image",
    features: ["WhatsApp size", "Auto crop", "Quality control", "Preview"],
    seoKeywords: ["WhatsApp DP resize", "WhatsApp profile picture size", "resize for WhatsApp", "DP maker"]
  },
  {
    id: "aadhaar-photo-resize",
    title: "Aadhaar Photo Resizer",
    description: "Resize photos to exact Aadhaar card photo specifications. Meet official size and format requirements.",
    shortDescription: "Resize photos for Aadhaar card requirements.",
    icon: CreditCard,
    colorClass: "bg-gradient-to-br from-orange-500 to-red-500",
    href: "/aadhaar-photo-resize",
    category: "image",
    features: ["Aadhaar specs", "Auto crop", "Size validation", "Format conversion"],
    seoKeywords: ["Aadhaar photo resize", "Aadhaar card photo size", "resize for Aadhaar", "Aadhaar photo dimensions"]
  },
  {
    id: "govt-job-photo-resize",
    title: "Govt Job Photo Resizer",
    description: "Resize photos for government job applications. Meet SSC, UPSC, Railway, and other exam photo requirements.",
    shortDescription: "Resize photos for govt job applications.",
    icon: Briefcase,
    colorClass: "bg-gradient-to-br from-blue-600 to-indigo-600",
    href: "/govt-job-photo-resize",
    category: "image",
    features: ["Govt specs", "Multiple presets", "KB size control", "Format conversion"],
    seoKeywords: ["govt job photo resize", "SSC photo size", "UPSC photo resize", "government exam photo"]
  },
  {
    id: "passport-photo-resize",
    title: "Passport Photo Resizer",
    description: "Resize photos to passport size specifications. Meet international passport photo requirements.",
    shortDescription: "Resize photos to passport size specs.",
    icon: FileImage,
    colorClass: "bg-gradient-to-br from-red-500 to-rose-600",
    href: "/passport-photo-resize",
    category: "image",
    features: ["Passport specs", "Auto crop", "Background check", "Print layout"],
    seoKeywords: ["passport photo resize", "passport size photo", "passport photo maker", "passport photo dimensions"]
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
  {
    id: "gst-calculator",
    title: "GST Calculator",
    description: "Calculate GST amount, net price, and gross price instantly. Supports all Indian GST rates with CGST, SGST, and IGST breakdowns.",
    shortDescription: "Calculate GST amount, net and gross price instantly.",
    icon: Percent,
    colorClass: "bg-gradient-to-br from-orange-500 to-amber-500",
    href: "/gst-calculator",
    category: "calculator",
    previewImage: "/previews/gst-calculator-preview.webp",
    features: ["All GST rates", "CGST/SGST/IGST", "Inclusive/Exclusive", "Instant results"],
    seoKeywords: ["GST calculator", "GST India", "CGST SGST calculator", "tax calculator"]
  },
  {
    id: "calculator",
    title: "Scientific Calculator",
    description: "Full-featured scientific calculator with basic and advanced math operations. Supports trigonometry, logarithms, and more.",
    shortDescription: "Full-featured scientific calculator online.",
    icon: Calculator,
    colorClass: "bg-gradient-to-br from-blue-500 to-indigo-500",
    href: "/calculator",
    category: "calculator",
    previewImage: "/previews/calculator-preview.webp",
    features: ["Basic math", "Scientific functions", "History", "Keyboard support"],
    seoKeywords: ["scientific calculator", "online calculator", "math calculator", "free calculator"]
  },
  {
    id: "age-calculator",
    title: "Age Calculator",
    description: "Calculate your exact age in years, months, days, hours and minutes. Get birthday wishes and life statistics.",
    shortDescription: "Calculate exact age in years, months and days.",
    icon: Cake,
    colorClass: "bg-gradient-to-br from-violet-500 to-purple-600",
    href: "/age-calculator",
    category: "calculator",
    previewImage: "/previews/age-calculator-preview.webp",
    features: ["Exact age", "Next birthday", "Life statistics", "Birthday wishes"],
    seoKeywords: ["age calculator", "calculate age", "date of birth calculator", "exact age calculator"]
  },
  {
    id: "currency-converter",
    title: "Currency Converter",
    description: "Convert between world currencies with live exchange rates. Supports 150+ currencies with real-time data.",
    shortDescription: "Convert currencies with live exchange rates.",
    icon: DollarSign,
    colorClass: "bg-gradient-to-br from-yellow-500 to-amber-600",
    href: "/currency-converter",
    category: "calculator",
    previewImage: "/previews/currency-converter-preview.webp",
    features: ["Live rates", "150+ currencies", "Swap currencies", "History chart"],
    seoKeywords: ["currency converter", "exchange rate", "money converter", "forex calculator"]
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
  {
    id: "unit-converter",
    title: "Unit Converter",
    description: "Convert between units of length, weight, temperature, volume, speed and more. Comprehensive unit conversion tool.",
    shortDescription: "Convert between units of measurement.",
    icon: Ruler,
    colorClass: "bg-gradient-to-br from-indigo-500 to-violet-500",
    href: "/unit-converter",
    category: "utility",
    previewImage: "/previews/unit-converter-preview.webp",
    features: ["Length", "Weight", "Temperature", "Volume"],
    seoKeywords: ["unit converter", "convert units", "measurement converter", "unit conversion tool"]
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
  {
    id: "word-to-excel",
    title: "Word to Excel",
    description: "Convert Word documents to Excel spreadsheets. Extract tables and data from DOCX to XLSX.",
    shortDescription: "Convert Word documents to Excel spreadsheets.",
    icon: Table,
    colorClass: "bg-gradient-to-br from-blue-500 to-green-500",
    href: "/word-to-excel",
    category: "document",
    previewImage: "/previews/word-to-excel-preview.webp",
    features: ["Table extraction", "Data preservation", "Formatting", "Batch convert"],
    seoKeywords: ["Word to Excel", "DOCX to XLSX", "convert Word to Excel", "Word Excel converter"]
  },
  {
    id: "excel-to-word",
    title: "Excel to Word",
    description: "Convert Excel spreadsheets to Word documents. Preserve table formatting and data layout.",
    shortDescription: "Convert Excel spreadsheets to Word documents.",
    icon: FileText,
    colorClass: "bg-gradient-to-br from-green-500 to-blue-500",
    href: "/excel-to-word",
    category: "document",
    previewImage: "/previews/excel-to-word-preview.webp",
    features: ["Table formatting", "Data layout", "Multiple sheets", "Batch convert"],
    seoKeywords: ["Excel to Word", "XLSX to DOCX", "convert Excel to Word", "Excel Word converter"]
  },
  {
    id: "ppt-to-pdf",
    title: "PPT to PDF",
    description: "Convert PowerPoint presentations to PDF documents. Preserve slides, animations preview, and formatting.",
    shortDescription: "Convert PowerPoint presentations to PDF.",
    icon: Presentation,
    colorClass: "bg-gradient-to-br from-red-500 to-orange-500",
    href: "/ppt-to-pdf",
    category: "document",
    previewImage: "/previews/ppt-to-pdf-preview.webp",
    features: ["Slide preservation", "Formatting", "Fast conversion", "Batch convert"],
    seoKeywords: ["PPT to PDF", "PowerPoint to PDF", "convert PPT", "presentation to PDF"]
  },
  {
    id: "html-to-pdf",
    title: "HTML to PDF",
    description: "Convert HTML web pages to PDF documents. Capture full page content with styling and layout.",
    shortDescription: "Convert HTML web pages to PDF documents.",
    icon: Code,
    colorClass: "bg-gradient-to-br from-cyan-500 to-teal-500",
    href: "/html-to-pdf",
    category: "document",
    previewImage: "/previews/html-to-pdf-preview.webp",
    features: ["Full page capture", "CSS styling", "Layout preservation", "Custom sizing"],
    seoKeywords: ["HTML to PDF", "convert webpage to PDF", "HTML PDF converter", "web page to PDF"]
  },
  {
    id: "google-drive-to-pdf",
    title: "Google Drive to PDF",
    description: "Convert Google Drive documents to PDF format. Access and convert your Google Docs, Sheets, and Slides.",
    shortDescription: "Convert Google Drive files to PDF.",
    icon: HardDrive,
    colorClass: "bg-gradient-to-br from-yellow-500 to-green-500",
    href: "/google-drive-to-pdf",
    category: "document",
    previewImage: "/previews/google-drive-to-pdf-preview.webp",
    features: ["Google Docs", "Google Sheets", "Google Slides", "Direct conversion"],
    seoKeywords: ["Google Drive to PDF", "convert Google Doc to PDF", "Google Sheets to PDF", "Drive PDF converter"]
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
