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

import { useEffect } from "react";
import hammerCursorImage from "./assets/hammer_cursor.png";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const cursor = document.getElementById("custom-cursor");
    
    const handleMouseMove = (e: MouseEvent) => {
      if (cursor) {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (
        target.closest("button") || 
        target.closest("a") || 
        target.closest("select") || 
        target.closest("option") || 
        target.closest("input") || 
        target.closest("textarea") || 
        target.closest(".cursor-pointer") || 
        target.closest('[role="button"]') ||
        target.closest('[role="option"]') ||
        target.closest('[role="combobox"]') ||
        target.closest('[role="menuitem"]') ||
        target.closest('[role="tab"]')
      )) {
        cursor?.classList.add("cursor-hover");
      } else {
        cursor?.classList.remove("cursor-hover");
      }
    };

    const handleMouseDown = () => {
      cursor?.classList.add("cursor-clicking");
    };

    const handleMouseUp = () => {
      cursor?.classList.remove("cursor-clicking");
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
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

        {/* Floating Custom hardware-accelerated Gavel Cursor */}
        <div 
          id="custom-cursor" 
          className="hidden md:block pointer-events-none fixed w-16 h-16 z-[9999] -translate-x-1/4 -translate-y-1/4 transition-transform duration-200 ease-out"
          style={{
            backgroundImage: `url(${hammerCursorImage})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
