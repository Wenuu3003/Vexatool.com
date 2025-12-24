import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import MergePDF from "./pages/tools/MergePDF";
import SplitPDF from "./pages/tools/SplitPDF";
import CompressPDF from "./pages/tools/CompressPDF";
import ConvertPDF from "./pages/tools/ConvertPDF";
import EditPDF from "./pages/tools/EditPDF";
import SignPDF from "./pages/tools/SignPDF";
import WatermarkPDF from "./pages/tools/WatermarkPDF";
import RotatePDF from "./pages/tools/RotatePDF";
import UnlockPDF from "./pages/tools/UnlockPDF";
import ProtectPDF from "./pages/tools/ProtectPDF";
import OrganizePDF from "./pages/tools/OrganizePDF";
import RepairPDF from "./pages/tools/RepairPDF";
import ImageToPDF from "./pages/tools/ImageToPDF";
import QRCodeGenerator from "./pages/tools/QRCodeGenerator";
import QRCodeScanner from "./pages/tools/QRCodeScanner";
import HTMLToPDF from "./pages/tools/HTMLToPDF";
import PPTToPDF from "./pages/tools/PPTToPDF";
import ExcelToPDF from "./pages/tools/ExcelToPDF";
import PDFToPowerPoint from "./pages/tools/PDFToPowerPoint";
import PDFToExcel from "./pages/tools/PDFToExcel";
import Calculator from "./pages/tools/Calculator";
import TagsGenerator from "./pages/tools/TagsGenerator";
import CurrencyConverter from "./pages/tools/CurrencyConverter";
import SEOTool from "./pages/tools/SEOTool";
import AIChat from "./pages/tools/AIChat";
import GoogleDriveToPDF from "./pages/tools/GoogleDriveToPDF";
import CompressImage from "./pages/tools/CompressImage";
import AISearch from "./pages/tools/AISearch";
import WordToPDF from "./pages/tools/WordToPDF";
import WordToExcel from "./pages/tools/WordToExcel";
import ExcelToWord from "./pages/tools/ExcelToWord";
import PDFToImage from "./pages/tools/PDFToImage";
import JPGToPDF from "./pages/tools/JPGToPDF";
import PDFToJPG from "./pages/tools/PDFToJPG";
import PNGToPDF from "./pages/tools/PNGToPDF";
import PDFToPNG from "./pages/tools/PDFToPNG";
import PDFToHTML from "./pages/tools/PDFToHTML";
import FileCompressor from "./pages/tools/FileCompressor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            {/* Utility Tools */}
            <Route path="/qr-code-scanner" element={<QRCodeScanner />} />
            <Route path="/qr-code-generator" element={<QRCodeGenerator />} />
            <Route path="/currency-converter" element={<CurrencyConverter />} />
            <Route path="/seo-tool" element={<SEOTool />} />
            <Route path="/tags-generator" element={<TagsGenerator />} />
            <Route path="/calculator" element={<Calculator />} />
            {/* AI Tools */}
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/ai-search" element={<AISearch />} />
            {/* PDF Tools */}
            <Route path="/merge-pdf" element={<MergePDF />} />
            <Route path="/split-pdf" element={<SplitPDF />} />
            <Route path="/compress-pdf" element={<CompressPDF />} />
            <Route path="/pdf-to-word" element={<ConvertPDF />} />
            <Route path="/edit-pdf" element={<EditPDF />} />
            <Route path="/sign-pdf" element={<SignPDF />} />
            <Route path="/watermark-pdf" element={<WatermarkPDF />} />
            <Route path="/rotate-pdf" element={<RotatePDF />} />
            <Route path="/unlock-pdf" element={<UnlockPDF />} />
            <Route path="/protect-pdf" element={<ProtectPDF />} />
            <Route path="/organize-pdf" element={<OrganizePDF />} />
            <Route path="/repair-pdf" element={<RepairPDF />} />
            <Route path="/pdf-to-image" element={<PDFToImage />} />
            <Route path="/pdf-to-jpg" element={<PDFToJPG />} />
            <Route path="/pdf-to-png" element={<PDFToPNG />} />
            <Route path="/pdf-to-html" element={<PDFToHTML />} />
            <Route path="/pdf-to-powerpoint" element={<PDFToPowerPoint />} />
            <Route path="/pdf-to-excel" element={<PDFToExcel />} />
            {/* Image Tools */}
            <Route path="/image-to-pdf" element={<ImageToPDF />} />
            <Route path="/jpg-to-pdf" element={<JPGToPDF />} />
            <Route path="/png-to-pdf" element={<PNGToPDF />} />
            <Route path="/compress-image" element={<CompressImage />} />
            <Route path="/file-compressor" element={<FileCompressor />} />
            {/* Document Converters */}
            <Route path="/word-to-pdf" element={<WordToPDF />} />
            <Route path="/word-to-excel" element={<WordToExcel />} />
            <Route path="/excel-to-word" element={<ExcelToWord />} />
            <Route path="/html-to-pdf" element={<HTMLToPDF />} />
            <Route path="/ppt-to-pdf" element={<PPTToPDF />} />
            <Route path="/excel-to-pdf" element={<ExcelToPDF />} />
            <Route path="/google-drive-to-pdf" element={<GoogleDriveToPDF />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
