import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Menu, 
  X, 
  Globe, 
  User, 
  LogIn, 
  UserPlus, 
  Home, 
  MessageSquare, 
  FileText, 
  Newspaper,
  Info,
  Settings
} from "lucide-react";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { getTranslation } from "@/lib/translations";

interface HeaderProps {
  onLanguageChange?: (language: string) => void;
  currentLanguage?: string;
}

const Header = ({ onLanguageChange, currentLanguage = 'en' }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Login/Signup form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', name: '' });
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' }
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.login(loginForm);
      if (response.success) {
        toast.success('Login successful!');
        setIsLoginOpen(false);
        setLoginForm({ email: '', password: '' });
        // Store token and user data
        localStorage.setItem('token', response.token || '');
        localStorage.setItem('user', JSON.stringify(response.user));
        // Don't refresh the page, just update the UI
      } else {
        toast.error(response.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupForm.email || !signupForm.password || !signupForm.name) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.register(signupForm);
      if (response.success) {
        toast.success('Account created successfully!');
        setIsSignupOpen(false);
        setSignupForm({ email: '', password: '', name: '' });
        // Don't refresh the page, just update the UI
      } else {
        toast.error(response.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-heading font-bold text-xl text-primary">Law Assistant</span>
          </div>

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
              {getTranslation('documents', currentLanguage)}
            </button>
            <button
              onClick={() => scrollToSection('news')}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Newspaper className="h-4 w-4 mr-1 inline" />
              {getTranslation('news', currentLanguage)}
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Info className="h-4 w-4 mr-1 inline" />
              {getTranslation('about', currentLanguage)}
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

            {/* Login Button (Feature #2) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center space-x-1"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">{getTranslation('login', currentLanguage)}</span>
            </Button>

            {/* Sign Up Button (Feature #3) */}
            <Button
              size="sm"
              onClick={() => setIsSignupOpen(true)}
              className="flex items-center space-x-1"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">{getTranslation('signUp', currentLanguage)}</span>
            </Button>

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
                {getTranslation('documents', currentLanguage)}
              </button>
              <button
                onClick={() => scrollToSection('news')}
                className="text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
              >
                <Newspaper className="h-4 w-4 mr-2 inline" />
                {getTranslation('news', currentLanguage)}
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
              >
                <Info className="h-4 w-4 mr-2 inline" />
                {getTranslation('about', currentLanguage)}
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black/50 overflow-y-auto p-4">
          <div className="absolute inset-0 z-0" onClick={() => setIsLoginOpen(false)}></div>
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative z-10 mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{getTranslation('login', currentLanguage)}</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsLoginOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginForm({ ...loginForm, email: e.target.value })}
              />
              <Input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
              <Button onClick={handleLogin} disabled={isLoading} className="w-full">
                {isLoading ? 'Logging in...' : getTranslation('login', currentLanguage)}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Signup Modal */}
      {isSignupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black/50 overflow-y-auto p-4">
          <div className="absolute inset-0 z-0" onClick={() => setIsSignupOpen(false)}></div>
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative z-10 mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{getTranslation('signUp', currentLanguage)}</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsSignupOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Full Name"
                value={signupForm.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignupForm({ ...signupForm, name: e.target.value })}
              />
              <Input
                type="email"
                placeholder="Email"
                value={signupForm.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignupForm({ ...signupForm, email: e.target.value })}
              />
              <Input
                type="password"
                placeholder="Password"
                value={signupForm.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignupForm({ ...signupForm, password: e.target.value })}
              />
              <Button onClick={handleSignup} disabled={isLoading} className="w-full">
                {isLoading ? 'Creating Account...' : getTranslation('signUp', currentLanguage)}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </header>
  );
};

export default Header;