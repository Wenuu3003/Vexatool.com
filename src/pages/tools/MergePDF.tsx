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
        title="Merge PDF Files Online Free - Combine PDFs | Mypdfs"
        description="Free online PDF merger. Combine multiple PDF files into one document. Easy to use, no registration required."
        keywords="merge PDF, combine PDF, join PDF files, PDF merger, free PDF combine, online PDF merger"
      />
      <ToolLayout
        title="Merge PDF"
        description="Combine multiple PDF files into one document"
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
        whatIs="PDF merging is the process of combining multiple PDF documents into a single unified file. Whether you are a student compiling research papers, a business professional consolidating reports, or anyone who needs to organize scattered documents, merging PDFs saves you time and simplifies document management. Our free online PDF merger at MyPDFs allows you to combine up to 20 PDF files quickly and securely, maintaining the original quality, formatting, bookmarks, and interactive elements from every source file. The entire process happens directly in your browser — your documents are never uploaded to any external server, ensuring complete privacy for sensitive materials like contracts, financial statements, and personal records."
        howToUse={[
          "Click the upload area or drag and drop multiple PDF files you want to merge.",
          "Review the file list and arrange them in your preferred order if needed.",
          "Click the 'Merge & Download' button to combine all selected PDFs into one document.",
          "Your merged PDF will download automatically — ready to share, print, or archive.",
          "For additional organization, use our Split PDF or Organize PDF tools on the merged result."
        ]}
        features={[
          "Combine up to 20 PDF files in a single operation with no quality loss.",
          "Maintains original quality, formatting, fonts, and page layouts from every source file.",
          "Preserves bookmarks, hyperlinks, annotations, and interactive form fields across merged documents.",
          "Fast browser-based processing — no file uploads to external servers for maximum privacy.",
          "No file size limits for individual documents — handle large reports and presentations.",
          "Drag-and-drop file ordering lets you control the exact sequence of pages.",
          "Works on desktop, tablet, and mobile devices with any modern browser.",
          "Free to use with no registration, no daily limits, and no watermarks on output."
        ]}
        safetyNote="All PDF processing occurs directly in your browser using secure client-side JavaScript technology. Your documents are never uploaded to external servers, ensuring complete privacy and data security for sensitive materials. Once merging is complete, files are immediately available for download without being stored anywhere. We do not access, read, or retain any content from your documents."
        faqs={[
          {
            question: "How many PDF files can I merge at once?",
            answer: "You can merge up to 20 PDF files in a single operation. For larger batches, simply merge files in groups and then combine the resulting PDFs in a second pass."
          },
          {
            question: "Will the merged PDF maintain the original formatting?",
            answer: "Yes, our merger preserves all original formatting, fonts, images, and layouts from each source PDF. The final document looks exactly like the originals combined sequentially."
          },
          {
            question: "Can I change the order of pages in the merged PDF?",
            answer: "You can arrange the order of files before merging. For more detailed page-level organization after merging, use our Organize PDF tool."
          },
          {
            question: "Is there a maximum file size for merging?",
            answer: "There is no strict limit, but browser memory constraints may affect very large files. For best results, we recommend individual files under 50MB each."
          },
          {
            question: "Can I merge PDFs on my phone or tablet?",
            answer: "Absolutely! MyPDFs is fully responsive and works perfectly on smartphones and tablets. Just open the tool in your mobile browser, select files, and merge."
          },
          {
            question: "Do I need to create an account to merge PDFs?",
            answer: "No, you do not need any account, registration, or login. Simply visit the page, upload your files, and download the merged result — completely free."
          },
          {
            question: "Will there be a watermark on the merged PDF?",
            answer: "No. Unlike many other online PDF tools, MyPDFs never adds watermarks, branding, or any modifications to your merged document."
          },
          {
            question: "Are my files safe during the merge process?",
            answer: "Yes. All processing happens locally in your browser. Your files are never sent to any server, making this one of the most private PDF merge tools available online."
          },
          {
            question: "Can I merge password-protected PDFs?",
            answer: "Password-protected PDFs need to be unlocked first. Use our Unlock PDF tool to remove protection, then merge the unlocked files."
          },
          {
            question: "What if the merge process fails or freezes?",
            answer: "If merging fails, try refreshing the page and re-uploading the files. Ensure the PDFs are not corrupted. Very large or complex files may take longer to process depending on your device's capabilities."
          }
        ]}
      />
      </ToolLayout>
    </>
  );
};

export default MergePDF;
