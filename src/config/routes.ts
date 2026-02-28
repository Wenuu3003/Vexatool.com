// Central route configuration for sitemap generation and app routing with SEO metadata
export interface RouteConfig {
  path: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  includeInSitemap: boolean;
  title?: string;
  description?: string;
  keywords?: string;
  category?: string;
}

// Blog post slugs for sitemap
export const blogPosts = [
  'how-to-merge-pdf-files-online-complete-guide',
  'love-age-calculator-complete-guide',
  'age-calculator-birthday-planning',
  'qr-code-generator-complete-guide',
  'background-remover-perfect-product-photos',
  'emi-calculator-home-loan-guide',
  'gst-calculator-business-guide',
  'pdf-to-word-formatting-tips',
  'image-compression-web-performance',
  'split-pdf-organize-documents',
  'bmi-calculator-health-guide',
  'word-to-pdf-professional-documents',
  'currency-converter-travel-guide',
  'pdf-watermark-protect-documents',
  'image-resizer-social-media-guide',
  'unit-converter-complete-reference',
  'pdf-to-excel-data-extraction',
  'word-counter-content-optimization',
  'pincode-finder-india-postal-guide',
  'pdf-to-jpg-image-conversion',
  'convert-pdf-to-word-free-guide',
  'digital-signature-guide',
  'pdf-accessibility-guide',
  'how-to-merge-pdfs-complete-guide',
  'best-image-compression-tips',
  'pdf-security-guide',
  'compress-pdf-without-losing-quality',
  'best-free-pdf-tools-online-2026',
];

