import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CanonicalHead } from "@/components/CanonicalHead";
import { Link } from "react-router-dom";
import { Breadcrumb } from "@/components/Breadcrumb";
import { QrCode, ScanLine, Shield, Palette, Smartphone } from "lucide-react";
import qrToolsVisual from "@/assets/graphics/qr-tools-visual.webp";
import securityVisualImg from "@/assets/graphics/security-visual.webp";

const tools = [
  { name: "QR Code Generator", href: "/qr-code-generator", icon: QrCode, desc: "Create custom QR codes with logos and colors for any URL, text, or data", gradient: "from-blue-500 to-indigo-600" },
  { name: "QR Code Scanner", href: "/qr-code-scanner", icon: ScanLine, desc: "Scan QR codes from camera or uploaded images instantly", gradient: "from-violet-500 to-purple-600" },
];

const faqs = [
  { q: "Can I add my brand logo to a QR code?", a: "Yes. The QR Code Generator lets you upload a custom logo that appears in the center of your QR code. You can also customize foreground and background colors to match your branding." },
  { q: "What data types can QR codes contain?", a: "You can create QR codes for URLs, plain text, WiFi credentials, contact cards (vCard), email addresses, phone numbers, and more." },
  { q: "Does the QR scanner work with the phone camera?", a: "Yes. The scanner uses your device camera directly in the browser. No app installation needed — just allow camera access and point at any QR code." },
  { q: "Can I scan QR codes from images?", a: "Yes. Upload any image containing a QR code and the scanner will detect and decode it instantly." },
  { q: "Are generated QR codes permanent?", a: "QR codes created with VexaTool are static — the data is encoded directly in the image. They work permanently and don't depend on any external service." },
];

const QRTools = () => {
  return (
    <div className="min-h-screen bg-background">
      <CanonicalHead
        title="Free QR Code Generator & Scanner Online | VexaTool"
        description="Create and scan QR codes for free with VexaTool. Generate custom QR codes with logos for URLs, text, WiFi, and more. Scan QR codes from camera or image."
        keywords="QR code generator, QR code scanner, create QR code online, QR code with logo, free QR generator, scan QR code"
      />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <Breadcrumb items={[{ name: "QR Tools", path: "/qr-tools" }]} className="mb-6" />
        <h1 className="text-4xl font-bold text-foreground mb-4">Free QR Code Tools</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
          Create custom QR codes with logos and colors, or scan any QR code instantly. Free, private, no app needed.
        </p>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {tools.map((tool) => (
            <Link key={tool.href} to={tool.href} className="group p-6 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tool.gradient} flex items-center justify-center`}>
                  <tool.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{tool.name}</h3>
              </div>
              <p className="text-muted-foreground">{tool.desc}</p>
            </Link>
          ))}
        </div>

        {/* Featured Visual: Create QR Codes — FULL WIDTH */}
        <div className="mb-16 rounded-2xl border border-border bg-gradient-to-br from-indigo-500/5 via-card to-violet-500/5 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
            <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Create QR Codes for Any Purpose</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our QR code generator supports multiple data types — website URLs, text messages, WiFi credentials, and contact cards. Each code can be customized with brand colors and logos for professional use.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                The scanner works directly in your browser using your device camera or from uploaded images. No app required — it decodes any standard QR code in milliseconds.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Palette, label: "Custom Colors & Logos" },
                  { icon: Smartphone, label: "Mobile Camera Scan" },
                  { icon: Shield, label: "No Data Stored" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex items-center justify-center p-6 md:p-8">
              <img
                src={qrToolsVisual}
                alt="QR code generation workflow showing customization, QR output, and mobile scanning"
                className="w-full max-w-md rounded-xl shadow-xl border border-border/40"
                loading="lazy"
                decoding="async"
                width={480}
                height={320}
              />
            </div>
          </div>
        </div>

        {/* Featured Visual: Privacy — FULL WIDTH */}
        <div className="mb-16 rounded-2xl border border-border bg-gradient-to-br from-green-500/5 via-card to-emerald-500/5 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
            <div className="md:col-span-2 flex items-center justify-center p-6 md:p-8 order-2 md:order-1">
              <img
                src={securityVisualImg}
                alt="Privacy-first QR code processing"
                className="w-full max-w-md rounded-xl shadow-xl border border-border/40"
                loading="lazy"
                decoding="async"
                width={480}
                height={320}
              />
            </div>
            <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-center order-1 md:order-2">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Privacy and Security</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Both tools process data entirely in your browser. When you create a QR code, the content is encoded locally — no data is sent to any server. When you scan a QR code, the decoding happens on your device. Your URLs, contact details, and other sensitive information remain completely private.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {["No Data Sent", "No Cloud Storage", "Offline After Load", "Complete Privacy"].map((item, i) => (
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

export default QRTools;
