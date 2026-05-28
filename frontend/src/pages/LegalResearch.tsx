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

  Info,

  Bot

} from "lucide-react";

import { apiClient } from "@/services/api";

import { toast } from "sonner";

import { useNavigate } from "react-router-dom";

import { getTranslation } from "@/lib/translations";

import ToolNavigationSidebar from "@/components/ToolNavigationSidebar";



const LegalResearch = ({ currentLanguage = 'en' }) => {

  const navigate = useNavigate();

  const [query, setQuery] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [results, setResults] = useState<any>(null);

  const [searchHistory, setSearchHistory] = useState<string[]>([]);



  const handleSearch = async () => {

    if (!query.trim()) {

      toast.error(getTranslation('enterSearchQuery', currentLanguage));

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

  toast.success(getTranslation('legalResearchCompleted', currentLanguage));

    } catch (error) {

      console.error("Legal research error:", error);

  toast.error(getTranslation('legalResearchFailed', currentLanguage));

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
                <span>{getTranslation('Back To Home', currentLanguage)}</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Search className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-primary">{getTranslation('legalResearchTool', currentLanguage)}</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-8 items-start">
          <div className="hidden lg:block">
            <ToolNavigationSidebar currentLanguage={currentLanguage} />
          </div>
          <div className="min-w-0 w-full">
            <div className="max-w-4xl mx-auto">

          {/* Search Section */}

          <Card className="p-6 mb-8">

            <div className="space-y-4">

              <div>

                <h2 className="text-2xl font-semibold mb-2">{getTranslation('vectorBasedSearch', currentLanguage)}</h2>

                <p className="text-muted-foreground">

                  {getTranslation('vectorBasedSearchDesc', currentLanguage)}

                </p>

              </div>



              <div className="flex gap-4">

                <Input

                  value={query}

                  onChange={(e) => setQuery(e.target.value)}

                  placeholder={getTranslation('enterResearchQuery', currentLanguage)}

                  className="flex-1"

                  onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSearch()}

                />

                <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>

                  {isLoading ? (

                    <>

                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />

                      {getTranslation('searching', currentLanguage)}

                    </>

                  ) : (

                    <>

                      <Search className="h-4 w-4 mr-2" />

                      {getTranslation('search', currentLanguage)}

                    </>

                  )}

                </Button>

              </div>



              {/* Search History */}

              {searchHistory.length > 0 && (

                <div className="space-y-2">

                  <h3 className="text-sm font-medium text-muted-foreground">{getTranslation('recentSearches', currentLanguage)}</h3>

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

              <p className="text-muted-foreground">{getTranslation('performingVectorSearch', currentLanguage)}</p>

            </Card>

          )}



          {results && !isLoading && (
            <div className="w-full bg-card border border-border/60 border-l-4 border-l-accent rounded-2xl rounded-tl-none shadow-sm p-6 space-y-6 text-left animate-scale-in">
              {/* Header */}
              <div className="border-b border-border/30 pb-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-heading font-semibold text-primary">{getTranslation('searchResults', currentLanguage)}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {getTranslation('query', currentLanguage)}: "{results.query}" • {getTranslation('searchCompletedAt', currentLanguage)} {new Date(results.timestamp).toLocaleTimeString()}
                </p>
              </div>

              {/* Content */}
              <div className="prose max-w-none text-sm text-foreground leading-relaxed bg-secondary/30 p-4 rounded-xl border border-border/30">
                <div dangerouslySetInnerHTML={{ __html: results.results.content.replace(/\n/g, '<br/>') }} />
              </div>

              {/* Citations */}
              {results.results.citations && results.results.citations.length > 0 && (
                <div className="pt-4 border-t border-border/30">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{getTranslation('legalCitations', currentLanguage)}</h4>
                  <div className="space-y-1.5">
                    {results.results.citations.map((citation: string, index: number) => (
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

              <h3 className="text-lg font-semibold">{getTranslation('howLegalResearchWorks', currentLanguage)}</h3>

            </div>

            <div className="grid md:grid-cols-3 gap-4 text-sm">

              <div className="space-y-2">

                <div className="flex items-center space-x-2">

                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</div>

                  <h4 className="font-semibold">{getTranslation('vectorSearch', currentLanguage)}</h4>

                </div>

                <p className="text-muted-foreground">

                  {getTranslation('vectorSearchDesc', currentLanguage)}

                </p>

              </div>

              <div className="space-y-2">

                <div className="flex items-center space-x-2">

                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</div>

                  <h4 className="font-semibold">{getTranslation('aiAnalysis', currentLanguage)}</h4>

                </div>

                <p className="text-muted-foreground">

                  {getTranslation('aiAnalysisDesc', currentLanguage)}

                </p>

              </div>

              <div className="space-y-2">

                <div className="flex items-center space-x-2">

                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">3</div>

                  <h4 className="font-semibold">{getTranslation('citationBackedResults', currentLanguage)}</h4>

                </div>

                <p className="text-muted-foreground">

                  {getTranslation('citationBackedResultsDesc', currentLanguage)}

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



export default LegalResearch;

