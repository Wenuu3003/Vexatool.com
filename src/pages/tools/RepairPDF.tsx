import { useState } from "react";
import { Wrench, Download, AlertTriangle, CheckCircle } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument } from "pdf-lib";
import { useFileHistory } from "@/hooks/useFileHistory";
import { AdPlaceholder } from "@/components/AdBanner";
import { Helmet } from "react-helmet";

const RepairPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [repairStatus, setRepairStatus] = useState<"idle" | "success" | "error">("idle");
  const { toast } = useToast();
  const { saveFileHistory } = useFileHistory();

  const handleProcess = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setRepairStatus("idle");

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      
      // Attempt to load and rebuild the PDF
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
        updateMetadata: false,
      });

      // Create a new PDF and copy all pages
      const repairedPdf = await PDFDocument.create();
      const pages = await repairedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      
      pages.forEach((page) => {
        repairedPdf.addPage(page);
      });

      // Save with fresh structure
      const pdfBytes = await repairedPdf.save({
        useObjectStreams: false,
      });
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });

      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `repaired_${files[0].name}`;
      link.click();
      URL.revokeObjectURL(url);

      await saveFileHistory(files[0].name, "pdf", "repair");

      setRepairStatus("success");
      toast({
        title: "Success!",
        description: "PDF repaired and downloaded",
      });
    } catch (error) {
      setRepairStatus("error");
      toast({
        title: "Repair Failed",
        description: "The PDF is too corrupted to repair automatically. The file may be severely damaged.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Repair Corrupted PDF Free Online | Mypdfs</title>
        <meta name="description" content="Free online PDF repair tool. Fix corrupted or damaged PDF files. Recover data from broken PDFs and restore documents." />
        <meta name="keywords" content="repair PDF, fix corrupted PDF, recover PDF, damaged PDF, PDF repair tool, free PDF fix" />
        <link rel="canonical" href="https://mypdfs.lovable.app/repair-pdf" />
      </Helmet>
      <ToolLayout
        title="Repair PDF"
        description="Fix corrupted or damaged PDF files"
        icon={Wrench}
        colorClass="bg-tool-repair"
      >
      <div className="space-y-6">
        <AdPlaceholder className="h-20" />
        
        <FileUpload
          files={files}
          onFilesChange={(newFiles) => {
            setFiles(newFiles);
            setRepairStatus("idle");
          }}
          colorClass="bg-tool-repair"
          multiple={false}
        />

        {files.length > 0 && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-card p-4 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">Repair Process</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Attempts to recover data from corrupted PDF structures</li>
                <li>• Rebuilds the document with a fresh structure</li>
                <li>• Preserves as much content as possible</li>
              </ul>
            </div>

            {repairStatus === "success" && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-green-700 dark:text-green-400">PDF successfully repaired!</p>
              </div>
            )}

            {repairStatus === "error" && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <p className="text-destructive">Could not repair this PDF. The file may be severely corrupted.</p>
              </div>
            )}

            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full bg-tool-repair hover:bg-tool-repair/90"
            >
              {isProcessing ? (
                "Repairing..."
              ) : (
                <>
                  <Wrench className="w-4 h-4 mr-2" />
                  Repair & Download PDF
                </>
              )}
            </Button>
          </div>
        )}
        
        <AdPlaceholder className="h-20" />
      </div>
      </ToolLayout>
    </>
  );
};

export default RepairPDF;
