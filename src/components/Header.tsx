import { FileText, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              <span className="text-primary">We</span>lovePDF
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Merge PDF
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Split PDF
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Compress PDF
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary flex items-center gap-1">
              All PDF tools
              <ChevronDown className="w-4 h-4" />
            </Button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="text-foreground">
              Login
            </Button>
            <Button variant="default">
              Sign up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start text-foreground">
                Merge PDF
              </Button>
              <Button variant="ghost" className="justify-start text-foreground">
                Split PDF
              </Button>
              <Button variant="ghost" className="justify-start text-foreground">
                Compress PDF
              </Button>
              <Button variant="ghost" className="justify-start text-foreground">
                All PDF tools
              </Button>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1">
                  Login
                </Button>
                <Button variant="default" className="flex-1">
                  Sign up
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
