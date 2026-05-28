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

  Diff,

  Bot

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
    switch ((impact || 'medium').toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch ((impact || 'medium').toLowerCase()) {
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

          <div className="hidden lg:block">
            <ToolNavigationSidebar />
          </div>

          <div className="min-w-0 w-full">

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
            <div className="w-full bg-card border border-border/60 border-l-4 border-l-accent rounded-2xl rounded-tl-none shadow-sm p-6 space-y-6 text-left animate-scale-in">
              {/* Header */}
              <div className="border-b border-border/30 pb-3">
                <div className="flex items-center space-x-2">
                  <GitCompare className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-heading font-semibold text-primary">Document Comparison Report</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Type: {results.comparison.comparisonType} • Completed at {new Date(results.timestamp).toLocaleTimeString()}
                </p>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Comparison Summary</h4>
                <div className="prose max-w-none text-sm text-foreground leading-relaxed bg-secondary/30 p-4 rounded-xl border border-border/30">
                  <div dangerouslySetInnerHTML={{ __html: results.comparison.summary.replace(/\n/g, '<br/>') }} />
                </div>
              </div>

              {/* Key Differences */}
              {results.comparison.differences && results.comparison.differences.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Differences Identified</h4>
                  <div className="space-y-4">
                    {results.comparison.differences.map((difference: any, index: number) => {
                      if (!difference) return null;
                      
                      // Safeguard against missing or undefined properties
                      let sectionTitle = String(difference.section || 'Clause / Provision');
                      const impact = String(difference.impact || 'medium');
                      const doc1 = String(difference.document1 || 'Refer to original document provisions.');
                      const doc2 = String(difference.document2 || 'Refer to updated document provisions.');
                      const recommendation = String(difference.recommendation || 'Review changes carefully.');

                      if (sectionTitle.endsWith('...')) {
                        const cleanPrefix = sectionTitle.replace(/\.{3,}$/, '').trim();
                        
                        let completedText = '';
                        
                        // Helper to extract sentences without legacy lookbehind regex
                        const getSentences = (text: string) => {
                          if (typeof text !== 'string') return [];
                          return text.replace(/([.!?])\s+/g, "$1|").split("|").map(s => s.trim()).filter(Boolean);
                        };
                        
                        const recSentences = getSentences(recommendation);
                        const descSentences = getSentences(doc2);
                        const allSentences = [...recSentences, ...descSentences];
                        
                        // 1. Try exact start matching (case-insensitive)
                        for (const sentence of allSentences) {
                          if (sentence.toLowerCase().startsWith(cleanPrefix.toLowerCase())) {
                            completedText = sentence;
                            break;
                          }
                        }
                        
                        // 2. Try fuzzy word matching (first 3 words)
                        if (!completedText) {
                          const words = cleanPrefix.split(/\s+/).filter(Boolean);
                          if (words.length >= 3) {
                            const firstThreeWords = words.slice(0, 3).join(' ').toLowerCase();
                            for (const sentence of allSentences) {
                              if (sentence.toLowerCase().startsWith(firstThreeWords)) {
                                completedText = sentence;
                                break;
                              }
                            }
                          }
                        }
                        
                        // 3. Try contains/index-of matching
                        if (!completedText) {
                          for (const sentence of allSentences) {
                            if (sentence.toLowerCase().includes(cleanPrefix.toLowerCase())) {
                              completedText = sentence;
                              break;
                            }
                          }
                        }
                        
                        // If we successfully completed the text, use it!
                        if (completedText) {
                          sectionTitle = completedText;
                        } else {
                          // Otherwise, just remove the trailing '...'
                          sectionTitle = cleanPrefix;
                        }
                      }

                      return (
                        <div key={index} className={`p-4 rounded-xl border ${getImpactColor(impact)} shadow-xs`}>
                          <div className="flex items-center justify-between space-x-4 mb-3 font-medium">
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              {getImpactIcon(impact)}
                              <span className="text-sm font-semibold">{sectionTitle}</span>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded bg-background/50 border border-border/10 flex-shrink-0">
                              {impact} Impact
                            </span>
                          </div>
                          
                          {doc1 === "Refer to original document provisions." || doc1 === "Original" || doc1 === "Original version" || doc1 === "Original terms" ? (
                            <div className="mb-3">
                              <h5 className="text-xs font-semibold mb-1 text-muted-foreground">Description of Change:</h5>
                              <p className="text-xs bg-background/60 p-2.5 rounded border border-border/20 leading-relaxed">{doc2}</p>
                            </div>
                          ) : (
                            <div className="grid md:grid-cols-2 gap-4 mb-3">
                              <div>
                                <h5 className="text-xs font-semibold mb-1 text-muted-foreground">Document 1 (Original):</h5>
                                <p className="text-xs bg-background/60 p-2.5 rounded border border-border/20 leading-relaxed">{doc1}</p>
                              </div>
                              <div>
                                <h5 className="text-xs font-semibold mb-1 text-muted-foreground">Document 2 (Updated):</h5>
                                <p className="text-xs bg-background/60 p-2.5 rounded border border-border/20 leading-relaxed">{doc2}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="text-xs border-t border-border/10 pt-2 mt-2">
                            <strong>Recommendation:</strong> <span className="opacity-90">{recommendation}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Redline View */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visual Redline View</h4>
                <div className="prose max-w-none text-sm text-foreground leading-relaxed bg-secondary/15 p-4 rounded-xl border border-border/30 overflow-x-auto whitespace-pre-wrap">
                  <div dangerouslySetInnerHTML={{ __html: results.comparison.redlineView.replace(/\n/g, '<br/>') }} />
                </div>
              </div>

              {/* Recommendations */}
              {results.comparison.recommendations && results.comparison.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Action Items</h4>
                  <div className="space-y-2 bg-secondary/15 p-4 rounded-xl border border-border/30">
                    {results.comparison.recommendations.map((recommendation: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground/90">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Citations */}
              {results.comparison.citations && results.comparison.citations.length > 0 && (
                <div className="pt-4 border-t border-border/30">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Legal Citations & References</h4>
                  <div className="space-y-1.5">
                    {results.comparison.citations.map((citation: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2 text-xs text-muted-foreground">
                        <span>•</span>
                        <span>{citation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

