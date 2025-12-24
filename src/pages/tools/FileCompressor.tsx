import { useState } from "react";
import { FileArchive, Download, Trash2 } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { Slider } from "@/components/ui/slider";
import { PDFDocument } from "pdf-lib";

interface CompressedFile {
  original: File;
  compressed: Blob;
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

  const compressImage = async (file: File, quality: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculate new dimensions (max 2000px while maintaining aspect ratio)
        let width = img.width;
        let height = img.height;
        const maxDimension = quality < 50 ? 1000 : quality < 80 ? 1500 : 2000;
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to compress image'));
          },
          file.type === 'image/png' ? 'image/png' : 'image/jpeg',
          quality / 100
        );
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

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
        
        if (file.type.startsWith('image/')) {
          compressed = await compressImage(file, quality[0]);
        } else if (file.type === 'application/pdf') {
          compressed = await compressPDF(file);
        } else {
          // For other files, just pass through (can't compress)
          compressed = file;
        }
        
        results.push({
          original: file,
          compressed,
          originalSize: file.size,
          compressedSize: compressed.size,
          previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(compressed) : undefined,
        });
      }

      setCompressedFiles(results);
      
      const totalOriginal = results.reduce((acc, r) => acc + r.originalSize, 0);
      const totalCompressed = results.reduce((acc, r) => acc + r.compressedSize, 0);
      const savings = ((totalOriginal - totalCompressed) / totalOriginal * 100);

      toast({
        title: "Compression complete!",
        description: `Reduced by ${savings.toFixed(1)}% (${formatSize(totalOriginal)} → ${formatSize(totalCompressed)})`,
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
    link.download = `compressed_${compressed.original.name}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    compressedFiles.forEach(file => downloadFile(file));
  };

  return (
    <>
      <Helmet>
        <title>File Compressor Free Online - Compress Images PDF Files | Mypdfs</title>
        <meta name="description" content="Free online file compressor. Compress images, PDFs and other files to reduce size. Supports JPG, PNG, PDF compression with quality control." />
        <meta name="keywords" content="file compressor, compress files, reduce file size, image compression, pdf compression, free compressor" />
        <link rel="canonical" href="https://mypdfs.lovable.app/file-compressor" />
      </Helmet>
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
                  const savings = ((file.originalSize - file.compressedSize) / file.originalSize * 100);
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-4">
                        {file.previewUrl && (
                          <img src={file.previewUrl} alt="" className="w-12 h-12 object-cover rounded" />
                        )}
                        <div>
                          <p className="font-medium truncate max-w-xs">{file.original.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatSize(file.originalSize)} → {formatSize(file.compressedSize)}
                            <span className="text-green-600 ml-2">(-{savings.toFixed(1)}%)</span>
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
