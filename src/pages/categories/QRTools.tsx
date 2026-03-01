import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CanonicalHead } from "@/components/CanonicalHead";
import { Link } from "react-router-dom";
import { QrCode, ScanLine } from "lucide-react";

const tools = [
  { name: "QR Code Generator", href: "/qr-code-generator", icon: QrCode, desc: "Create custom QR codes with logos and colors for any URL, text, or data", gradient: "from-blue-500 to-indigo-600" },
  { name: "QR Code Scanner", href: "/qr-code-scanner", icon: ScanLine, desc: "Scan QR codes from camera or uploaded images instantly", gradient: "from-violet-500 to-purple-600" },
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
        <h1 className="text-4xl font-bold text-foreground mb-6">Free QR Code Tools</h1>
        
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-muted-foreground leading-relaxed">
            QR codes have become an essential part of modern communication. From restaurant menus and business cards to payment links and event tickets, these scannable codes make sharing information instant and contactless. VexaTool provides everything you need to create and scan QR codes, completely free.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Our QR code generator lets you create customized codes for any purpose. Add your brand logo, choose custom colors, and download in high resolution formats suitable for print or digital use. Whether you need a QR code for your website URL, a WhatsApp contact link, WiFi credentials, or plain text, the generator handles it all.
          </p>
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Create QR Codes for Any Purpose</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our QR code generator supports multiple data types. Create codes for website URLs to share links easily, for text messages, for WiFi network credentials so guests can connect without typing passwords, and for contact cards that save directly to phone contacts. Each code can be customized with your brand colors and logo, making it professional enough for business use.
          </p>
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Scan Any QR Code Instantly</h2>
          <p className="text-muted-foreground leading-relaxed">
            The QR code scanner works directly in your browser using your device camera or from uploaded images. Point your camera at any QR code and get instant results. No app download required — it works on all modern smartphones and computers with a webcam. The scanner supports all standard QR code formats and delivers results in milliseconds.
          </p>
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Privacy and Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            Both tools process data entirely in your browser. When you create a QR code, the content is encoded locally — no data is sent to any server. When you scan a QR code, the decoding happens on your device. Your URLs, contact details, and other sensitive information remain completely private.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </main>
      <Footer />
    </div>
  );
};

export default QRTools;
