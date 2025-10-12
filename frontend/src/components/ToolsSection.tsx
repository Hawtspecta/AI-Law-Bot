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

const ToolsSection = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleToolDemo = async (toolType: string) => {
    setIsLoading(toolType);
    
    try {
      switch (toolType) {
        case 'legal-research':
          // Feature #17: Legal Research Tool
          const searchResponse = await apiClient.searchLegal({
            query: "consumer protection act 2019",
            filters: { category: "consumer", jurisdiction: "India" },
            userId: "anonymous"
          });
          
          toast.success("Legal research completed! Check the results below.");
          console.log("Legal Research Results:", searchResponse);
          break;

        case 'contract-analyzer':
          // Feature #18: Contract Analyzer
          const contractResponse = await apiClient.analyzeContract({
            contractContent: "This is a sample contract for analysis. The contract includes standard terms and conditions, liability clauses, and payment terms.",
            contractType: "Service Agreement"
          });
          
          toast.success("Contract analysis completed! Check the results below.");
          console.log("Contract Analysis Results:", contractResponse);
          break;

        case 'form-assistance':
          // Feature #19: Legal News & Forms
          const formResponse = await apiClient.fillForm({
            formType: "Consumer Complaint Form",
            userInputs: {
              name: "John Doe",
              email: "john@example.com",
              complaint: "Defective product received",
              amount: "5000"
            },
            conditions: {
              validateEmail: true,
              requireAmount: true
            }
          });
          
          toast.success("Form assistance completed! Check the results below.");
          console.log("Form Assistance Results:", formResponse);
          break;

        case 'document-comparator':
          // Feature #20: Document Comparator
          const comparisonResponse = await apiClient.compareDocuments({
            document1: "Original contract with 30-day payment terms",
            document2: "Updated contract with 45-day payment terms",
            comparisonType: "contract"
          });
          
          toast.success("Document comparison completed! Check the results below.");
          console.log("Document Comparison Results:", comparisonResponse);
          break;

        default:
          toast.error("Unknown tool type");
      }
    } catch (error) {
      console.error(`${toolType} error:`, error);
      toast.error(`Failed to run ${toolType} demo`);
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
            Core Legal Tools
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Powerful AI-driven tools designed to simplify complex legal tasks. 
            Each tool leverages advanced technology to provide accurate, 
            citation-backed results.
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
                      Running Demo...
                    </>
                  ) : (
                    <>
                      Try Demo
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