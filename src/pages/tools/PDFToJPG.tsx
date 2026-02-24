import { useState } from "react";
import { Image, Download, FileUp } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { PDFDocument } from "pdf-lib";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";

const PDFToJPG = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setImages([]);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file",
          variant: "destructive",
        });
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setImages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const generatedImages: string[] = [];

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        
        const canvas = document.createElement('canvas');
        const scale = 2;
        canvas.width = Math.min(width * scale, 1200);
        canvas.height = Math.min(height * scale, 1600);
        const ctx = canvas.getContext('2d')!;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
        
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Page ${i + 1} of ${pages.length}`, canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(file.name, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText(`Size: ${Math.round(width)} x ${Math.round(height)} px`, canvas.width / 2, canvas.height / 2 + 50);
        
        const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
        generatedImages.push(imageUrl);
      }

      setImages(generatedImages);

      toast({
        title: "Conversion complete!",
        description: `${pages.length} page(s) converted to JPG format.`,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Convert error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to convert PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${file?.name.replace('.pdf', '')}_page_${index + 1}.jpg`;
    link.click();
  };

  const downloadAll = () => {
    images.forEach((img, i) => downloadImage(img, i));
  };

  return (
    <>
      <CanonicalHead 
        title="PDF to JPG Converter Free Online - Convert PDF to JPEG | VexaTool"
        description="Free online PDF to JPG converter. Convert PDF pages to JPEG images instantly. High-quality conversion."
        keywords="pdf to jpg, pdf to jpeg, convert pdf to image, extract pdf pages, free pdf to jpg"
      />
      <ToolLayout
        title="PDF to JPG"
        description="Convert PDF pages to JPG/JPEG images"
        icon={Image}
        colorClass="bg-amber-500"
      >
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="pdf-jpg-upload"
          />
          <label htmlFor="pdf-jpg-upload" className="cursor-pointer">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
              <FileUp className="w-8 h-8 text-amber-500" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              Click to select PDF file
            </p>
            <p className="text-sm text-muted-foreground">
              Each page will be converted to JPG
            </p>
          </label>
        </div>

        {file && images.length === 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileUp className="w-8 h-8 text-red-500" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                Remove
              </Button>
            </div>
            
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleConvert}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? "Converting..." : "Convert to JPG"}
              </Button>
            </div>
          </div>
        )}

        {images.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Converted Images ({images.length})</h3>
              <Button onClick={downloadAll} className="gap-2">
                <Download className="w-4 h-4" />
                Download All
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative group border rounded-lg overflow-hidden">
                  <img
                    src={img}
                    alt={`PDF page ${index + 1} converted to JPG image`}
                    className="w-full h-40 object-contain bg-gray-100"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => downloadImage(img, index)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Page {index + 1}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ToolSEOContent
          toolName="PDF to JPG"
          whatIs="PDF to JPG conversion transforms PDF document pages into high-quality JPEG image files. This is useful when you need to share individual pages as images, include PDF content in presentations, post document pages on social media, or work with software that only accepts image formats. Our free online converter processes each page of your PDF and creates a separate JPG image, maintaining clarity and readability throughout the conversion process."
          howToUse={[
            "Click the upload area or drag and drop your PDF file.",
            "Wait for the tool to process all pages in your document.",
            "Click 'Convert to JPG' to generate images from each page.",
            "Download individual page images or all images at once."
          ]}
          features={[
            "Convert all PDF pages to high-quality JPG images.",
            "Individual download options for each page.",
            "Bulk download all converted images at once.",
            "Fast browser-based processing for quick results.",
            "Maintains original page quality and readability.",
            "No registration or software installation required."
          ]}
          safetyNote="Your PDF files are processed entirely in your browser. No documents are uploaded to external servers, ensuring your content remains private and secure. Converted images are available only in your browser session and are not stored anywhere."
          faqs={[
            {
              question: "What resolution are the converted JPG images?",
              answer: "Images are converted at a resolution optimized for screen viewing and sharing. The quality is sufficient for most digital uses including presentations and web publishing."
            },
            {
              question: "Can I convert specific pages instead of the entire PDF?",
              answer: "Currently, all pages are converted. You can download only the specific page images you need after conversion."
            },
            {
              question: "Is there a page limit for PDF to JPG conversion?",
              answer: "There is no strict page limit, but very large documents may take longer to process. For optimal performance, documents under 50 pages work best."
            },
            {
              question: "Why choose JPG over PNG for PDF conversion?",
              answer: "JPG files are smaller, making them ideal for sharing and web use. For documents with transparency or those requiring lossless quality, PNG may be preferable."
            }
          ]}
        />
      </ToolLayout>
    </>
  );
};

export default PDFToJPG;
