import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CanonicalHead } from "@/components/CanonicalHead";
import { Link } from "react-router-dom";
import { FileEdit, Layers, Scissors, FileDown, FileType2, FileText, Unlock, Lock, RotateCw, Image } from "lucide-react";

const tools = [
  { name: "PDF Editor", href: "/edit-pdf", icon: FileEdit, desc: "Edit text, add images, annotate documents", gradient: "from-blue-500 to-indigo-600" },
  { name: "Merge PDF", href: "/merge-pdf", icon: Layers, desc: "Combine multiple PDFs into one file", gradient: "from-green-500 to-emerald-600" },
  { name: "Split PDF", href: "/split-pdf", icon: Scissors, desc: "Separate pages into individual files", gradient: "from-orange-500 to-red-500" },
  { name: "Compress PDF", href: "/compress-pdf", icon: FileDown, desc: "Reduce PDF file size while keeping quality", gradient: "from-purple-500 to-violet-600" },
  { name: "PDF to Word", href: "/pdf-to-word", icon: FileType2, desc: "Convert PDF to editable Word documents", gradient: "from-blue-600 to-blue-700" },
  { name: "Word to PDF", href: "/word-to-pdf", icon: FileText, desc: "Transform Word files into professional PDFs", gradient: "from-blue-500 to-cyan-500" },
  { name: "Unlock PDF", href: "/unlock-pdf", icon: Unlock, desc: "Remove password restrictions from PDFs", gradient: "from-amber-500 to-orange-500" },
  { name: "Protect PDF", href: "/protect-pdf", icon: Lock, desc: "Add password protection to your PDFs", gradient: "from-red-500 to-pink-500" },
  { name: "Rotate PDF", href: "/rotate-pdf", icon: RotateCw, desc: "Rotate pages to correct orientation", gradient: "from-teal-500 to-green-500" },
  { name: "JPG to PDF", href: "/jpg-to-pdf", icon: Image, desc: "Convert JPG images to PDF format", gradient: "from-amber-500 to-yellow-500" },
  { name: "PDF to JPG", href: "/pdf-to-jpg", icon: Image, desc: "Convert PDF pages to JPG images", gradient: "from-pink-500 to-rose-500" },
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
        <h1 className="text-4xl font-bold text-foreground mb-6">Free Online PDF Tools</h1>
        
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-muted-foreground leading-relaxed">
            PDF files are everywhere — from school assignments and job applications to business invoices and government forms. But working with them can sometimes feel frustrating, especially when you need to make quick edits or combine multiple documents. That is where VexaTool steps in.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Our collection of free PDF tools lets you handle every common PDF task directly in your web browser. Whether you need to merge multiple PDFs into a single file, compress a large document for email, convert between PDF and Word formats, or simply rotate a scanned page, each tool is designed to be straightforward and fast.
          </p>
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Why Choose VexaTool for PDF Editing?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Most PDF editors online either require a paid subscription or limit your free usage to just a few files per day. VexaTool is different. Every PDF tool on this platform is completely free to use, with no daily limits and no account registration required. Your files are processed directly in your browser, which means sensitive documents like financial records, legal agreements, or identification papers never leave your device.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Students preparing college assignments, professionals handling contracts, small business owners creating invoices, and government employees managing official paperwork — all benefit from having reliable PDF tools that just work, without the hassle of downloading software or worrying about privacy.
          </p>
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">How Our PDF Tools Work</h2>
          <p className="text-muted-foreground leading-relaxed">
            Using any PDF tool on VexaTool follows a simple process: select the tool you need, upload your PDF file (or drag and drop it), make your changes, and download the result. The entire process takes seconds, and because everything happens in your browser, there are no server uploads or waiting times. Your original file stays safe on your device throughout.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Each tool is optimized for mobile devices as well, so you can edit, merge, or convert PDFs on the go using your phone or tablet. No app installation needed — just open your browser and start working.
          </p>
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Security You Can Trust</h2>
          <p className="text-muted-foreground leading-relaxed">
            We take file security seriously. All connections to VexaTool use HTTPS encryption. Our PDF tools process files locally in your browser using JavaScript, which means your documents never get uploaded to any server. There is no cloud storage, no file retention, and no third-party access to your data. Once you close the browser tab, your processed files exist only on your device.
          </p>
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </main>
      <Footer />
    </div>
  );
};

export default PDFTools;
