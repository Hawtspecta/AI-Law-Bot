import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, FileCheck, Newspaper, GitCompare } from "lucide-react";

const ToolsSection = () => {
  const tools = [
    {
      icon: Scale,
      title: "Legal Research Tool",
      description: "Query laws, precedents, and case summaries with AI-powered search.",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: FileCheck,
      title: "Contract Analyzer",
      description: "Detect risks, ambiguous clauses, and compliance issues automatically.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Newspaper,
      title: "Legal News & Forms",
      description: "Get region-specific legal news and step-by-step filing assistance.",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: GitCompare,
      title: "Document Comparator",
      description: "Compare old vs new laws and highlight outdated clauses instantly.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <section id="documents" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">
            Powerful Legal Tools
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to understand and navigate legal complexities
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {tools.map((tool, idx) => (
            <Card
              key={idx}
              className="p-6 gradient-card border-border/50 hover:border-accent/50 transition-smooth hover:shadow-lg hover:scale-105 animate-fade-in group cursor-pointer"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className={`${tool.bgColor} ${tool.color} rounded-2xl w-14 h-14 flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth`}>
                <tool.icon className="h-7 w-7" />
              </div>

              <h3 className="text-lg font-heading font-semibold text-primary mb-2">
                {tool.title}
              </h3>

              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {tool.description}
              </p>

              <Button variant="outline" size="sm" className="w-full group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-smooth">
                Try Demo
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
