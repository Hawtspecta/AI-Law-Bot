import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Search, 
  FileText, 
  ClipboardList, 
  GitCompare,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { getTranslation } from "@/lib/translations";
import { useNavigate } from "react-router-dom";

interface ToolsSectionProps {
  currentLanguage?: string;
}

const ToolsSection = ({ currentLanguage = 'en' }: ToolsSectionProps) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleToolDemo = async (toolType: string) => {
    setIsLoading(toolType);
    
    try {
      switch (toolType) {
        case 'legal-research':
          // Navigate to legal research page
          navigate('/legal-research');
          break;

        case 'contract-analyzer':
          // Navigate to contract analyzer page
          navigate('/contract-analyzer');
          break;

        case 'form-assistance':
          // Navigate to form assistance page
          navigate('/form-assistance');
          break;

        case 'document-comparator':
          // Navigate to document comparator page
          navigate('/document-comparator');
          break;

        default:
          toast.error("Unknown tool type");
      }
    } catch (error) {
      console.error(`${toolType} error:`, error);
      toast.error(`Failed to open ${toolType} tool`);
    } finally {
      setIsLoading(null);
    }
  };

  const tools = [
    {
      id: 'legal-research',
      title: 'Legal Research Tool',
      description: 'Access dedicated search interface. Performs high-speed vector search using Pinecone to retrieve statutes and case precedents, which the LLM then summarizes.',
      icon: Search,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      features: [
        'Vector-based legal search',
        'Statute and precedent retrieval',
        'AI-powered summarization',
        'Citation-backed results'
      ]
    },
    {
      id: 'contract-analyzer',
      title: 'Contract Analyzer',
      description: 'Uses NLP/ML to extract clauses, perform risk assessment, and conduct Compliance Checks against current regulations, flagging risks as Critical/High/Medium.',
      icon: FileText,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      features: [
        'Clause extraction',
        'Risk assessment',
        'Compliance checking',
        'Risk level flagging'
      ]
    },
    {
      id: 'form-assistance',
      title: 'Legal News & Forms',
      description: 'Form Assistance utilizes logic-based conditions to validate user inputs against form requirements stored in PostgreSQL, minimizing errors in document preparation.',
      icon: ClipboardList,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      features: [
        'Logic-based validation',
        'Form requirement checking',
        'Error minimization',
        'Document preparation'
      ]
    },
    {
      id: 'document-comparator',
      title: 'Document Comparator',
      description: 'Compares documents using Natural Language Inference (NLI) to identify clauses invalidated by new laws. Generates a visual redline view.',
      icon: GitCompare,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      features: [
        'Natural Language Inference',
        'Clause invalidation detection',
        'Visual redline view',
        'Law compliance checking'
      ]
    }
  ];

  return (
    <section id="tools" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">
            {getTranslation('coreLegalTools', currentLanguage)}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {getTranslation('powerfulAiTools', currentLanguage)}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tools.map((tool) => (
            <Card
              key={tool.id}
              className="p-6 gradient-card border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg group"
            >
              <div className="space-y-4">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${tool.bgColor} ${tool.color} group-hover:scale-110 transition-transform`}>
                  <tool.icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-xl font-heading font-semibold text-primary">
                    {tool.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tool.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2">
                    {tool.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Demo Button */}
                <Button
                  onClick={() => handleToolDemo(tool.id)}
                  disabled={isLoading === tool.id}
                  className="w-full group-hover:bg-accent group-hover:text-white transition-colors"
                  variant="outline"
                >
                  {isLoading === tool.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {getTranslation('runningDemo', currentLanguage)}
                    </>
                  ) : (
                    <>
                      {getTranslation('tryDemo', currentLanguage)}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <Card className="p-8 gradient-card border-border/50 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Info className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-2xl font-heading font-semibold text-primary mb-4">
              How Our Tools Work
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</div>
                  <h4 className="font-semibold text-primary">Upload & Process</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload your documents or enter your query. Our AI processes the information using advanced NLP techniques.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</div>
                  <h4 className="font-semibold text-primary">AI Analysis</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes the content, extracts key information, and performs compliance checks against current regulations.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">3</div>
                  <h4 className="font-semibold text-primary">Get Results</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive detailed analysis, recommendations, and citation-backed results to help you make informed decisions.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;