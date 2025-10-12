import { Scale, Mail, Twitter, Linkedin, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-12 border-t border-primary-foreground/10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scale className="h-6 w-6 text-accent" />
              <h3 className="text-lg font-heading font-bold">
                AI for Accessible Justice
              </h3>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Reimagining justice by breaking barriers — empowering individuals with accessible, affordable, and understandable legal help for all.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#home" className="text-white/70 hover:text-accent transition-smooth">
                  Home
                </a>
              </li>
              <li>
                <a href="#ask-a-question" className="text-white/70 hover:text-accent transition-smooth">
                  Ask a Question
                </a>
              </li>
              <li>
                <a href="#documents" className="text-white/70 hover:text-accent transition-smooth">
                  Tools
                </a>
              </li>
              <li>
                <a href="#about" className="text-white/70 hover:text-accent transition-smooth">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-white/70 hover:text-accent transition-smooth">
                  Legal News
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-accent transition-smooth">
                  Knowledge Base
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-accent transition-smooth">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-accent transition-smooth">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Connect</h4>
            <div className="flex gap-3 mb-4">
              <a
                href="#"
                className="bg-white/10 hover:bg-accent w-10 h-10 rounded-lg flex items-center justify-center transition-smooth"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-white/10 hover:bg-accent w-10 h-10 rounded-lg flex items-center justify-center transition-smooth"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-white/10 hover:bg-accent w-10 h-10 rounded-lg flex items-center justify-center transition-smooth"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-white/10 hover:bg-accent w-10 h-10 rounded-lg flex items-center justify-center transition-smooth"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-white/70">
              contact@aijustice.ai
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
            <p>© 2025 AI for Accessible Justice. All rights reserved.</p>
            <p className="text-center md:text-right">
              This prototype is for educational use only — not a substitute for professional legal advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
