import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ChatInterface from "@/components/ChatInterface";
import ToolsSection from "@/components/ToolsSection";
import HowItWorks from "@/components/HowItWorks";
import LegalNews from "@/components/LegalNews";
import PrivacySettings from "@/components/PrivacySettings";
import ConnectionStatus from "@/components/ConnectionStatus";
import Footer from "@/components/Footer";

const Index = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  return (
    <div className="min-h-screen">
      <Header 
        onLanguageChange={setCurrentLanguage}
        currentLanguage={currentLanguage}
      />
      <main>
        <Hero />
        <ChatInterface />
        <ToolsSection />
        <HowItWorks />
        <LegalNews />
        <PrivacySettings />
      </main>
      <Footer />
      <ConnectionStatus />
    </div>
  );
};

export default Index;
