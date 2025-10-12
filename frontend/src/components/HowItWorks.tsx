import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Upload, 
  Brain, 
  FileText, 
  CheckCircle, 
  ArrowRight,
  Users,
  Shield,
  Clock,
  Award
} from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Ask Your Question",
      description: "Simply type your legal question in plain language. Our AI understands context and provides relevant answers.",
      icon: MessageSquare,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      number: 2,
      title: "Upload Documents",
      description: "Upload contracts, agreements, or legal documents for analysis. Our AI extracts key information and identifies risks.",
      icon: Upload,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      number: 3,
      title: "AI Analysis",
      description: "Our advanced AI processes your query using legal databases, case law, and regulatory information.",
      icon: Brain,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      number: 4,
      title: "Get Results",
      description: "Receive detailed answers with citations, risk assessments, and actionable recommendations.",
      icon: FileText,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    }
  ];

  const features = [
    {
      icon: Users,
      title: "Trusted by Thousands",
      description: "Over 89+ active users rely on our platform for legal assistance",
      color: "text-blue-500"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security measures",
      color: "text-green-500"
    },
    {
      icon: Clock,
      title: "24/7 Available",
      description: "Get legal help anytime, anywhere with our always-on AI assistant",
      color: "text-purple-500"
    },
    {
      icon: Award,
      title: "Citation-Backed",
      description: "All answers include relevant legal citations and precedents",
      color: "text-orange-500"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our AI-powered legal assistant simplifies complex legal processes into 
            four simple steps. Get reliable, citation-backed answers in minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step, index) => (
            <Card
              key={step.number}
              className="p-6 gradient-card border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg group text-center"
            >
              <div className="space-y-4">
                {/* Step Number & Icon */}
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${step.bgColor} ${step.color} group-hover:scale-110 transition-transform`}>
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-xl font-heading font-semibold text-primary">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 gradient-card border-border/50 hover:border-accent/50 transition-all duration-300 text-center"
            >
              <div className="space-y-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-heading font-semibold text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Technology Stack */}
        <Card className="p-8 gradient-card border-border/50 max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-semibold text-primary mb-4">
              Built with Advanced Technology
            </h3>
            <p className="text-muted-foreground">
              Our platform leverages cutting-edge AI and legal technology to deliver accurate, reliable results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Frontend */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-primary text-center">Frontend (UI)</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>React & TypeScript</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Tailwind CSS</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Responsive Design</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Cross-Platform</span>
                </div>
              </div>
            </div>

            {/* Backend */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-primary text-center">Backend (API)</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Node.js & Express</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>OpenAI GPT-4</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Pinecone Vector DB</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>RAG System</span>
                </div>
              </div>
            </div>

            {/* Database */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-primary text-center">Data Layer</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>PostgreSQL</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Manifest ORM</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Secure Storage</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Audit Logging</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button
            size="lg"
            onClick={() => {
              const chatElement = document.getElementById('ask-a-question');
              if (chatElement) {
                chatElement.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="glow-primary flex items-center space-x-2 mx-auto"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Try It Now</span>
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;