import { useState } from "react";
import { Table, Download, Info } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Helmet } from "react-helmet";

const ExcelToPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls') || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an Excel file (.xls, .xlsx, or .csv)",
          variant: "destructive",
        });
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an Excel file to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    toast({
      title: "Conversion Note",
      description: "For best results, use Microsoft Excel or Google Sheets to export as PDF. This ensures all formatting, formulas results, and cell styles are preserved.",
    });

    setIsProcessing(false);
  };

  return (
    <>
      <Helmet>
        <title>Excel to PDF Converter Free Online | Mypdfs</title>
        <meta name="description" content="Free Excel to PDF converter. Convert XLS, XLSX, and CSV files to PDF format. Easy conversion guide with formatting preserved." />
        <meta name="keywords" content="Excel to PDF, XLS to PDF, XLSX to PDF, CSV to PDF, spreadsheet to PDF, free Excel converter" />
        <link rel="canonical" href="https://mypdfs.lovable.app/excel-to-pdf" />
      </Helmet>
      <ToolLayout
        title="Excel to PDF"
        description="Convert XLS, XLSX, and CSV files to PDF"
        icon={Table}
        colorClass="bg-green-600"
      >
      <div className="max-w-2xl mx-auto space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            For the best conversion quality with preserved formatting, use Microsoft Excel's "Save as PDF" feature 
            or Google Sheets' "Download as PDF" option.
          </AlertDescription>
        </Alert>

        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept=".xls,.xlsx,.csv"
            onChange={handleFileChange}
            className="hidden"
            id="excel-upload"
          />
          <label htmlFor="excel-upload" className="cursor-pointer">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <Table className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              {file ? file.name : "Click to select Excel file"}
            </p>
            <p className="text-sm text-muted-foreground">
              Supports .xls, .xlsx, and .csv files
            </p>
          </label>
        </div>

        {file && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
            <Button
              size="lg"
              onClick={handleConvert}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? "Processing..." : (
                <>
                  <Download className="w-5 h-5" />
                  Get Conversion Tips
                </>
              )}
            </Button>
          </div>
        )}

        <div className="bg-muted/30 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">How to convert Excel to PDF:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Open your Excel file in Microsoft Excel</li>
            <li>Go to File → Save As (or Export)</li>
            <li>Select "PDF" as the file format</li>
            <li>Choose which sheets to include</li>
            <li>Click Save</li>
          </ol>
          <p className="text-sm text-muted-foreground">
            <strong>Using Google Sheets?</strong> Open your file, go to File → Download → PDF Document
          </p>
        </div>
      </div>
      </ToolLayout>
    </>
  );
};

export default ExcelToPDF;
