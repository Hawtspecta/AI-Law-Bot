import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { 
  MessageSquare, 
  ArrowRight, 
  Users, 
  FileText, 
  DollarSign,
  TrendingUp,
  Shield,
  Clock
} from "lucide-react";
import { apiClient, MetricsResponse } from "../services/api";
import { toast } from "sonner";
import { getTranslation } from "../lib/translations";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface HeroProps {
  currentLanguage?: string;
}

const Hero = ({ currentLanguage = 'en' }: HeroProps) => {
  // Removed statistics section and metrics state
  const [isLoading, setIsLoading] = useState(false);
  const revealRef = useScrollReveal();

  const handleStartChat = async () => {
    // Scroll instantly to the chat interface so the UI feels incredibly responsive!
    const chatElement = document.getElementById('ask-a-question');
    if (chatElement) {
      chatElement.scrollIntoView({ behavior: 'smooth' });
    }

    setIsLoading(true);
    try {
      const response = await apiClient.createSession('anonymous', 'New Conversation');
      if (response.success) {
        localStorage.setItem('currentSessionId', response.session.sessionId);
        toast.success('New chat session started!');
      } else {
        toast.success('Chat interface opened!');
      }
    } catch (error) {
      toast.success('Chat interface opened!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLearnMore = () => {
    // Scroll to detailed feature explanation sections
    const featuresElement = document.getElementById('how-it-works');
    if (featuresElement) {
      featuresElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative py-24 bg-gradient-to-br from-primary/5 via-secondary/15 to-accent/5 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div ref={revealRef} className="space-y-8 reveal-fade-up max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold justify-center shadow-sm animate-pulse-soft">
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            AI-Powered Legal Assistant
          </div>
          <h1 className="text-4xl md:text-6.5xl font-heading font-extrabold text-primary leading-tight tracking-tight">
            {getTranslation('heroTitle', currentLanguage)}{' '}
            <span className="text-accent">
              {getTranslation('heroSubtitle', currentLanguage)}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mx-auto font-normal">
            {getTranslation('heroDescription', currentLanguage)}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleStartChat}
              size="lg"
              className="w-full sm:w-auto h-12 px-6 rounded-xl font-medium shadow-md transition-smooth hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              {getTranslation('startChat', currentLanguage)}
            </Button>
            <Button 
              onClick={handleLearnMore} 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto h-12 px-6 rounded-xl font-medium transition-smooth hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm cursor-pointer"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              {getTranslation('learnMore', currentLanguage)}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;