export const routes: RouteConfig[] = [
  // Main pages
  { 
    path: '/', 
    priority: 1.0, 
    changefreq: 'daily', 
    includeInSitemap: true,
    title: 'All-in-One Free Online Tools | PDF, QR & Calculator Tools – VexaTool',
    description: 'VexaTool provides secure and free online PDF editor, QR code generator, image tools and calculators. Fast, easy and mobile-friendly tools for everyone.',
    keywords: 'pdf tools, online pdf editor, free pdf converter, calculator, image compressor, qr code generator',
    category: 'Website'
  },
  { 
    path: '/blog', 
    priority: 0.9, 
    changefreq: 'daily', 
    includeInSitemap: true,
    title: 'Blog - PDF Tips, Guides & Tutorials | VexaTool',
    description: 'Learn PDF tips, tool tutorials, image editing guides. How-to articles on PDF editing, compression, conversion and more.',
    keywords: 'pdf tips, tools guide, pdf tutorials, image compression tips',
    category: 'Blog'
  },
  { 
    path: '/about-us', 
    priority: 0.7, 
    changefreq: 'monthly', 
    includeInSitemap: true,
    title: 'About Us – VexaTool Free Online Tools',
    description: 'Learn about VexaTool - your free online PDF tools, image tools, calculators and utility platform. 100% free, no registration required.',
    keywords: 'about vexatool, free pdf tools, online tools',
    category: 'Website'
  },
  { 
    path: '/privacy-policy', 
    priority: 0.5, 
    changefreq: 'monthly', 
    includeInSitemap: true,
    title: 'Privacy Policy – VexaTool',
    description: 'Privacy policy for VexaTool online tools. Your data is processed locally and never stored on servers.',
    keywords: 'privacy policy, data protection',
    category: 'Legal'
  },
  { 
    path: '/terms-and-conditions', 
    priority: 0.5, 
    changefreq: 'monthly', 
    includeInSitemap: true,
    title: 'Terms and Conditions – VexaTool',
    description: 'Terms and conditions for using VexaTool online PDF tools and utilities.',
    keywords: 'terms and conditions, terms of service',
    category: 'Legal'
  },
  { 
    path: '/contact', 
    priority: 0.7, 
    changefreq: 'monthly', 
    includeInSitemap: true,
    title: 'Contact Us – VexaTool | Support & Inquiries',
    description: 'Contact VexaTool for support, feedback, or business inquiries. Get help with PDF tools, image tools, calculators.',
    keywords: 'contact vexatool, support, help, feedback',
    category: 'Website'
  },
  { path: '/auth', priority: 0.3, changefreq: 'monthly', includeInSitemap: false },
  { path: '/account', priority: 0.3, changefreq: 'monthly', includeInSitemap: false },
  
  // Blog posts
  ...blogPosts.map(slug => ({
    path: `/blog/${slug}`,
    priority: 0.8,
    changefreq: 'weekly' as const,
    includeInSitemap: true,
    title: `${slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} | VexaTool Blog`,
    description: `Read our complete guide on ${slug.replace(/-/g, ' ')}. Tips, tricks and best practices.`,
    keywords: slug.replace(/-/g, ', '),
    category: 'Blog'
  })),
  
  { 
    path: '/word-counter',
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Word Counter - Count Words, Characters, Sentences Free | VexaTool',
    description: 'Free word counter tool. Count words, characters, sentences, paragraphs instantly. Perfect for essays, articles, social media posts.',
    keywords: 'word counter, character counter, word count, letter count, text counter, essay word counter',
    category: 'Utility Tools'
  },
  
  // Utility Tools - High priority
  { 
    path: '/qr-code-scanner', 
    priority: 0.9, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'QR Code Scanner - Scan QR Codes Online Free | VexaTool',
    description: 'Free QR code scanner online. Scan QR codes from camera or image upload. Fast, accurate QR code reader with no app required.',
    keywords: 'qr scanner, qr code reader, scan qr code online, qr code scanner free, read qr code',
    category: 'QR Tools'
  },
  { 
    path: '/qr-code-generator', 
    priority: 0.9, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'QR Code Generator - Create QR Codes with Logo Free | VexaTool',
    description: 'Create custom QR codes with logo for free. Generate QR codes for URL, WiFi, vCard, text. Custom colors, high resolution download.',
    keywords: 'qr code generator, create qr code, qr code with logo, custom qr code, free qr generator, qr code maker',
    category: 'QR Tools'
  },
  { 
    path: '/currency-converter', 
    priority: 0.8, 
    changefreq: 'daily', 
    includeInSitemap: true,
    title: 'Currency Converter - Live Exchange Rates USD INR EUR | VexaTool',
    description: 'Convert currencies with live exchange rates. USD to INR, EUR to INR, GBP to INR. Free currency converter with 100+ currencies.',
    keywords: 'currency converter, exchange rate, usd to inr, eur to inr, money converter, forex rates',
    category: 'Calculator Tools'
  },
  {
    path: '/calculator', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Calculator - Free Online Scientific Calculator | VexaTool',
    description: 'Free online calculator for basic and scientific calculations. Easy to use calculator for students and professionals.',
    keywords: 'online calculator, scientific calculator, free calculator, math calculator, basic calculator',
    category: 'Calculator Tools'
  },
  
  // Calculator Tools (Age Calculator merged into Love Calculator - redirect handled in App.tsx)
  { 
    path: '/bmi-calculator', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'BMI Calculator - Body Mass Index Calculator Free | VexaTool',
    description: 'Calculate your BMI (Body Mass Index) instantly. Free BMI calculator with health category and recommendations. Metric and imperial units.',
    keywords: 'bmi calculator, body mass index, weight calculator, health calculator, bmi check, obesity calculator',
    category: 'Calculator Tools'
  },
  { 
    path: '/emi-calculator', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'EMI Calculator - Home Loan, Car Loan, Personal Loan EMI | VexaTool',
    description: 'Calculate loan EMI instantly. Home loan, car loan, personal loan EMI calculator with amortization schedule. Free EMI calculator India.',
    keywords: 'emi calculator, loan calculator, home loan emi, car loan emi, personal loan emi, loan emi calculator',
    category: 'Calculator Tools'
  },
  { 
    path: '/gst-calculator', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'GST Calculator - Calculate GST Online India | VexaTool',
    description: 'Calculate GST (Goods and Services Tax) instantly. Free GST calculator India with all tax slabs - 5%, 12%, 18%, 28%. CGST, SGST, IGST.',
    keywords: 'gst calculator, gst calculation india, tax calculator, cgst sgst, gst online, goods and services tax',
    category: 'Calculator Tools'
  },
  { 
    path: '/age-calculator', 
    priority: 0.9, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Age Calculator - Calculate Exact Age in Years, Months & Days | VexaTool',
    description: 'Free online age calculator. Calculate your exact age in years, months, days, hours. Birthday wishes in English & Telugu. Share on Instagram & WhatsApp.',
    keywords: 'age calculator, birthday calculator, how old am I, age in days, telugu age calculator, birthday wishes, exact age calculator',
    category: 'Calculator Tools'
  },
  { 
    path: '/love-calculator', 
    priority: 0.9, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Love Calculator ❤️ Free Compatibility Test with Zodiac & Share Cards | VexaTool',
    description: 'Free Love Calculator with zodiac compatibility. Upload photos, get Instagram & WhatsApp ready images. Fun & safe!',
    keywords: 'love calculator, love compatibility test, zodiac love calculator, instagram story maker, whatsapp status, numerology',
    category: 'Calculator Tools'
  },
  {
    path: '/unit-converter', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Unit Converter - Length, Weight, Temperature Converter | VexaTool',
    description: 'Convert units of length, weight, temperature, area, volume. Free online unit converter. Metric to imperial, kg to lbs, cm to inches.',
    keywords: 'unit converter, length converter, weight converter, temperature converter, metric converter, kg to lbs',
    category: 'Calculator Tools'
  },
  { 
    path: '/pincode-generator', 
    priority: 0.9, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'PIN Code Finder India - Search Indian Postal Codes | VexaTool',
    description: 'Find Indian PIN codes instantly. Search postal codes by location, post office, district. Complete India PIN code database with details.',
    keywords: 'pin code finder, india pin code, postal code india, zip code india, post office pin code, area pin code',
    category: 'Utility Tools'
  },
  
  // Image Tools
  { 
    path: '/compress-image', 
    priority: 0.9, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Compress Image - Reduce Image Size Online Free | VexaTool',
    description: 'Compress images online for free. Reduce image file size without losing quality. JPG, PNG, WebP compressor. Up to 90% size reduction.',
    keywords: 'compress image, image compressor, reduce image size, jpg compressor, png compressor, photo compressor',
    category: 'Image Tools'
  },
  { 
    path: '/image-resizer', 
    priority: 0.9, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Image Resizer – Resize to 20KB, WhatsApp DP, Aadhaar & Passport Photo India | VexaTool',
    description: 'Resize image to 20KB or 50KB for Govt Job Form, UPSC, SSC. WhatsApp DP 192x192px, Aadhaar photo 200x200px, Passport Photo India. Free, fast, secure.',
    keywords: 'image resizer, resize image to 20kb, whatsapp dp resize, aadhaar photo size, passport size photo india, govt job form photo, resize photo to 50kb, compress image to 20kb',
    category: 'Image Tools'
  },
  {
    path: '/whatsapp-dp-resize',
    priority: 0.9,
    changefreq: 'weekly',
    includeInSitemap: true,
    title: 'WhatsApp DP Resize Online Free – 192x192px Under 20KB | VexaTool',
    description: 'Resize photo for WhatsApp DP online free. Get perfect 192x192px WhatsApp profile picture under 20KB. Instant download, no signup required.',
    keywords: 'whatsapp dp resize, whatsapp profile photo size, resize photo for whatsapp, whatsapp dp 192x192, whatsapp dp maker free',
    category: 'Image Tools'
  },
  {
    path: '/aadhaar-photo-resize',
    priority: 0.9,
    changefreq: 'weekly',
    includeInSitemap: true,
    title: 'Aadhaar Card Photo Size Online Free – 200x200px | VexaTool',
    description: 'Resize photo for Aadhaar card online free. Get correct 200x200px Aadhaar photo size under 50KB with white background. Instant, no signup.',
    keywords: 'aadhaar photo size, aadhaar card photo resize, aadhaar photo online, resize photo for aadhaar, aadhaar enrollment photo size',
    category: 'Image Tools'
  },
  {
    path: '/govt-job-photo-resize',
    priority: 0.9,
    changefreq: 'weekly',
    includeInSitemap: true,
    title: 'Govt Job Form Photo Resize – 3.5x4.5cm, 20KB Free | VexaTool',
    description: 'Resize photo for government job application form online. Get 3.5x4.5cm photo under 20KB for SSC, UPSC, IBPS, Railway exams. Free, instant.',
    keywords: 'govt job form photo size, resize photo for government form, SSC photo size, UPSC photo requirement, IBPS photo resize, railway exam photo size',
    category: 'Image Tools'
  },
  {
    path: '/passport-photo-resize',
    priority: 0.9,
    changefreq: 'weekly',
    includeInSitemap: true,
    title: 'Passport Size Photo Online Free India – 2x2 inch 300 DPI | VexaTool',
    description: 'Create passport size photo online free. Perfect 2x2 inch (51x51mm) passport photo at 300 DPI with white background. For Indian passport, visa.',
    keywords: 'passport size photo online, passport photo maker india, 2x2 passport photo free, passport photo 300 dpi, make passport photo online, indian passport photo size',
    category: 'Image Tools'
  },
  { 
    path: '/image-format-converter',
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Image Format Converter - JPG to PNG, PNG to WebP | VexaTool',
    description: 'Convert images between formats. JPG to PNG, PNG to WebP, WebP to JPG. Free online image format converter with quality control.',
    keywords: 'image converter, jpg to png, png to jpg, webp converter, image format converter, convert image online',
    category: 'Image Tools'
  },
  { 
    path: '/background-remover', 
    priority: 0.9, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Background Remover - Remove Image Background Free | VexaTool',
    description: 'Remove image background instantly with AI. Free background remover for photos, products, portraits. Transparent background in seconds.',
    keywords: 'background remover, remove background, transparent background, ai background removal, photo background remover',
    category: 'Image Tools'
  },
  { 
    path: '/image-to-pdf', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Image to PDF - Convert Images to PDF Free | VexaTool',
    description: 'Convert images to PDF online. Combine multiple images into one PDF. JPG, PNG, WebP to PDF converter. Free, fast, no signup.',
    keywords: 'image to pdf, convert image to pdf, photo to pdf, picture to pdf, jpg to pdf, png to pdf',
    category: 'Image Tools'
  },
  { 
    path: '/jpg-to-pdf', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'JPG to PDF - Convert JPG to PDF Online Free | VexaTool',
    description: 'Convert JPG images to PDF instantly. Combine multiple JPGs into one PDF. Free online JPG to PDF converter with high quality.',
    keywords: 'jpg to pdf, convert jpg to pdf, jpeg to pdf, photo to pdf, jpg pdf converter',
    category: 'Image Tools'
  },
  { 
    path: '/png-to-pdf', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'PNG to PDF - Convert PNG to PDF Online Free | VexaTool',
    description: 'Convert PNG images to PDF online. Free PNG to PDF converter with transparency support. Multiple PNGs to single PDF.',
    keywords: 'png to pdf, convert png to pdf, png pdf converter, image to pdf, transparent image to pdf',
    category: 'Image Tools'
  },
  { 
    path: '/file-compressor', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'File Compressor - Compress Files Online Free | VexaTool',
    description: 'Compress files to reduce size. Support for images, documents, PDFs. Free online file compressor with maximum compression.',
    keywords: 'file compressor, compress files, reduce file size, file compression, compress documents',
    category: 'Utility Tools'
  },
  
  // PDF Tools
  { 
    path: '/merge-pdf', 
    priority: 0.9, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Merge PDF - Combine PDF Files Online Free | VexaTool',
    description: 'Merge multiple PDF files into one document. Free online PDF merger. Combine PDFs instantly without signup. Drag and drop support.',
    keywords: 'merge pdf, combine pdf, join pdf files, pdf merger, combine pdf online, merge pdf free',
    category: 'PDF Tools'
  },
  { 
    path: '/split-pdf', 
    priority: 0.9, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Split PDF - Extract Pages from PDF Free | VexaTool',
    description: 'Split PDF into separate pages or extract specific pages. Free online PDF splitter. Select page ranges to extract.',
    keywords: 'split pdf, extract pdf pages, pdf splitter, separate pdf pages, divide pdf, extract pages from pdf',
    category: 'PDF Tools'
  },
  { 
    path: '/compress-pdf', 
    priority: 0.9, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Compress PDF - Reduce PDF Size Online Free | VexaTool',
    description: 'Compress PDF files to reduce size without losing quality. Free online PDF compressor. Reduce PDF up to 90% smaller.',
    keywords: 'compress pdf, reduce pdf size, pdf compressor, shrink pdf, optimize pdf, pdf size reducer',
    category: 'PDF Tools'
  },
  { 
    path: '/pdf-to-word', 
    priority: 0.9, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'PDF to Word - Convert PDF to Word Document Free | VexaTool',
    description: 'Convert PDF to Word document online. Free PDF to DOC, DOCX converter. Editable Word format with formatting preserved.',
    keywords: 'pdf to word, convert pdf to word, pdf to doc, pdf to docx, pdf word converter',
    category: 'PDF Tools'
  },
  { 
    path: '/edit-pdf', 
    priority: 0.9, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Edit PDF - Free Online PDF Editor | VexaTool',
    description: 'Edit PDF files online for free. Add text, images, annotations to PDFs. Easy to use PDF editor without software download.',
    keywords: 'edit pdf, pdf editor, modify pdf, add text to pdf, online pdf editor, pdf editor free',
    category: 'PDF Tools'
  },
  { 
    path: '/sign-pdf', 
    priority: 0.9, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Sign PDF - Add Electronic Signature to PDF Free | VexaTool',
    description: 'Sign PDF documents online for free. Add electronic signature, draw signature, or type signature. E-sign PDFs instantly.',
    keywords: 'sign pdf, electronic signature, e-sign pdf, pdf signature, digital signature, esignature',
    category: 'PDF Tools'
  },
  { 
    path: '/watermark-pdf', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Watermark PDF - Add Watermark to PDF Free | VexaTool',
    description: 'Add text or image watermark to PDF files. Free online PDF watermark tool. Custom opacity, position, and rotation.',
    keywords: 'watermark pdf, add watermark to pdf, pdf watermark, stamp pdf, pdf branding, text watermark',
    category: 'PDF Tools'
  },
  { 
    path: '/rotate-pdf', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Rotate PDF - Rotate PDF Pages 90, 180, 270 Degrees | VexaTool',
    description: 'Rotate PDF pages online for free. Rotate 90, 180, or 270 degrees. Fix upside-down or sideways PDF pages instantly.',
    keywords: 'rotate pdf, turn pdf, flip pdf pages, pdf rotation, rotate pdf pages, fix pdf orientation',
    category: 'PDF Tools'
  },
  { 
    path: '/unlock-pdf', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Unlock PDF - Remove PDF Password Free | VexaTool',
    description: 'Remove password protection from PDF files. Free online PDF unlocker. Unlock secured PDFs for editing and printing.',
    keywords: 'unlock pdf, remove pdf password, pdf unlocker, decrypt pdf, pdf password remover, unlock secured pdf',
    category: 'PDF Tools'
  },
  { 
    path: '/protect-pdf', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Protect PDF - Add Password to PDF Free | VexaTool',
    description: 'Add password protection to PDF files. Free online PDF encryption tool. Secure your PDFs with strong encryption.',
    keywords: 'protect pdf, password pdf, encrypt pdf, secure pdf, pdf password protection, pdf encryption',
    category: 'PDF Tools'
  },
  { 
    path: '/organize-pdf', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Organize PDF - Reorder PDF Pages Free | VexaTool',
    description: 'Reorder, delete, and organize PDF pages. Free online PDF organizer with drag and drop. Rearrange pages easily.',
    keywords: 'organize pdf, reorder pdf pages, rearrange pdf, pdf page order, sort pdf pages, manage pdf pages',
    category: 'PDF Tools'
  },
  { 
    path: '/repair-pdf', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Repair PDF - Fix Corrupted PDF Files Free | VexaTool',
    description: 'Repair corrupted or damaged PDF files. Free online PDF repair tool. Fix broken, unreadable PDFs instantly.',
    keywords: 'repair pdf, fix pdf, corrupted pdf, damaged pdf, pdf recovery, broken pdf repair',
    category: 'PDF Tools'
  },
  { 
    path: '/pdf-to-image', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'PDF to Image - Convert PDF to JPG, PNG Free | VexaTool',
    description: 'Convert PDF pages to images. Free PDF to JPG, PNG converter. High quality image extraction from PDF.',
    keywords: 'pdf to image, pdf to jpg, pdf to png, convert pdf to picture, pdf image extractor, pdf to photo',
    category: 'PDF Tools'
  },
  { 
    path: '/pdf-to-jpg', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'PDF to JPG - Convert PDF to JPG Online Free | VexaTool',
    description: 'Convert PDF to JPG images online. Free PDF to JPG converter. High quality output, all pages converted.',
    keywords: 'pdf to jpg, convert pdf to jpg, pdf to jpeg, pdf jpg converter, pdf to image',
    category: 'PDF Tools'
  },
  { 
    path: '/pdf-to-png', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'PDF to PNG - Convert PDF to PNG with Transparency | VexaTool',
    description: 'Convert PDF to PNG images with transparency support. Free PDF to PNG converter online. High resolution output.',
    keywords: 'pdf to png, convert pdf to png, pdf png converter, pdf to transparent image, pdf to picture',
    category: 'PDF Tools'
  },
  { 
    path: '/pdf-to-html', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'PDF to HTML - Convert PDF to Web Page Free | VexaTool',
    description: 'Convert PDF documents to HTML format. Free online PDF to HTML converter for web publishing.',
    keywords: 'pdf to html, convert pdf to html, pdf to web page, pdf html converter, pdf to website',
    category: 'PDF Tools'
  },
  { 
    path: '/pdf-to-powerpoint', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'PDF to PowerPoint - Convert PDF to PPT Free | VexaTool',
    description: 'Convert PDF to PowerPoint presentations. Free PDF to PPT, PPTX converter. Editable slides from PDF.',
    keywords: 'pdf to powerpoint, pdf to ppt, convert pdf to pptx, pdf to slides, pdf ppt converter',
    category: 'PDF Tools'
  },
  { 
    path: '/pdf-to-excel', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'PDF to Excel - Convert PDF to Excel Spreadsheet | VexaTool',
    description: 'Convert PDF tables to Excel spreadsheets. Free PDF to Excel converter. Extract data from PDF to XLS, XLSX.',
    keywords: 'pdf to excel, convert pdf to excel, pdf to xlsx, pdf to spreadsheet, extract pdf table, pdf xls',
    category: 'PDF Tools'
  },
  
  // Document Converters
  { 
    path: '/word-to-pdf', 
    priority: 0.9, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Word to PDF - Convert DOC, DOCX to PDF Free | VexaTool',
    description: 'Convert Word documents to PDF online. Free DOC to PDF, DOCX to PDF converter. Perfect formatting preserved.',
    keywords: 'word to pdf, doc to pdf, docx to pdf, convert word to pdf, word pdf converter, document to pdf',
    category: 'Document Converters'
  },
  { 
    path: '/word-to-excel', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Word to Excel - Convert DOC to XLS, CSV Free | VexaTool',
    description: 'Convert Word documents to Excel spreadsheets. Free DOC to XLS, CSV converter online.',
    keywords: 'word to excel, doc to xls, docx to xlsx, word to spreadsheet, document to excel',
    category: 'Document Converters'
  },
  { 
    path: '/excel-to-word', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Excel to Word - Convert XLS, XLSX to DOC Free | VexaTool',
    description: 'Convert Excel spreadsheets to Word documents. Free XLS to DOC, XLSX to DOCX converter.',
    keywords: 'excel to word, xls to doc, xlsx to docx, spreadsheet to word, excel word converter',
    category: 'Document Converters'
  },
  { 
    path: '/html-to-pdf', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'HTML to PDF - Convert Web Page to PDF Free | VexaTool',
    description: 'Convert HTML code or web pages to PDF. Free online HTML to PDF converter. Perfect for saving web content.',
    keywords: 'html to pdf, webpage to pdf, convert html to pdf, website to pdf, web to pdf, url to pdf',
    category: 'Document Converters'
  },
  { 
    path: '/ppt-to-pdf', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'PPT to PDF - Convert PowerPoint to PDF Free | VexaTool',
    description: 'Convert PowerPoint presentations to PDF. Free PPT to PDF, PPTX to PDF converter. High quality output.',
    keywords: 'ppt to pdf, powerpoint to pdf, pptx to pdf, slides to pdf, presentation to pdf, convert ppt',
    category: 'Document Converters'
  },
  { 
    path: '/excel-to-pdf', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Excel to PDF - Convert XLS, XLSX to PDF Free | VexaTool',
    description: 'Convert Excel spreadsheets to PDF. Free XLS to PDF, XLSX to PDF converter. Formatting preserved.',
    keywords: 'excel to pdf, xls to pdf, xlsx to pdf, spreadsheet to pdf, convert excel to pdf',
    category: 'Document Converters'
  },
  { 
    path: '/google-drive-to-pdf', 
    priority: 0.8, 
    changefreq: 'weekly', 
    includeInSitemap: true,
    title: 'Google Drive to PDF - Convert Docs, Sheets, Slides | VexaTool',
    description: 'Convert Google Docs, Sheets, Slides to PDF. Free Google Drive to PDF converter. Download as PDF instantly.',
    keywords: 'google drive to pdf, google docs to pdf, google sheets to pdf, google slides to pdf, drive pdf',
    category: 'Document Converters'
  },
];

