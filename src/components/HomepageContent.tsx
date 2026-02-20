import { Shield, Zap, Globe, Users, CheckCircle, FileText, Image, Cpu, Lock, Award, Heart, Clock, QrCode, GraduationCap, Briefcase, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";

export const HomepageContent = () => {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
          
          {/* Best Free PDF Tools */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Best Free PDF Tools for PDF Lovers
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              MyPDFs.in is India's most comprehensive free online PDF toolkit — bringing together over 50 powerful tools for managing PDFs, images, and documents directly from your web browser. Whether you need to <Link to="/merge-pdf" className="text-primary hover:underline">merge multiple PDF files online</Link>, <Link to="/compress-pdf" className="text-primary hover:underline">compress a large PDF for free</Link>, <Link to="/pdf-to-word" className="text-primary hover:underline">convert PDF to Word</Link>, or <Link to="/edit-pdf" className="text-primary hover:underline">edit PDF online without watermark</Link>, MyPDFs has you covered — completely free, with no registration required.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Unlike traditional desktop software that requires expensive subscriptions and lengthy installations, MyPDFs works instantly in any modern browser. There are no downloads to install, no accounts to create, and absolutely no hidden fees. We built this platform with a simple belief: everyone deserves access to professional-grade document tools without financial barriers — especially students, job seekers, and small business owners in India.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Since our launch, thousands of users across India rely on MyPDFs daily for their personal and professional document needs. From students preparing college assignments and converting PDF to Excel for data analysis, to business professionals handling contracts and government forms — our secure PDF tools serve a diverse community that values simplicity, speed, and privacy.
            </p>
          </div>

          {/* Popular PDF Converters */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Popular PDF Converters – PDF to Excel, Word, JPG & More
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Converting PDFs to editable formats is one of the most requested features online. MyPDFs offers a complete suite of <strong>free PDF converters</strong> that handle every format you need — from extracting tables with our <Link to="/pdf-to-excel" className="text-primary hover:underline">PDF to Excel converter</Link> to creating editable documents with <Link to="/pdf-to-word" className="text-primary hover:underline">PDF to Word</Link>. Need images? Convert with <Link to="/pdf-to-jpg" className="text-primary hover:underline">PDF to JPG</Link> or <Link to="/pdf-to-png" className="text-primary hover:underline">PDF to PNG</Link>. Going the other way? Use <Link to="/word-to-pdf" className="text-primary hover:underline">Word to PDF</Link>, <Link to="/excel-to-pdf" className="text-primary hover:underline">Excel to PDF</Link>, or <Link to="/image-to-pdf" className="text-primary hover:underline">Image to PDF</Link> converters.
            </p>
            <div className="not-prose grid md:grid-cols-2 gap-3">
              {[
                { name: "PDF to Excel", href: "/pdf-to-excel", desc: "Extract tables & data to editable spreadsheets" },
                { name: "PDF to Word", href: "/pdf-to-word", desc: "Convert PDFs to editable Word documents" },
                { name: "Word to PDF", href: "/word-to-pdf", desc: "Transform Word files into professional PDFs" },
                { name: "PDF to JPG", href: "/pdf-to-jpg", desc: "Convert PDF pages to high-quality images" },
                { name: "Image to PDF", href: "/image-to-pdf", desc: "Convert photos and images to PDF format" },
                { name: "Excel to PDF", href: "/excel-to-pdf", desc: "Convert spreadsheets to shareable PDFs" },
                { name: "PPT to PDF", href: "/ppt-to-pdf", desc: "Convert presentations to PDF format" },
                { name: "HTML to PDF", href: "/html-to-pdf", desc: "Save web pages as PDF documents" },
              ].map((tool, i) => (
                <Link key={i} to={tool.href} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{tool.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">— {tool.desc}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Secure & Fast PDF Editor */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Secure & Fast PDF Editor Online – Edit PDFs Without Watermark
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Looking for a <strong>free PDF editor online</strong> that doesn't add watermarks? MyPDFs offers a professional-grade <Link to="/edit-pdf" className="text-primary hover:underline">PDF editor</Link> that lets you modify text, add images, insert signatures, and annotate documents — all without installing software. Our editor supports both text-based PDFs and scanned documents through built-in OCR (Optical Character Recognition) technology.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Beyond editing, our PDF suite includes tools to <Link to="/merge-pdf" className="text-primary hover:underline">merge PDF files online</Link>, <Link to="/split-pdf" className="text-primary hover:underline">split large PDFs</Link>, <Link to="/compress-pdf" className="text-primary hover:underline">compress PDF files for free</Link>, <Link to="/rotate-pdf" className="text-primary hover:underline">rotate pages</Link>, <Link to="/sign-pdf" className="text-primary hover:underline">add digital signatures</Link>, <Link to="/protect-pdf" className="text-primary hover:underline">password-protect documents</Link>, and <Link to="/watermark-pdf" className="text-primary hover:underline">add watermarks for branding</Link>. Every tool processes files securely in your browser — your sensitive documents never leave your device.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you're a student editing assignment PDFs, a professional modifying contracts, or a government employee working with official forms, MyPDFs provides the best free PDF editing experience in India — fast, secure, and completely free.
            </p>
          </div>

          {/* Free QR Code Generator */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Free QR Code Generator Tool – Create QR Codes Instantly
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our <Link to="/qr-code-generator" className="text-primary hover:underline">free QR code generator</Link> lets you create custom QR codes for URLs, text, WhatsApp links, contact details, and payment pages — all in seconds. Add your brand logo, customize colors, and download in PNG or SVG format. Perfect for business cards, restaurant menus, event posters, product packaging, and digital marketing campaigns across India.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Need to scan existing QR codes? Our <Link to="/qr-code-scanner" className="text-primary hover:underline">QR code scanner</Link> reads any QR code from your camera or uploaded images. Both tools work entirely in your browser with no data sent to external servers — your URLs, payment links, and contact information remain completely private.
            </p>
            <div className="not-prose grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "URL QR Codes", desc: "Link to any website" },
                { label: "WhatsApp QR", desc: "Direct message links" },
                { label: "Contact QR", desc: "Share vCard details" },
                { label: "Payment QR", desc: "UPI & payment links" },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-muted/30 rounded-lg text-center">
                  <QrCode className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-medium text-foreground text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why MyPDFs is Better */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Why MyPDFs is Better Than Other PDF Websites?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The internet is full of PDF tools, but most come with significant drawbacks. Popular alternatives like iLovePDF, SmallPDF, and Adobe Acrobat either limit free usage to a few operations per day, require account creation, or charge monthly subscriptions ranging from ₹500 to ₹2,000. Many also upload your files to remote servers, raising serious privacy concerns for sensitive documents like Aadhaar cards, PAN cards, salary slips, and legal agreements.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              MyPDFs eliminates these pain points entirely. Here is how we compare:
            </p>
            <div className="overflow-x-auto not-prose mb-6">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-3 font-semibold text-foreground">Feature</th>
                    <th className="text-center p-3 font-semibold text-foreground">MyPDFs</th>
                    <th className="text-center p-3 font-semibold text-foreground">Others</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["Price", "100% Free", "Freemium / Paid"],
                    ["Account Required", "No", "Usually Yes"],
                    ["Daily Usage Limit", "Unlimited", "2-5 per day"],
                    ["File Processing", "In Browser (Local)", "Server Upload"],
                    ["Privacy", "Files Stay on Device", "Files Uploaded to Cloud"],
                    ["Watermarks on Output", "Never", "Often in Free Tier"],
                    ["Mobile Friendly", "Fully Responsive", "Varies"],
                    ["AI Tools Included", "Yes (Chat, Grammar, Resume)", "Rarely"],
                    ["QR Code Generator", "Yes, with Logo Support", "No"],
                    ["Calculators & Utilities", "EMI, GST, BMI, Age", "No"],
                  ].map(([feature, us, them], i) => (
                    <tr key={i}>
                      <td className="p-3 text-foreground">{feature}</td>
                      <td className="p-3 text-center text-primary font-medium">{us}</td>
                      <td className="p-3 text-center text-muted-foreground">{them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Who Should Use - India focused */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Who Uses MyPDFs? Free PDF Tools for Students, Professionals & Businesses
            </h2>
            <div className="grid md:grid-cols-2 gap-6 not-prose">
              {[
                { icon: GraduationCap, title: "Students & Educators", desc: "Merge lecture notes into single PDFs, convert assignments to PDF for submission, compress files for college portals, and use our AI resume builder for campus placements. Perfect for UPSC, SSC, and competitive exam preparation." },
                { icon: Briefcase, title: "Business Professionals", desc: "Sign contracts digitally, merge financial reports, convert Excel data to PDF for presentations, and protect confidential documents with password encryption. Essential for CA, CS, and legal professionals." },
                { icon: IndianRupee, title: "Small Business Owners", desc: "Create professional invoices, generate QR codes for UPI payments and WhatsApp business links, compress product images for e-commerce, and calculate GST using our free calculator." },
                { icon: Users, title: "Government & Job Seekers", desc: "Resize photos for Aadhaar, passport, and government job applications. Convert scanned documents to PDF, merge certificates for job applications, and compress files for government portal uploads." },
              ].map((item, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Key Features That Set MyPDFs Apart
            </h2>
            <div className="grid md:grid-cols-2 gap-4 not-prose">
              {[
                { icon: FileText, title: "Complete PDF Suite", desc: "Merge, split, compress, rotate, watermark, protect, unlock, sign, and edit PDFs — everything in one place. The best free PDF tool website in India." },
                { icon: Image, title: "Image Tools", desc: "Compress images, resize photos for Aadhaar & passport, remove backgrounds with AI, and convert between JPG, PNG, WebP, and PDF formats." },
                { icon: Cpu, title: "AI-Powered Tools", desc: "AI chatbot, grammar checker, text generator, resume builder, hashtag generator, and intelligent web search — all free." },
                { icon: Shield, title: "Privacy First", desc: "Most tools process files entirely in your browser. Your documents never leave your device — no server uploads needed. Safe for Aadhaar, PAN, and sensitive files." },
                { icon: Zap, title: "Lightning Fast", desc: "Browser-based processing delivers instant results. No waiting for server queues or upload/download cycles. Works even on slow internet." },
                { icon: Globe, title: "Works Everywhere", desc: "Fully responsive design works on desktop, tablet, and mobile. No app installation required — just open and use on any device." },
                { icon: Lock, title: "Document Security", desc: "Password-protect sensitive PDFs, add watermarks for branding, and sign documents with digital signatures. Essential for legal and business use." },
                { icon: Users, title: "No Account Needed", desc: "Use every tool without registration, login, or personal information. Just visit, use, and download — unlimited times, forever free." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Privacy */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Security & Privacy: How We Protect Your Files
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We understand that documents often contain sensitive information — Aadhaar cards, PAN cards, financial records, legal agreements, medical reports, and confidential business data. That is why security is not just a feature at MyPDFs; it is our foundational principle.
            </p>
            <div className="not-prose space-y-4 mb-6">
              {[
                { title: "Client-Side Processing", desc: "The majority of our tools — including PDF merge, split, compress, image conversion, and QR code generation — process your files entirely within your web browser using JavaScript. Your files literally never leave your device." },
                { title: "No File Storage", desc: "We do not store, cache, or retain any files you process. Once your task is complete, the output is available only to you. There is no server-side copy of your documents." },
                { title: "HTTPS Encryption", desc: "All communication with our website uses industry-standard HTTPS encryption, protecting your data during transit from eavesdropping or tampering." },
                { title: "No Third-Party Access", desc: "We never share, sell, or provide your files or data to any third party. Your Aadhaar, PAN, salary slips, and other sensitive documents remain 100% private." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explore Popular Tools */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Explore Our Most Popular Free PDF Tools
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              With over 50 tools available, here are the most-used features on MyPDFs that users across India love:
            </p>
            <div className="not-prose grid md:grid-cols-2 gap-3">
              {[
                { name: "Merge PDF Online", href: "/merge-pdf", desc: "Combine multiple PDFs into one document" },
                { name: "Split PDF", href: "/split-pdf", desc: "Extract specific pages from any PDF" },
                { name: "Compress PDF Free", href: "/compress-pdf", desc: "Reduce file size without losing quality" },
                { name: "PDF to Word Converter", href: "/pdf-to-word", desc: "Convert PDFs to editable Word documents" },
                { name: "PDF to Excel Free", href: "/pdf-to-excel", desc: "Extract tables from PDF to spreadsheet" },
                { name: "Edit PDF Online", href: "/edit-pdf", desc: "Modify text, add images, OCR scanned docs" },
                { name: "Sign PDF", href: "/sign-pdf", desc: "Add digital signatures to documents" },
                { name: "QR Code Generator", href: "/qr-code-generator", desc: "Create custom QR codes with logos" },
                { name: "AI Resume Builder", href: "/ai-resume-builder", desc: "Build professional resumes with AI" },
                { name: "Image Compressor", href: "/compress-image", desc: "Reduce image file sizes instantly" },
              ].map((tool, i) => (
                <Link key={i} to={tool.href} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{tool.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">— {tool.desc}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Trust & Credibility */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Why Thousands Trust MyPDFs Every Day
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Trust is earned through consistent reliability, transparency, and genuine value. Here is what makes MyPDFs a trusted platform across India:
            </p>
            <div className="not-prose grid md:grid-cols-3 gap-4">
              {[
                { icon: Award, title: "Built in India 🇮🇳", desc: "Developed by Indian developers who understand local needs — government forms, competitive exams, business compliance." },
                { icon: Heart, title: "Community Driven", desc: "Features are built based on real user feedback from students, professionals, and businesses across India." },
                { icon: Clock, title: "Always Available", desc: "99.9% uptime ensures our tools are ready whenever you need them, 24/7 — even during peak exam seasons." },
                { icon: Shield, title: "GDPR Compliant", desc: "We follow international data protection standards with a comprehensive privacy policy and cookie consent." },
                { icon: Globe, title: "Optimized for India", desc: "Fast loading even on slower connections. Works perfectly on budget smartphones and older browsers." },
                { icon: Users, title: "Active Support", desc: "Responsive customer support via email and social media. We typically respond within 24 hours." },
              ].map((item, i) => (
                <div key={i} className="text-center p-4 bg-card border border-border rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-primary/5 border border-primary/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to Simplify Your Document Workflow?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of Indian users who save time and money with MyPDFs. No signup, no installation, no cost — just powerful free PDF tools that work. Start by choosing a tool above, or explore our complete collection.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/merge-pdf" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                <FileText className="w-4 h-4" /> Merge PDF Free
              </Link>
              <Link to="/compress-pdf" className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors">
                <Zap className="w-4 h-4" /> Compress PDF
              </Link>
              <Link to="/edit-pdf" className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors">
                <FileText className="w-4 h-4" /> Edit PDF Online
              </Link>
              <Link to="/qr-code-generator" className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors">
                <QrCode className="w-4 h-4" /> QR Code Generator
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
