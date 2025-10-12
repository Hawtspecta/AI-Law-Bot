import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Newspaper, 
  Calendar, 
  ExternalLink, 
  Filter,
  Loader2,
  TrendingUp,
  Globe
} from "lucide-react";
import { apiClient, LegalNewsResponse } from "@/services/api";
import { toast } from "sonner";

const LegalNews = () => {
  const [news, setNews] = useState<LegalNewsResponse['news']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('India');
  const [selectedTopic, setSelectedTopic] = useState('general');

  const regions = [
    { code: 'India', name: 'India', flag: '🇮🇳' },
    { code: 'USA', name: 'United States', flag: '🇺🇸' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'EU', name: 'European Union', flag: '🇪🇺' }
  ];

  const topics = [
    { code: 'general', name: 'General Legal News' },
    { code: 'consumer', name: 'Consumer Protection' },
    { code: 'corporate', name: 'Corporate Law' },
    { code: 'criminal', name: 'Criminal Law' },
    { code: 'family', name: 'Family Law' },
    { code: 'property', name: 'Property Law' }
  ];

  useEffect(() => {
    loadNews();
  }, [selectedRegion, selectedTopic]);

  const loadNews = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getLegalNews(selectedRegion, selectedTopic, 6);
      if (response.success) {
        setNews(response.news);
      }
    } catch (error) {
      console.error('Failed to load news:', error);
      toast.error('Failed to load legal news');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <section id="news" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">
            Legal News & Updates
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Stay informed with the latest legal developments, regulatory changes, 
            and important updates personalized by region and topic.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 rounded-md border border-border bg-background text-sm"
            >
              {regions.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.flag} {region.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-2 rounded-md border border-border bg-background text-sm"
            >
              {topics.map((topic) => (
                <option key={topic.code} value={topic.code}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={loadNews}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </Button>
        </div>

        {/* News Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading legal news...</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((article, index) => (
              <Card
                key={article.id}
                className="p-6 gradient-card border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg group"
              >
                <div className="space-y-4">
                  {/* Article Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(article.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>{article.source}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-heading font-semibold text-primary group-hover:text-accent transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                  </div>

                  {/* Article Summary */}
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>

                  {/* Article Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs group-hover:text-accent"
                    >
                      Read More
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                    
                    <div className="text-xs text-muted-foreground">
                      {selectedRegion} • {selectedTopic}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            onClick={loadNews}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <Newspaper className="h-4 w-4" />
            <span>Load More News</span>
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <Card className="p-8 gradient-card border-border/50 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Newspaper className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-2xl font-heading font-semibold text-primary mb-4">
              Stay Updated with Legal Developments
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our legal news feed provides personalized updates based on your region and interests. 
              Get notified about important regulatory changes, landmark cases, and legal precedents 
              that could affect your business or personal legal matters.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LegalNews;
