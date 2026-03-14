import { useState } from "react";
import { Image, Download, FileUp } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { CanonicalHead } from "@/components/CanonicalHead";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ToolSEOContent from "@/components/ToolSEOContent";
import { pdfjsLib } from "@/lib/pdfWorker";

const PDFToImage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [format, setFormat] = useState<"png" | "jpg">("png");
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

        const imageUrl = canvas.toDataURL(format === "jpg" ? "image/jpeg" : "image/png", 0.92);
        generatedImages.push(imageUrl);
      }

      setImages(generatedImages);
      toast({ title: "Conversion complete!", description: `${pdf.numPages} page(s) converted to ${format.toUpperCase()}.` });
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
    link.download = `${file?.name.replace(".pdf", "")}_page_${index + 1}.${format}`;
    link.click();
  };

  const downloadAll = () => images.forEach((img, i) => downloadImage(img, i));

  const seoContent = {
    toolName: "PDF to Image Converter",
    whatIs: "PDF to Image Converter is a free online tool that transforms PDF document pages into high-quality image files. You can choose between PNG format for lossless quality and transparency support, or JPG format for smaller file sizes. This is perfect for sharing document pages on social media, including them in presentations, or extracting visual content from PDFs.",
    howToUse: [
      "Select your preferred output format (PNG or JPG).",
      "Click the upload area to select your PDF file.",
      "Click the convert button to start processing.",
      "View the converted images in the preview gallery.",
      "Download individual pages or all images at once.",
    ],
    features: [
      "Full page rendering — actual PDF content, not placeholders",
      "Choice of PNG or JPG output format",
      "High-resolution 2× scale output for crisp images",
      "Batch download all pages at once",
      "Progress bar for multi-page documents",
      "Secure client-side processing — files never leave your device",
    ],
    safetyNote: "Your PDF files are processed entirely in your browser. No documents are uploaded to any server, ensuring complete privacy.",
    faqs: [
      { question: "Should I choose PNG or JPG?", answer: "Choose PNG for documents with text, graphics, or when you need transparency. Choose JPG for photographs or when you need smaller file sizes. PNG is lossless while JPG uses compression." },
      { question: "What quality are the output images?", answer: "Images are rendered at 2× scale for excellent quality and sharpness, suitable for printing and presentations." },
      { question: "Can I convert a specific page only?", answer: "All pages are converted during processing. After conversion, you can download only the specific pages you need from the preview gallery." },
      { question: "Is there a page limit?", answer: "There's no hard limit, but very large PDFs may take longer to process. The tool handles most standard documents efficiently." },
    ],
  };

  return (
    <>
      <CanonicalHead
        title="PDF to Image Converter Free Online - PDF to JPG PNG | VexaTool"
        description="Free online PDF to image converter. Convert PDF pages to JPG or PNG images with full page rendering. No signup required."
        keywords="pdf to image, pdf to jpg, pdf to png, convert pdf, extract pdf images, free pdf converter"
      />
      <ToolLayout title="PDF to Image" description="Convert PDF pages to JPG or PNG images" icon={Image} colorClass="bg-purple-500">
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm font-medium">Output format:</span>
            <Select value={format} onValueChange={(v) => setFormat(v as "png" | "jpg")}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" id="pdf-image-upload" />
            <label htmlFor="pdf-image-upload" className="cursor-pointer">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                <FileUp className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">Click to select PDF file</p>
              <p className="text-sm text-muted-foreground">Each page will be rendered as an image</p>
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileUp className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setImages([]); }}>Remove</Button>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">Rendering pages… {progress}%</p>
            </div>
          )}

          {file && images.length === 0 && !isProcessing && (
            <div className="text-center">
              <Button size="lg" onClick={handleConvert} className="gap-2">
                Convert to {format.toUpperCase()}
              </Button>
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
                    <img src={img} alt={`Page ${index + 1}`} className="w-full h-40 object-contain bg-muted" loading="lazy" decoding="async" />
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
        <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
};

export default PDFToImage;
