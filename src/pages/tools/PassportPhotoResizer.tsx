import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CanonicalHead } from "@/components/CanonicalHead";
import { StructuredData } from "@/components/StructuredData";
import { ToolLayout } from "@/components/ToolLayout";

const PassportPhotoResizer = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/image-resizer?mode=passport", { replace: false });
    }, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <CanonicalHead
        title="Passport Size Photo Online Free India – 2x2 inch 300 DPI | VexaTool"
        description="Create passport size photo online free. Perfect 2x2 inch (51x51mm) passport photo at 300 DPI with white background. Suitable for Indian passport, visa applications."
        keywords="passport size photo online, passport photo maker india, 2x2 passport photo free, passport photo 300 dpi, make passport photo online, indian passport photo size"
      />
      <StructuredData
        type="WebApplication"
        data={{
          name: "Passport Size Photo Maker India",
          description: "Create perfect 2x2 inch passport size photos at 300 DPI with white background for Indian passport and visa applications. Free online tool.",
          url: "https://vexatool.com/passport-photo-resize",
          applicationCategory: "MultimediaApplication",
        }}
      />
      <ToolLayout
        title="Passport Size Photo Online – 2x2 inch Free"
        description="Create perfect passport size photos (2×2 inch, 300 DPI, white background) for Indian passport and visa applications. Free, instant, no signup."
        colorClass="bg-purple-500"
        category="Image Tools"
      >
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-muted-foreground text-sm">Loading Passport Photo Maker…</p>
        </div>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Passport Photo Requirements India</h2>
          <p className="text-muted-foreground">
            Indian passport applications require a <strong>2×2 inch (51×51 mm)</strong> colour photograph with a
            plain white background at <strong>300 DPI</strong>. Our tool resizes, crops, and enhances your photo
            to meet all official requirements instantly.
          </p>
          <h3 className="text-lg font-semibold text-foreground">Supported Documents</h3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Indian Passport application (fresh &amp; renewal)</li>
            <li>US Visa (B1/B2, F1, H1B)</li>
            <li>UK Visa applications</li>
            <li>Schengen Visa</li>
            <li>OCI Card applications</li>
          </ul>
          <h3 className="text-lg font-semibold text-foreground">Photo Specifications</h3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Size: <strong>2×2 inches (51×51 mm)</strong></li>
            <li>Resolution: <strong>300 DPI</strong> (600×600 pixels)</li>
            <li>Background: <strong>Plain white</strong></li>
            <li>File size: Under 50KB</li>
            <li>Recent photo (within 6 months)</li>
            <li>No glasses, uniform head size</li>
          </ul>
        </section>
      </ToolLayout>
    </>
  );
};

export default PassportPhotoResizer;
