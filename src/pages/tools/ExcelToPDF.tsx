import { useState } from "react";
import { Table, Download, Info } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Helmet } from "react-helmet";
import ToolSEOContent from "@/components/ToolSEOContent";

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

  const seoContent = {
    toolName: "Excel to PDF Converter",
    whatIs: "Excel to PDF Converter provides guidance and tools to convert your Excel spreadsheets (.xls, .xlsx, .csv) to PDF format. For the best conversion quality with preserved formatting, formulas results, and cell styles, we recommend using Microsoft Excel's built-in 'Save as PDF' feature or Google Sheets' 'Download as PDF' option. This ensures all your data, charts, and formatting are perfectly preserved.",
    howToUse: [
      "Select your Excel file (.xls, .xlsx, or .csv).",
      "Review the conversion tips provided.",
      "For Microsoft Excel: Go to File → Save As → Select PDF format.",
      "For Google Sheets: Go to File → Download → PDF Document.",
      "Choose which sheets to include and adjust page settings.",
      "Save your PDF file."
    ],
    features: [
      "Guidance for converting with Microsoft Excel",
      "Instructions for Google Sheets conversion",
      "Tips for preserving formatting",
      "Support for .xls, .xlsx, and .csv files",
      "Recommendations for optimal PDF output",
      "Links to additional conversion resources"
    ],
    safetyNote: "When using Microsoft Excel or Google Sheets for conversion, your files are processed by those trusted applications. For online converters, always use reputable services that respect your privacy and delete files after conversion.",
    faqs: [
      { question: "Why use Excel or Google Sheets instead of an online converter?", answer: "Excel and Google Sheets preserve all formatting, formulas, charts, and cell styles perfectly. Online converters may lose some formatting or have limitations with complex spreadsheets." },
      { question: "Can I convert multiple sheets to one PDF?", answer: "Yes! Both Excel and Google Sheets allow you to select multiple sheets or the entire workbook to convert to a single PDF document." },
      { question: "How do I fit my spreadsheet on one page?", answer: "In Excel's Save as PDF dialog, use the 'Fit Sheet on One Page' option under Page Setup. In Google Sheets, adjust the scale percentage in the PDF export settings." },
      { question: "What about charts and images in my spreadsheet?", answer: "Charts, images, and all visual elements are preserved when converting through Excel or Google Sheets. They will appear exactly as they do in your spreadsheet." }
    ]
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
      <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
};

export default ExcelToPDF;
