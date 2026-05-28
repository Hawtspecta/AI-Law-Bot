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

import { getTranslation } from "@/lib/translations";

import { useScrollReveal } from "../hooks/useScrollReveal";




interface LegalNewsProps {

  currentLanguage?: string;

}



const LegalNews = ({ currentLanguage = 'en' }: LegalNewsProps) => {

  const revealRef = useScrollReveal();

  const [news, setNews] = useState<LegalNewsResponse['news']>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [selectedRegion, setSelectedRegion] = useState('India');

  const [selectedTopic, setSelectedTopic] = useState('general');

  const [limit, setLimit] = useState(6);

  const [isRegionOpen, setIsRegionOpen] = useState(false);

  const [isTopicOpen, setIsTopicOpen] = useState(false);



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

  }, [selectedRegion, selectedTopic, limit]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest(".relative")) {
        setIsRegionOpen(false);
        setIsTopicOpen(false);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);



  const loadNews = async () => {

    setIsLoading(true);

    try {

      const response = await apiClient.getLegalNews(selectedRegion, selectedTopic, limit);

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

    <section id="news" className="py-20 bg-transparent">

      <div className="container mx-auto px-4">

        <div ref={revealRef} className="text-center mb-16 reveal-fade-up">

          <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">

            {getTranslation('legalNewsUpdates', currentLanguage)}

          </h2>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">

            {getTranslation('stayInformed', currentLanguage)}

          </p>

        </div>



        {/* Filters */}

        <div className="flex flex-wrap justify-center gap-6 mb-12 relative z-40">

          {/* Region Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsRegionOpen(!isRegionOpen);
                setIsTopicOpen(false);
              }}
              className="flex items-center space-x-2 px-3 py-2 rounded-md border border-border bg-background text-sm cursor-pointer hover:bg-secondary/50 transition-smooth"
            >
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>{regions.find(r => r.code === selectedRegion)?.flag} {regions.find(r => r.code === selectedRegion)?.name}</span>
            </button>
            
            {isRegionOpen && (
              <div className="absolute left-0 mt-2 w-48 rounded-xl border border-border/60 bg-card p-1 shadow-lg z-50 animate-scale-in">
                {regions.map((region) => (
                  <button
                    key={region.code}
                    onClick={() => {
                      setSelectedRegion(region.code);
                      setLimit(6);
                      setIsRegionOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-smooth hover:bg-secondary cursor-pointer flex items-center justify-between ${
                      selectedRegion === region.code ? "bg-secondary font-semibold" : ""
                    }`}
                  >
                    <span>{region.flag} {region.name}</span>
                    {selectedRegion === region.code && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Topic Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsTopicOpen(!isTopicOpen);
                setIsRegionOpen(false);
              }}
              className="flex items-center space-x-2 px-3 py-2 rounded-md border border-border bg-background text-sm cursor-pointer hover:bg-secondary/40 transition-smooth"
            >
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span>{topics.find(t => t.code === selectedTopic)?.name}</span>
            </button>
            
            {isTopicOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl border border-border/60 bg-card p-1 shadow-lg z-50 animate-scale-in">
                {topics.map((topic) => (
                  <button
                    key={topic.code}
                    onClick={() => {
                      setSelectedTopic(topic.code);
                      setLimit(6);
                      setIsTopicOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-smooth hover:bg-secondary cursor-pointer flex items-center justify-between ${
                      selectedTopic === topic.code ? "bg-secondary font-semibold" : ""
                    }`}
                  >
                    <span>{topic.name}</span>
                    {selectedTopic === topic.code && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button

            onClick={loadNews}

            disabled={isLoading}

            variant="outline"

            size="sm"
            className="cursor-pointer"

          >

            {isLoading ? (

              <>

                <Loader2 className="h-4 w-4 mr-2 animate-spin" />

                {getTranslation('loading', currentLanguage)}

              </>

            ) : (

              getTranslation('refresh', currentLanguage)

            )}

          </Button>

        </div>

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

                className="p-6 gradient-card border-border/40 hover:border-accent/40 shadow-sm hover:shadow-md hover:-translate-y-1 transition-smooth rounded-2xl group relative overflow-hidden flex flex-col h-full"

              >

                <div className="flex flex-col h-full justify-between flex-1">

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

                </div>



                  {/* Article Actions */}

                  <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-4">

                    <Button

                      variant="ghost"

                      size="sm"

                      className="text-xs"

                      onClick={() => article.url && window.open(article.url, '_blank', 'noopener,noreferrer')}

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

            onClick={() => setLimit(prev => prev + 6)}

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

