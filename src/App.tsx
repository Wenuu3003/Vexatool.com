import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { CookieConsent } from "./components/CookieConsent";
import { AdSenseLoader } from "./components/AdSenseLoader";

// Eagerly load Index for fast initial render
import Index from "./pages/Index";

// Lazy load all other pages for better code splitting
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));

// PDF Tools - lazy loaded
const MergePDF = lazy(() => import("./pages/tools/MergePDF"));
const SplitPDF = lazy(() => import("./pages/tools/SplitPDF"));
const CompressPDF = lazy(() => import("./pages/tools/CompressPDF"));
const ConvertPDF = lazy(() => import("./pages/tools/ConvertPDF"));
const EditPDF = lazy(() => import("./pages/tools/EditPDF"));
const SignPDF = lazy(() => import("./pages/tools/SignPDF"));
const WatermarkPDF = lazy(() => import("./pages/tools/WatermarkPDF"));
const RotatePDF = lazy(() => import("./pages/tools/RotatePDF"));
const UnlockPDF = lazy(() => import("./pages/tools/UnlockPDF"));
const ProtectPDF = lazy(() => import("./pages/tools/ProtectPDF"));
const OrganizePDF = lazy(() => import("./pages/tools/OrganizePDF"));
const RepairPDF = lazy(() => import("./pages/tools/RepairPDF"));
const PDFToImage = lazy(() => import("./pages/tools/PDFToImage"));
const PDFToJPG = lazy(() => import("./pages/tools/PDFToJPG"));
const PDFToPNG = lazy(() => import("./pages/tools/PDFToPNG"));
const PDFToHTML = lazy(() => import("./pages/tools/PDFToHTML"));
const PDFToPowerPoint = lazy(() => import("./pages/tools/PDFToPowerPoint"));
const PDFToExcel = lazy(() => import("./pages/tools/PDFToExcel"));

// Image Tools - lazy loaded
const ImageToPDF = lazy(() => import("./pages/tools/ImageToPDF"));
const JPGToPDF = lazy(() => import("./pages/tools/JPGToPDF"));
const PNGToPDF = lazy(() => import("./pages/tools/PNGToPDF"));
const CompressImage = lazy(() => import("./pages/tools/CompressImage"));
const FileCompressor = lazy(() => import("./pages/tools/FileCompressor"));
const BackgroundRemover = lazy(() => import("./pages/tools/BackgroundRemover"));

// Document Converters - lazy loaded
const WordToPDF = lazy(() => import("./pages/tools/WordToPDF"));
const WordToExcel = lazy(() => import("./pages/tools/WordToExcel"));
const ExcelToWord = lazy(() => import("./pages/tools/ExcelToWord"));
const HTMLToPDF = lazy(() => import("./pages/tools/HTMLToPDF"));
const PPTToPDF = lazy(() => import("./pages/tools/PPTToPDF"));
const ExcelToPDF = lazy(() => import("./pages/tools/ExcelToPDF"));
const GoogleDriveToPDF = lazy(() => import("./pages/tools/GoogleDriveToPDF"));

// Utility Tools - lazy loaded
const QRCodeGenerator = lazy(() => import("./pages/tools/QRCodeGenerator"));
const QRCodeScanner = lazy(() => import("./pages/tools/QRCodeScanner"));
const Calculator = lazy(() => import("./pages/tools/Calculator"));

const CurrencyConverter = lazy(() => import("./pages/tools/CurrencyConverter"));
const SEOTool = lazy(() => import("./pages/tools/SEOTool"));

// AI Tools - lazy loaded
const AIChat = lazy(() => import("./pages/tools/AIChat"));
const AISearch = lazy(() => import("./pages/tools/AISearch"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AdSenseLoader />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/account" element={<Account />} />
              {/* Utility Tools */}
              <Route path="/qr-code-scanner" element={<QRCodeScanner />} />
              <Route path="/qr-code-generator" element={<QRCodeGenerator />} />
              <Route path="/currency-converter" element={<CurrencyConverter />} />
              <Route path="/seo-tool" element={<SEOTool />} />
              
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
              <Route path="/background-remover" element={<BackgroundRemover />} />
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
          </Suspense>
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
