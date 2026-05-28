import { useState } from "react";

import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";

import { Textarea } from "@/components/ui/textarea";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { 

  FileText, 

  ArrowLeft, 

  Loader2, 

  AlertTriangle,

  CheckCircle,

  Info,

  Shield,

  AlertCircle

} from "lucide-react";

import { apiClient } from "@/services/api";

import { toast } from "sonner";

import { useNavigate } from "react-router-dom";

import ToolNavigationSidebar from "@/components/ToolNavigationSidebar";



const ContractAnalyzer = () => {

  const navigate = useNavigate();

  const [contractContent, setContractContent] = useState("");

  const [contractType, setContractType] = useState("general");

  const [isLoading, setIsLoading] = useState(false);

  const [results, setResults] = useState<any>(null);



  const contractTypes = [

    { value: "general", label: "General Contract" },

    { value: "service", label: "Service Agreement" },

    { value: "employment", label: "Employment Contract" },

    { value: "lease", label: "Lease Agreement" },

    { value: "purchase", label: "Purchase Agreement" },

    { value: "nda", label: "Non-Disclosure Agreement" }

  ];



  const handleAnalyze = async () => {

    if (!contractContent.trim()) {

      toast.error("Please enter contract content");

      return;

    }



    setIsLoading(true);

    try {

      const response = await apiClient.analyzeContract({

        contractContent: contractContent.trim(),

        contractType: contractType

      });



      setResults(response);

      toast.success("Contract analysis completed!");

    } catch (error) {

      console.error("Contract analysis error:", error);

      toast.error("Failed to analyze contract");

    } finally {

      setIsLoading(false);

    }

  };



  const getRiskColor = (level: string) => {

    switch (level.toLowerCase()) {

      case 'critical': return 'text-red-600 bg-red-50 border-red-200';

      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';

      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';

      case 'low': return 'text-green-600 bg-green-50 border-green-200';

      default: return 'text-gray-600 bg-gray-50 border-gray-200';

    }

  };



  const getRiskIcon = (level: string) => {

    switch (level.toLowerCase()) {

      case 'critical': return <AlertTriangle className="h-4 w-4" />;

      case 'high': return <AlertCircle className="h-4 w-4" />;

      case 'medium': return <AlertCircle className="h-4 w-4" />;

      case 'low': return <CheckCircle className="h-4 w-4" />;

      default: return <Info className="h-4 w-4" />;

    }

  };



  return (

    <div className="min-h-screen bg-background">

      {/* Header */}

      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">

        <div className="container mx-auto px-4">

          <div className="flex h-16 items-center justify-between">

            <div className="flex items-center space-x-4">

              <Button

                variant="ghost"

                size="sm"

                onClick={() => navigate("/")}

                className="flex items-center space-x-2"

              >

                <ArrowLeft className="h-4 w-4" />

                <span>Back to Home</span>

              </Button>

              <div className="flex items-center space-x-2">

                <FileText className="h-6 w-6 text-primary" />

                <h1 className="text-xl font-bold text-primary">Contract Analyzer</h1>

              </div>

            </div>

          </div>

        </div>

      </div>



      <div className="container mx-auto px-4 py-8">

        <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-8 items-start">

          <div className="hidden lg:block">
            <ToolNavigationSidebar />
          </div>

          <div className="min-w-0 w-full">

            <div className="max-w-4xl mx-auto">

              {/* Input Section */}

          <Card className="p-6 mb-8">

            <div className="space-y-4">

              <div>

                <h2 className="text-2xl font-semibold mb-2">Contract Analysis</h2>

                <p className="text-muted-foreground">

                  Upload your contract for AI-powered analysis including clause extraction, risk assessment, and compliance checking.

                </p>

              </div>



              <div className="space-y-4">

                <div>

                  <label className="text-sm font-medium mb-2 block">Contract Type</label>

                  <Select value={contractType} onValueChange={setContractType}>

                    <SelectTrigger>

                      <SelectValue placeholder="Select contract type" />

                    </SelectTrigger>

                    <SelectContent>

                      {contractTypes.map((type) => (

                        <SelectItem key={type.value} value={type.value}>

                          {type.label}

                        </SelectItem>

                      ))}

                    </SelectContent>

                  </Select>

                </div>



                <div>

                  <label className="text-sm font-medium mb-2 block">Contract Content</label>

                  <Textarea

                    value={contractContent}

                    onChange={(e) => setContractContent(e.target.value)}

                    placeholder="Paste your contract content here..."

                    className="min-h-[300px]"

                  />

                </div>



                <Button onClick={handleAnalyze} disabled={isLoading || !contractContent.trim()}>

                  {isLoading ? (

                    <>

                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />

                      Analyzing...

                    </>

                  ) : (

                    <>

                      <FileText className="h-4 w-4 mr-2" />

                      Analyze Contract

                    </>

                  )}

                </Button>

              </div>

            </div>

          </Card>



          {/* Results Section */}

          {isLoading && (

            <Card className="p-8 text-center">

              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />

              <p className="text-muted-foreground">Performing NLP/ML analysis...</p>

            </Card>

          )}



          {results && !isLoading && (

            <div className="space-y-6">

              {/* Summary */}

              <Card className="p-6">

                <div className="flex items-center space-x-2 mb-4">

                  <Info className="h-5 w-5 text-primary" />

                  <h3 className="text-lg font-semibold">Analysis Summary</h3>

                </div>

                <div className="prose max-w-none">

                  <div dangerouslySetInnerHTML={{ __html: results.analysis.summary.replace(/\n/g, '<br/>') }} />

                </div>

              </Card>



              {/* Key Clauses */}

              {results.analysis.keyClauses && results.analysis.keyClauses.length > 0 && (

                <Card className="p-6">

                  <div className="flex items-center space-x-2 mb-4">

                    <FileText className="h-5 w-5 text-blue-500" />

                    <h3 className="text-lg font-semibold">Key Clauses</h3>

                  </div>

                  <div className="space-y-2">

                    {results.analysis.keyClauses.map((clause: string, index: number) => (

                      <div key={index} className="flex items-start space-x-2">

                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />

                        <span className="text-sm">{clause}</span>

                      </div>

                    ))}

                  </div>

                </Card>

              )}



              {/* Risk Assessment */}

              {results.analysis.risks && results.analysis.risks.length > 0 && (

                <Card className="p-6">

                  <div className="flex items-center space-x-2 mb-4">

                    <AlertTriangle className="h-5 w-5 text-red-500" />

                    <h3 className="text-lg font-semibold">Risk Assessment</h3>

                  </div>

                  <div className="space-y-3">

                    {results.analysis.risks.map((risk: any, index: number) => (

                      <div key={index} className={`p-4 rounded-lg border ${getRiskColor(risk.level)}`}>

                        <div className="flex items-center space-x-2 mb-2">

                          {getRiskIcon(risk.level)}

                          <span className="font-medium">{risk.level} Risk</span>

                        </div>

                        <p className="text-sm mb-2">{risk.description}</p>

                        <p className="text-xs text-muted-foreground">

                          <strong>Recommendation:</strong> {risk.recommendation}

                        </p>

                      </div>

                    ))}

                  </div>

                </Card>

              )}



              {/* Compliance Issues */}

              {results.analysis.complianceIssues && results.analysis.complianceIssues.length > 0 && (

                <Card className="p-6">

                  <div className="flex items-center space-x-2 mb-4">

                    <Shield className="h-5 w-5 text-purple-500" />

                    <h3 className="text-lg font-semibold">Compliance Issues</h3>

                  </div>

                  <div className="space-y-3">

                    {results.analysis.complianceIssues.map((issue: any, index: number) => (

                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">

                        <span className="text-sm">{issue.issue}</span>

                        <span className={`px-2 py-1 rounded text-xs font-medium ${

                          issue.status === 'Compliant' 

                            ? 'bg-green-100 text-green-800' 

                            : issue.status === 'Non-Compliant'

                            ? 'bg-red-100 text-red-800'

                            : 'bg-yellow-100 text-yellow-800'

                        }`}>

                          {issue.status}

                        </span>

                      </div>

                    ))}

                  </div>

                </Card>

              )}



              {/* Recommendations */}

              {results.analysis.recommendations && results.analysis.recommendations.length > 0 && (

                <Card className="p-6">

                  <div className="flex items-center space-x-2 mb-4">

                    <CheckCircle className="h-5 w-5 text-green-500" />

                    <h3 className="text-lg font-semibold">Recommendations</h3>

                  </div>

                  <div className="space-y-2">

                    {results.analysis.recommendations.map((recommendation: string, index: number) => (

                      <div key={index} className="flex items-start space-x-2">

                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />

                        <span className="text-sm">{recommendation}</span>

                      </div>

                    ))}

                  </div>

                </Card>

              )}



              {/* Citations */}

              {results.analysis.citations && results.analysis.citations.length > 0 && (

                <Card className="p-6">

                  <div className="flex items-center space-x-2 mb-4">

                    <FileText className="h-5 w-5 text-blue-500" />

                    <h3 className="text-lg font-semibold">Legal Citations</h3>

                  </div>

                  <div className="space-y-2">

                    {results.analysis.citations.map((citation: string, index: number) => (

                      <div key={index} className="flex items-start space-x-2">

                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />

                        <span className="text-sm">{citation}</span>

                      </div>

                    ))}

                  </div>

                </Card>

              )}

            </div>

          )}



          {/* Features Info */}

          <Card className="p-6 mt-8">

            <div className="flex items-center space-x-2 mb-4">

              <Info className="h-5 w-5 text-blue-500" />

              <h3 className="text-lg font-semibold">Contract Analysis Features</h3>

            </div>

            <div className="grid md:grid-cols-4 gap-4 text-sm">

              <div className="space-y-2">

                <div className="flex items-center space-x-2">

                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</div>

                  <h4 className="font-semibold">Clause Extraction</h4>

                </div>

                <p className="text-muted-foreground">

                  AI identifies and extracts key clauses, terms, and conditions from your contract.

                </p>

              </div>

              <div className="space-y-2">

                <div className="flex items-center space-x-2">

                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</div>

                  <h4 className="font-semibold">Risk Assessment</h4>

                </div>

                <p className="text-muted-foreground">

                  Comprehensive risk analysis with Critical/High/Medium/Low risk level flagging.

                </p>

              </div>

              <div className="space-y-2">

                <div className="flex items-center space-x-2">

                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">3</div>

                  <h4 className="font-semibold">Compliance Checking</h4>

                </div>

                <p className="text-muted-foreground">

                  Validates contract against current regulations and legal requirements.

                </p>

              </div>

              <div className="space-y-2">

                <div className="flex items-center space-x-2">

                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">4</div>

                  <h4 className="font-semibold">AI Recommendations</h4>

                </div>

                <p className="text-muted-foreground">

                  Get actionable recommendations to improve contract terms and reduce risks.

                </p>

              </div>

            </div>

          </Card>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

};



export default ContractAnalyzer;

