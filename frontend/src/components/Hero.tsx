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

interface HeroProps {
  currentLanguage?: string;
}

const Hero = ({ currentLanguage = 'en' }: HeroProps) => {
  // Removed statistics section and metrics state
  const [isLoading, setIsLoading] = useState(false);

  const handleStartChat = async () => {
    setIsLoading(true);
    try {
      // ...existing code...
      const response = await apiClient.createSession('anonymous', 'New Conversation');
      if (response.success) {
        localStorage.setItem('currentSessionId', response.session.sessionId);
        const chatElement = document.getElementById('ask-a-question');
        if (chatElement) chatElement.scrollIntoView({ behavior: 'smooth' });
        toast.success('New chat session started!');
      } else {
        const chatElement = document.getElementById('ask-a-question');
        if (chatElement) chatElement.scrollIntoView({ behavior: 'smooth' });
        toast.success('Chat interface opened!');
      }
    } catch (error) {
      const chatElement = document.getElementById('ask-a-question');
      if (chatElement) chatElement.scrollIntoView({ behavior: 'smooth' });
      toast.success('Chat interface opened!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLearnMore = () => {
    // Scroll to detailed feature explanation sections (Feature #10)
    const featuresElement = document.getElementById('how-it-works');
    if (featuresElement) {
      featuresElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative py-20 bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="space-y-8 animate-fade-up max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium justify-center">
            <Shield className="h-4 w-4 mr-2" />
            AI-Powered Legal Assistant
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary leading-tight">
            {getTranslation('heroTitle', currentLanguage)}{' '}
            <span className="text-accent">{getTranslation('heroSubtitle', currentLanguage)}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mx-auto">
            {getTranslation('heroDescription', currentLanguage)}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleStartChat}
              size="lg"
              className="w-full sm:w-auto"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              {getTranslation('startChat', currentLanguage)}
            </Button>
            <Button onClick={handleLearnMore} size="lg" variant="outline" className="w-full sm:w-auto">
              <ArrowRight className="h-5 w-5 mr-2" />
              {getTranslation('learnMore', currentLanguage)}
            </Button>
          </div>
        </div>
      </div>
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse delay-1000"></div>
    </section>
  );
};

export default Hero;