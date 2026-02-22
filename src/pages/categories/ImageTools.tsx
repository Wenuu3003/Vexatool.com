import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CanonicalHead } from "@/components/CanonicalHead";
import { Link } from "react-router-dom";
import { Crop, ImageDown, RefreshCw, Image, Eraser } from "lucide-react";

const tools = [
  { name: "Image Resize Tool", href: "/image-resizer", icon: Crop, desc: "Resize images to any custom or preset dimension" },
  { name: "Image Compressor", href: "/compress-image", icon: ImageDown, desc: "Reduce image file size while maintaining quality" },
  { name: "Image Converter", href: "/image-format-converter", icon: RefreshCw, desc: "Convert between JPG, PNG, WebP and more" },
  { name: "Image to PDF", href: "/image-to-pdf", icon: Image, desc: "Convert images to PDF documents" },
  { name: "Background Remover", href: "/background-remover", icon: Eraser, desc: "Remove backgrounds from any image" },
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
        <h1 className="text-4xl font-bold text-foreground mb-6">Free Online Image Tools</h1>
        
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-muted-foreground leading-relaxed">
            Images are a part of daily digital life — from social media posts and website content to job application forms and product listings. But getting images into the right format, size, or quality can be a real challenge without proper tools. VexaTool offers a set of practical image tools that handle these tasks effortlessly.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Whether you need to resize a photo for a government form, compress images for faster website loading, convert between file formats, or remove the background from a product photo, our tools are built to deliver fast results without sacrificing quality.
          </p>
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Why VexaTool Image Tools Stand Out</h2>
          <p className="text-muted-foreground leading-relaxed">
            Many image editing platforms require you to create accounts, pay subscription fees, or deal with watermarks on your output. VexaTool takes a different approach. Every image tool is free, unlimited, and processes your files directly in your browser. This means your personal photos, documents, and sensitive images never get uploaded to external servers.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Our tools support all major image formats including JPG, PNG, and WebP. The interface is clean and intuitive, designed to work equally well on desktop computers and mobile devices. No software installation needed — just open your browser and start editing.
          </p>
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Practical Uses for Image Tools</h2>
          <p className="text-muted-foreground leading-relaxed">
            Job seekers frequently need to resize passport-size photos to specific dimensions and file sizes for online applications. E-commerce sellers need background-free product images for their listings. Bloggers and content creators need to compress images for faster page load times. Students preparing presentations need to convert between formats. Whatever your need, these tools help you get the job done quickly and without cost.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link key={tool.href} to={tool.href} className="group p-5 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <tool.icon className="w-5 h-5 text-primary" />
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

export default ImageTools;
