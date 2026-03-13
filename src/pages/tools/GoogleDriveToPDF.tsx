import { useState } from "react";
import { Cloud, Download, FileText, Link, AlertCircle, ExternalLink, Shield, CheckCircle } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";

const GoogleDriveToPDF = () => {
  const [driveLink, setDriveLink] = useState("");
  const [fileId, setFileId] = useState<string | null>(null);

  const extractFileId = (url: string): string | null => {
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /\/d\/([a-zA-Z0-9_-]+)/,
      /^([a-zA-Z0-9_-]{25,})$/,
    ];
    for (const pattern of patterns) {
      const match = url.trim().match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleProcess = () => {
    if (!driveLink.trim()) {
      toast({ title: "No link provided", description: "Please paste a Google Drive link.", variant: "destructive" });
      return;
    }
    const id = extractFileId(driveLink);
    if (!id) {
      toast({ title: "Invalid Link", description: "Could not extract a file ID from that link. Make sure you paste the full Google Drive URL.", variant: "destructive" });
      return;
    }
    setFileId(id);
    toast({ title: "Link Ready", description: "Select the correct file type below and click to download as PDF." });
  };

  const downloadPDF = (type: 'doc' | 'sheet' | 'slide' | 'file') => {
    if (!fileId) return;
    const urls: Record<string, string> = {
      doc: `https://docs.google.com/document/d/${fileId}/export?format=pdf`,
      sheet: `https://docs.google.com/spreadsheets/d/${fileId}/export?format=pdf`,
      slide: `https://docs.google.com/presentation/d/${fileId}/export/pdf`,
      file: `https://drive.google.com/uc?export=download&id=${fileId}`,
    };
    window.open(urls[type], '_blank');
    toast({ title: "Download Started", description: "Your PDF export should begin in a new tab. Make sure the file is publicly shared." });
  };

  const seoContent = {
    toolName: "Google Drive to PDF Converter",
    whatIs: "Google Drive to PDF Converter helps you export Google Docs, Sheets, and Slides as PDF documents using Google's own export URLs. Simply paste the sharing link of your publicly shared file, select the correct file type, and click to download the PDF export. This tool works by constructing the correct Google export URL for your file — the actual export happens through Google's servers, ensuring full fidelity of your document. No files are processed or stored on our servers.",
    howToUse: [
      "Copy the sharing link of your Google Drive file (make sure it's set to 'Anyone with the link can view').",
      "Paste the link in the input field above.",
      "Click 'Process Link' to extract the file ID.",
      "Select the correct file type (Google Doc, Sheet, Slides, or Other File).",
      "Your browser will open Google's PDF export URL and the download will begin."
    ],
    features: [
      "Supports Google Docs, Sheets, Slides, and other Drive files",
      "Uses Google's native export for full document fidelity",
      "No file upload or server processing — links open directly",
      "Works with any publicly shared Google Drive file",
      "Handles multiple Google Drive URL formats automatically",
      "Free with no registration required"
    ],
    safetyNote: "This tool does not download, process, or store your files. It simply constructs the correct Google export URL based on your file's sharing link. The actual PDF export is handled entirely by Google's servers. Your files remain secure in your Google Drive account.",
    faqs: [
      { question: "Why does my download fail?", answer: "The file must be publicly shared with 'Anyone with the link can view' permission. If it's restricted, Google will block the export. Also make sure you select the correct file type (Doc, Sheet, or Slides)." },
      { question: "Does this tool access my Google account?", answer: "No. This tool does not connect to your Google account at all. It simply opens the standard Google export URL in your browser. Google handles the authentication and download." },
      { question: "Can I convert private files?", answer: "The file needs to be publicly accessible via link for the export URL to work. If you're logged into Google in the same browser, some restricted files may still work." },
      { question: "Why are there different file type buttons?", answer: "Google uses different export URL patterns for Docs, Sheets, and Slides. Selecting the correct type ensures the export URL works properly." }
    ]
  };

  return (
    <>
      <CanonicalHead
        title="Google Drive to PDF Converter Free | VexaTool"
        description="Export Google Docs, Sheets, and Slides to PDF format. Free Google Drive to PDF converter using native Google export."
        keywords="Google Drive to PDF, Google Docs to PDF, Google Sheets to PDF, Google Slides to PDF"
      />
      <ToolLayout
        title="Google Drive to PDF"
        description="Export Google Drive files to PDF using Google's native export"
        icon={Cloud}
        colorClass="bg-green-500"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="drive-link">Google Drive Sharing Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="drive-link"
                    placeholder="https://docs.google.com/document/d/... or Google Drive file link"
                    value={driveLink}
                    onChange={(e) => { setDriveLink(e.target.value); setFileId(null); }}
                    className="flex-1"
                  />
                  <Button onClick={handleProcess} disabled={!driveLink.trim()}>
                    <Link className="w-4 h-4 mr-2" />
                    Process Link
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Important:</strong> The file must be publicly shared ("Anyone with the link can view") for the export to work. This tool opens Google's own export URL — no files are processed on our servers.
                </div>
              </div>
            </CardContent>
          </Card>

          {fileId && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  File ID Detected
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select the type of your Google file to download as PDF:
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { type: 'doc' as const, label: 'Google Doc', icon: FileText },
                    { type: 'sheet' as const, label: 'Google Sheet', icon: FileText },
                    { type: 'slide' as const, label: 'Google Slides', icon: FileText },
                    { type: 'file' as const, label: 'Other File', icon: Download },
                  ].map(({ type, label, icon: Icon }) => (
                    <Button
                      key={type}
                      variant="outline"
                      onClick={() => downloadPDF(type)}
                      className="flex flex-col gap-1 h-auto py-4"
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs">{label}</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="bg-green-50/50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">How It Works</h4>
                <p className="text-sm text-muted-foreground">
                  This tool constructs Google's native PDF export URL for your file. When you click a download button, your browser opens the export link directly — no files pass through our servers. The PDF is generated by Google and downloaded straight to your device.
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Supported Files</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Google Docs → PDF (full formatting preserved)</li>
                <li>• Google Sheets → PDF (all sheets included)</li>
                <li>• Google Slides → PDF (one slide per page)</li>
                <li>• Other publicly shared files → Direct download</li>
              </ul>
            </CardContent>
          </Card>

          <ToolSEOContent {...seoContent} />
        </div>
      </ToolLayout>
    </>
  );
};

export default GoogleDriveToPDF;