// Use the custom domain for sitemap generation
export const BASE_URL = 'https://vexatool.com';

// Tool update dates for accurate lastmod (format: YYYY-MM-DD)
// Update these when significant changes are made to specific tools
export const toolUpdateDates: Record<string, string> = {
  '/': '2026-01-23',
  '/blog': '2026-01-23',
  '/edit-pdf': '2026-01-23', // Major update: Professional PDF Editor
  '/watermark-pdf': '2026-01-23',
  '/sign-pdf': '2026-01-23', 
  '/merge-pdf': '2026-01-23',
  '/split-pdf': '2026-01-23',
  '/compress-pdf': '2026-01-23',
  '/pdf-to-excel': '2026-01-23',
  '/excel-to-pdf': '2026-01-23',
  '/qr-code-generator': '2026-01-20',
  '/qr-code-scanner': '2026-01-20',
  '/background-remover': '2026-01-20',
  '/image-resizer': '2026-01-20',
  '/compress-image': '2026-01-20',
  '/pincode-generator': '2026-01-20',
};

// Default lastmod date for routes without specific update dates
const DEFAULT_LASTMOD = '2026-01-23';

export const generateSitemapXml = (): string => {
  const urls = routes
    .filter(route => route.includeInSitemap)
    .map(route => {
      // Use specific update date if available, otherwise default
      const lastmod = toolUpdateDates[route.path] || DEFAULT_LASTMOD;
      return `  <url>
    <loc>${BASE_URL}${route.path === '/' ? '' : route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`;
};

// Helper to get route SEO data
export const getRouteSEO = (path: string): RouteConfig | undefined => {
  return routes.find(route => route.path === path);
};
