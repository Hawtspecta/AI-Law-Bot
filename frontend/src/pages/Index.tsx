import { useState, useEffect } from "react";

import Header from "@/components/Header";

import Hero from "@/components/Hero";

import ChatInterface from "@/components/ChatInterface";

import ToolsSection from "@/components/ToolsSection";

import HowItWorks from "@/components/HowItWorks";

import LegalNews from "@/components/LegalNews";

import PrivacySettings from "@/components/PrivacySettings";

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

  // Scroll to hash section on page load (e.g. returning to #tools)
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      // Slight delay to ensure the DOM is fully rendered and styled before scrolling
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    }
  }, []);

  const handleLanguageChange = (language: string) => {

    setCurrentLanguage(language);

    // Update localStorage and trigger re-render without page reload

    localStorage.setItem('selectedLanguage', language);

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

    </div>

  );

};



export default Index;

