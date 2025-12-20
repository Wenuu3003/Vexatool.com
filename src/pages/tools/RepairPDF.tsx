import { Wrench } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";

const RepairPDF = () => {
  return (
    <ToolLayout
      title="Repair PDF"
      description="Fix corrupted or damaged PDF files"
      icon={Wrench}
      colorClass="bg-tool-repair"
    >
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 bg-tool-repair rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Wrench className="w-10 h-10 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Coming Soon
        </h2>
        <p className="text-muted-foreground">
          PDF repair functionality is coming soon. 
          This feature will help recover data from corrupted PDF files.
        </p>
      </div>
    </ToolLayout>
  );
};

export default RepairPDF;
