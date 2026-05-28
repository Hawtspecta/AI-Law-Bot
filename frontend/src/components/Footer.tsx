import { Button } from "@/components/ui/button";

import { 

  MessageSquare, 

  FileText, 

  Newspaper, 

  Info,

  Mail,

  Phone,

  MapPin,

  ExternalLink,

  Heart

} from "lucide-react";



const Footer = () => {

  const scrollToSection = (sectionId: string) => {

    const element = document.getElementById(sectionId);

    if (element) {

      element.scrollIntoView({ behavior: 'smooth' });

    }

  };



  const navigationLinks = [

    { id: 'hero', label: 'Home', icon: MessageSquare },

    { id: 'ask-a-question', label: 'Ask a Question', icon: MessageSquare },

    { id: 'tools', label: 'Documents', icon: FileText },

    { id: 'news', label: 'News', icon: Newspaper },

    { id: 'how-it-works', label: 'How It Works', icon: Info }

  ];



  const legalLinks = [

    { label: 'Privacy Policy', href: '#' },

    { label: 'Terms of Service', href: '#' },

    { label: 'Cookie Policy', href: '#' },

    { label: 'Data Protection', href: '#' }

  ];



  const supportLinks = [

    { label: 'Help Center', href: '#' },

    { label: 'Contact Support', href: '#' },

    { label: 'API Documentation', href: '#' },

    { label: 'Status Page', href: '#' }

  ];



  return (

    <footer className="bg-secondary/50 border-t border-border/50">

      <div className="container mx-auto px-4 py-16">

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand Section */}

          <div className="space-y-6">

            <div className="flex items-center space-x-2">

              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">

                <span className="text-white font-bold text-sm">AI</span>

              </div>

              <span className="font-heading font-bold text-xl text-primary">Law Assistant</span>

            </div>

            

            <p className="text-sm text-muted-foreground leading-relaxed">

              Simplifying legal help using reliable, citation-backed AI. 

              Get instant answers to your legal questions with our advanced 

              artificial intelligence platform.

            </p>



            <div className="space-y-2">

              <div className="flex items-center space-x-2 text-sm text-muted-foreground">

                <Mail className="h-4 w-4" />

                <span>support@ailawassistant.com</span>

              </div>

              <div className="flex items-center space-x-2 text-sm text-muted-foreground">

                <Phone className="h-4 w-4" />

                <span>+91 98765 43210</span>

              </div>

              <div className="flex items-center space-x-2 text-sm text-muted-foreground">

                <MapPin className="h-4 w-4" />

                <span>Mumbai, India</span>

              </div>

            </div>

          </div>



          {/* Navigation Links */}

          <div className="space-y-6">

            <h3 className="text-lg font-heading font-semibold text-primary">Navigation</h3>

            <div className="space-y-3">

              {navigationLinks.map((link) => (

                <button

                  key={link.id}

                  onClick={() => scrollToSection(link.id)}

                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group"

                >

                  <link.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />

                  <span>{link.label}</span>

                </button>

              ))}

            </div>

          </div>



          {/* Legal Links */}

          <div className="space-y-6">

            <h3 className="text-lg font-heading font-semibold text-primary">Legal</h3>

            <div className="space-y-3">

              {legalLinks.map((link) => (

                <a

                  key={link.label}

                  href={link.href}

                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group"

                >

                  <ExternalLink className="h-3 w-3 group-hover:scale-110 transition-transform" />

                  <span>{link.label}</span>

                </a>

              ))}

            </div>

          </div>



          {/* Support Links */}

          <div className="space-y-6">

            <h3 className="text-lg font-heading font-semibold text-primary">Support</h3>

            <div className="space-y-3">

              {supportLinks.map((link) => (

                <a

                  key={link.label}

                  href={link.href}

                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group"

                >

                  <ExternalLink className="h-3 w-3 group-hover:scale-110 transition-transform" />

                  <span>{link.label}</span>

                </a>

              ))}

            </div>

          </div>

        </div>



        {/* Mission Statement */}

        <div className="mt-16 pt-8 border-t border-border/50">

          <div className="text-center space-y-4">

            <h3 className="text-xl font-heading font-semibold text-primary">

              Our Mission

            </h3>

            <p className="text-muted-foreground max-w-4xl mx-auto leading-relaxed">

              To simplify legal help using reliable, citation-backed AI. The system is built on a scalable, 

              secure architecture using advanced technology to ensure high performance and accessibility for all users. 

              We believe that legal assistance should be accessible, affordable, and available to everyone.

            </p>

          </div>

        </div>



        {/* Bottom Bar */}

        <div className="mt-12 pt-8 border-t border-border/50">

          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">

              <span>© 2024 AI Law Assistant. Made with</span>

              <Heart className="h-4 w-4 text-red-500" />

              <span>in India.</span>

            </div>

            

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">

              <span>Powered by OpenAI GPT-4</span>

              <span>•</span>

              <span>Built with React & Node.js</span>

              <span>•</span>

              <span>Secured with Enterprise-grade encryption</span>

            </div>

          </div>

        </div>

      </div>

    </footer>

  );

};



export default Footer;