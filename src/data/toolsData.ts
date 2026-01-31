import { 
  Layers, Scissors, FileDown, FileType2, FileEdit, PenTool, Droplets, 
  RotateCw, Unlock, Lock, LayoutGrid, Wrench, Image, QrCode, ScanLine, 
  Code, Presentation, Table, Calculator, Coins, BarChart3, Cloud, 
  ImageDown, FileText, FileSpreadsheet, FileArchive, Eraser, MessageSquare, 
  SpellCheck, FileUser, Hash, Youtube, Crop, RefreshCw, Heart, Percent, 
  Scale, AlignLeft, MapPin, MessageCircle, Cake, LucideIcon
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

// Tool categories for filtering and organization
export const toolCategories = [
  { id: "ai", name: "AI Tools", icon: MessageSquare },
  { id: "image", name: "Image Tools", icon: Image },
  { id: "calculator", name: "Calculators", icon: Calculator },
  { id: "utility", name: "Utilities", icon: Wrench },
  { id: "pdf-core", name: "PDF Core", icon: FileEdit },
  { id: "pdf-convert", name: "PDF Convert", icon: FileType2 },
  { id: "cloud", name: "Cloud Tools", icon: Cloud },
];

export const toolsData: ToolData[] = [
  // AI Tools
  {
    id: "ai-text-generator",
    title: "AI Text Generator",
    description: "Generate creative content, articles, and stories using AI. Perfect for writers, marketers, and content creators who need high-quality text quickly.",
    shortDescription: "Generate creative content, articles, and stories using AI.",
    icon: MessageSquare,
    colorClass: "bg-gradient-to-br from-violet-500 to-purple-600",
    href: "/ai-text-generator",
    category: "ai",
    previewImage: "/previews/ai-text-generator-preview.webp",
    features: ["Blog post generation", "Story writing", "Marketing copy", "Multiple tones"],
    seoKeywords: ["AI text generator", "content generator", "AI writer", "article generator"]
  },
  {
    id: "ai-grammar-tool",
    title: "AI Grammar & Rewrite",
    description: "Fix grammar errors, improve clarity, and rewrite text professionally with AI assistance. Perfect for students, writers, and professionals.",
    shortDescription: "Fix grammar, improve clarity, and rewrite text professionally.",
    icon: SpellCheck,
    colorClass: "bg-gradient-to-br from-blue-500 to-cyan-500",
    href: "/ai-grammar-tool",
    category: "ai",
    previewImage: "/previews/ai-grammar-tool-preview.webp",
    features: ["Grammar correction", "Style improvement", "Tone adjustment", "Plagiarism check"],
    seoKeywords: ["grammar checker", "AI proofreader", "text rewriter", "grammar fixer"]
  },
  {
    id: "ai-resume-builder",
    title: "AI Resume Builder",
    description: "Create professional resumes with AI-powered suggestions and formatting. Stand out with optimized layouts and industry-specific keywords.",
    shortDescription: "Create professional resumes with AI-powered suggestions.",
    icon: FileUser,
    colorClass: "bg-gradient-to-br from-emerald-500 to-teal-500",
    href: "/ai-resume-builder",
    category: "ai",
    previewImage: "/previews/ai-resume-builder-preview.webp",
    features: ["AI suggestions", "Multiple templates", "ATS optimization", "PDF export"],
    seoKeywords: ["resume builder", "CV maker", "AI resume", "professional resume"]
  },
  {
    id: "hashtag-generator",
    title: "Hashtag Generator",
    description: "Generate trending hashtags for Instagram, Twitter, TikTok, and more. Boost your social media reach with AI-powered hashtag suggestions.",
    shortDescription: "Generate trending hashtags for Instagram, Twitter, TikTok.",
    icon: Hash,
    colorClass: "bg-gradient-to-br from-pink-500 to-rose-500",
    href: "/hashtag-generator",
    category: "ai",
    previewImage: "/previews/hashtag-generator-preview.webp",
    features: ["Trending hashtags", "Platform-specific", "Copy to clipboard", "Hashtag analytics"],
    seoKeywords: ["hashtag generator", "Instagram hashtags", "TikTok hashtags", "trending hashtags"]
  },
  {
    id: "youtube-generator",
    title: "YouTube Generator",
    description: "Create SEO-optimized YouTube titles, descriptions, and tags with AI. Improve your video discoverability and grow your channel.",
    shortDescription: "Create SEO-optimized YouTube titles, descriptions, and tags.",
    icon: Youtube,
    colorClass: "bg-gradient-to-br from-red-500 to-red-600",
    href: "/youtube-generator",
    category: "ai",
    previewImage: "/previews/youtube-generator-preview.webp",
    features: ["Title optimization", "Description generator", "Tag suggestions", "Thumbnail ideas"],
    seoKeywords: ["YouTube SEO", "video title generator", "YouTube tags", "video description"]
  },
  {
    id: "whatsapp-analyzer",
    title: "WhatsApp Chat Analyzer",
    description: "Analyze WhatsApp chats for love, friendship & fun insights. Get viral-worthy results with detailed statistics and visualizations.",
    shortDescription: "Analyze WhatsApp chats for love, friendship & fun insights.",
    icon: MessageCircle,
    colorClass: "bg-gradient-to-br from-green-500 to-emerald-600",
    href: "/whatsapp-analyzer",
    category: "ai",
    previewImage: "/previews/whatsapp-analyzer-preview.webp",
    features: ["Message stats", "Emoji analysis", "Activity graphs", "Word clouds"],
    seoKeywords: ["WhatsApp analyzer", "chat analyzer", "WhatsApp stats", "message analysis"]
  },

  // Image Tools
  {
    id: "image-resizer",
    title: "Image Resizer",
    description: "Resize images for passport, social media, and custom dimensions. Quick and easy resizing with quality preservation.",
    shortDescription: "Resize images for passport, social media, and custom dimensions.",
    icon: Crop,
    colorClass: "bg-gradient-to-br from-orange-500 to-amber-500",
    href: "/image-resizer",
    category: "image",
    previewImage: "/previews/image-resizer-preview.webp",
    features: ["Preset sizes", "Custom dimensions", "Aspect ratio lock", "Batch resize"],
    seoKeywords: ["image resizer", "resize photo", "photo resizer", "image dimensions"]
  },
  {
    id: "image-format-converter",
    title: "Image Converter",
    description: "Convert images between PNG, JPG, WebP, and more formats instantly. Maintain quality while reducing file size.",
    shortDescription: "Convert images between PNG, JPG, WebP formats.",
    icon: RefreshCw,
    colorClass: "bg-gradient-to-br from-indigo-500 to-blue-500",
    href: "/image-format-converter",
    category: "image",
    previewImage: "/previews/image-converter-preview.webp",
    features: ["Multiple formats", "Quality control", "Batch convert", "WebP support"],
    seoKeywords: ["image converter", "PNG to JPG", "WebP converter", "format converter"]
  },
  {
    id: "background-remover",
    title: "Background Remover",
    description: "Remove background from any image using AI. Download as PNG with transparent background, JPG, or WebP format.",
    shortDescription: "Remove background from any image using AI.",
    icon: Eraser,
    colorClass: "bg-gradient-to-br from-purple-500 to-pink-500",
    href: "/background-remover",
    category: "image",
    previewImage: "/previews/background-remover-preview.webp",
    features: ["AI-powered", "Transparent PNG", "Custom backgrounds", "High quality"],
    seoKeywords: ["background remover", "remove background", "transparent image", "AI background"]
  },
  {
    id: "compress-image",
    title: "Compress Images",
    description: "Reduce image file sizes while maintaining quality. Supports JPG, PNG, WebP with smart compression algorithms.",
    shortDescription: "Reduce image file sizes while maintaining quality.",
    icon: ImageDown,
    colorClass: "bg-teal-500",
    href: "/compress-image",
    category: "image",
    previewImage: "/previews/compress-image-preview.webp",
    features: ["Smart compression", "Quality slider", "Batch process", "Multiple formats"],
    seoKeywords: ["compress image", "reduce image size", "image compressor", "photo compression"]
  },

  // Calculator Tools
  {
    id: "love-calculator",
    title: "Love & Age Calculator",
    description: "Calculate love compatibility with zodiac & numerology. Find your exact age with birthday wishes and life wisdom tips.",
    shortDescription: "Calculate love compatibility with zodiac & numerology.",
    icon: Heart,
    colorClass: "bg-gradient-to-br from-pink-500 to-rose-500",
    href: "/love-calculator",
    category: "calculator",
    previewImage: "/previews/love-calculator-preview.webp",
    features: ["Love percentage", "Zodiac match", "Age calculator", "Birthday wishes"],
    seoKeywords: ["love calculator", "compatibility test", "zodiac compatibility", "age calculator"]
  },
  {
    id: "age-calculator",
    title: "Age Calculator",
    description: "Calculate your exact age in years, months, days, hours, minutes and seconds. Get birthday countdown and motivation tips.",
    shortDescription: "Calculate your exact age with birthday countdown.",
    icon: Cake,
    colorClass: "bg-gradient-to-br from-amber-500 to-orange-500",
    href: "/age-calculator",
    category: "calculator",
    previewImage: "/previews/age-calculator-preview.webp",
    features: ["Exact age", "Birthday countdown", "Life statistics", "Share cards"],
    seoKeywords: ["age calculator", "birthday calculator", "exact age", "age in days"]
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
    id: "emi-calculator",
    title: "EMI Calculator",
    description: "Calculate loan EMI, total interest, and monthly payments instantly. Plan your finances with detailed amortization schedules.",
    shortDescription: "Calculate loan EMI, total interest, and payments.",
    icon: Percent,
    colorClass: "bg-gradient-to-br from-green-500 to-emerald-500",
    href: "/emi-calculator",
    category: "calculator",
    previewImage: "/previews/emi-calculator-preview.webp",
    features: ["EMI calculation", "Amortization", "Interest breakdown", "Comparison"],
    seoKeywords: ["EMI calculator", "loan calculator", "mortgage calculator", "interest calculator"]
  },
  {
    id: "gst-calculator",
    title: "GST Calculator",
    description: "Calculate GST amounts, inclusive and exclusive prices for Indian taxes. Support for all GST slabs (5%, 12%, 18%, 28%).",
    shortDescription: "Calculate GST amounts for Indian taxes.",
    icon: Percent,
    colorClass: "bg-gradient-to-br from-orange-400 to-amber-500",
    href: "/gst-calculator",
    category: "calculator",
    previewImage: "/previews/gst-calculator-preview.webp",
    features: ["All GST slabs", "Inclusive/Exclusive", "CGST/SGST split", "Invoice generation"],
    seoKeywords: ["GST calculator", "tax calculator", "GST India", "tax calculation"]
  },
  {
    id: "unit-converter",
    title: "Unit Converter",
    description: "Convert between length, weight, temperature, area, volume, and more units with precision and ease.",
    shortDescription: "Convert between length, weight, temperature, and more.",
    icon: Scale,
    colorClass: "bg-gradient-to-br from-cyan-500 to-blue-500",
    href: "/unit-converter",
    category: "calculator",
    previewImage: "/previews/unit-converter-preview.webp",
    features: ["Multiple categories", "Real-time conversion", "Copy results", "History"],
    seoKeywords: ["unit converter", "measurement converter", "length converter", "weight converter"]
  },
  {
    id: "word-counter",
    title: "Word Counter",
    description: "Count words, characters, sentences, and paragraphs. Estimate reading time and analyze text density.",
    shortDescription: "Count words, characters, and estimate reading time.",
    icon: AlignLeft,
    colorClass: "bg-gradient-to-br from-slate-500 to-gray-600",
    href: "/word-counter",
    category: "calculator",
    previewImage: "/previews/word-counter-preview.webp",
    features: ["Word count", "Character count", "Reading time", "Keyword density"],
    seoKeywords: ["word counter", "character counter", "text analyzer", "word count tool"]
  },

  // Utility Tools
  {
    id: "qr-code-scanner",
    title: "QR Code Scanner",
    description: "Scan QR codes from images or camera. Fast and accurate detection with support for all QR code types.",
    shortDescription: "Scan QR codes from images or camera.",
    icon: ScanLine,
    colorClass: "bg-violet-500",
    href: "/qr-code-scanner",
    category: "utility",
    previewImage: "/previews/qr-code-scanner-preview.webp",
    features: ["Camera scan", "Image upload", "History", "Copy results"],
    seoKeywords: ["QR scanner", "QR code reader", "scan QR code", "QR code scanner"]
  },
  {
    id: "qr-code-generator",
    title: "QR Code Generator",
    description: "Create custom QR codes with logos, colors, and instant download. Generate QR codes for URLs, text, WiFi, and more.",
    shortDescription: "Create custom QR codes with logos and colors.",
    icon: QrCode,
    colorClass: "bg-purple-500",
    href: "/qr-code-generator",
    category: "utility",
    previewImage: "/previews/qr-code-generator-preview.webp",
    features: ["Custom colors", "Logo embedding", "Multiple formats", "Bulk generation"],
    seoKeywords: ["QR generator", "create QR code", "QR code maker", "custom QR code"]
  },
  {
    id: "currency-converter",
    title: "Currency Converter",
    description: "Convert between world currencies with real-time exchange rates. Support for 150+ currencies.",
    shortDescription: "Convert between world currencies with live rates.",
    icon: Coins,
    colorClass: "bg-emerald-500",
    href: "/currency-converter",
    category: "utility",
    previewImage: "/previews/currency-converter-preview.webp",
    features: ["Real-time rates", "150+ currencies", "Historical data", "Favorites"],
    seoKeywords: ["currency converter", "exchange rate", "money converter", "forex calculator"]
  },
  {
    id: "seo-tool",
    title: "SEO Analyzer",
    description: "Analyze and optimize your website and YouTube videos for SEO. Get actionable recommendations.",
    shortDescription: "Analyze and optimize your website for SEO.",
    icon: BarChart3,
    colorClass: "bg-blue-600",
    href: "/seo-tool",
    category: "utility",
    previewImage: "/previews/seo-tool-preview.webp",
    features: ["SEO score", "Keyword analysis", "Meta optimization", "Performance tips"],
    seoKeywords: ["SEO analyzer", "SEO checker", "website SEO", "SEO tool"]
  },
  {
    id: "calculator",
    title: "Calculator",
    description: "A powerful scientific calculator for all your mathematical needs. Support for basic and advanced operations.",
    shortDescription: "A powerful calculator for all mathematical needs.",
    icon: Calculator,
    colorClass: "bg-indigo-500",
    href: "/calculator",
    category: "utility",
    previewImage: "/previews/calculator-preview.webp",
    features: ["Scientific mode", "History", "Memory functions", "Unit conversion"],
    seoKeywords: ["calculator", "scientific calculator", "online calculator", "math calculator"]
  },
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

  // File Compression
  {
    id: "file-compressor",
    title: "File Compressor",
    description: "Compress any file or image to reduce size. Supports multiple formats with smart compression algorithms.",
    shortDescription: "Compress any file or image to reduce size.",
    icon: FileArchive,
    colorClass: "bg-rose-500",
    href: "/file-compressor",
    category: "utility",
    previewImage: "/previews/file-compressor-preview.webp",
    features: ["Multiple formats", "Batch compression", "Quality control", "ZIP creation"],
    seoKeywords: ["file compressor", "compress files", "reduce file size", "zip compressor"]
  },
  {
    id: "compress-pdf",
    title: "Compress PDF",
    description: "Reduce PDF file size while optimizing for maximum quality. Perfect for email attachments and web uploads.",
    shortDescription: "Reduce PDF file size while optimizing quality.",
    icon: FileDown,
    colorClass: "bg-tool-compress",
    href: "/compress-pdf",
    category: "pdf-core",
    previewImage: "/previews/compress-pdf-preview.webp",
    features: ["Smart compression", "Quality presets", "Batch process", "Size preview"],
    seoKeywords: ["compress PDF", "reduce PDF size", "PDF compressor", "shrink PDF"]
  },

  // PDF Core Tools
  {
    id: "merge-pdf",
    title: "Merge PDF",
    description: "Combine multiple PDF files into one document. Drag and drop to reorder pages before merging.",
    shortDescription: "Combine PDFs in the order you want.",
    icon: Layers,
    colorClass: "bg-tool-merge",
    href: "/merge-pdf",
    category: "pdf-core",
    previewImage: "/previews/merge-pdf-preview.webp",
    features: ["Drag & drop", "Reorder pages", "Batch merge", "Preview"],
    seoKeywords: ["merge PDF", "combine PDF", "join PDF", "PDF merger"]
  },
  {
    id: "split-pdf",
    title: "Split PDF",
    description: "Separate one page or a whole set into independent PDF files. Extract specific pages easily.",
    shortDescription: "Separate pages into independent PDF files.",
    icon: Scissors,
    colorClass: "bg-tool-split",
    href: "/split-pdf",
    category: "pdf-core",
    previewImage: "/previews/split-pdf-preview.webp",
    features: ["Page selection", "Range split", "Extract pages", "Batch split"],
    seoKeywords: ["split PDF", "separate PDF", "extract PDF pages", "PDF splitter"]
  },
  {
    id: "edit-pdf",
    title: "Edit PDF",
    description: "Add text, images, shapes, and freehand annotations to PDF documents. Full editing capabilities.",
    shortDescription: "Add text, images, shapes to a PDF document.",
    icon: FileEdit,
    colorClass: "bg-tool-edit",
    href: "/edit-pdf",
    category: "pdf-core",
    previewImage: "/previews/edit-pdf-preview.webp",
    features: ["Text editing", "Image insertion", "Annotations", "Form filling"],
    seoKeywords: ["edit PDF", "PDF editor", "modify PDF", "annotate PDF"]
  },
  {
    id: "sign-pdf",
    title: "Sign PDF",
    description: "Sign documents yourself or request electronic signatures from others. Legal e-signatures.",
    shortDescription: "Sign yourself or request electronic signatures.",
    icon: PenTool,
    colorClass: "bg-tool-sign",
    href: "/sign-pdf",
    category: "pdf-core",
    previewImage: "/previews/sign-pdf-preview.webp",
    features: ["Draw signature", "Upload signature", "Multiple signers", "Secure"],
    seoKeywords: ["sign PDF", "e-signature", "digital signature", "PDF signature"]
  },
  {
    id: "watermark-pdf",
    title: "Watermark PDF",
    description: "Stamp an image or text over your PDF in seconds. Protect your documents with custom watermarks.",
    shortDescription: "Stamp an image or text over your PDF.",
    icon: Droplets,
    colorClass: "bg-tool-watermark",
    href: "/watermark-pdf",
    category: "pdf-core",
    previewImage: "/previews/watermark-pdf-preview.webp",
    features: ["Text watermark", "Image watermark", "Position control", "Opacity"],
    seoKeywords: ["watermark PDF", "add watermark", "PDF watermark", "protect PDF"]
  },
  {
    id: "rotate-pdf",
    title: "Rotate PDF",
    description: "Rotate your PDFs the way you need them. Rotate individual pages or entire documents.",
    shortDescription: "Rotate your PDFs the way you need them.",
    icon: RotateCw,
    colorClass: "bg-tool-rotate",
    href: "/rotate-pdf",
    category: "pdf-core",
    previewImage: "/previews/rotate-pdf-preview.webp",
    features: ["90° rotation", "Page selection", "Batch rotate", "Preview"],
    seoKeywords: ["rotate PDF", "turn PDF", "flip PDF", "PDF rotation"]
  },
  {
    id: "unlock-pdf",
    title: "Unlock PDF",
    description: "Remove PDF password security for freedom to use your PDFs. Unlock protected documents.",
    shortDescription: "Remove PDF password security.",
    icon: Unlock,
    colorClass: "bg-tool-unlock",
    href: "/unlock-pdf",
    category: "pdf-core",
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
    colorClass: "bg-tool-protect",
    href: "/protect-pdf",
    category: "pdf-core",
    previewImage: "/previews/protect-pdf-preview.webp",
    features: ["Password protection", "Permissions", "Encryption", "Batch protect"],
    seoKeywords: ["protect PDF", "password PDF", "encrypt PDF", "secure PDF"]
  },
  {
    id: "organize-pdf",
    title: "Organize PDF",
    description: "Sort, delete, add, and rearrange pages of your PDF file. Complete page management.",
    shortDescription: "Sort pages of your PDF file however you like.",
    icon: LayoutGrid,
    colorClass: "bg-tool-organize",
    href: "/organize-pdf",
    category: "pdf-core",
    previewImage: "/previews/organize-pdf-preview.webp",
    features: ["Drag & drop", "Delete pages", "Add pages", "Reorder"],
    seoKeywords: ["organize PDF", "rearrange PDF", "PDF pages", "manage PDF"]
  },
  {
    id: "repair-pdf",
    title: "Repair PDF",
    description: "Repair damaged PDF files and recover data from corrupt documents. Fix broken PDFs.",
    shortDescription: "Repair damaged PDF and recover data.",
    icon: Wrench,
    colorClass: "bg-tool-repair",
    href: "/repair-pdf",
    category: "pdf-core",
    previewImage: "/previews/repair-pdf-preview.webp",
    features: ["File recovery", "Error fixing", "Data extraction", "Multiple attempts"],
    seoKeywords: ["repair PDF", "fix PDF", "corrupt PDF", "PDF recovery"]
  },

  // PDF Conversion Tools
  {
    id: "pdf-to-word",
    title: "PDF to Word",
    description: "Convert PDF files into editable DOC and DOCX documents. Preserve formatting and layout.",
    shortDescription: "Convert PDF files to editable Word documents.",
    icon: FileType2,
    colorClass: "bg-tool-convert",
    href: "/pdf-to-word",
    category: "pdf-convert",
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
    colorClass: "bg-blue-600",
    href: "/word-to-pdf",
    category: "pdf-convert",
    previewImage: "/previews/word-to-pdf-preview.webp",
    features: ["Perfect formatting", "Font embedding", "Batch convert", "Fast processing"],
    seoKeywords: ["Word to PDF", "DOCX to PDF", "convert Word", "Word converter"]
  },
  {
    id: "pdf-to-excel",
    title: "PDF to Excel",
    description: "Extract tables and data from PDF to Excel spreadsheets. Accurate data extraction.",
    shortDescription: "Extract tables and data from PDF to Excel.",
    icon: Table,
    colorClass: "bg-green-500",
    href: "/pdf-to-excel",
    category: "pdf-convert",
    previewImage: "/previews/pdf-to-excel-preview.webp",
    features: ["Table detection", "Data accuracy", "Multiple sheets", "Batch convert"],
    seoKeywords: ["PDF to Excel", "extract tables", "PDF to XLSX", "PDF converter"]
  },
  {
    id: "excel-to-pdf",
    title: "Excel to PDF",
    description: "Convert Excel spreadsheets to PDF documents. Preserve cell formatting and formulas display.",
    shortDescription: "Convert Excel spreadsheets to PDF.",
    icon: Table,
    colorClass: "bg-green-600",
    href: "/excel-to-pdf",
    category: "pdf-convert",
    previewImage: "/previews/excel-to-pdf-preview.webp",
    features: ["Formatting preserved", "Multiple sheets", "Page setup", "Fast conversion"],
    seoKeywords: ["Excel to PDF", "XLSX to PDF", "convert Excel", "spreadsheet to PDF"]
  },
  {
    id: "word-to-excel",
    title: "Word to Excel",
    description: "Convert Word documents to Excel spreadsheet format (CSV). Extract tables from documents.",
    shortDescription: "Convert Word documents to Excel format.",
    icon: FileSpreadsheet,
    colorClass: "bg-green-600",
    href: "/word-to-excel",
    category: "pdf-convert",
    previewImage: "/previews/word-to-excel-preview.webp",
    features: ["Table extraction", "CSV export", "Data formatting", "Batch process"],
    seoKeywords: ["Word to Excel", "DOCX to XLSX", "convert Word", "document converter"]
  },
  {
    id: "excel-to-word",
    title: "Excel to Word",
    description: "Convert Excel spreadsheets to Word document format (RTF). Preserve table structure.",
    shortDescription: "Convert Excel spreadsheets to Word format.",
    icon: FileText,
    colorClass: "bg-blue-600",
    href: "/excel-to-word",
    category: "pdf-convert",
    previewImage: "/previews/excel-to-word-preview.webp",
    features: ["Table preservation", "RTF export", "Formatting", "Multiple sheets"],
    seoKeywords: ["Excel to Word", "XLSX to DOCX", "convert Excel", "spreadsheet to Word"]
  },
  {
    id: "pdf-to-powerpoint",
    title: "PDF to PowerPoint",
    description: "Convert PDF documents to editable PowerPoint presentations. Extract slides and content.",
    shortDescription: "Convert PDF to editable PowerPoint presentations.",
    icon: Presentation,
    colorClass: "bg-orange-500",
    href: "/pdf-to-powerpoint",
    category: "pdf-convert",
    previewImage: "/previews/pdf-to-powerpoint-preview.webp",
    features: ["Slide extraction", "Image preservation", "Text editing", "Batch convert"],
    seoKeywords: ["PDF to PowerPoint", "PDF to PPT", "convert PDF", "presentation converter"]
  },
  {
    id: "ppt-to-pdf",
    title: "PowerPoint to PDF",
    description: "Convert PPT and PPTX presentations to PDF format. Perfect for sharing and printing.",
    shortDescription: "Convert PowerPoint presentations to PDF.",
    icon: Presentation,
    colorClass: "bg-orange-600",
    href: "/ppt-to-pdf",
    category: "pdf-convert",
    previewImage: "/previews/ppt-to-pdf-preview.webp",
    features: ["Slide conversion", "Animation handling", "Notes included", "Fast processing"],
    seoKeywords: ["PowerPoint to PDF", "PPT to PDF", "convert presentation", "PPTX to PDF"]
  },
  {
    id: "pdf-to-html",
    title: "PDF to HTML",
    description: "Convert PDF documents to HTML web pages. Responsive and clean HTML output.",
    shortDescription: "Convert PDF documents to HTML web pages.",
    icon: Code,
    colorClass: "bg-orange-500",
    href: "/pdf-to-html",
    category: "pdf-convert",
    previewImage: "/previews/pdf-to-html-preview.webp",
    features: ["Clean HTML", "Responsive output", "CSS styling", "Image extraction"],
    seoKeywords: ["PDF to HTML", "convert PDF", "PDF to web", "HTML converter"]
  },
  {
    id: "html-to-pdf",
    title: "HTML to PDF",
    description: "Convert HTML code and web pages to PDF documents. Capture websites as PDF.",
    shortDescription: "Convert HTML and web pages to PDF.",
    icon: Code,
    colorClass: "bg-orange-500",
    href: "/html-to-pdf",
    category: "pdf-convert",
    previewImage: "/previews/html-to-pdf-preview.webp",
    features: ["URL capture", "CSS support", "Custom size", "High quality"],
    seoKeywords: ["HTML to PDF", "web to PDF", "convert HTML", "webpage to PDF"]
  },

  // Image Conversion Tools
  {
    id: "pdf-to-image",
    title: "PDF to Image",
    description: "Convert PDF pages to JPG or PNG images instantly. High-quality image output.",
    shortDescription: "Convert PDF pages to JPG or PNG images.",
    icon: Image,
    colorClass: "bg-purple-500",
    href: "/pdf-to-image",
    category: "pdf-convert",
    previewImage: "/previews/pdf-to-image-preview.webp",
    features: ["Multiple formats", "High resolution", "Batch convert", "Quality control"],
    seoKeywords: ["PDF to image", "PDF to JPG", "PDF to PNG", "convert PDF"]
  },
  {
    id: "pdf-to-jpg",
    title: "PDF to JPG",
    description: "Convert PDF pages to high-quality JPG/JPEG images. Perfect for sharing and editing.",
    shortDescription: "Convert PDF pages to high-quality JPG images.",
    icon: Image,
    colorClass: "bg-amber-500",
    href: "/pdf-to-jpg",
    category: "pdf-convert",
    previewImage: "/previews/pdf-to-jpg-preview.webp",
    features: ["High quality", "All pages", "DPI control", "Batch convert"],
    seoKeywords: ["PDF to JPG", "PDF to JPEG", "convert PDF", "PDF image"]
  },
  {
    id: "pdf-to-png",
    title: "PDF to PNG",
    description: "Convert PDF pages to transparent PNG images. Ideal for graphics and web use.",
    shortDescription: "Convert PDF pages to transparent PNG images.",
    icon: Image,
    colorClass: "bg-cyan-500",
    href: "/pdf-to-png",
    category: "pdf-convert",
    previewImage: "/previews/pdf-to-png-preview.webp",
    features: ["Transparency", "High resolution", "Lossless quality", "All pages"],
    seoKeywords: ["PDF to PNG", "convert PDF", "transparent PNG", "PDF converter"]
  },
  {
    id: "image-to-pdf",
    title: "Image to PDF",
    description: "Convert JPG, PNG, and other images to PDF documents. Combine multiple images into one PDF.",
    shortDescription: "Convert images to PDF documents.",
    icon: Image,
    colorClass: "bg-blue-500",
    href: "/image-to-pdf",
    category: "pdf-convert",
    previewImage: "/previews/image-to-pdf-preview.webp",
    features: ["Multiple images", "Page ordering", "Size control", "Batch convert"],
    seoKeywords: ["image to PDF", "JPG to PDF", "convert images", "photo to PDF"]
  },
  {
    id: "jpg-to-pdf",
    title: "JPG to PDF",
    description: "Convert JPG/JPEG images to PDF. Combine multiple JPGs into one PDF document.",
    shortDescription: "Convert JPG images to PDF.",
    icon: Image,
    colorClass: "bg-amber-500",
    href: "/jpg-to-pdf",
    category: "pdf-convert",
    previewImage: "/previews/jpg-to-pdf-preview.webp",
    features: ["Multiple JPGs", "Page order", "Compression", "Quality settings"],
    seoKeywords: ["JPG to PDF", "JPEG to PDF", "convert JPG", "image to PDF"]
  },
  {
    id: "png-to-pdf",
    title: "PNG to PDF",
    description: "Convert PNG images to PDF. Combine multiple PNGs into one PDF document.",
    shortDescription: "Convert PNG images to PDF.",
    icon: Image,
    colorClass: "bg-cyan-500",
    href: "/png-to-pdf",
    category: "pdf-convert",
    previewImage: "/previews/png-to-pdf-preview.webp",
    features: ["Multiple PNGs", "Transparency handling", "Page order", "Quality control"],
    seoKeywords: ["PNG to PDF", "convert PNG", "image to PDF", "transparent to PDF"]
  },

  // Cloud Tools
  {
    id: "google-drive-to-pdf",
    title: "Google Drive to PDF",
    description: "Convert Google Docs, Sheets, Slides and Drive files to PDF format directly.",
    shortDescription: "Convert Google Drive files to PDF format.",
    icon: Cloud,
    colorClass: "bg-blue-400",
    href: "/google-drive-to-pdf",
    category: "cloud",
    previewImage: "/previews/google-drive-to-pdf-preview.webp",
    features: ["Drive integration", "All file types", "Direct conversion", "Fast processing"],
    seoKeywords: ["Google Drive to PDF", "convert Drive", "Docs to PDF", "cloud converter"]
  },
];

// Helper function to get tools by category
export function getToolsByCategory(category: string): ToolData[] {
  return toolsData.filter(tool => tool.category === category);
}

// Helper function to get a tool by ID
export function getToolById(id: string): ToolData | undefined {
  return toolsData.find(tool => tool.id === id);
}

// Helper function to search tools
export function searchTools(query: string): ToolData[] {
  const lowerQuery = query.toLowerCase();
  return toolsData.filter(tool => 
    tool.title.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery) ||
    tool.seoKeywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
  );
}
