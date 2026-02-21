import { useState } from "react";
import { Layers, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { PDFDocument } from "pdf-lib";
import { toast } from "@/hooks/use-toast";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";

const MergePDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMerge = async () => {
    if (files.length < 2) {
      toast({
        title: "Not enough files",
        description: "Please select at least 2 PDF files to merge.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "merged.pdf";
      link.click();

      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "Your PDFs have been merged successfully.",
      });

      setFiles([]);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Merge error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to merge PDFs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <CanonicalHead 
        title="Merge PDF Online Free – Combine Multiple PDFs Into One | MyPDFs"
        description="Free online PDF merger. Combine multiple PDF files into one document instantly. No signup, no watermarks, 100% secure browser-based processing. Best free PDF merge tool in India."
        keywords="merge PDF online, combine PDF free, join PDF files, PDF merger online, free PDF combine, merge PDF India, combine multiple PDFs, how to merge PDF without software, secure PDF merging, best PDF merger online"
      />
      <ToolLayout
        title="Merge PDF Online Free"
        description="Combine multiple PDF files into one document — fast, free, no signup required"
        icon={Layers}
        colorClass="bg-tool-merge"
      >
      <FileUpload
        files={files}
        onFilesChange={setFiles}
        multiple
        maxFiles={20}
        colorClass="bg-tool-merge"
      />

      {files.length >= 2 && (
        <div className="mt-8 text-center">
          <Button
            size="lg"
            onClick={handleMerge}
            disabled={isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              "Merging..."
            ) : (
              <>
                <Download className="w-5 h-5" />
                Merge & Download
              </>
            )}
          </Button>
        </div>
      )}

      <ToolSEOContent
        toolName="Merge PDF"
        whatIs="PDF merging is the process of combining two or more separate PDF documents into a single, unified file. It's one of the most common document tasks — whether you're a student bundling assignment pages for a college portal, a professional compiling reports for a client presentation, or a job seeker combining your resume, cover letter, and certificates into one clean attachment. The concept is straightforward: your original files remain unchanged in content, but they're stitched together page by page into one downloadable PDF. Our free Merge PDF tool at MyPDFs.in handles this entire process directly inside your web browser. Your files are never uploaded to any external server — the merging happens locally using client-side JavaScript, which means sensitive documents like Aadhaar cards, PAN cards, salary slips, contracts, and medical records stay completely private on your device. There's no registration, no daily usage limit, and no watermark added to your output. You get a clean, professional merged document every single time. Unlike desktop software that requires installation and often costs ₹1,500 or more per month, MyPDFs works on any device with a browser — phones, tablets, laptops, Chromebooks — without downloading anything. Whether you're using a budget smartphone on a 3G connection or a high-end laptop with broadband, the experience is the same: fast, reliable, and completely free."
        howToUse={[
          "Open the Merge PDF tool on MyPDFs.in — no account creation or login needed.",
          "Click the upload area or drag and drop your PDF files. You can add up to 20 files at once.",
          "Review the file list and rearrange them in your preferred order. The merged PDF will follow this exact sequence.",
          "Click the 'Merge & Download' button. Processing happens instantly in your browser.",
          "Your merged PDF downloads automatically — ready to share, email, upload, or print.",
          "Open the merged file to verify all pages, formatting, and images appear correctly."
        ]}
        features={[
          "Combine up to 20 PDF files in a single operation with zero quality loss — fonts, images, hyperlinks, and bookmarks are fully preserved.",
          "100% browser-based processing — your files never leave your device, making this one of the most private PDF merge tools available online.",
          "No file size limits on individual documents — handle large reports, presentations, scanned documents, and image-heavy PDFs without restrictions.",
          "No registration, no login, no email verification — the tool is ready the moment the page loads.",
          "No watermarks, branding, or modifications added to your output — unlike many competitors that stamp their logo on free-tier results.",
          "Works on all devices and browsers — desktop, mobile, tablet. Fully responsive and optimized for slower connections.",
          "Drag-and-drop file ordering lets you control the exact page sequence before merging.",
          "Unlimited daily usage — merge as many times as you need without hitting daily caps or cooldown periods."
        ]}
        safetyNote="Your privacy is our foundational principle. The entire PDF merging process runs locally inside your web browser using secure client-side JavaScript. Your documents are never uploaded to any server, never stored on any cloud, and never accessible to anyone — including us. Once you close the browser tab, all processed data is gone. This approach makes MyPDFs one of the safest options for merging sensitive documents like identification cards, financial statements, legal agreements, and medical records. We follow GDPR-compliant practices and maintain a transparent privacy policy that explains exactly how every tool works."
        faqs={[
          {
            question: "How many PDF files can I merge at once?",
            answer: "You can merge up to 20 PDF files in a single operation. If you have more files, merge them in batches — combine the first 20 into one PDF, then merge that result with the next batch. There's no limit on how many times you can use the tool."
          },
          {
            question: "Will the merged PDF maintain the original formatting?",
            answer: "Yes — completely. Our merger preserves all original formatting, fonts, images, hyperlinks, bookmarks, and page layouts from each source PDF. The final document looks exactly like the originals placed one after another. Nothing is altered, compressed, or degraded."
          },
          {
            question: "Can I change the order of pages in the merged PDF?",
            answer: "You can arrange the order of files before merging, which determines the page sequence. For more detailed page-level reorganization after merging — like moving individual pages or deleting specific pages — use our Organize PDF or Edit PDF tool."
          },
          {
            question: "Is there a maximum file size for merging?",
            answer: "There's no strict file size limit. However, since processing happens in your browser, very large files (over 100 MB each) may take longer depending on your device's memory and processing power. For most everyday documents — reports, forms, certificates — the tool handles them instantly."
          },
          {
            question: "Can I merge PDFs on my phone or tablet?",
            answer: "Absolutely. MyPDFs is fully responsive and works on any smartphone or tablet browser — Chrome, Safari, Firefox, Samsung Internet. Just open the tool, select files from your phone's storage, and merge. No app installation required."
          },
          {
            question: "Do I need to create an account to merge PDFs?",
            answer: "No. You don't need any account, registration, email verification, or login. Visit the page, upload your files, merge, and download. It works the same way every time — completely free and anonymous."
          },
          {
            question: "Will there be a watermark on the merged PDF?",
            answer: "Never. Unlike many other online PDF tools that add watermarks or branding to free-tier output, MyPDFs never modifies your document. The merged PDF is clean and professional — exactly what you'd expect from a premium tool."
          },
          {
            question: "Are my files safe during the merge process?",
            answer: "Yes. All processing happens locally in your web browser using client-side JavaScript. Your files are never sent to any server, never stored anywhere, and never accessible to anyone. This makes MyPDFs one of the most private PDF merge tools available online."
          },
          {
            question: "Can I merge password-protected PDFs?",
            answer: "Password-protected PDFs need to be unlocked before merging. Use our Unlock PDF tool to remove the password protection first, then merge the unlocked files. This ensures the merge process can read all pages correctly."
          },
          {
            question: "What if the merge process fails or seems slow?",
            answer: "If merging fails, try refreshing the page and re-uploading the files. Ensure the PDFs aren't corrupted — you can verify by opening them individually first. Very large or complex files with heavy images may take 10-30 seconds depending on your device. If issues persist, try using a different browser or clearing your browser cache."
          }
        ]}
      />
      </ToolLayout>
    </>
  );
};

export default MergePDF;
