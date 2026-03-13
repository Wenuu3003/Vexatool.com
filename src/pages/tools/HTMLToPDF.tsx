import { useState } from "react";
import { Code, Download, Loader2, Eye } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import DOMPurify from "dompurify";
import jsPDF from "jspdf";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";

const HTMLToPDF = () => {
  const [html, setHtml] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleConvert = async () => {
    if (!html.trim()) {
      toast({
        title: "No HTML content",
        description: "Please enter HTML content to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);

    try {
      // Create a hidden container to render sanitized HTML
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.width = "800px";
      container.style.fontFamily = "Arial, sans-serif";
      container.style.fontSize = "14px";
      container.style.lineHeight = "1.6";
      container.style.color = "#000";
      container.style.padding = "20px";

      const sanitizedHtml = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','div','span','br','strong','em','u','ul','ol','li','table','tr','td','th','thead','tbody','a','img','blockquote','pre','code','hr','b','i','sub','sup','dl','dt','dd','figure','figcaption','section','article','header','footer','nav','main','aside'],
        ALLOWED_ATTR: ['class','id','style','href','src','alt','title','width','height','colspan','rowspan']
      });

      container.innerHTML = sanitizedHtml;
      document.body.appendChild(container);

      setProgress(30);

      // Extract text content from the rendered HTML for PDF generation
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const maxWidth = pageWidth - margin * 2;
      const lineHeight = 6;
      let cursorY = margin;

      const addNewPageIfNeeded = () => {
        if (cursorY > pageHeight - margin - 10) {
          pdf.addPage();
          cursorY = margin;
        }
      };

      // Walk through child elements and render text to PDF
      const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = (node.textContent || "").trim();
          if (!text) return;

          const lines = pdf.splitTextToSize(text, maxWidth);
          for (const line of lines) {
            addNewPageIfNeeded();
            pdf.text(line, margin, cursorY);
            cursorY += lineHeight;
          }
          return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();

        // Handle headings
        if (/^h[1-6]$/.test(tag)) {
          const level = parseInt(tag[1]);
          const sizes: Record<number, number> = { 1: 22, 2: 18, 3: 15, 4: 13, 5: 12, 6: 11 };
          cursorY += 4;
          addNewPageIfNeeded();
          pdf.setFontSize(sizes[level] || 12);
          pdf.setFont("helvetica", "bold");
          const headingLines = pdf.splitTextToSize(el.textContent || "", maxWidth);
          for (const line of headingLines) {
            addNewPageIfNeeded();
            pdf.text(line, margin, cursorY);
            cursorY += lineHeight + 1;
          }
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "normal");
          cursorY += 2;
          return;
        }

        // Handle list items
        if (tag === "li") {
          addNewPageIfNeeded();
          const text = el.textContent || "";
          const bullet = el.parentElement?.tagName.toLowerCase() === "ol" 
            ? `${Array.from(el.parentElement.children).indexOf(el) + 1}. ` 
            : "• ";
          const lines = pdf.splitTextToSize(bullet + text, maxWidth - 5);
          for (const line of lines) {
            addNewPageIfNeeded();
            pdf.text(line, margin + 5, cursorY);
            cursorY += lineHeight;
          }
          return;
        }

        // Handle HR
        if (tag === "hr") {
          cursorY += 3;
          addNewPageIfNeeded();
          pdf.setDrawColor(200, 200, 200);
          pdf.line(margin, cursorY, pageWidth - margin, cursorY);
          cursorY += 5;
          return;
        }

        // Handle block elements with spacing
        const isBlock = ["p", "div", "blockquote", "pre", "section", "article", "figure"].includes(tag);
        if (isBlock) cursorY += 2;

        // Bold/italic
        if (["strong", "b"].includes(tag)) {
          pdf.setFont("helvetica", "bold");
        }
        if (["em", "i"].includes(tag)) {
          pdf.setFont("helvetica", "italic");
        }

        // Process children
        for (const child of Array.from(el.childNodes)) {
          processNode(child);
        }

        // Reset font after bold/italic
        if (["strong", "b", "em", "i"].includes(tag)) {
          pdf.setFont("helvetica", "normal");
        }

        // Handle BR
        if (tag === "br") {
          cursorY += lineHeight;
        }

        if (isBlock) cursorY += 2;
      };

      setProgress(50);

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");

      for (const child of Array.from(container.childNodes)) {
        processNode(child);
      }

      document.body.removeChild(container);

      setProgress(90);

      // Download the PDF
      pdf.save("converted-document.pdf");

      setProgress(100);

      toast({
        title: "PDF Generated!",
        description: "Your HTML has been converted and downloaded as a PDF file.",
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Convert error:", error);
      }
      toast({
        title: "Conversion Error",
        description: "Failed to convert HTML to PDF. Please check your HTML and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const seoContent = {
    toolName: "HTML to PDF Converter",
    whatIs: "HTML to PDF Converter is a free online tool that transforms HTML code into downloadable PDF documents. Whether you are a developer wanting to convert web content to PDF, or you have HTML templates that need to be shared as documents, this tool provides instant conversion. It sanitizes your HTML for security while preserving the structure and formatting of your content, then generates a real PDF file that downloads directly — no print dialog needed.",
    howToUse: [
      "Enter or paste your HTML code in the text area.",
      "View the live preview of your HTML content below the editor.",
      "Click 'Convert to PDF' to generate and download the PDF.",
      "The PDF file downloads automatically to your device.",
      "Open the PDF in any PDF reader to verify the output."
    ],
    features: [
      "Direct PDF download — no print dialog required",
      "Live preview of HTML content before conversion",
      "Secure HTML sanitization to prevent XSS attacks",
      "Supports headings, paragraphs, lists, tables, and more",
      "Automatic pagination for long content",
      "Proper formatting with bold, italic, and list support",
      "No file uploads required — 100% browser-based"
    ],
    safetyNote: "Your HTML code is processed entirely in your browser and is sanitized using DOMPurify to remove any potentially harmful scripts or elements. No data is sent to any server, ensuring complete privacy and security for your content.",
    faqs: [
      { question: "Does it generate a real PDF file?", answer: "Yes! The tool generates a genuine PDF document that downloads directly to your device. No print dialog is involved — you get a proper .pdf file." },
      { question: "What HTML elements are supported?", answer: "Common elements like headings (h1-h6), paragraphs, divs, spans, lists, tables, links, images, and semantic HTML5 elements are supported. JavaScript is not executed for security." },
      { question: "Can I include CSS styles?", answer: "Inline CSS styles are preserved in the preview. The PDF output renders the text content with proper heading sizes, bold, italic, and list formatting." },
      { question: "Why are some elements removed?", answer: "For security, the tool sanitizes HTML to prevent cross-site scripting (XSS) attacks. Script tags, event handlers, and potentially dangerous elements are removed while keeping your content structure intact." },
      { question: "Is there a content length limit?", answer: "There is no hard limit. Long content automatically flows across multiple pages in the generated PDF. Very large documents may take a moment to process." }
    ]
  };

  return (
    <>
      <CanonicalHead
        title="HTML to PDF Converter Free Online | VexaTool"
        description="Free online HTML to PDF converter. Convert HTML code to downloadable PDF documents instantly. No print dialog needed."
        keywords="HTML to PDF, convert HTML, web to PDF, code to PDF, free HTML converter"
      />
      <ToolLayout
        title="HTML to PDF"
        description="Convert HTML code to downloadable PDF documents"
        icon={Code}
        colorClass="bg-orange-500"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <Label htmlFor="html-content">Enter HTML Content</Label>
            <Textarea
              id="html-content"
              placeholder="<h1>Hello World</h1><p>Enter your HTML here...</p>"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          {html.trim() && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/30">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </h3>
                <div
                  className="bg-white text-black p-4 rounded border min-h-[200px]"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(html, {
                      ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','div','span','br','strong','em','u','ul','ol','li','table','tr','td','th','thead','tbody','a','img','blockquote','pre','code','hr','b','i','sub','sup','dl','dt','dd','figure','figcaption','section','article','header','footer','nav','main','aside'],
                      ALLOWED_ATTR: ['class','id','style','href','src','alt','title','width','height','colspan','rowspan']
                    })
                  }}
                />
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    {progress < 30 ? "Preparing content..." : progress < 60 ? "Generating PDF..." : "Finalizing..."}
                  </p>
                </div>
              )}

              <div className="text-center">
                <Button
                  size="lg"
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Convert to PDF
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Downloads a real PDF file directly — no print dialog
                </p>
              </div>
            </div>
          )}
        </div>
        <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
};

export default HTMLToPDF;
