import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ChatInterface from "@/components/ChatInterface";
import ToolsSection from "@/components/ToolsSection";
import HowItWorks from "@/components/HowItWorks";
import LegalNews from "@/components/LegalNews";
import PrivacySettings from "@/components/PrivacySettings";
import ConnectionStatus from "@/components/ConnectionStatus";
import Footer from "@/components/Footer";
import { getTranslation } from "@/lib/translations";

const Index = () => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') || 'en';
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('selectedLanguage', currentLanguage);
  }, [currentLanguage]);

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    // Force re-render of all components
    window.location.reload();
  };

  return (
    <div className="min-h-screen">
      <Header 
        onLanguageChange={handleLanguageChange}
        currentLanguage={currentLanguage}
      />
      <main>
        <Hero currentLanguage={currentLanguage} />
        <ChatInterface currentLanguage={currentLanguage} />
        <ToolsSection currentLanguage={currentLanguage} />
        <HowItWorks currentLanguage={currentLanguage} />
        <LegalNews currentLanguage={currentLanguage} />
        <PrivacySettings currentLanguage={currentLanguage} />
      </main>
      <Footer currentLanguage={currentLanguage} />
      <ConnectionStatus />
    </div>
  );
};

export default Index;
