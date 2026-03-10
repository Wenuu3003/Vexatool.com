import { useState } from "react";
import { Image, Download, FileUp } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const PDFToJPG = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf")) {
        setFile(selectedFile);
        setImages([]);
        setProgress(0);
      } else {
        toast({ title: "Invalid file type", description: "Please select a PDF file", variant: "destructive" });
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select a PDF file to convert.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setImages([]);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const generatedImages: string[] = [];
      const scale = 2;

      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(Math.round((i / pdf.numPages) * 100));
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;

        await page.render({ canvasContext: ctx, viewport }).promise;
        generatedImages.push(canvas.toDataURL("image/jpeg", 0.92));
      }

      setImages(generatedImages);
      toast({ title: "Conversion complete!", description: `${pdf.numPages} page(s) converted to JPG.` });
    } catch (error) {
      if (import.meta.env.DEV) console.error("Convert error:", error);
      const msg = error instanceof Error ? error.message : "";
      toast({
        title: "Conversion failed",
        description: msg.includes("password") ? "This PDF is password-protected. Unlock it first." : "Failed to convert PDF. The file may be corrupted.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${file?.name.replace(".pdf", "")}_page_${index + 1}.jpg`;
    link.click();
  };

  const downloadAll = () => images.forEach((img, i) => downloadImage(img, i));

  return (
    <>
      <CanonicalHead
        title="PDF to JPG Converter Free Online - Convert PDF to JPEG | VexaTool"
        description="Free online PDF to JPG converter. Convert PDF pages to high-quality JPEG images with full page rendering. No signup required."
        keywords="pdf to jpg, pdf to jpeg, convert pdf to image, extract pdf pages, free pdf to jpg"
      />
      <ToolLayout title="PDF to JPG" description="Convert PDF pages to JPG/JPEG images" icon={Image} colorClass="bg-amber-500">
        <div className="space-y-6">
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" id="pdf-jpg-upload" />
            <label htmlFor="pdf-jpg-upload" className="cursor-pointer">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                <FileUp className="w-8 h-8 text-amber-500" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">Click to select PDF file</p>
              <p className="text-sm text-muted-foreground">Each page will be rendered as a JPG image</p>
            </label>
          </div>

          {file && images.length === 0 && !isProcessing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FileUp className="w-8 h-8 text-amber-500" />
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Remove</Button>
              </div>
              <div className="text-center">
                <Button size="lg" onClick={handleConvert} className="gap-2">Convert to JPG</Button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">Rendering pages… {progress}%</p>
            </div>
          )}

          {images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">Converted Images ({images.length})</h3>
                <Button onClick={downloadAll} className="gap-2"><Download className="w-4 h-4" />Download All</Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group border border-border rounded-lg overflow-hidden">
                    <img src={img} alt={`PDF page ${index + 1} converted to JPG`} className="w-full h-40 object-contain bg-muted" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="sm" variant="secondary" onClick={() => downloadImage(img, index)}>
                        <Download className="w-4 h-4 mr-1" />Page {index + 1}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <ToolSEOContent
          toolName="PDF to JPG"
          whatIs="PDF to JPG conversion transforms PDF document pages into high-quality JPEG image files. This is useful when you need to share individual pages as images, include PDF content in presentations, post document pages on social media, or work with software that only accepts image formats. Our free online converter renders each page of your PDF at high resolution and creates a separate JPG image, maintaining clarity and readability throughout the conversion process."
          howToUse={[
            "Click the upload area to select your PDF file.",
            "Click 'Convert to JPG' to render all pages as images.",
            "View the rendered images in the preview gallery.",
            "Download individual page images or all images at once.",
          ]}
          features={[
            "Full page rendering using PDF.js — actual content, not placeholders",
            "High-resolution 2× scale output for crisp, printable images",
            "Individual or bulk download options",
            "Progress tracking for multi-page documents",
            "No registration or software installation required",
            "100% browser-based — files never leave your device",
          ]}
          safetyNote="Your PDF files are processed entirely in your browser. No documents are uploaded to external servers."
          faqs={[
            { question: "What resolution are the converted JPG images?", answer: "Images are rendered at 2× scale for excellent quality, suitable for printing and high-resolution displays." },
            { question: "Can I convert specific pages instead of the entire PDF?", answer: "Currently, all pages are converted. You can download only the specific page images you need after conversion." },
            { question: "Is there a page limit?", answer: "No strict limit, but very large documents may take longer. Documents under 50 pages work best." },
            { question: "Why choose JPG over PNG?", answer: "JPG files are smaller, making them ideal for sharing and web use. For documents needing transparency or lossless quality, PNG is preferable." },
          ]}
        />
      </ToolLayout>
    </>
  );
};

export default PDFToJPG;
