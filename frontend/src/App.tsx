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

    const isTextInputTarget = (el: HTMLElement | null): boolean => {
      if (!el) return false;
      const tagName = el.tagName.toUpperCase();
      if (tagName === 'INPUT') {
        const type = (el as HTMLInputElement).type?.toLowerCase() || 'text';
        return !["button", "submit", "image", "checkbox", "radio", "file", "range", "color"].includes(type);
      }
      if (tagName === 'TEXTAREA') return true;
      if (el.isContentEditable) return true;
      
      const closestText = el.closest("input, textarea, [contenteditable='true']");
      if (closestText) {
        if (closestText.tagName.toUpperCase() === 'INPUT') {
          const type = (closestText as HTMLInputElement).type?.toLowerCase() || 'text';
          return !["button", "submit", "image", "checkbox", "radio", "file", "range", "color"].includes(type);
        }
        return true;
      }
      return false;
    };
    
    const handleMouseMove = (e: PointerEvent) => {
      if (cursor) {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;

        const target = e.target as HTMLElement | null;
        if (isTextInputTarget(target)) {
          cursor.classList.add("custom-cursor-hidden");
        } else {
          cursor.classList.remove("custom-cursor-hidden");
        }
      }
    };

    const handleMouseOver = (e: PointerEvent) => {
      // If the mouse is pressed down, we are in a click/drag gesture.
      // Do not change the hover state during an active click/drag gesture to prevent jitter!
      if (e.buttons === 1) {
        return;
      }

      const target = e.target as HTMLElement | null;
      if (!target || !cursor) return;

      if (isTextInputTarget(target)) {
        cursor.classList.add("custom-cursor-hidden");
        cursor.classList.remove("cursor-hover");
        return;
      } else {
        cursor.classList.remove("custom-cursor-hidden");
      }

      const interactive = target.closest(
        "button, a, select, option, input, textarea, .cursor-pointer, [role='button'], [role='option'], [role='combobox'], [role='menuitem'], [role='tab'], [role='slider'], [data-orientation], .touch-none"
      ) as HTMLElement | null;

      if (interactive) {
        // Gavel is bent only when the element is actually clickable (interactive and NOT disabled/readonly)
        const isDisabled = 
          interactive.hasAttribute("disabled") || 
          interactive.getAttribute("aria-disabled") === "true" ||
          interactive.classList.contains("disabled") ||
          interactive.classList.contains("pointer-events-none") ||
          interactive.closest("[disabled]") !== null ||
          interactive.closest(".pointer-events-none") !== null;

        // Standard text inputs/textareas are interactive but not "clickable discs" to bang a gavel on
        const isTextInput = 
          (interactive.tagName === "INPUT" && 
            !["button", "submit", "image", "checkbox", "radio", "file"].includes((interactive as HTMLInputElement).type.toLowerCase())) ||
          interactive.tagName === "TEXTAREA";

        if (!isDisabled && !isTextInput) {
          cursor.classList.add("cursor-hover");
          return;
        }
      }
      cursor.classList.remove("cursor-hover");
    };

    const handleMouseDown = () => {
      cursor?.classList.add("cursor-clicking");
    };

    const handleMouseUp = (e: PointerEvent) => {
      cursor?.classList.remove("cursor-clicking");
      // Trigger a hover check on mouse up to update the gavel rotation immediately
      handleMouseOver(e);
    };

    window.addEventListener("pointermove", handleMouseMove);
    window.addEventListener("pointerover", handleMouseOver);
    window.addEventListener("pointerdown", handleMouseDown);
    window.addEventListener("pointerup", handleMouseUp);

    return () => {
      window.removeEventListener("pointermove", handleMouseMove);
      window.removeEventListener("pointerover", handleMouseOver);
      window.removeEventListener("pointerdown", handleMouseDown);
      window.removeEventListener("pointerup", handleMouseUp);
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
