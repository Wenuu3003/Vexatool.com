import { CheckCircle, FileText, Image, Globe, Users } from "lucide-react";
import { Link } from "react-router-dom";

export const HomepageContent = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">

          {/* Why Choose VexaTool */}
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
              Why Choose VexaTool?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3 text-sm md:text-base">
              VexaTool processes your documents directly in your browser using client-side JavaScript. Your files never leave your device — making it safe for sensitive materials like financial records, legal contracts, and identification documents.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3 text-sm md:text-base">
              Every tool follows the same simple workflow: upload, process, download. No signup, no subscription, no hidden fees. Whether you need to{" "}
              <Link to="/merge-pdf" className="text-primary hover:underline">merge PDFs</Link>,{" "}
              <Link to="/compress-pdf" className="text-primary hover:underline">compress files</Link>, or{" "}
              <Link to="/qr-code-generator" className="text-primary hover:underline">generate QR codes</Link> — it just works.
            </p>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              Fully responsive on desktop, tablet, and mobile. No daily limits, no watermarks, no premium gates.
            </p>
          </div>

          {/* Comparison table */}
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 tracking-tight">
              How VexaTool Compares
            </h2>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-muted/60">
                    <th className="text-left p-3.5 font-semibold text-foreground">Feature</th>
                    <th className="text-center p-3.5 font-semibold text-foreground">VexaTool</th>
                    <th className="text-center p-3.5 font-semibold text-muted-foreground">Others</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["Price", "100% Free", "Freemium / Paid"],
                    ["Account Required", "No", "Usually Yes"],
                    ["Daily Usage Limit", "Unlimited", "2–5 per day"],
                    ["File Processing", "In Browser", "Server Upload"],
                    ["Privacy", "Files Stay Local", "Cloud Upload"],
                    ["Watermarks", "Never", "Often in Free Tier"],
                    ["Mobile Friendly", "Fully Responsive", "Varies"],
                  ].map(([feature, us, them], i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 text-foreground font-medium">{feature}</td>
                      <td className="p-3.5 text-center text-primary font-medium">{us}</td>
                      <td className="p-3.5 text-center text-muted-foreground">{them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Security */}
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 tracking-tight">
              Your Files Stay on Your Device
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "Browser-Based Processing", desc: "Files are processed entirely in your browser. Nothing is uploaded." },
                { title: "No File Storage", desc: "We don't store, cache, or retain any files you process." },
                { title: "HTTPS Encryption", desc: "All communication uses industry-standard encryption." },
                { title: "No Third-Party Access", desc: "Your files are never shared with any third party." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-card border border-border/60 rounded-xl">
                  <CheckCircle className="w-4.5 h-4.5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Who it's for */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 tracking-tight">
              Built for Everyone
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: FileText, title: "Students & Educators", desc: "Merge notes, convert assignments, compress files for portals." },
                { icon: Globe, title: "Business Professionals", desc: "Edit contracts, merge reports, generate QR codes." },
                { icon: Image, title: "Content Creators", desc: "Resize images, remove backgrounds, convert formats." },
                { icon: Users, title: "Everyday Users", desc: "Calculate BMI, find PIN codes, count words, create QR codes." },
              ].map((item, i) => (
                <div key={i} className="bg-card border border-border/60 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center">
                      <item.icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
