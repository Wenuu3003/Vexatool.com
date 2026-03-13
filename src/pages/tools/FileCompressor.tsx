import { useState } from "react";
import { FileArchive, Download, Trash2 } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { compressImageFile } from "@/lib/imageCompression";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";
import { Slider } from "@/components/ui/slider";
import { PDFDocument } from "pdf-lib";

interface CompressedFile {
  original: File;
  compressed: Blob;
  compressedType: string;
  originalSize: number;
  compressedSize: number;
  previewUrl?: string;
}

const FileCompressor = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [compressedFiles, setCompressedFiles] = useState<CompressedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState([80]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      setCompressedFiles([]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setCompressedFiles([]);
  };

  // Image compression is handled by a shared helper so all tools stay consistent.


  const compressPDF = async (file: File): Promise<Blob> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    
    // Remove metadata
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');
    
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 20,
    });
    
    return new Blob([new Uint8Array(compressedBytes)], { type: 'application/pdf' });
  };

  const handleCompress = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to compress.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const results: CompressedFile[] = [];

    try {
      for (const file of files) {
        let compressed: Blob;
        let compressedType = file.type || "application/octet-stream";

        if (file.type.startsWith("image/")) {
          const maxDimension =
            quality[0] < 50 ? 1000 : quality[0] < 80 ? 1500 : 2000;

          const res = await compressImageFile(file, {
            quality: quality[0],
            maxDimension,
          });

          compressed = res.blob;
          compressedType = res.outputType;
        } else if (file.type === "application/pdf") {
          compressed = await compressPDF(file);
          compressedType = "application/pdf";
        } else {
          // For other files, just pass through (can't compress)
          compressed = file;
        }

        results.push({
          original: file,
          compressed,
          compressedType,
          originalSize: file.size,
          compressedSize: compressed.size,
          previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(compressed) : undefined,
        });
      }

      setCompressedFiles(results);
      
      const totalOriginal = results.reduce((acc, r) => acc + r.originalSize, 0);
      const totalCompressed = results.reduce((acc, r) => acc + r.compressedSize, 0);
      const savings = Math.max(0, ((totalOriginal - totalCompressed) / totalOriginal * 100));

      toast({
        title: "Compression complete!",
        description:
          savings > 0.5
            ? `Reduced by ${savings.toFixed(1)}% (${formatSize(totalOriginal)} → ${formatSize(totalCompressed)})`
            : `Optimized. Try lowering quality for smaller files (${formatSize(totalOriginal)} → ${formatSize(totalCompressed)}).`,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Compress error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to compress some files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const downloadFile = (compressed: CompressedFile) => {
    const url = URL.createObjectURL(compressed.compressed);
    const link = document.createElement('a');
    link.href = url;

    const baseName = compressed.original.name.replace(/\.[^/.]+$/, "");
    const ext =
      compressed.compressedType === "application/pdf"
        ? ".pdf"
        : compressed.compressedType === "image/webp"
          ? ".webp"
          : compressed.compressedType === "image/png"
            ? ".png"
            : compressed.compressedType.startsWith("image/")
              ? ".jpg"
              : "";

    link.download = `compressed_${baseName}${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    compressedFiles.forEach(file => downloadFile(file));
  };

  return (
    <>
      <CanonicalHead 
        title="File Compressor Free Online - Compress Images PDF Files | VexaTool"
        description="Free online file compressor. Compress images, PDFs and other files to reduce size with quality control."
        keywords="file compressor, compress files, reduce file size, image compression, pdf compression"
      />
      <ToolLayout
        title="File Compressor"
        description="Compress images and PDF files to reduce size"
        icon={FileArchive}
        colorClass="bg-rose-500"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Compression Quality: {quality[0]}%
            </label>
            <Slider
              value={quality}
              onValueChange={setQuality}
              min={10}
              max={100}
              step={5}
              className="w-full max-w-md"
            />
            <p className="text-xs text-muted-foreground">
              Lower quality = smaller file size
            </p>
          </div>

          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-compress-upload"
            />
            <label htmlFor="file-compress-upload" className="cursor-pointer">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10 flex items-center justify-center">
                <FileArchive className="w-8 h-8 text-rose-500" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">
                Click to select files
              </p>
              <p className="text-sm text-muted-foreground">
                Supports images (JPG, PNG, WebP) and PDF files
              </p>
            </label>
          </div>

          {files.length > 0 && compressedFiles.length === 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Selected Files ({files.length})</h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium truncate max-w-xs">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={handleCompress}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? "Compressing..." : "Compress Files"}
                </Button>
              </div>
            </div>
          )}

          {compressedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Compressed Files ({compressedFiles.length})</h3>
                <Button onClick={downloadAll} className="gap-2">
                  <Download className="w-4 h-4" />
                  Download All
                </Button>
              </div>
              
              <div className="space-y-2">
                {compressedFiles.map((file, index) => {
                  const percent = ((file.originalSize - file.compressedSize) / file.originalSize * 100);
                  const label = percent > 0.5 ? `(-${percent.toFixed(1)}%)` : "(optimized)";

                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-4">
                        {file.previewUrl && (
                          <img
                            src={file.previewUrl}
                            alt={`${file.original.name} preview`}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium truncate max-w-xs">{file.original.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatSize(file.originalSize)} → {formatSize(file.compressedSize)}
                            <span className="text-primary ml-2">{label}</span>
                          </p>
                        </div>
                      </div>
                      <Button onClick={() => downloadFile(file)} className="gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ToolLayout>
    </>
  );
};

export default FileCompressor;
