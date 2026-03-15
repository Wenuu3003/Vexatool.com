import { CheckCircle, FileText, Image, Globe, Users, Shield, Zap, MonitorSmartphone } from "lucide-react";
import { Link } from "react-router-dom";
import pdfWorkflowImg from "@/assets/graphics/pdf-workflow.webp";
import securityVisualImg from "@/assets/graphics/security-visual.webp";

export const HomepageContent = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">

          {/* Why Choose VexaTool — Featured Visual Card */}
          <div className="mb-16 sm:mb-20 rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-primary/5 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
              <div className="md:col-span-3 p-7 sm:p-8 md:p-10 flex flex-col justify-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
                  Why Choose VexaTool?
                </h2>
                <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  <p>
                    VexaTool processes documents directly in your browser — your files never leave your device. Safe for financial records, legal contracts, and sensitive documents.
                  </p>
                  <p>
                    Simple workflow: upload, process, download. No signup, no subscription, no hidden fees.{" "}
                    <Link to="/merge-pdf" className="text-primary hover:underline">Merge PDFs</Link>,{" "}
                    <Link to="/compress-pdf" className="text-primary hover:underline">compress files</Link>, or{" "}
                    <Link to="/qr-code-generator" className="text-primary hover:underline">generate QR codes</Link> — it just works.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 mt-5">
                  {[
                    { icon: Zap, label: "Instant Processing" },
                    { icon: Shield, label: "100% Private" },
                    { icon: MonitorSmartphone, label: "Any Device" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium">
                      <item.icon className="w-3.5 h-3.5" />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 flex items-center justify-center p-5 sm:p-6 md:p-8">
                <img
                  src={pdfWorkflowImg}
                  alt="How VexaTool works: upload, process, and download documents in 3 simple steps"
                  className="w-full max-w-md rounded-xl shadow-xl border border-border/40"
                  loading="lazy"
                  decoding="async"
                  width={480}
                  height={320}
                />
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <div className="mb-16 sm:mb-20">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-5 sm:mb-6 tracking-tight">
              How VexaTool Compares
            </h2>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs sm:text-sm border border-border rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-muted/60">
                    <th className="text-left p-3 sm:p-3.5 font-semibold text-foreground">Feature</th>
                    <th className="text-center p-3 sm:p-3.5 font-semibold text-foreground">VexaTool</th>
                    <th className="text-center p-3 sm:p-3.5 font-semibold text-muted-foreground">Others</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["Price", "100% Free", "Freemium / Paid"],
                    ["Account Required", "No", "Usually Yes"],
                    ["Daily Limit", "Unlimited", "2–5 per day"],
                    ["Processing", "In Browser", "Server Upload"],
                    ["Privacy", "Files Stay Local", "Cloud Upload"],
                    ["Watermarks", "Never", "Often in Free Tier"],
                    ["Mobile", "Fully Responsive", "Varies"],
                  ].map(([feature, us, them], i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 sm:p-3.5 text-foreground font-medium">{feature}</td>
                      <td className="p-3 sm:p-3.5 text-center text-primary font-medium">{us}</td>
                      <td className="p-3 sm:p-3.5 text-center text-muted-foreground">{them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Security — Featured Visual Card */}
          <div className="mb-16 sm:mb-20 rounded-2xl border border-border bg-gradient-to-br from-green-500/5 via-card to-emerald-500/5 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
              <div className="md:col-span-2 flex items-center justify-center p-5 sm:p-6 md:p-8 order-2 md:order-1">
                <img
                  src={securityVisualImg}
                  alt="Browser-based secure file processing with encryption and privacy protection"
                  className="w-full max-w-md rounded-xl shadow-xl border border-border/40"
                  loading="lazy"
                  decoding="async"
                  width={480}
                  height={320}
                />
              </div>
              <div className="md:col-span-3 p-7 sm:p-8 md:p-10 flex flex-col justify-center order-1 md:order-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-5 sm:mb-6 tracking-tight">
                  Your Files Stay on Your Device
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { title: "Browser-Based Processing", desc: "Files are processed entirely in your browser. Nothing is uploaded." },
                    { title: "No File Storage", desc: "We don't store, cache, or retain any files you process." },
                    { title: "HTTPS Encryption", desc: "All communication uses industry-standard encryption." },
                    { title: "No Third-Party Access", desc: "Your files are never shared with any third party." },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 sm:p-4 bg-card border border-border/60 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-foreground text-xs sm:text-sm">{item.title}</h4>
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Who it's for */}
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-5 sm:mb-6 tracking-tight">
              Built for Everyone
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { icon: FileText, title: "Students & Educators", desc: "Merge notes, convert assignments, compress files for portals." },
                { icon: Globe, title: "Business Professionals", desc: "Edit contracts, merge reports, generate QR codes." },
                { icon: Image, title: "Content Creators", desc: "Resize images, remove backgrounds, convert formats." },
                { icon: Users, title: "Everyday Users", desc: "Calculate BMI, find PIN codes, count words, create QR codes." },
              ].map((item, i) => (
                <div key={i} className="bg-card border border-border/60 rounded-xl p-4 sm:p-5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-xs sm:text-sm">{item.title}</h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
