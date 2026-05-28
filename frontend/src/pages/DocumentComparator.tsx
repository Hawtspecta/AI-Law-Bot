import { useState } from "react";

import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";

import { Textarea } from "@/components/ui/textarea";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { 

  GitCompare, 

  ArrowLeft, 

  Loader2, 

  FileText,

  AlertTriangle,

  CheckCircle,

  Info,

  Eye,

  Diff

} from "lucide-react";

import { apiClient } from "@/services/api";

import { toast } from "sonner";

import { useNavigate } from "react-router-dom";

import ToolNavigationSidebar from "@/components/ToolNavigationSidebar";



const DocumentComparator = () => {

  const navigate = useNavigate();

  const [document1, setDocument1] = useState("");

  const [document2, setDocument2] = useState("");

  const [comparisonType, setComparisonType] = useState("general");

  const [isLoading, setIsLoading] = useState(false);

  const [results, setResults] = useState<any>(null);



  const comparisonTypes = [

    { value: "general", label: "General Comparison" },

    { value: "contract", label: "Contract Comparison" },

    { value: "legal", label: "Legal Document Comparison" },

    { value: "policy", label: "Policy Comparison" },

    { value: "agreement", label: "Agreement Comparison" }

  ];



  const handleCompare = async () => {

    if (!document1.trim() || !document2.trim()) {

      toast.error("Please enter both documents to compare");

      return;

    }



    setIsLoading(true);

    try {

      const response = await apiClient.compareDocuments({

        document1: document1.trim(),

        document2: document2.trim(),

        comparisonType: comparisonType

      });



      setResults(response);

      toast.success("Document comparison completed!");

    } catch (error) {

      console.error("Document comparison error:", error);

      toast.error("Failed to compare documents");

    } finally {

      setIsLoading(false);

    }

  };



  const getImpactColor = (impact: string) => {

    switch (impact.toLowerCase()) {

      case 'high': return 'text-red-600 bg-red-50 border-red-200';

      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';

      case 'low': return 'text-green-600 bg-green-50 border-green-200';

      default: return 'text-gray-600 bg-gray-50 border-gray-200';

    }

  };



  const getImpactIcon = (impact: string) => {

    switch (impact.toLowerCase()) {

      case 'high': return <AlertTriangle className="h-4 w-4" />;

      case 'medium': return <AlertTriangle className="h-4 w-4" />;

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

                <GitCompare className="h-6 w-6 text-primary" />

                <h1 className="text-xl font-bold text-primary">Document Comparator</h1>

              </div>

            </div>

          </div>

        </div>

      </div>



      <div className="container mx-auto px-4 py-8">

        <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-8 items-start">

          <ToolNavigationSidebar />

          <div className="min-w-0">

            <div className="max-w-6xl mx-auto">

              {/* Input Section */}

          <Card className="p-6 mb-8">

            <div className="space-y-4">

              <div>

                <h2 className="text-2xl font-semibold mb-2">Document Comparison</h2>

                <p className="text-muted-foreground">

                  Compare documents using Natural Language Inference (NLI) to identify differences and generate visual redline view.

                </p>

              </div>



              <div className="space-y-4">

                <div>

                  <label className="text-sm font-medium mb-2 block">Comparison Type</label>

                  <Select value={comparisonType} onValueChange={setComparisonType}>

                    <SelectTrigger>

                      <SelectValue placeholder="Select comparison type" />

                    </SelectTrigger>

                    <SelectContent>

                      {comparisonTypes.map((type) => (

                        <SelectItem key={type.value} value={type.value}>

                          {type.label}

                        </SelectItem>

                      ))}

                    </SelectContent>

                  </Select>

                </div>



                <div className="grid lg:grid-cols-2 gap-6">

                  <div>

                    <label className="text-sm font-medium mb-2 block">Document 1 (Original)</label>

                    <Textarea

                      value={document1}

                      onChange={(e) => setDocument1(e.target.value)}

                      placeholder="Paste the first document here..."

                      className="min-h-[300px]"

                    />

                  </div>

                  <div>

                    <label className="text-sm font-medium mb-2 block">Document 2 (Updated)</label>

                    <Textarea

                      value={document2}

                      onChange={(e) => setDocument2(e.target.value)}

                      placeholder="Paste the second document here..."

                      className="min-h-[300px]"

                    />

                  </div>

                </div>



                <Button onClick={handleCompare} disabled={isLoading || !document1.trim() || !document2.trim()}>

                  {isLoading ? (

                    <>

                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />

                      Comparing...

                    </>

                  ) : (

                    <>

                      <GitCompare className="h-4 w-4 mr-2" />

                      Compare Documents

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

              <p className="text-muted-foreground">Performing Natural Language Inference analysis...</p>

            </Card>

          )}



          {results && !isLoading && (

            <div className="space-y-6">

              {/* Summary */}

              <Card className="p-6">

                <div className="flex items-center space-x-2 mb-4">

                  <Info className="h-5 w-5 text-primary" />

                  <h3 className="text-lg font-semibold">Comparison Summary</h3>

                </div>

                <div className="prose max-w-none">

                  <div dangerouslySetInnerHTML={{ __html: results.comparison.summary.replace(/\n/g, '<br/>') }} />

                </div>

              </Card>



              {/* Differences */}

              {results.comparison.differences && results.comparison.differences.length > 0 && (

                <Card className="p-6">

                  <div className="flex items-center space-x-2 mb-4">

                    <Diff className="h-5 w-5 text-blue-500" />

                    <h3 className="text-lg font-semibold">Key Differences</h3>

                  </div>

                  <div className="space-y-4">

                    {results.comparison.differences.map((difference: any, index: number) => (

                      <div key={index} className={`p-4 rounded-lg border ${getImpactColor(difference.impact)}`}>

                        <div className="flex items-center space-x-2 mb-3">

                          {getImpactIcon(difference.impact)}

                          <span className="font-medium">{difference.section}</span>

                          <span className="text-sm font-medium">{difference.impact} Impact</span>

                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-3">

                          <div>

                            <h4 className="text-sm font-medium mb-1">Document 1:</h4>

                            <p className="text-sm bg-gray-50 p-2 rounded">{difference.document1}</p>

                          </div>

                          <div>

                            <h4 className="text-sm font-medium mb-1">Document 2:</h4>

                            <p className="text-sm bg-gray-50 p-2 rounded">{difference.document2}</p>

                          </div>

                        </div>

                        <div className="text-sm">

                          <strong>Recommendation:</strong> {difference.recommendation}

                        </div>

                      </div>

                    ))}

                  </div>

                </Card>

              )}



              {/* Redline View */}

              <Card className="p-6">

                <div className="flex items-center space-x-2 mb-4">

                  <Eye className="h-5 w-5 text-purple-500" />

                  <h3 className="text-lg font-semibold">Visual Redline View</h3>

                </div>

                <div className="prose max-w-none">

                  <div dangerouslySetInnerHTML={{ __html: results.comparison.redlineView.replace(/\n/g, '<br/>') }} />

                </div>

              </Card>



              {/* Recommendations */}

              {results.comparison.recommendations && results.comparison.recommendations.length > 0 && (

                <Card className="p-6">

                  <div className="flex items-center space-x-2 mb-4">

                    <CheckCircle className="h-5 w-5 text-green-500" />

                    <h3 className="text-lg font-semibold">Recommendations</h3>

                  </div>

                  <div className="space-y-2">

                    {results.comparison.recommendations.map((recommendation: string, index: number) => (

                      <div key={index} className="flex items-start space-x-2">

                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />

                        <span className="text-sm">{recommendation}</span>

                      </div>

                    ))}

                  </div>

                </Card>

              )}



              {/* Citations */}

              {results.comparison.citations && results.comparison.citations.length > 0 && (

                <Card className="p-6">

                  <div className="flex items-center space-x-2 mb-4">

                    <FileText className="h-5 w-5 text-blue-500" />

                    <h3 className="text-lg font-semibold">Legal Citations</h3>

                  </div>

                  <div className="space-y-2">

                    {results.comparison.citations.map((citation: string, index: number) => (

                      <div key={index} className="flex items-start space-x-2">

                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />

                        <span className="text-sm">{citation}</span>

                      </div>

                    ))}

                  </div>

                </Card>

              )}



              {/* Comparison Metadata */}

              <Card className="p-4">

                <div className="flex items-center justify-between text-sm text-muted-foreground">

                  <span>Type: {results.comparison.comparisonType}</span>

                  <span>Analysis completed at {new Date(results.timestamp).toLocaleTimeString()}</span>

                </div>

              </Card>

            </div>

          )}



          {/* Features Info */}

          <Card className="p-6 mt-8">

            <div className="flex items-center space-x-2 mb-4">

              <Info className="h-5 w-5 text-blue-500" />

              <h3 className="text-lg font-semibold">Document Comparison Features</h3>

            </div>

            <div className="grid md:grid-cols-4 gap-4 text-sm">

              <div className="space-y-2">

                <div className="flex items-center space-x-2">

                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</div>

                  <h4 className="font-semibold">Natural Language Inference</h4>

                </div>

                <p className="text-muted-foreground">

                  Advanced NLP techniques to understand semantic differences between documents.

                </p>

              </div>

              <div className="space-y-2">

                <div className="flex items-center space-x-2">

                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</div>

                  <h4 className="font-semibold">Clause Invalidation Detection</h4>

                </div>

                <p className="text-muted-foreground">

                  Identifies clauses that may be invalidated by new laws or regulations.

                </p>

              </div>

              <div className="space-y-2">

                <div className="flex items-center space-x-2">

                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">3</div>

                  <h4 className="font-semibold">Visual Redline View</h4>

                </div>

                <p className="text-muted-foreground">

                  Generate visual representations of changes with highlighted differences.

                </p>

              </div>

              <div className="space-y-2">

                <div className="flex items-center space-x-2">

                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">4</div>

                  <h4 className="font-semibold">Law Compliance Checking</h4>

                </div>

                <p className="text-muted-foreground">

                  Ensures documents comply with current legal requirements and regulations.

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



export default DocumentComparator;

