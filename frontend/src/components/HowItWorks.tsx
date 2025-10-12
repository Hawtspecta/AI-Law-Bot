import { MessageCircle, Brain, Lightbulb, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: MessageCircle,
      number: "01",
      title: "Ask a Question",
      description: "Type or speak your legal query in plain language",
    },
    {
      icon: Brain,
      number: "02",
      title: "AI Analyzes",
      description: "Our AI processes your question using legal databases",
    },
    {
      icon: Lightbulb,
      number: "03",
      title: "Get Legal Insights",
      description: "Receive clear explanations with citations and references",
    },
    {
      icon: CheckCircle,
      number: "04",
      title: "Take Action",
      description: "Download summaries, forms, and next steps guidance",
    },
  ];

  return (
    <section className="py-20 gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Get legal help in four simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative animate-fade-up"
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-smooth h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-accent rounded-2xl w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-5xl font-heading font-bold text-white/20">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-xl font-heading font-semibold text-white mb-2">
                  {step.title}
                </h3>

                <p className="text-white/80 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connection line */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-white/20"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
