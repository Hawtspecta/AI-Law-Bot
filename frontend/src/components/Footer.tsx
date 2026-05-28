import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MessageSquare, 
  FileText, 
  Newspaper, 
  Info,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Heart,
  X
} from "lucide-react";

import { getTranslation } from "@/lib/translations";

interface FooterProps {
  currentLanguage?: string;
}

const Footer = ({ currentLanguage = 'en' }: FooterProps) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (modalKey: string) => {
    setActiveModal(modalKey);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const modalContent: Record<string, { title: string; content: string[] }> = {
    'privacy': {
      title: 'Privacy Policy',
      content: [
        'We collect and process your data in accordance with applicable data protection laws.',
        'Your queries are processed anonymously by default to protect your privacy.',
        'We do not share your personal information with third parties without your consent.',
        'You can request deletion of your data at any time through our support channels.',
        'We use industry-standard encryption to protect your data in transit and at rest.'
      ]
    },
    'terms': {
      title: 'Terms of Service',
      content: [
        'By using this service, you agree to these terms and conditions.',
        'The AI responses are for informational purposes only and do not constitute legal advice.',
        'We are not responsible for decisions made based on the information provided.',
        'You must not use this service for illegal purposes or to generate harmful content.',
        'We reserve the right to suspend or terminate access for violations of these terms.'
      ]
    },
    'cookies': {
      title: 'Cookie Policy',
      content: [
        'We use essential cookies to ensure the website functions properly.',
        'We use analytics cookies to understand how you use our service and improve it.',
        'You can manage your cookie preferences through your browser settings.',
        'Disabling certain cookies may affect the functionality of the website.',
        'We do not use cookies for advertising or tracking across third-party sites.'
      ]
    },
    'data-protection': {
      title: 'Data Protection',
      content: [
        'Your data is protected under GDPR and other applicable data protection regulations.',
        'We implement appropriate technical and organizational measures to protect your data.',
        'Data retention periods are configurable in your privacy settings.',
        'You have the right to access, rectify, or delete your personal data.',
        'We conduct regular security audits to ensure data protection compliance.'
      ]
    },
    'help': {
      title: 'Help Center',
      content: [
        'Browse our FAQ section for quick answers to common questions.',
        'Use our interactive guides to learn how to use each feature effectively.',
        'Contact our support team for personalized assistance.',
        'Access video tutorials for step-by-step instructions.',
        'Check our documentation for detailed technical information.'
      ]
    },
    'contact': {
      title: 'Contact Support',
      content: [
        'Email us at support@ailawassistant.com for general inquiries.',
        'Call us at +91 98765 43210 for urgent assistance.',
        'Our support team is available 24/7 to help you.',
        'We typically respond to emails within 24 hours.',
        'Visit our office in Mumbai for in-person consultations.'
      ]
    },
    'api-docs': {
      title: 'API Documentation',
      content: [
        'Base URL: https://api.ailawassistant.com',
        'Authentication: Bearer token required for all requests.',
        'Rate limits: 100 requests per minute per user.',
        'Available endpoints: /chat, /documents, /forms, /compare.',
        'For detailed API documentation, visit our developer portal.'
      ]
    },
    'status': {
      title: 'Status Page',
      content: [
        'Current Status: All systems operational',
        'Uptime: 99.9% over the last 30 days',
        'Last Incident: None in the last 30 days',
        'Response Time: < 200ms average',
        'For real-time status updates, check our monitoring dashboard.'
      ]
    }
  };



  const navigationLinks = [
    { id: 'hero', label: 'Home', icon: MessageSquare },
    { id: 'ask-a-question', label: 'Ask a Question', icon: MessageSquare },
    { id: 'tools', label: 'Tools', icon: FileText },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'how-it-works', label: 'How It Works', icon: Info }
  ];



  const legalLinks = [
    { label: 'Privacy Policy', key: 'privacy' },
    { label: 'Terms of Service', key: 'terms' },
    { label: 'Cookie Policy', key: 'cookies' },
    { label: 'Data Protection', key: 'data-protection' }
  ];



  const supportLinks = [
    { label: 'Help Center', key: 'help' as string },
    { label: 'Contact Support', key: 'contact' as string },
    { label: 'API Documentation', key: 'api-docs' as string },
    { label: 'Status Page', key: 'status' as string }
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
                <button
                  key={link.label}
                  onClick={() => openModal(link.key)}
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group w-full text-left"
                >
                  <ExternalLink className="h-3 w-3 group-hover:scale-110 transition-transform" />
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          </div>



          {/* Support Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-heading font-semibold text-primary">Support</h3>
            <div className="space-y-3">
              {supportLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => link.key && openModal(link.key)}
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors group w-full text-left"
                >
                  <ExternalLink className="h-3 w-3 group-hover:scale-110 transition-transform" />
                  <span>{link.label}</span>
                </button>
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

          </div>

        </div>
      </div>

      {/* Modal */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <Card 
            className="max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-primary">
                {modalContent[activeModal]?.title}
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={closeModal}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {modalContent[activeModal]?.content.map((item, idx) => (
                <p key={idx} className="text-sm text-muted-foreground">
                  {item}
                </p>
              ))}
            </div>
          </Card>
        </div>
      )}
    </footer>
  );
};



export default Footer;