import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CanonicalHead } from "@/components/CanonicalHead";
import { Link } from "react-router-dom";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Home, ArrowLeft } from "lucide-react";
import { FileEdit, Layers, Scissors, FileDown, FileType2, FileText, Unlock, Lock, RotateCw, Image, PenTool, Droplets, FolderSync, FileCheck, FileImage, Code, Shield, Zap, Globe } from "lucide-react";
import pdfWorkflowImg from "@/assets/graphics/pdf-workflow.webp";
import securityVisualImg from "@/assets/graphics/security-visual.webp";

const tools = [
  { name: "PDF Editor", href: "/edit-pdf", icon: FileEdit, desc: "Edit text, add images, annotate documents", gradient: "from-blue-500 to-indigo-600" },
  { name: "Merge PDF", href: "/merge-pdf", icon: Layers, desc: "Combine multiple PDFs into one file", gradient: "from-green-500 to-emerald-600" },
  { name: "Split PDF", href: "/split-pdf", icon: Scissors, desc: "Separate pages into individual files", gradient: "from-orange-500 to-red-500" },
  { name: "Compress PDF", href: "/compress-pdf", icon: FileDown, desc: "Reduce PDF file size while keeping quality", gradient: "from-purple-500 to-violet-600" },
  { name: "PDF to Word", href: "/pdf-to-word", icon: FileType2, desc: "Convert PDF to editable Word documents", gradient: "from-blue-600 to-blue-700" },
  { name: "Word to PDF", href: "/word-to-pdf", icon: FileText, desc: "Transform Word files into professional PDFs", gradient: "from-blue-500 to-cyan-500" },
  { name: "Sign PDF", href: "/sign-pdf", icon: PenTool, desc: "Add digital signatures to PDF documents", gradient: "from-indigo-500 to-purple-600" },
  { name: "Watermark PDF", href: "/watermark-pdf", icon: Droplets, desc: "Add text or image watermarks to PDFs", gradient: "from-cyan-500 to-blue-500" },
  { name: "Unlock PDF", href: "/unlock-pdf", icon: Unlock, desc: "Remove password restrictions from PDFs", gradient: "from-amber-500 to-orange-500" },
  { name: "Protect PDF", href: "/protect-pdf", icon: Lock, desc: "Add password protection to your PDFs", gradient: "from-red-500 to-pink-500" },
  { name: "Rotate PDF", href: "/rotate-pdf", icon: RotateCw, desc: "Rotate pages to correct orientation", gradient: "from-teal-500 to-green-500" },
  { name: "Organize PDF", href: "/organize-pdf", icon: FolderSync, desc: "Rearrange and reorder PDF pages", gradient: "from-lime-500 to-green-600" },
  { name: "Repair PDF", href: "/repair-pdf", icon: FileCheck, desc: "Fix corrupted or damaged PDF files", gradient: "from-yellow-500 to-orange-500" },
  { name: "JPG to PDF", href: "/jpg-to-pdf", icon: Image, desc: "Convert JPG images to PDF format", gradient: "from-amber-500 to-yellow-500" },
  { name: "PNG to PDF", href: "/png-to-pdf", icon: Image, desc: "Convert PNG images to PDF format", gradient: "from-green-500 to-teal-500" },
  { name: "PDF to JPG", href: "/pdf-to-jpg", icon: Image, desc: "Convert PDF pages to JPG images", gradient: "from-pink-500 to-rose-500" },
  { name: "PDF to PNG", href: "/pdf-to-png", icon: Image, desc: "Convert PDF pages to PNG images", gradient: "from-emerald-500 to-green-600" },
  { name: "PDF to Image", href: "/pdf-to-image", icon: FileImage, desc: "Convert PDF pages to various image formats", gradient: "from-violet-500 to-fuchsia-500" },
  { name: "PDF to HTML", href: "/pdf-to-html", icon: Code, desc: "Convert PDF to HTML web pages", gradient: "from-sky-500 to-blue-600" },
];

