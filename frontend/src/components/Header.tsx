import { Scale, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const navItems = ["Home", "Ask a Question", "Documents", "News", "About"];
  const languages = ["English", "हिन्दी", "मराठी", "தமிழ்", "ಕನ್ನಡ"];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-accent" />
          <h1 className="text-xl font-heading font-bold text-primary">
            AI for Accessible Justice
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-medium text-foreground/80 hover:text-accent transition-smooth"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <select className="text-sm bg-secondary text-secondary-foreground rounded-lg px-3 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-accent">
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm">
            Login
          </Button>
          <Button size="sm" className="glow-primary">
            Sign Up
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-lg font-medium text-foreground/80 hover:text-accent transition-smooth"
                >
                  {item}
                </a>
              ))}
              <select className="text-sm bg-secondary text-secondary-foreground rounded-lg px-3 py-2 border border-border mt-4">
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <Button variant="outline" className="w-full mt-2">
                Login
              </Button>
              <Button className="w-full">
                Sign Up
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
