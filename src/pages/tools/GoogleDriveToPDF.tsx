import { useState } from "react";
import { Cloud, Download, FileText, Link, AlertCircle } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { CanonicalHead } from "@/components/CanonicalHead";

const GoogleDriveToPDF = () => {
  const [driveLink, setDriveLink] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileInfo, setFileInfo] = useState<{ name: string; type: string } | null>(null);

  const extractFileId = (url: string): string | null => {
    // Handle various Google Drive URL formats
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /\/d\/([a-zA-Z0-9_-]+)/,
      /^([a-zA-Z0-9_-]{25,})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleConvert = async () => {
    if (!driveLink.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Google Drive link.",
        variant: "destructive",
      });
      return;
    }

    const fileId = extractFileId(driveLink);
    if (!fileId) {
      toast({
        title: "Invalid Link",
        description: "Could not extract file ID from the provided link.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Direct download URL for publicly shared files
      const exportUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      
      // For Google Docs, Sheets, Slides - use export URLs
      const docExportUrl = `https://docs.google.com/document/d/${fileId}/export?format=pdf`;
      const sheetExportUrl = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=pdf`;
      const slideExportUrl = `https://docs.google.com/presentation/d/${fileId}/export/pdf`;

      // Create download links
      setFileInfo({ name: `document_${fileId.slice(0, 8)}`, type: "PDF" });

      toast({
        title: "Ready to Download",
        description: "Click the download button to get your PDF. Make sure the file is publicly shared.",
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Conversion error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to process the file. Make sure it's publicly shared.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = (type: 'doc' | 'sheet' | 'slide' | 'file') => {
    const fileId = extractFileId(driveLink);
    if (!fileId) return;

    let url: string;
    switch (type) {
      case 'doc':
        url = `https://docs.google.com/document/d/${fileId}/export?format=pdf`;
        break;
      case 'sheet':
        url = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=pdf`;
        break;
      case 'slide':
        url = `https://docs.google.com/presentation/d/${fileId}/export/pdf`;
        break;
      default:
        url = `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    window.open(url, '_blank');
    
    toast({
      title: "Download Started",
      description: "Your PDF download should begin shortly.",
    });
  };

  return (
    <>
      <CanonicalHead 
        title="Google Drive to PDF Converter Free | Mypdfs"
        description="Convert Google Drive files to PDF. Export Google Docs, Sheets, and Slides to PDF format easily."
        keywords="Google Drive to PDF, Google Docs to PDF, Google Sheets to PDF, Google Slides to PDF"
      />
      <ToolLayout
        title="Google Drive to PDF"
        description="Convert Google Drive files to PDF format"
        icon={Cloud}
        colorClass="bg-green-500"
      >
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="drive-link">Google Drive Link</Label>
              <div className="flex gap-2">
                <Input
                  id="drive-link"
                  placeholder="Paste your Google Drive file link here..."
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleConvert}
                  disabled={isProcessing || !driveLink.trim()}
                >
                  <Link className="w-4 h-4 mr-2" />
                  {isProcessing ? "Processing..." : "Process"}
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Important:</strong> The file must be publicly shared ("Anyone with the link can view") for this to work.
              </div>
            </div>
          </CardContent>
        </Card>

        {fileInfo && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Select File Type & Download
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose the correct file type for your Google Drive file:
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => downloadPDF('doc')}
                  className="flex flex-col gap-1 h-auto py-4"
                >
                  <FileText className="w-6 h-6" />
                  <span className="text-xs">Google Doc</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => downloadPDF('sheet')}
                  className="flex flex-col gap-1 h-auto py-4"
                >
                  <FileText className="w-6 h-6" />
                  <span className="text-xs">Google Sheet</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => downloadPDF('slide')}
                  className="flex flex-col gap-1 h-auto py-4"
                >
                  <FileText className="w-6 h-6" />
                  <span className="text-xs">Google Slides</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => downloadPDF('file')}
                  className="flex flex-col gap-1 h-auto py-4"
                >
                  <Download className="w-6 h-6" />
                  <span className="text-xs">Other File</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Supported Files</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Google Docs → PDF</li>
              <li>• Google Sheets → PDF</li>
              <li>• Google Slides → PDF</li>
              <li>• Any publicly shared file</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      </ToolLayout>
    </>
  );
};

export default GoogleDriveToPDF;
