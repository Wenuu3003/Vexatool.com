import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CanonicalHead } from "@/components/CanonicalHead";
import { StructuredData } from "@/components/StructuredData";
import { ToolLayout } from "@/components/ToolLayout";

const AadhaarPhotoResizer = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/image-resizer?mode=aadhaar", { replace: false });
    }, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <CanonicalHead
        title="Aadhaar Card Photo Size Online Free – 200x200px | VexaTool"
        description="Resize photo for Aadhaar card online free. Get correct 200x200px Aadhaar photo size under 50KB with white background. Instant, no signup."
        keywords="aadhaar photo size, aadhaar card photo resize, aadhaar photo online, resize photo for aadhaar, aadhaar enrollment photo size"
      />
      <StructuredData
        type="WebApplication"
        data={{
          name: "Aadhaar Photo Resizer",
          description: "Resize any photo to correct Aadhaar card size (200x200px) under 50KB with white background. Free online tool.",
          url: "https://vexatool.com/aadhaar-photo-resize",
          applicationCategory: "MultimediaApplication",
        }}
      />
      <ToolLayout
        title="Aadhaar Photo Resize – 200x200px Free"
        description="Resize your photo to correct Aadhaar card size (200x200px, under 50KB) with white background. Free, instant, no signup."
        colorClass="bg-blue-500"
        category="Image Tools"
      >
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-muted-foreground text-sm">Loading Aadhaar Photo Resizer…</p>
        </div>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Aadhaar Card Photo Size Requirements</h2>
          <p className="text-muted-foreground">
            UIDAI requires a <strong>200×200 pixel</strong> photograph with a plain white background for Aadhaar
            enrollment and update. Our tool auto-resizes, crops, and adds a white background to make your photo
            Aadhaar-ready in seconds.
          </p>
          <h3 className="text-lg font-semibold text-foreground">How to Resize Photo for Aadhaar</h3>
          <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
            <li>Upload your passport-style or front-facing photo</li>
            <li>Select "Aadhaar Photo" mode (auto-selected on this page)</li>
            <li>Click "Apply Mode" – white background and correct size applied automatically</li>
            <li>Download and use for Aadhaar enrollment or update</li>
          </ol>
          <h3 className="text-lg font-semibold text-foreground">UIDAI Photo Specifications</h3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Dimensions: <strong>200×200 pixels</strong></li>
            <li>Background: <strong>Plain white</strong></li>
            <li>File size: <strong>Under 50KB</strong></li>
            <li>Format: JPEG/JPG</li>
            <li>Face must be clearly visible, no sunglasses</li>
          </ul>
        </section>
      </ToolLayout>
    </>
  );
};

export default AadhaarPhotoResizer;
