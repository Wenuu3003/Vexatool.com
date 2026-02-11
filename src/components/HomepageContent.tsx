import { Shield, Zap, Globe, Users, CheckCircle, FileText, Image, Cpu, Lock, Award, Heart, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export const HomepageContent = () => {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
          
          {/* What is MyPDFs */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              What is MyPDFs.in? Your Complete Online Document Toolkit
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              MyPDFs.in is a comprehensive, free online platform that brings together over 50 powerful tools for managing PDFs, images, and documents — all accessible directly from your web browser. Whether you need to <Link to="/merge-pdf" className="text-primary hover:underline">merge multiple PDF files</Link> into one, <Link to="/compress-pdf" className="text-primary hover:underline">compress a large PDF</Link> for email, <Link to="/pdf-to-word" className="text-primary hover:underline">convert a PDF to an editable Word document</Link>, or <Link to="/edit-pdf" className="text-primary hover:underline">edit text within a PDF</Link>, MyPDFs has you covered.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Unlike traditional desktop software that requires expensive subscriptions and lengthy installations, MyPDFs works instantly in any modern browser. There are no downloads to install, no accounts to create, and absolutely no hidden fees. We built this platform with a simple belief: everyone deserves access to professional-grade document tools without financial barriers.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Since our launch, thousands of users across India and the world rely on MyPDFs daily for their personal and professional document needs. From students preparing assignments to business professionals handling contracts, our tools serve a diverse community that values simplicity, speed, and security.
            </p>
          </div>

          {/* Who Should Use */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Who Should Use MyPDFs?
            </h2>
            <div className="grid md:grid-cols-2 gap-6 not-prose">
              {[
                { title: "Students & Educators", desc: "Merge lecture notes, convert assignments to PDF, compress files for submission portals, and create study materials effortlessly." },
                { title: "Business Professionals", desc: "Sign contracts digitally, merge reports, convert presentations, and protect confidential documents with password encryption." },
                { title: "Freelancers & Creatives", desc: "Build AI-powered resumes, convert portfolios to PDF, resize images for clients, and generate QR codes for marketing." },
                { title: "Small Business Owners", desc: "Create professional invoices, compress product images, generate hashtags for social media, and manage documents without costly software." },
                { title: "Government & Legal Workers", desc: "Digitize paper documents with image-to-PDF conversion, split lengthy legal files, and add watermarks for document security." },
                { title: "Everyday Users", desc: "Anyone who needs to quickly edit a PDF, convert a file format, calculate EMI or GST, or scan a QR code — all without installing software." },
              ].map((item, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
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
                { icon: FileText, title: "Complete PDF Suite", desc: "Merge, split, compress, rotate, watermark, protect, unlock, sign, and edit PDFs — everything in one place." },
                { icon: Image, title: "Image Tools", desc: "Compress images, resize photos, remove backgrounds with AI, and convert between JPG, PNG, WebP, and PDF formats." },
                { icon: Cpu, title: "AI-Powered Tools", desc: "AI chatbot, grammar checker, text generator, resume builder, hashtag generator, and intelligent web search." },
                { icon: Shield, title: "Privacy First", desc: "Most tools process files entirely in your browser. Your documents never leave your device — no server uploads needed." },
                { icon: Zap, title: "Lightning Fast", desc: "Browser-based processing delivers instant results. No waiting for server queues or upload/download cycles." },
                { icon: Globe, title: "Works Everywhere", desc: "Fully responsive design works on desktop, tablet, and mobile. No app installation required — just open and use." },
                { icon: Lock, title: "Document Security", desc: "Password-protect sensitive PDFs, add watermarks for branding, and sign documents with digital signatures." },
                { icon: Users, title: "No Account Needed", desc: "Use every tool without registration, login, or personal information. Just visit, use, and download." },
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

          {/* Why Better Than Competitors */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Why MyPDFs is Better Than Other PDF Tools
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The internet is full of PDF tools, but most come with significant drawbacks. Popular alternatives like iLovePDF, SmallPDF, and Adobe Acrobat either limit free usage to a few operations per day, require account creation, or charge monthly subscriptions ranging from ₹500 to ₹2,000. Many also upload your files to remote servers, raising serious privacy concerns for sensitive documents.
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
                    ["File Processing", "In Browser", "Server Upload"],
                    ["Privacy", "Files Stay Local", "Files Uploaded"],
                    ["Mobile Friendly", "Fully Responsive", "Varies"],
                    ["AI Tools Included", "Yes", "Rarely"],
                    ["Calculators & Utilities", "Yes", "No"],
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

          {/* Security & Privacy */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Security & Privacy: How We Protect Your Files
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We understand that documents often contain sensitive information — financial records, legal agreements, medical reports, personal photos, and confidential business data. That is why security is not just a feature at MyPDFs; it is our foundational principle.
            </p>
            <div className="not-prose space-y-4 mb-6">
              {[
                { title: "Client-Side Processing", desc: "The majority of our tools — including PDF merge, split, compress, image conversion, and QR code generation — process your files entirely within your web browser using JavaScript. Your files literally never leave your device." },
                { title: "No File Storage", desc: "We do not store, cache, or retain any files you process. Once your task is complete, the output is available only to you. There is no server-side copy of your documents." },
                { title: "HTTPS Encryption", desc: "All communication with our website uses industry-standard HTTPS encryption, protecting your data during transit from eavesdropping or tampering." },
                { title: "No Third-Party Access", desc: "We never share, sell, or provide your files or data to any third party. Our business model relies on non-intrusive advertising, not your personal information." },
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

          {/* Popular Tools Overview */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Explore Our Most Popular Tools
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              With over 50 tools available, here are some of the most-used features on MyPDFs that users love:
            </p>
            <div className="not-prose grid md:grid-cols-2 gap-3">
              {[
                { name: "Merge PDF", href: "/merge-pdf", desc: "Combine multiple PDFs into one document" },
                { name: "Split PDF", href: "/split-pdf", desc: "Extract specific pages from any PDF" },
                { name: "Compress PDF", href: "/compress-pdf", desc: "Reduce file size without losing quality" },
                { name: "PDF to Word", href: "/pdf-to-word", desc: "Convert PDFs to editable Word documents" },
                { name: "Word to PDF", href: "/word-to-pdf", desc: "Transform Word files into professional PDFs" },
                { name: "Image to PDF", href: "/image-to-pdf", desc: "Convert photos and images to PDF format" },
                { name: "Edit PDF", href: "/edit-pdf", desc: "Modify text, add images, and annotate PDFs" },
                { name: "Sign PDF", href: "/sign-pdf", desc: "Add digital signatures to documents" },
                { name: "QR Code Generator", href: "/qr-code-generator", desc: "Create custom QR codes instantly" },
                { name: "AI Chatbot", href: "/ai-chat", desc: "Get AI-powered answers and assistance" },
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
              Trust is earned through consistent reliability, transparency, and genuine value. Here is what makes MyPDFs a trusted platform:
            </p>
            <div className="not-prose grid md:grid-cols-3 gap-4">
              {[
                { icon: Award, title: "Built in India", desc: "Developed by a dedicated team of Indian developers who understand local needs while serving a global audience." },
                { icon: Heart, title: "Community Driven", desc: "Features are built based on real user feedback. We listen, improve, and ship updates regularly." },
                { icon: Clock, title: "Always Available", desc: "99.9% uptime ensures our tools are ready whenever you need them, 24 hours a day, 7 days a week." },
                { icon: Shield, title: "GDPR Compliant", desc: "We follow international data protection standards with a comprehensive privacy policy and cookie consent." },
                { icon: Globe, title: "Globally Accessible", desc: "Fast loading from anywhere in the world with optimized performance for both desktop and mobile devices." },
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
              Join thousands of users who save time and money with MyPDFs. No signup, no installation, no cost — just powerful tools that work. Start by choosing a tool above, or explore our complete collection.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/merge-pdf" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                <FileText className="w-4 h-4" /> Try Merge PDF
              </Link>
              <Link to="/compress-pdf" className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors">
                <Zap className="w-4 h-4" /> Compress PDF
              </Link>
              <Link to="/edit-pdf" className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors">
                <FileText className="w-4 h-4" /> Edit PDF
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
