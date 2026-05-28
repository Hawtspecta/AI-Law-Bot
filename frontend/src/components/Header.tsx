import { useState } from "react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Card } from "@/components/ui/card";

import { 

  Menu, 

  X, 

  Globe, 

  Home, 

  MessageSquare, 

  FileText, 

  Newspaper,

  Info,

  Settings

} from "lucide-react";

import { toast } from "sonner";

import { getTranslation } from "@/lib/translations";

import logoImage from "@/assets/logo.jpg";

import { useNavigate } from "react-router-dom";




interface HeaderProps {

  onLanguageChange?: (language: string) => void;

  currentLanguage?: string;

}



const Header = ({ onLanguageChange, currentLanguage = 'en' }: HeaderProps) => {

  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
  ];



  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  const handleLanguageChange = (language: string) => {

    try {

      // Update language immediately in UI

      onLanguageChange?.(language);

      setIsLanguageOpen(false);

      toast.success('Language changed successfully!');

    } catch (error) {

      console.error('Language change error:', error);

      toast.error('Failed to change language');

    }

  };



  const scrollToSection = (sectionId: string) => {

    const element = document.getElementById(sectionId);

    if (element) {

      element.scrollIntoView({ behavior: 'smooth' });

    }

    setIsMenuOpen(false);

  };



  return (

    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">

      <div className="container mx-auto px-4">

        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <button 
            onClick={() => {
              if (window.location.pathname === "/") {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                navigate("/");
              }
            }}
            className="flex items-center space-x-2 cursor-pointer focus:outline-none hover:opacity-90 transition-opacity"
            aria-label="Law Assistant Home"
          >
            <img
              src={logoImage}
              alt="AI Law Assistant logo"
              className="h-8 w-8 rounded-lg object-cover"
            />
            <span className="font-heading font-bold text-xl text-primary">Law Assistant</span>
          </button>



          {/* Desktop Navigation */}

          <nav className="hidden md:flex items-center space-x-6">

            <button

              onClick={() => scrollToSection('hero')}

              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"

            >

              <Home className="h-4 w-4 mr-1 inline" />

              {getTranslation('home', currentLanguage)}

            </button>

            <button

              onClick={() => scrollToSection('ask-a-question')}

              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"

            >

              <MessageSquare className="h-4 w-4 mr-1 inline" />

              {getTranslation('askQuestion', currentLanguage)}

            </button>

            <button

              onClick={() => scrollToSection('tools')}

              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"

            >

              <FileText className="h-4 w-4 mr-1 inline" />

              Tools

            </button>

            <button

              onClick={() => scrollToSection('news')}

              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"

            >

              <Newspaper className="h-4 w-4 mr-1 inline" />

              {getTranslation('news', currentLanguage)}

            </button>

              <button

                onClick={() => scrollToSection('privacy')}

                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"

              >

                <Info className="h-4 w-4 mr-1 inline" />

                Privacy

              </button>

          </nav>



          {/* Right side controls */}

          <div className="flex items-center space-x-2">

            {/* Language Selector (Feature #1) */}

            <div className="relative">

              <Button

                variant="ghost"

                size="sm"

                onClick={() => setIsLanguageOpen(!isLanguageOpen)}

                className="flex items-center space-x-1"

              >

                <Globe className="h-4 w-4" />

                <span className="text-sm">{currentLang.flag}</span>

              </Button>

              

              {isLanguageOpen && (

                <Card className="absolute right-0 top-full mt-2 w-48 p-2 z-50">

                  {languages.map((lang) => (

                    <button

                      key={lang.code}

                      onClick={() => handleLanguageChange(lang.code)}

                      className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors ${

                        lang.code === currentLanguage ? 'bg-accent' : ''

                      }`}

                    >

                      <span className="mr-2">{lang.flag}</span>

                      {lang.name}

                    </button>

                  ))}

                </Card>

              )}

            </div>

            {/* Mobile menu button */}

            <Button

              variant="ghost"

              size="sm"

              className="md:hidden"

              onClick={() => setIsMenuOpen(!isMenuOpen)}

            >

              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}

            </Button>

          </div>

        </div>



        {/* Mobile Navigation */}

        {isMenuOpen && (

          <div className="md:hidden border-t py-4">

            <nav className="flex flex-col space-y-2">

              <button

                onClick={() => scrollToSection('hero')}

                className="text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors"

              >

                <Home className="h-4 w-4 mr-2 inline" />

                {getTranslation('home', currentLanguage)}

              </button>

              <button

                onClick={() => scrollToSection('ask-a-question')}

                className="text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors"

              >

                <MessageSquare className="h-4 w-4 mr-2 inline" />

                {getTranslation('askQuestion', currentLanguage)}

              </button>

              <button

                onClick={() => scrollToSection('tools')}

                className="text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors"

              >

                <FileText className="h-4 w-4 mr-2 inline" />

                Tools

              </button>

              <button

                onClick={() => scrollToSection('news')}

                className="text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors"

              >

                <Newspaper className="h-4 w-4 mr-2 inline" />

                {getTranslation('news', currentLanguage)}

              </button>

              <button

                onClick={() => scrollToSection('privacy')}

                className="text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors"

              >

                <Info className="h-4 w-4 mr-2 inline" />

                Privacy

              </button>

            </nav>

          </div>

        )}

      </div>

    </header>

  );

};



export default Header;