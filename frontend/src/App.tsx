import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LegalResearch from "./pages/LegalResearch";
import ContractAnalyzer from "./pages/ContractAnalyzer";
import FormAssistance from "./pages/FormAssistance";
import DocumentComparator from "./pages/DocumentComparator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/legal-research" element={<LegalResearch />} />
          <Route path="/contract-analyzer" element={<ContractAnalyzer />} />
          <Route path="/form-assistance" element={<FormAssistance />} />
          <Route path="/document-comparator" element={<DocumentComparator />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
