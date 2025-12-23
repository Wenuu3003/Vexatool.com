import { useState } from "react";
import { Image, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { PDFDocument } from "pdf-lib";
import { Helmet } from "react-helmet";

const ImageToPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const imageFiles = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/')
      );
      setFiles(prev => [...prev, ...imageFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({
        title: "No images selected",
        description: "Please select at least one image to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        let image;
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(bytes);
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(bytes);
        } else {
          // For other formats, convert to canvas then to PNG
          const img = document.createElement('img');
          img.src = URL.createObjectURL(file);
          await new Promise(resolve => img.onload = resolve);
          
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          
          const pngBlob = await new Promise<Blob>((resolve) => 
            canvas.toBlob(blob => resolve(blob!), 'image/png')
          );
          const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
          image = await pdfDoc.embedPng(pngBytes);
          URL.revokeObjectURL(img.src);
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "images_to_pdf.pdf";
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Conversion complete!",
        description: `${files.length} image(s) converted to PDF successfully.`,
      });

      setFiles([]);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Convert error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to convert images to PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Image to PDF Converter Free Online - JPG PNG to PDF | Mypdfs</title>
        <meta name="description" content="Free online image to PDF converter. Convert JPG, PNG, GIF, and other images to PDF. Combine multiple images into one PDF document." />
        <meta name="keywords" content="image to PDF, JPG to PDF, PNG to PDF, convert images, photo to PDF, free image converter" />
        <link rel="canonical" href="https://mypdfs.lovable.app/image-to-pdf" />
      </Helmet>
      <ToolLayout
        title="Image to PDF"
        description="Convert JPG, PNG, and other images to PDF"
        icon={Image}
        colorClass="bg-tool-convert"
      >
      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-tool-convert/10 flex items-center justify-center">
            <Image className="w-8 h-8 text-tool-convert" />
          </div>
          <p className="text-lg font-medium text-foreground mb-2">
            Click to select images
          </p>
          <p className="text-sm text-muted-foreground">
            Supports JPG, PNG, GIF, WebP, and more
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="font-medium">Selected Images ({files.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <p className="text-xs text-muted-foreground truncate mt-1">{file.name}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <Button
              size="lg"
              onClick={handleConvert}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                "Converting..."
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Convert to PDF
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      </ToolLayout>
    </>
  );
};

export default ImageToPDF;
