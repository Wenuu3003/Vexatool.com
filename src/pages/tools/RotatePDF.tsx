import { useState } from "react";
import { RotateCw, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { PDFDocument, degrees } from "pdf-lib";
import { toast } from "@/hooks/use-toast";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";

const RotatePDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState(90);

  const handleRotate = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to rotate.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      const pages = pdf.getPages();
      pages.forEach((page) => {
        page.setRotation(degrees(page.getRotation().angle + rotation));
      });

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "rotated.pdf";
      link.click();

      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "Your PDF has been rotated successfully.",
      });

      setFiles([]);
    } catch (error: unknown) {
      if (import.meta.env.DEV) console.error("Rotate error:", error);
      const msg = error instanceof Error ? error.message : "";
      let description = "Failed to rotate PDF. Please try again.";
      if (msg.includes("encrypted") || msg.includes("password")) {
        description = "This PDF is password-protected. Unlock it first.";
      } else if (msg.includes("Invalid") || msg.includes("parse")) {
        description = "This PDF appears to be corrupted. Try the Repair PDF tool.";
      }
      toast({
        title: "Rotation failed",
        description,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const seoContent = {
    toolName: "Rotate PDF",
    whatIs: "Rotate PDF is a free online tool that allows you to rotate all pages in a PDF document by 90, 180, or 270 degrees. This is useful when you have scanned documents that appear upside-down or sideways, or when you need to adjust the orientation of pages for better viewing or printing. The tool processes your PDF quickly and maintains the original quality of your document.",
    howToUse: [
      "Upload your PDF file by clicking the upload area or dragging and dropping.",
      "Select the rotation angle: 90°, 180°, or 270° clockwise.",
      "Click 'Rotate & Download' to process the PDF.",
      "Your rotated PDF will automatically download."
    ],
    features: [
      "Rotate all pages 90°, 180°, or 270° clockwise",
      "Maintains original PDF quality and formatting",
      "Fast processing with instant download",
      "Works with any PDF file size",
      "No registration or login required",
      "Complete client-side processing for privacy"
    ],
    safetyNote: "Your PDF files are processed entirely in your browser using client-side JavaScript. No files are uploaded to any server, ensuring your documents remain private and secure. The tool uses the trusted pdf-lib library for reliable PDF manipulation.",
    faqs: [
      { question: "Can I rotate only specific pages?", answer: "Currently, this tool rotates all pages in the PDF by the same angle. For rotating individual pages, you would need to split the PDF first, rotate specific pages, then merge them back together." },
      { question: "Will rotating affect my PDF quality?", answer: "No, rotating a PDF does not affect its quality. The content, text, and images remain exactly as they were, just oriented differently." },
      { question: "What's the difference between 90° and 270° rotation?", answer: "90° rotates clockwise (right), while 270° rotates counter-clockwise (left). 180° flips the page upside-down." },
      { question: "Can I rotate password-protected PDFs?", answer: "Password-protected PDFs need to be unlocked first before rotation. Use our Unlock PDF tool to remove the protection, then rotate the document." }
    ]
  };

  return (
    <>
      <CanonicalHead 
        title="Rotate PDF Pages Online Free | VexaTool"
        description="Free online PDF rotation tool. Rotate PDF pages 90, 180, or 270 degrees. Fix upside-down or sideways PDF pages."
        keywords="rotate PDF, turn PDF, flip PDF pages, PDF rotation, fix PDF orientation, free PDF rotate"
      />
      <ToolLayout
        title="Rotate PDF"
        description="Rotate all pages in your PDF document"
        icon={RotateCw}
        colorClass="bg-tool-rotate"
      >
      <FileUpload
        files={files}
        onFilesChange={setFiles}
        colorClass="bg-tool-rotate"
      />

      {files.length > 0 && (
        <div className="mt-8 max-w-md mx-auto space-y-4">
          <div className="flex justify-center gap-2">
            {[90, 180, 270].map((deg) => (
              <Button
                key={deg}
                variant={rotation === deg ? "default" : "outline"}
                onClick={() => setRotation(deg)}
              >
                {deg}°
              </Button>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={handleRotate}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                "Rotating..."
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Rotate & Download
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
};

export default RotatePDF;
