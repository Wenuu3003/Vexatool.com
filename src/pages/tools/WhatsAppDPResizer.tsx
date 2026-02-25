import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CanonicalHead } from "@/components/CanonicalHead";
import { StructuredData } from "@/components/StructuredData";
import { ToolLayout } from "@/components/ToolLayout";

const WhatsAppDPResizer = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/image-resizer?mode=whatsapp", { replace: false });
    }, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <CanonicalHead
        title="WhatsApp DP Resize Online Free – 192x192px Under 20KB | VexaTool"
        description="Resize photo for WhatsApp DP online free. Get perfect 192x192px WhatsApp profile picture under 20KB. Instant download, no signup required."
        keywords="whatsapp dp resize, whatsapp profile photo size, resize photo for whatsapp, whatsapp dp 192x192, whatsapp dp maker free"
      />
      <StructuredData
        type="WebApplication"
        data={{
          name: "WhatsApp DP Resizer",
          description: "Resize any photo to perfect WhatsApp DP size (192x192px) under 20KB instantly. Free, fast, no signup.",
          url: "https://vexatool.com/whatsapp-dp-resize",
          applicationCategory: "MultimediaApplication",
        }}
      />
      <ToolLayout
        title="WhatsApp DP Resize – 192x192px Free"
        description="Resize your photo to perfect WhatsApp DP size (192x192px, under 20KB) instantly. Free online tool, no signup needed."
        colorClass="bg-green-500"
        category="Image Tools"
      >
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-muted-foreground text-sm">Loading WhatsApp DP Resizer…</p>
        </div>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">WhatsApp DP Photo Size Guide</h2>
          <p className="text-muted-foreground">
            WhatsApp displays profile pictures at <strong>192×192 pixels</strong>. For best quality, your image should be
            at least 192×192px and under 20KB for fast loading. Our tool automatically crops, resizes, and compresses
            your photo to meet these exact specifications.
          </p>
          <h3 className="text-lg font-semibold text-foreground">How to Resize Photo for WhatsApp DP</h3>
          <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
            <li>Upload your photo (JPG, PNG, WebP supported)</li>
            <li>Select "WhatsApp DP" mode (auto-selected on this page)</li>
            <li>Click "Apply Mode" to compress to 192×192px under 20KB</li>
            <li>Download your optimised WhatsApp DP instantly</li>
          </ol>
          <h3 className="text-lg font-semibold text-foreground">WhatsApp Profile Picture Specifications</h3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Recommended size: <strong>192×192 pixels</strong></li>
            <li>Maximum file size: <strong>20KB</strong> for fast uploads</li>
            <li>Supported formats: JPG, PNG</li>
            <li>Shape: Square (cropped to circle by WhatsApp)</li>
          </ul>
        </section>
      </ToolLayout>
    </>
  );
};

export default WhatsAppDPResizer;
