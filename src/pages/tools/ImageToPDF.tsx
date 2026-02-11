import { useState } from "react";
import { Image, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { PDFDocument } from "pdf-lib";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";

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

  const seoContent = {
    toolName: "Image to PDF Converter",
    whatIs: "The Image to PDF Converter is a free online tool that transforms your images into professional PDF documents. Whether you have JPG photographs, PNG graphics, WebP images, GIF animations, or other formats, this tool combines them into a single, well-organized PDF file. It is perfect for creating photo albums, digitizing paper documents from phone camera scans, building portfolios, compiling product catalogs, or any collection of images that needs to be shared or archived as a single PDF. Each image is embedded at full resolution with its original dimensions, ensuring no quality loss. The entire conversion process happens in your browser, so your personal photos, identity documents, and sensitive images are never uploaded to any server.",
    howToUse: [
      "Click the upload area to select your image files from your device.",
      "Choose multiple images of any supported format — JPG, PNG, WebP, GIF, BMP, and more.",
      "Preview your selected images in the grid and remove any unwanted files.",
      "Add more images in additional batches if needed — they accumulate in the list.",
      "Click 'Convert to PDF' to create your document with all images.",
      "Your PDF will download automatically with each image on its own page."
    ],
    features: [
      "Support for all major image formats including JPG, PNG, WebP, GIF, BMP, and TIFF.",
      "Combine unlimited images into one organized PDF document.",
      "Automatic format conversion for unsupported types — all images work seamlessly.",
      "Maintains original image quality, resolution, and aspect ratio.",
      "Visual preview grid shows thumbnails with easy one-click removal.",
      "Batch upload support — add images from multiple folders incrementally.",
      "Secure client-side processing — your images never leave your device.",
      "Free to use with no registration, watermarks, or daily limits."
    ],
    safetyNote: "All image processing happens directly in your browser using secure client-side technology. Your files are never uploaded to any server, ensuring complete privacy for your personal photos, identity documents, and sensitive images. The conversion is performed locally, and only you have access to the resulting PDF file.",
    faqs: [
      { question: "What image formats are supported?", answer: "The tool supports JPG/JPEG, PNG, WebP, GIF, BMP, TIFF, and most other common image formats. Unsupported formats are automatically converted to PNG before being added to the PDF." },
      { question: "What order will the images appear?", answer: "Images appear in the order you selected them. You can remove images and re-add them to change the order before conversion." },
      { question: "Will image quality be reduced?", answer: "No, images are embedded in the PDF at their original quality and resolution. JPG and PNG files are directly embedded, while other formats are converted to PNG to preserve quality." },
      { question: "Can I add images from different folders?", answer: "Yes! You can add images in multiple batches. Each time you select files, they are added to your existing selection." },
      { question: "Is there a limit on the number of images?", answer: "There is no artificial limit. You can add as many images as your browser memory allows. For very large collections (100+ high-resolution images), processing may take a moment." },
      { question: "What is the page size of the resulting PDF?", answer: "Each page is sized to match the dimensions of the corresponding image, so every image fills its page completely without borders or cropping." },
      { question: "Can I convert a single image to PDF?", answer: "Yes, the tool works with a single image as well as multiple images. Upload one image and convert it to a single-page PDF." },
      { question: "Do I need to install any software?", answer: "No. This tool runs entirely in your web browser with no downloads, plugins, or installations required." },
      { question: "Can I rearrange the image order after uploading?", answer: "Currently, you can remove images and re-upload them in the desired order. The images appear in the PDF in the sequence they are listed." },
      { question: "Is this tool free to use?", answer: "Yes, completely free with no hidden charges, no account required, and no watermarks on the output PDF." }
    ]
  };

  return (
    <>
      <CanonicalHead 
        title="Image to PDF Converter Free Online - JPG PNG to PDF | Mypdfs"
        description="Free online image to PDF converter. Convert JPG, PNG, GIF images to PDF. Combine multiple images."
        keywords="image to PDF, JPG to PDF, PNG to PDF, convert images, photo to PDF, free image converter"
      />
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
      <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
};

export default ImageToPDF;
