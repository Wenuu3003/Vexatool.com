import { Shield, Zap, Globe, Users, CheckCircle, FileText, Image, Lock, QrCode, Calculator } from "lucide-react";
import { Link } from "react-router-dom";

export const HomepageContent = () => {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
          
          {/* What is VexaTool */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              What is VexaTool?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              VexaTool is a free online tools platform that brings together everything you need for working with PDFs, images, QR codes, and everyday calculations. Instead of downloading multiple apps or paying for expensive subscriptions, you get access to a complete toolkit that runs directly in your web browser — fast, secure, and always available.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you need to <Link to="/merge-pdf" className="text-primary hover:underline">merge PDF files</Link>, <Link to="/compress-pdf" className="text-primary hover:underline">compress a large PDF</Link>, <Link to="/qr-code-generator" className="text-primary hover:underline">generate a QR code</Link>, or <Link to="/image-resizer" className="text-primary hover:underline">resize an image</Link>, each tool is designed to be straightforward and deliver results in seconds. No signup required, no hidden fees, no daily usage limits.
            </p>
          </div>

          {/* Why VexaTool is Different */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Why VexaTool is Different
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Most online tool platforms either limit free usage, require account creation, or upload your files to remote servers. VexaTool takes a fundamentally different approach — your files are processed directly in your browser using client-side JavaScript. This means your documents, images, and personal data never leave your device.
            </p>
            <div className="overflow-x-auto not-prose mb-6">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-3 font-semibold text-foreground">Feature</th>
                    <th className="text-center p-3 font-semibold text-foreground">VexaTool</th>
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
                    ["Watermarks", "Never", "Often in Free Tier"],
                    ["Mobile Friendly", "Fully Responsive", "Varies"],
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
              Security & Privacy: Your Files Stay on Your Device
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We understand that documents often contain sensitive information. That is why security is our foundational principle, not just an afterthought.
            </p>
            <div className="not-prose space-y-4 mb-6">
              {[
                { title: "Browser-Based Processing", desc: "Most tools process files entirely within your web browser. Your files literally never leave your device." },
                { title: "No File Storage", desc: "We do not store, cache, or retain any files you process. Once your task is complete, the output exists only on your device." },
                { title: "HTTPS Encryption", desc: "All communication uses industry-standard HTTPS encryption, protecting your data during transit." },
                { title: "No Third-Party Access", desc: "We never share, sell, or provide your files to any third party." },
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

          {/* Who it's for */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Built for Students, Professionals & Businesses
            </h2>
            <div className="grid md:grid-cols-2 gap-6 not-prose">
              {[
                { icon: FileText, title: "Students & Educators", desc: "Merge lecture notes, convert assignments to PDF, compress files for college portals, and calculate percentages for exam preparation." },
                { icon: Globe, title: "Business Professionals", desc: "Edit contracts, merge financial reports, generate QR codes for business cards, and convert documents between formats." },
                { icon: Image, title: "Content Creators", desc: "Resize and compress images for websites, remove backgrounds for product photos, and convert between image formats." },
                { icon: Users, title: "Everyday Users", desc: "Calculate BMI, find PIN codes, count words in essays, create QR codes for sharing, and handle common document tasks." },
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

          {/* Tool Categories */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Explore Our Tool Categories
            </h2>
            <div className="grid md:grid-cols-2 gap-4 not-prose">
              {[
                { icon: FileText, title: "PDF Tools", desc: "Edit, merge, split, compress, convert, rotate, lock, and unlock PDF files.", href: "/pdf-tools" },
                { icon: Image, title: "Image Tools", desc: "Resize, compress, convert images and remove backgrounds instantly.", href: "/image-tools" },
                { icon: Calculator, title: "Calculators", desc: "BMI, EMI, age, love compatibility, and percentage calculators.", href: "/calculator-tools" },
                { icon: QrCode, title: "QR Tools", desc: "Generate custom QR codes and scan existing ones from camera or image.", href: "/qr-tools" },
              ].map((item, i) => (
                <Link key={i} to={item.href} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
