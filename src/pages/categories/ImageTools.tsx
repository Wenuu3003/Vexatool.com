import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CanonicalHead } from "@/components/CanonicalHead";
import { Link } from "react-router-dom";
import { Crop, ImageDown, RefreshCw, Image, Eraser, FileDown, Smartphone, CreditCard, Briefcase, FileImage } from "lucide-react";
import imageToolsVisual from "@/assets/graphics/image-tools-visual.webp";
import securityVisualImg from "@/assets/graphics/security-visual.webp";

const tools = [
  { name: "Image Resize Tool", href: "/image-resizer", icon: Crop, desc: "Resize images to any custom or preset dimension", gradient: "from-orange-500 to-amber-500" },
  { name: "Image Compressor", href: "/compress-image", icon: ImageDown, desc: "Reduce image file size while maintaining quality", gradient: "from-teal-500 to-cyan-500" },
  { name: "Image Converter", href: "/image-format-converter", icon: RefreshCw, desc: "Convert between JPG, PNG, WebP and more", gradient: "from-indigo-500 to-blue-500" },
  { name: "Image to PDF", href: "/image-to-pdf", icon: Image, desc: "Convert images to PDF documents", gradient: "from-blue-500 to-violet-500" },
  { name: "Background Remover", href: "/background-remover", icon: Eraser, desc: "Remove backgrounds from any image", gradient: "from-purple-500 to-pink-500" },
  { name: "File Compressor", href: "/file-compressor", icon: FileDown, desc: "Compress files to reduce size instantly", gradient: "from-sky-500 to-blue-500" },
  { name: "WhatsApp DP Resizer", href: "/whatsapp-dp-resize", icon: Smartphone, desc: "Resize photos for WhatsApp profile picture", gradient: "from-green-500 to-emerald-500" },
  { name: "Aadhaar Photo Resizer", href: "/aadhaar-photo-resize", icon: CreditCard, desc: "Resize photos for Aadhaar card requirements", gradient: "from-orange-500 to-red-500" },
  { name: "Govt Job Photo Resizer", href: "/govt-job-photo-resize", icon: Briefcase, desc: "Resize photos for govt job applications", gradient: "from-blue-600 to-indigo-600" },
  { name: "Passport Photo Resizer", href: "/passport-photo-resize", icon: FileImage, desc: "Resize photos to passport size specs", gradient: "from-red-500 to-rose-600" },
];

const faqs = [
  { q: "What image formats are supported?", a: "Our tools support JPG, PNG, WebP, GIF, and BMP formats. You can convert between any of these formats using the Image Converter." },
  { q: "Is there a file size limit for image uploads?", a: "Most tools handle images up to 20MB. Since processing happens in your browser, very large images may take a moment depending on your device." },
  { q: "Will compressing images reduce quality?", a: "Our compressor uses smart algorithms to reduce file size while maintaining visual quality. You can adjust the quality slider to find the perfect balance." },
  { q: "Can I resize photos to exact dimensions for government forms?", a: "Yes. We offer dedicated resizers for Aadhaar photos, passport photos, and government job application photos with preset dimensions that meet official requirements." },
  { q: "Is the background remover accurate?", a: "The background remover uses client-side AI to detect subjects. It works well for photos with clear foreground-background separation. For complex scenes, results may vary." },
];

const ImageTools = () => {
  return (
    <div className="min-h-screen bg-background">
      <CanonicalHead
        title="Free Image Tools Online – Resize, Compress, Convert & Edit Images | VexaTool"
        description="Use VexaTool's free online image tools to resize, compress, convert, and remove backgrounds from images. Supports JPG, PNG, WebP. Fast and secure."
        keywords="image tools online, image resizer, image compressor, background remover, image converter, resize photo online"
      />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-4xl font-bold text-foreground mb-4">Free Online Image Tools</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
          Resize, compress, convert, and edit images directly in your browser. All formats supported, no signup required.
        </p>

        {/* Tool Grid — near the top */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {tools.map((tool) => (
            <Link key={tool.href} to={tool.href} className="group p-5 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200">
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

        {/* Content + Visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Why VexaTool Image Tools Stand Out</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Many image editing platforms require accounts, subscriptions, or add watermarks. VexaTool is different — every tool is free, unlimited, and processes files directly in your browser.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our tools support all major image formats including JPG, PNG, and WebP. The interface works equally well on desktop and mobile devices, with no software installation needed.
            </p>
          </div>
          <div className="flex justify-center">
            <img
              src={imageToolsVisual}
              alt="Image editing tools showing resize, crop, color palette and background removal features"
              className="w-full max-w-sm rounded-xl shadow-lg border border-border/40"
              loading="lazy"
              decoding="async"
              width={400}
              height={256}
            />
          </div>
        </div>

        {/* Practical uses */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Practical Uses for Image Tools</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            Job seekers frequently need to resize passport-size photos to specific dimensions for online applications. E-commerce sellers need background-free product images. Bloggers need to compress images for faster page loads.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Students preparing presentations need format conversion. Whatever your need, these tools help you get the job done quickly and without cost.
          </p>
        </div>

        {/* Security section with image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
          <div className="flex justify-center order-2 md:order-1">
            <img
              src={securityVisualImg}
              alt="Secure browser-based image processing"
              className="w-full max-w-xs rounded-xl shadow-lg border border-border/40"
              loading="lazy"
              decoding="async"
              width={320}
              height={256}
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Your Photos Stay Private</h2>
            <p className="text-muted-foreground leading-relaxed">
              All image processing happens locally in your browser. Your personal photos, documents, and sensitive images never get uploaded to external servers. Complete privacy guaranteed.
            </p>
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

export default ImageTools;
