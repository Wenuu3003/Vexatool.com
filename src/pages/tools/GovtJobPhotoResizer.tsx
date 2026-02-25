import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CanonicalHead } from "@/components/CanonicalHead";
import { StructuredData } from "@/components/StructuredData";
import { ToolLayout } from "@/components/ToolLayout";

const GovtJobPhotoResizer = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/image-resizer?mode=govtjob", { replace: false });
    }, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <CanonicalHead
        title="Govt Job Form Photo Resize – 3.5x4.5cm, 20KB Free | VexaTool"
        description="Resize photo for government job application form online. Get 3.5x4.5cm photo under 20KB for SSC, UPSC, IBPS, Railway exams. Free, instant."
        keywords="govt job form photo size, resize photo for government form, SSC photo size, UPSC photo requirement, IBPS photo resize, railway exam photo size, government application photo"
      />
      <StructuredData
        type="WebApplication"
        data={{
          name: "Govt Job Form Photo Resizer",
          description: "Resize photo for government job forms to 3.5x4.5cm under 20KB. Suitable for SSC, UPSC, IBPS, Railway, Bank exams. Free online tool.",
          url: "https://vexatool.com/govt-job-photo-resize",
          applicationCategory: "MultimediaApplication",
        }}
      />
      <ToolLayout
        title="Govt Job Form Photo Resize – 3.5x4.5cm Free"
        description="Resize your photo to 3.5×4.5cm under 20KB for all Indian government job application forms. SSC, UPSC, IBPS, Railway ready."
        colorClass="bg-orange-500"
        category="Image Tools"
      >
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-muted-foreground text-sm">Loading Govt Job Photo Resizer…</p>
        </div>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Government Job Form Photo Requirements</h2>
          <p className="text-muted-foreground">
            Most Indian government exam forms (SSC, UPSC, IBPS, Railway, Bank PO) require a <strong>3.5×4.5 cm</strong>
            passport-style photograph with a <strong>plain white background</strong>, typically under 20KB or 50KB.
            Our tool handles all this automatically in one click.
          </p>
          <h3 className="text-lg font-semibold text-foreground">Supported Exams & Forms</h3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>SSC CGL, CHSL, MTS, GD</li>
            <li>UPSC Civil Services, NDA, CDS</li>
            <li>IBPS PO, Clerk, SO</li>
            <li>Railway RRB, NTPC, Group D</li>
            <li>State PSC exams</li>
            <li>Bank PO and Clerk exams</li>
          </ul>
          <h3 className="text-lg font-semibold text-foreground">Standard Photo Specifications</h3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Dimensions: <strong>3.5×4.5 cm</strong> (≈ 413×531 pixels at 300 DPI)</li>
            <li>Background: <strong>Plain white or light</strong></li>
            <li>File size: <strong>20KB or 50KB</strong> (selectable)</li>
            <li>Format: JPEG</li>
            <li>Recent photograph, face clearly visible</li>
          </ul>
        </section>
      </ToolLayout>
    </>
  );
};

export default GovtJobPhotoResizer;
