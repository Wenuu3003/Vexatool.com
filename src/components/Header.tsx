import { FileText, ChevronDown, Menu, LogOut, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MegaMenu, MobileMegaMenu } from "@/components/MegaMenu";
import { cn } from "@/lib/utils";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border" role="banner">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" aria-label="MyPDFAI Home - Free Online Tools">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-foreground">
              <span className="text-primary">MyPDF</span>AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            <Button
              variant="ghost"
              className={cn(
                "text-foreground hover:text-primary flex items-center gap-1",
                megaMenuOpen && "bg-muted"
              )}
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              aria-expanded={megaMenuOpen}
              aria-label="Open all tools menu"
            >
              All Tools
              <ChevronDown className={cn("w-4 h-4 transition-transform", megaMenuOpen && "rotate-180")} aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              className="text-foreground hover:text-primary"
              onClick={() => handleNavigation("/ai-resume-builder")}
            >
              AI Resume Builder
            </Button>
            <Button
              variant="ghost"
              className="text-foreground hover:text-primary"
              onClick={() => handleNavigation("/merge-pdf")}
            >
              Merge PDF
            </Button>
            <Button
              variant="ghost"
              className="text-foreground hover:text-primary"
              onClick={() => handleNavigation("/compress-pdf")}
            >
              Compress PDF
            </Button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="w-4 h-4" />
                    {user.email?.split("@")[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut} className="gap-2">
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" className="text-foreground" onClick={() => handleNavigation("/auth")}>
                  Login
                </Button>
                <Button variant="default" onClick={() => handleNavigation("/auth")}>
                  Sign up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </Button>
        </div>

        {/* Desktop Mega Menu */}
        {megaMenuOpen && (
          <div className="hidden md:block absolute left-0 right-0 top-16 bg-card border-b border-border shadow-lg animate-fade-in">
            <div className="container mx-auto">
              <MegaMenu onNavigate={() => setMegaMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-card z-50 overflow-y-auto animate-fade-in">
            <MobileMegaMenu onNavigate={closeMobileMenu} />
            <div className="p-4 border-t border-border">
              {user ? (
                <Button variant="outline" className="w-full gap-2" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                  Sign out
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => handleNavigation("/auth")}>
                    Login
                  </Button>
                  <Button variant="default" className="flex-1" onClick={() => handleNavigation("/auth")}>
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mega menu */}
      {megaMenuOpen && (
        <div
          className="fixed inset-0 top-16 bg-black/20 z-40 hidden md:block"
          onClick={() => setMegaMenuOpen(false)}
        />
      )}
    </header>
  );
};
