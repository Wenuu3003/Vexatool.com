import { PenTool } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";

const SignPDF = () => {
  return (
    <ToolLayout
      title="Sign PDF"
      description="Add your signature to PDF documents"
      icon={PenTool}
      colorClass="bg-tool-sign"
    >
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 bg-tool-sign rounded-2xl flex items-center justify-center mx-auto mb-6">
          <PenTool className="w-10 h-10 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Coming Soon
        </h2>
        <p className="text-muted-foreground">
          PDF signing functionality is coming soon. 
          You'll be able to draw, type, or upload your signature.
        </p>
      </div>
    </ToolLayout>
  );
};

export default SignPDF;
