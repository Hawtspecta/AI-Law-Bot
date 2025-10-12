import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  ArrowLeft, 
  Loader2, 
  FileText, 
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const LegalResearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.searchLegal({
        query: query.trim(),
        filters: { category: "legal", jurisdiction: "India" },
        userId: "anonymous"
      });

      setResults(response);
      setSearchHistory(prev => [query.trim(), ...prev.slice(0, 4)]);
      toast.success("Legal research completed!");
    } catch (error) {
      console.error("Legal research error:", error);
      toast.error("Failed to perform legal research");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
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
                <Search className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-primary">Legal Research Tool</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Section */}
          <Card className="p-6 mb-8">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Vector-Based Legal Search</h2>
                <p className="text-muted-foreground">
                  Search through statutes, case precedents, and legal documents using advanced AI-powered vector search.
                </p>
              </div>

              <div className="flex gap-4">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your legal research query..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Recent Searches:</h3>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((historyQuery, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleHistoryClick(historyQuery)}
                        className="text-xs"
                      >
                        {historyQuery}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Results Section */}
          {isLoading && (
            <Card className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Performing vector search and AI analysis...</p>
            </Card>
          )}

          {results && !isLoading && (
            <div className="space-y-6">
              {/* Search Results Summary */}
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Search Results</h3>
                </div>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: results.results.content.replace(/\n/g, '<br/>') }} />
                </div>
              </Card>

              {/* Citations */}
              {results.results.citations && results.results.citations.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Legal Citations</h3>
                  </div>
                  <div className="space-y-2">
                    {results.results.citations.map((citation: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{citation}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Sources */}
              {results.results.sources && results.results.sources.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Info className="h-5 w-5 text-purple-500" />
                    <h3 className="text-lg font-semibold">Source Documents</h3>
                  </div>
                  <div className="space-y-3">
                    {results.results.sources.map((source: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{source.title || `Source ${index + 1}`}</h4>
                          <span className="text-xs text-muted-foreground">
                            Similarity: {(source.similarity * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{source.content}</p>
                        {source.source && (
                          <p className="text-xs text-muted-foreground mt-2">Source: {source.source}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Search Metadata */}
              <Card className="p-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Query: "{results.query}"</span>
                  <span>Search completed at {new Date(results.timestamp).toLocaleTimeString()}</span>
                </div>
              </Card>
            </div>
          )}

          {/* Features Info */}
          <Card className="p-6 mt-8">
            <div className="flex items-center space-x-2 mb-4">
              <Info className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">How Legal Research Works</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</div>
                  <h4 className="font-semibold">Vector Search</h4>
                </div>
                <p className="text-muted-foreground">
                  Your query is converted to a vector and matched against our legal document database using semantic similarity.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</div>
                  <h4 className="font-semibold">AI Analysis</h4>
                </div>
                <p className="text-muted-foreground">
                  The AI analyzes the retrieved documents and provides comprehensive summaries with legal citations.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">3</div>
                  <h4 className="font-semibold">Citation-Backed Results</h4>
                </div>
                <p className="text-muted-foreground">
                  All results include proper legal citations and references to statutes, cases, and legal precedents.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LegalResearch;
