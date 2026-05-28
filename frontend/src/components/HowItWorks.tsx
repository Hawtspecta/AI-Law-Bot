

import { Card } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { 

  MessageSquare, 

  Upload, 

  Brain, 

  FileText, 

  CheckCircle, 

  ArrowRight,

  Users,

  Shield,

  Clock,

  Award

} from "lucide-react";

import { getTranslation } from "@/lib/translations";



interface HowItWorksProps {

  currentLanguage?: string;

}





const HowItWorks = ({ currentLanguage = 'en' }: HowItWorksProps) => {

  const steps = [

    {

      number: 1,

      title: getTranslation('askYourQuestion', currentLanguage),

      description: getTranslation('howItWorksStep1', currentLanguage) || getTranslation('howItWorksDescription', currentLanguage),

      icon: MessageSquare,

      color: "text-blue-500",

      bgColor: "bg-blue-500/10"

    },

    {

      number: 2,

      title: getTranslation('aiAnalysis', currentLanguage),

      description: getTranslation('howItWorksStep3', currentLanguage) || '',

      icon: Brain,

      color: "text-purple-500",

      bgColor: "bg-purple-500/10"

    },

    {

      number: 3,

      title: getTranslation('getResults', currentLanguage),

      description: getTranslation('howItWorksStep4', currentLanguage) || '',

      icon: FileText,

      color: "text-orange-500",

      bgColor: "bg-orange-500/10"

    }

  ];



  const features = [

    {

      icon: Users,

      title: getTranslation('trustedBy', currentLanguage),

      description: getTranslation('trustedByDesc', currentLanguage),

      color: "text-blue-500"

    },

    {

      icon: Shield,

      title: getTranslation('privacySecurity', currentLanguage),

      description: getTranslation('privacySecurityDesc', currentLanguage),

      color: "text-green-500"

    },

    {

      icon: Clock,

      title: '24/7 Guidance',

      description: getTranslation('supportDesc', currentLanguage),

      color: "text-purple-500"

    },

    {

      icon: Award,

      title: getTranslation('keyCitations', currentLanguage),

      description: getTranslation('keyCitationsDesc', currentLanguage),

      color: "text-orange-500"

    }

  ];



  return (

    <section id="how-it-works" className="py-20 bg-background">

      <div className="container mx-auto px-4">

        <div className="text-center mb-16 animate-fade-up">

          <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">

            {getTranslation('howItWorks', currentLanguage)}

          </h2>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">

            {getTranslation('howItWorksDescription', currentLanguage)}

          </p>

        </div>



        {/* Steps */}

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20">

          {steps.map((step, index) => (

            <Card

              key={step.number}

              className="p-6 gradient-card border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg group text-center"

            >

              <div className="space-y-4">

                {/* Step Number & Icon */}

                <div className="relative">

                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${step.bgColor} ${step.color} group-hover:scale-110 transition-transform`}>

                    <step.icon className="h-8 w-8" />

                  </div>

                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">

                    {step.number}

                  </div>

                </div>



                {/* Content */}

                <div className="space-y-3">

                  <h3 className="text-xl font-heading font-semibold text-primary">

                    {step.title}

                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">

                    {step.description}

                  </p>

                </div>

              </div>

            </Card>

          ))}

        </div>



        {/* Features Grid */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">

          {features.map((feature, index) => (

            <Card

              key={index}

              className="p-6 gradient-card border-border/50 hover:border-accent/50 transition-all duration-300 text-center"

            >

              <div className="space-y-4">

                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary ${feature.color}`}>

                  <feature.icon className="h-6 w-6" />

                </div>

                <div className="space-y-2">

                  <h3 className="text-lg font-heading font-semibold text-primary">

                    {feature.title}

                  </h3>

                  <p className="text-sm text-muted-foreground">

                    {feature.description}

                  </p>

                </div>

              </div>

            </Card>

          ))}

        </div>



        {/* Technology Stack section removed */}

        <div className="text-center mt-16">

          <Button

            size="lg"

            onClick={() => {

              const chatElement = document.getElementById('ask-a-question');

              if (chatElement) {

                chatElement.scrollIntoView({ behavior: 'smooth' });

              }

            }}

            className="glow-primary flex items-center space-x-2 mx-auto"

          >

            <MessageSquare className="h-5 w-5" />

            <span>{getTranslation('startChat', currentLanguage)}</span>

            <ArrowRight className="h-5 w-5" />

          </Button>

        </div>

      </div>

    </section>

  );

};



export default HowItWorks;