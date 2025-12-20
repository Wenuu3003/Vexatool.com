import { FileEdit } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";

const EditPDF = () => {
  return (
    <ToolLayout
      title="Edit PDF"
      description="Add text, images, and annotations to your PDF"
      icon={FileEdit}
      colorClass="bg-tool-edit"
    >
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 bg-tool-edit rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileEdit className="w-10 h-10 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Coming Soon
        </h2>
        <p className="text-muted-foreground">
          Full PDF editing capabilities are coming soon. 
          This feature will include text editing, image insertion, and annotations.
        </p>
      </div>
    </ToolLayout>
  );
};

export default EditPDF;
