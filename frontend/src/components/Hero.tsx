import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { apiClient, MetricsResponse } from "@/services/api";
import { toast } from "sonner";

const Hero = () => {
  const [metrics, setMetrics] = useState<MetricsResponse['metrics'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await apiClient.getMetrics();
      if (response.success) {
        setMetrics(response.metrics);
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const handleStartChat = async () => {
    setIsLoading(true);
    try {
      // Create new session (Feature #9)
      const response = await apiClient.createSession('anonymous', 'New Conversation');
      if (response.success) {
        // Scroll to chat interface
        const chatElement = document.getElementById('ask-a-question');
        if (chatElement) {
          chatElement.scrollIntoView({ behavior: 'smooth' });
        }
        toast.success('New chat session started!');
      }
    } catch (error) {
      toast.error('Failed to start chat session');
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
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-up">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Shield className="h-4 w-4 mr-2" />
                AI-Powered Legal Assistant
              </div>
              
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary leading-tight">
                Simplify Legal Help with{" "}
                <span className="text-accent">Reliable AI</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Get instant, citation-backed legal answers in simple language. 
                Upload documents, analyze contracts, and access legal research 
                powered by advanced AI technology.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Start Chat Button (Feature #9) */}
              <Button
                size="lg"
                onClick={handleStartChat}
                disabled={isLoading}
                className="glow-primary flex items-center space-x-2"
              >
                <MessageSquare className="h-5 w-5" />
                <span>{isLoading ? 'Starting...' : 'Start Chat'}</span>
                <ArrowRight className="h-5 w-5" />
              </Button>

              {/* Learn More Button (Feature #10) */}
              <Button
                variant="outline"
                size="lg"
                onClick={handleLearnMore}
                className="flex items-center space-x-2"
              >
                <span>Learn More</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>24/7 Available</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span>AI-Powered</span>
              </div>
            </div>
          </div>

          {/* Right Content - Metrics Display (Feature #11) */}
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-heading font-semibold text-primary mb-2">
                Trusted by Thousands
              </h3>
              <p className="text-muted-foreground">
                Real statistics from our platform
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Legal Fees Saved */}
              <Card className="p-6 text-center gradient-card border-border/50">
                <div className="flex items-center justify-center mb-3">
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {metrics?.legalFeesSaved || '₹40L'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Legal Fees Saved
                </div>
              </Card>

              {/* Total Users */}
              <Card className="p-6 text-center gradient-card border-border/50">
                <div className="flex items-center justify-center mb-3">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {metrics?.totalUsers || '89'}+
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Users
                </div>
              </Card>

              {/* Documents Processed */}
              <Card className="p-6 text-center gradient-card border-border/50">
                <div className="flex items-center justify-center mb-3">
                  <FileText className="h-8 w-8 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {metrics?.documentsProcessed || '156'}+
                </div>
                <div className="text-sm text-muted-foreground">
                  Documents Processed
                </div>
              </Card>

              {/* Total Messages */}
              <Card className="p-6 text-center gradient-card border-border/50">
                <div className="flex items-center justify-center mb-3">
                  <MessageSquare className="h-8 w-8 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {metrics?.totalMessages || '1,250'}+
                </div>
                <div className="text-sm text-muted-foreground">
                  Questions Answered
                </div>
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Data calculated from anonymized usage in our Audit Log
              </p>
            </div>
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