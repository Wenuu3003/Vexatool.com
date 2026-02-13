import { useState } from "react";
import { FileDown, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { CanonicalHead } from "@/components/CanonicalHead";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import ToolSEOContent from "@/components/ToolSEOContent";
import { compressPDF } from "@/lib/pdfCompress";

const CompressPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [quality, setQuality] = useState([70]);
  const [progress, setProgress] = useState(0);

  const handleCompress = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to compress.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const originalSize = file.size;

      const compressedBytes = await compressPDF(arrayBuffer, {
        quality: quality[0],
        onProgress: (current, total) => {
          setProgress(Math.round((current / total) * 100));
        },
      });

      const compressedBlob = new Blob([new Uint8Array(compressedBytes)], { type: "application/pdf" });
      const newSize = compressedBlob.size;
      const savings = Math.max(0, ((originalSize - newSize) / originalSize) * 100);

      setCompressedSize(newSize);

      const url = URL.createObjectURL(compressedBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `compressed_${file.name}`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Compression complete!",
        description: savings > 1
          ? `File size reduced by ${savings.toFixed(1)}% (${formatSize(originalSize)} → ${formatSize(newSize)})`
          : `PDF optimized. Minimal reduction — file was already compact.`,
      });

      setFiles([]);
      setCompressedSize(null);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Compress error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to compress PDF. The file may be corrupted or password-protected.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  return (
    <>
      <CanonicalHead 
        title="Compress PDF Online Free - Reduce PDF File Size | Mypdfs"
        description="Free online PDF compressor. Reduce PDF file size while maintaining quality. Compress large PDFs instantly."
        keywords="compress PDF, reduce PDF size, PDF compressor, shrink PDF, optimize PDF, free PDF compression"
      />
      <ToolLayout
        title="Compress PDF"
        description="Reduce the file size of your PDF documents"
        icon={FileDown}
        colorClass="bg-tool-compress"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="quality">Compression Level</Label>
              <span className="text-sm text-muted-foreground">
                {quality[0] < 50 ? "High (smaller file)" : quality[0] < 75 ? "Medium" : "Low (better quality)"}
              </span>
            </div>
            <Slider
              id="quality"
              value={quality}
              onValueChange={setQuality}
              min={20}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Lower values = smaller file size but may reduce image quality
            </p>
          </div>

          <FileUpload
            files={files}
            onFilesChange={setFiles}
            colorClass="bg-tool-compress"
          />

          {files.length > 0 && (
            <div className="mt-8 text-center space-y-4">
              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full max-w-md mx-auto" />
                  <p className="text-sm text-muted-foreground">Compressing page {Math.ceil((progress / 100) * files.length) || 1}...</p>
                </div>
              )}
              <Button
                size="lg"
                onClick={handleCompress}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  "Compressing..."
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Compress & Download
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                Current file size: {formatSize(files[0].size)}
              </p>
              {compressedSize && (
                <p className="text-sm text-primary font-medium">
                  Compressed size: {formatSize(compressedSize)}
                </p>
              )}
            </div>
          )}
        </div>

        <ToolSEOContent
          toolName="Compress PDF"
          whatIs="PDF compression is the process of reducing the file size of a PDF document while maintaining its visual quality and readability. Large PDF files create real problems — they are difficult to share via email (most providers cap attachments at 25MB), slow to upload to government portals and job application systems, and consume excessive storage space on your device. Our free online PDF compressor at MyPDFs uses advanced optimization algorithms to shrink your PDF files by up to 90%, depending on content type. The tool works directly in your browser, meaning your sensitive financial reports, legal contracts, and personal documents are never uploaded to any external server. Whether you need to compress a single scanned document or optimize a batch of image-heavy presentations, this tool delivers fast, reliable results with an adjustable quality slider so you control the balance between file size and visual fidelity."
          howToUse={[
            "Upload your PDF file by clicking the upload area or dragging and dropping your document.",
            "Adjust the compression level slider — move left for maximum compression (smaller file) or right for maximum quality.",
            "Click the 'Compress & Download' button to process your file.",
            "View the compression results showing original size versus compressed size.",
            "Your compressed PDF will be downloaded automatically, ready to share, email, or upload."
          ]}
          features={[
            "Reduce PDF file sizes by up to 90% depending on content and compression settings.",
            "Adjustable compression levels — slider control to balance quality versus file size.",
            "Fast browser-based processing with no file uploads to external servers.",
            "Preserves text clarity, page layouts, and document structure during compression.",
            "Works with scanned documents, image-heavy PDFs, and text-based files.",
            "Real-time size comparison shows original and compressed file sizes.",
            "No registration required and completely free to use with no daily limits.",
            "Compatible with all devices — desktop, tablet, and mobile browsers."
          ]}
          safetyNote="Your PDF files are processed entirely within your browser using secure client-side technology. No files are uploaded to external servers, ensuring your documents remain private and secure. Once compression is complete, your original file remains unchanged on your device while you receive an optimized copy."
          faqs={[
            { question: "How much can I reduce my PDF file size?", answer: "The compression ratio depends on the PDF content. Files with many high-resolution images can be reduced by 70-90%, while text-heavy documents may see 20-50% reduction. Use the compression slider to find the optimal balance." },
            { question: "Will compression affect the quality of my PDF?", answer: "Our smart compression algorithm prioritizes quality retention. At higher quality settings, visual differences are imperceptible. Lower compression settings may slightly reduce image quality but significantly decrease file size." },
            { question: "Is there a file size limit for compression?", answer: "Browser-based processing can handle files up to several hundred megabytes. For best performance, we recommend files under 100MB. Larger files may take longer to process." },
            { question: "Can I compress password-protected PDFs?", answer: "Password-protected PDFs with encryption cannot be compressed without first removing the protection. Use our Unlock PDF tool first, then compress the file." },
            { question: "Why is my compressed file almost the same size as the original?", answer: "Text-based PDFs with minimal images are already very compact. Compression is most effective on PDFs containing high-resolution images, scanned pages, or embedded media. The toast message will indicate when a file is already well-compressed." },
            { question: "Can I compress multiple PDFs at once?", answer: "Currently, the tool processes one file at a time for maximum quality control. For batch compression, simply process each file sequentially." },
            { question: "Will the compressed PDF work on all devices and readers?", answer: "Yes. The compressed PDF is a standard PDF file that opens in any PDF reader on any device, including Adobe Acrobat, Chrome, Firefox, and mobile PDF apps." },
            { question: "Do I need to create an account?", answer: "No. The compression tool is completely free with no registration, no login, and no daily usage limits." },
            { question: "What is the difference between High, Medium, and Low compression?", answer: "High compression (slider left) produces the smallest files but may reduce image sharpness. Medium is balanced. Low compression (slider right) keeps maximum quality with modest size reduction." },
            { question: "Is my compressed PDF stored on your servers?", answer: "No. All processing happens in your browser. We never see, store, or have access to your files." }
          ]}
        />
      </ToolLayout>
    </>
  );
};

export default CompressPDF;
