import { FileType2 } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";

const ConvertPDF = () => {
  return (
    <ToolLayout
      title="PDF to Word"
      description="Convert PDF documents to editable Word files"
      icon={FileType2}
      colorClass="bg-tool-convert"
    >
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 bg-tool-convert rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileType2 className="w-10 h-10 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Coming Soon
        </h2>
        <p className="text-muted-foreground">
          PDF to Word conversion requires server-side processing. 
          This feature will be available soon with our cloud processing service.
        </p>
      </div>
    </ToolLayout>
  );
};

export default ConvertPDF;
