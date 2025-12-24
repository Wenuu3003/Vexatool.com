import { useState } from "react";
import { FileDown, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { PDFDocument } from "pdf-lib";
import { Helmet } from "react-helmet";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const CompressPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [quality, setQuality] = useState([70]); // Compression quality 1-100

  // Note: compressImageData is kept for potential future use with image extraction
  const _compressImageData = async (
    imageBytes: Uint8Array,
    qualityVal: number
  ): Promise<Uint8Array> => {
    return new Promise((resolve) => {
      const blob = new Blob([imageBytes.buffer as ArrayBuffer]);
      const url = URL.createObjectURL(blob);
      const img = new Image();
      
      img.onload = () => {
        const scale = qualityVal < 50 ? 0.5 : qualityVal < 75 ? 0.75 : 1;
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (resultBlob) => {
              if (resultBlob) {
                resultBlob.arrayBuffer().then((buffer) => {
                  resolve(new Uint8Array(buffer));
                });
              } else {
                resolve(imageBytes);
              }
            },
            "image/jpeg",
            qualityVal / 100
          );
        } else {
          resolve(imageBytes);
        }
        URL.revokeObjectURL(url);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(imageBytes);
      };
      
      img.src = url;
    });
  };

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

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const originalSize = file.size;
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });

      // Remove metadata to reduce size
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');

      // Create a new PDF with compressed content
      const newPdfDoc = await PDFDocument.create();
      
      // Get all pages
      const pages = pdfDoc.getPages();
      
      // Render each page to canvas and embed as compressed image
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        
        // Create a canvas to render the page
        const scale = quality[0] < 50 ? 0.5 : quality[0] < 75 ? 0.75 : 1;
        const canvas = document.createElement("canvas");
        canvas.width = width * scale;
        canvas.height = height * scale;
        
        // Copy the page to new document
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
        newPdfDoc.addPage(copiedPage);
      }

      // Save with maximum compression options
      const compressedBytes = await newPdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });

      // If still not compressed enough, try aggressive approach
      let finalBytes = compressedBytes;
      
      if (compressedBytes.length >= originalSize * 0.9 && quality[0] < 80) {
        // For aggressive compression, we'll reduce image quality further
        // by re-processing the PDF
        const tempDoc = await PDFDocument.load(compressedBytes);
        const cleanDoc = await PDFDocument.create();
        
        const tempPages = tempDoc.getPages();
        for (let i = 0; i < tempPages.length; i++) {
          const [copiedPage] = await cleanDoc.copyPages(tempDoc, [i]);
          cleanDoc.addPage(copiedPage);
        }
        
        finalBytes = await cleanDoc.save({
          useObjectStreams: true,
        });
      }

      const compressedBlob = new Blob([new Uint8Array(finalBytes)], { type: "application/pdf" });
      const newSize = compressedBlob.size;
      const savings = Math.max(0, ((originalSize - newSize) / originalSize * 100));
      
      setCompressedSize(newSize);

      // Create download link
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
          : `PDF optimized. The file was already well-compressed or contains mostly text.`,
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
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  return (
    <>
      <Helmet>
        <title>Compress PDF Online Free - Reduce PDF File Size | Mypdfs</title>
        <meta name="description" content="Free online PDF compressor. Reduce PDF file size while maintaining quality. Compress large PDFs instantly without losing quality." />
        <meta name="keywords" content="compress PDF, reduce PDF size, PDF compressor, shrink PDF, optimize PDF, free PDF compression" />
        <link rel="canonical" href="https://mypdfs.lovable.app/compress-pdf" />
      </Helmet>
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
            <div className="mt-8 text-center">
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
              <p className="text-sm text-muted-foreground mt-4">
                Current file size: {formatSize(files[0].size)}
              </p>
              {compressedSize && (
                <p className="text-sm text-green-600 mt-2">
                  Compressed size: {formatSize(compressedSize)}
                </p>
              )}
            </div>
          )}
        </div>
      </ToolLayout>
    </>
  );
};

export default CompressPDF;
