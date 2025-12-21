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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
