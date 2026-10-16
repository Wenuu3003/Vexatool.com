import { useState, useRef, useCallback } from "react";
import { Presentation, Download, Info, Upload, FileText, CheckCircle, ImageIcon } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";
import { Progress } from "@/components/ui/progress";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import { extractContentFromPPTX } from '@/lib/extractPptx';

const PPTToPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isConverted, setIsConverted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing) return;
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileName = selectedFile.name.toLowerCase();
      if (fileName.endsWith('.pptx')) {
        setFile(selectedFile);
        setIsConverted(false);
        toast({
          title: "File selected",
          description: `${selectedFile.name} is ready for conversion.`,
        });
      } else {
        setFile(null);
        setIsConverted(false);
        toast({
          title: "Invalid file type",
          description: "Select a .pptx file. Legacy .ppt is unsupported; save it as .pptx first.",
          variant: "destructive",
        });
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PowerPoint file first.",
        variant: "destructive",
      });
      return;
    }

    setIsConverted(false);
    setIsProcessing(true);
    setProgress(10);

    try {
      const isPPTX = file.name.toLowerCase().endsWith('.pptx');
      
      // Create PDF document
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      setProgress(30);
      
      if (isPPTX) {
        // Extract content from PPTX (now includes images)
        const slides = await extractContentFromPPTX(file);
        setProgress(50);
        
        // Create PDF pages for each slide
        for (let i = 0; i < slides.length; i++) {
          // Standard slide dimensions (16:9 aspect ratio)
          const pageWidth = 960;
          const pageHeight = 540;
          const page = pdfDoc.addPage([pageWidth, pageHeight]);
          
          // Add slide background
          page.drawRectangle({
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
            color: rgb(1, 1, 1),
          });
          
          const slideData = slides[i];
          let contentStartY = pageHeight - 50;
          
          // Embed images first (position them at the top/center of slide)
          if (slideData.images.length > 0) {
            let imageY = pageHeight - 60;
            const maxImageHeight = slideData.text.length > 0 ? 280 : 420;
            const maxImageWidth = pageWidth - 100;
            
            for (const img of slideData.images) {
              try {
                let embeddedImage;
                if (img.type === 'png') {
                  embeddedImage = await pdfDoc.embedPng(img.data);
                } else {
                  embeddedImage = await pdfDoc.embedJpg(img.data);
                }
                
                // Calculate dimensions to fit within bounds while maintaining aspect ratio
                const imgWidth = embeddedImage.width;
                const imgHeight = embeddedImage.height;
                let scale = Math.min(maxImageWidth / imgWidth, maxImageHeight / imgHeight, 1);
                
                const scaledWidth = imgWidth * scale;
                const scaledHeight = imgHeight * scale;
                
                // Center the image horizontally
                const imageX = (pageWidth - scaledWidth) / 2;
                imageY -= scaledHeight;
                
                if (imageY > 60) {
                  page.drawImage(embeddedImage, {
                    x: imageX,
                    y: imageY,
                    width: scaledWidth,
                    height: scaledHeight,
                  });
                  imageY -= 10; // Gap between images
                  contentStartY = imageY - 20;
                }
              } catch (imgError) {
                console.warn('Could not embed image:', imgError);
              }
            }
          }
          
          // Add slide number
          page.drawText(`Slide ${i + 1}`, {
            x: 40,
            y: pageHeight - 30,
            size: 18,
            font: boldFont,
            color: rgb(0.3, 0.3, 0.3),
          });
          
          // Add text content with word wrapping
          if (slideData.text.length > 0) {
            let yPosition = Math.min(contentStartY, pageHeight - 100);
            const lineHeight = 22;
            const maxWidth = pageWidth - 80;
            
            for (const textLine of slideData.text) {
              if (yPosition < 50) break;
              
              // Word wrap
              const words = textLine.split(' ');
              let currentLine = '';
              
              for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const textWidth = font.widthOfTextAtSize(testLine, 14);
                
                if (textWidth > maxWidth && currentLine) {
                  page.drawText(currentLine, {
                    x: 40,
                    y: yPosition,
                    size: 14,
                    font: font,
                    color: rgb(0.1, 0.1, 0.1),
                  });
                  yPosition -= lineHeight;
                  currentLine = word;
                } else {
                  currentLine = testLine;
                }
              }
              
              if (currentLine && yPosition >= 50) {
                page.drawText(currentLine, {
                  x: 40,
                  y: yPosition,
                  size: 14,
                  font: font,
                  color: rgb(0.1, 0.1, 0.1),
                });
                yPosition -= lineHeight;
              }
            }
          }
          
          // Add footer
          page.drawText(`Converted from: ${file.name}`, {
            x: 40,
            y: 20,
            size: 10,
            font: font,
            color: rgb(0.5, 0.5, 0.5),
          });
          
          setProgress(50 + Math.round((i / slides.length) * 40));
        }
      } else {
        throw new Error('Legacy .ppt is unsupported. Save as .pptx first.');
      }
      
      setProgress(90);
      
      // Save and download PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.replace(/\.(pptx?|ppt)$/i, '.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setProgress(100);
      setIsConverted(true);
      
      toast({
        title: "Conversion Complete!",
        description: "A simplified PDF was created. Check it before sharing; original slide layout is not preserved.",
      });
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Conversion failed",
        description: error instanceof Error ? error.message : "Conversion failed. No PDF was created.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isProcessing) return;
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fileName = droppedFile.name.toLowerCase();
      if (fileName.endsWith('.pptx')) {
        setFile(droppedFile);
        setIsConverted(false);
        toast({
          title: "File selected",
          description: `${droppedFile.name} is ready for conversion.`,
        });
      } else {
        setFile(null);
        setIsConverted(false);
        toast({
          title: "Invalid file type",
          description: "Select a .pptx file. Legacy .ppt is unsupported; save it as .pptx first.",
          variant: "destructive",
        });
      }
    }
  }, [isProcessing]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const seoContent = {
    toolName: "PPTX to simplified PDF",
    whatIs: "Extract supported text and PNG/JPEG images from PPTX into a simplified PDF. This is not a faithful PowerPoint renderer: slide layout, fonts, charts, shapes, animations and some content are not preserved. Legacy PPT is unsupported.",
    howToUse: ["Save legacy PPT as PPTX first.", "Choose a PPTX up to 25 MB.", "Convert and inspect every output page before sharing."],
    features: ["Local text and PNG/JPEG extraction", "Clear errors for unreadable presentations", "Simplified PDF output"],
    safetyNote: "Keep the original. Complex slides may lose content or formatting. For faithful output use PowerPoint's Export to PDF. The conversion operation does not upload the document.",
    faqs: [{question: "Is original layout preserved?", answer: "No. This tool extracts supported content into a simplified layout. Use PowerPoint export for faithful slides."}, {question: "Can I use legacy PPT?", answer: "No. Save as PPTX first. Invalid or unsupported presentations do not produce a placeholder PDF."}]
  };

  return (
    <>
      <CanonicalHead 
        title="PowerPoint to PDF Converter Free Online | VexaTool"
        description="Extract supported PPTX text and images into a simplified PDF. Original layout is not preserved; legacy PPT is unsupported."
        keywords="PowerPoint to PDF, PPT to PDF, PPTX to PDF, convert presentation, free PPT converter"
      />
      <ToolLayout
        title="PowerPoint to PDF"
        description="PPTX to simplified PDF — original layout is not preserved"
        icon={Presentation}
        colorClass="bg-orange-600"
      >
      <div className="max-w-2xl mx-auto space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Extract supported text and PNG/JPEG images into a simplified PDF. Layout, charts, shapes and some content are not preserved. Use PowerPoint Export for a faithful copy.
          </AlertDescription>
        </Alert>

        <div 
          className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => { if (!isProcessing) fileInputRef.current?.click(); }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pptx"
            onChange={handleFileChange}
            className="hidden"
            id="ppt-upload"
          />
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
            {isConverted ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : file ? (
              <Presentation className="w-8 h-8 text-orange-500" />
            ) : (
              <Upload className="w-8 h-8 text-orange-500" />
            )}
          </div>
          <p className="text-lg font-medium text-foreground mb-2">
            {file ? file.name : "Click or drag to select PowerPoint file"}
          </p>
          <p className="text-sm text-muted-foreground">
            PPTX only · Up to 25 MB · Legacy PPT unsupported
          </p>
        </div>

        {file && (
          <div className="text-center space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-foreground">
                <FileText className="w-5 h-5 text-orange-600" />
                <span className="font-medium">{file.name}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Size: {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            
            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground">Converting... {progress}%</p>
              </div>
            )}
            
            <Button
              size="lg"
              onClick={handleConvert}
              disabled={isProcessing}
              className="gap-2 bg-orange-600 hover:bg-orange-700"
            >
              {isProcessing ? "Converting..." : isConverted ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Convert Again
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Convert to PDF
                </>
              )}
            </Button>
          </div>
        )}

        <div className="bg-muted/30 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm">✓</span>
            How It Works
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground ml-8">
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">•</span>
              <span>Upload your PowerPoint file (.pptx only)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">•</span>
              <span>The tool extracts text AND images from each slide</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">•</span>
              <span>Images are embedded directly into the PDF</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">•</span>
              <span>A simplified PDF is generated; inspect every page before sharing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">•</span>
              <span>Download starts automatically when ready</span>
            </li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-green-700 dark:text-green-400">Local conversion</h3>
          <p className="text-sm text-muted-foreground">
            This conversion operation reads the document locally and does not upload it to a server.
          </p>
        </div>
      </div>
      <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
};

export default PPTToPDF;