const faqs = [
  { q: "Are VexaTool PDF tools really free?", a: "Yes, every PDF tool is 100% free with no daily limits, no signup required, and no watermarks on output files." },
  { q: "Is it safe to edit sensitive PDFs online?", a: "Absolutely. All processing happens in your browser using JavaScript. Your files are never uploaded to any server, making it safe for contracts, financial records, and legal documents." },
  { q: "Can I merge password-protected PDFs?", a: "Our Merge PDF tool handles most encrypted PDFs automatically. For fully locked files, use the Unlock PDF tool first, then merge." },
  { q: "Do PDF tools work on mobile phones?", a: "Yes. All tools are fully responsive and work on smartphones and tablets. No app installation needed." },
  { q: "What is the maximum file size supported?", a: "Most tools handle PDFs up to 25MB comfortably. Since processing happens on your device, performance depends on your device's capabilities." },
  { q: "Can I convert scanned PDFs to Word?", a: "For scanned PDFs (image-based), use our PDF Editor with built-in OCR to extract text first, then export. The PDF to Word tool works best with text-based PDFs." },
];

const PDFTools = () => {
  return (
    <div className="min-h-screen bg-background">
      <CanonicalHead
        title="Free PDF Tools Online – Edit, Merge, Compress & Convert PDF | VexaTool"
        description="Use VexaTool's free online PDF tools to edit, merge, split, compress, convert, rotate, lock and unlock PDF files. Secure, fast, browser-based processing."
        keywords="PDF tools online, free PDF editor, merge PDF, compress PDF, PDF to Word, PDF converter, online PDF tools"
      />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <Breadcrumb items={[{ name: "PDF Tools", path: "/pdf-tools" }]} className="mb-6" />
        <h1 className="text-4xl font-bold text-foreground mb-4">Free Online PDF Tools</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
          Edit, merge, split, compress, and convert PDF files directly in your browser. No signup, no watermarks, no server uploads.
        </p>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              to={tool.href}
              className="group p-5 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tool.gradient} flex items-center justify-center`}>
                  <tool.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{tool.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{tool.desc}</p>
            </Link>
          ))}
        </div>

        {/* Featured Visual: How it works — FULL WIDTH prominent */}
        <div className="mb-16 rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-primary/5 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
            <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">How VexaTool PDF Tools Work</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Using any PDF tool follows a simple three-step process: select the tool you need, upload your PDF file, and download the result. The entire process takes seconds.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Everything happens in your browser — there are no server uploads or waiting times. Your original file stays safe on your device throughout.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Zap, label: "Instant Processing" },
                  { icon: Shield, label: "100% Private" },
                  { icon: Globe, label: "Works Everywhere" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex items-center justify-center p-6 md:p-8">
              <img
                src={pdfWorkflowImg}
                alt="PDF workflow: upload, process, download in 3 steps"
                className="w-full max-w-md rounded-xl shadow-xl border border-border/40"
                loading="lazy"
                decoding="async"
                width={480}
                height={320}
              />
            </div>
          </div>
        </div>

        {/* Content: Why choose */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Why Choose VexaTool for PDF Editing?</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            Most PDF editors online either require a paid subscription or limit your free usage to just a few files per day. VexaTool is different. Every PDF tool is completely free, with no daily limits and no account registration required.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Students preparing college assignments, professionals handling contracts, small business owners creating invoices, and government employees managing official paperwork — all benefit from having reliable PDF tools that just work, without downloading software or worrying about privacy.
          </p>
        </div>

        {/* Featured Visual: Security — FULL WIDTH prominent */}
        <div className="mb-16 rounded-2xl border border-border bg-gradient-to-br from-green-500/5 via-card to-emerald-500/5 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
            <div className="md:col-span-2 flex items-center justify-center p-6 md:p-8 order-2 md:order-1">
              <img
                src={securityVisualImg}
                alt="Secure browser-based PDF processing with encryption"
                className="w-full max-w-md rounded-xl shadow-xl border border-border/40"
                loading="lazy"
                decoding="async"
                width={480}
                height={320}
              />
            </div>
            <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-center order-1 md:order-2">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Security You Can Trust</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All connections use HTTPS encryption. Our PDF tools process files locally in your browser using JavaScript, which means your documents never get uploaded to any server.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                There is no cloud storage, no file retention, and no third-party access to your data. Once you close the browser tab, your processed files exist only on your device.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {["No Server Uploads", "No File Storage", "HTTPS Encrypted", "Zero Third-Party Access"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-card border border-border/60 rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PDFTools;
