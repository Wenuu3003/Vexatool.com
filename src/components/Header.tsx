import { FileText, ChevronDown, Menu, LogOut, User } from "lucide-react";
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

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              <span className="text-primary">My</span>pdfs
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
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
              onClick={() => handleNavigation("/split-pdf")}
            >
              Split PDF
            </Button>
            <Button 
              variant="ghost" 
              className="text-foreground hover:text-primary"
              onClick={() => handleNavigation("/compress-pdf")}
            >
              Compress PDF
            </Button>
            <Button 
              variant="ghost" 
              className="text-foreground hover:text-primary flex items-center gap-1"
              onClick={() => {
                const toolsSection = document.getElementById('tools-grid');
                if (toolsSection) {
                  toolsSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  handleNavigation("/");
                }
              }}
            >
              All PDF tools
              <ChevronDown className="w-4 h-4" />
            </Button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="w-4 h-4" />
                    {user.email?.split('@')[0]}
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
                <Button variant="ghost" className="text-foreground" onClick={() => handleNavigation('/auth')}>
                  Login
                </Button>
                <Button variant="default" onClick={() => handleNavigation('/auth')}>
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
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-2">
              <Button 
                variant="ghost" 
                className="justify-start text-foreground"
                onClick={() => handleNavigation("/merge-pdf")}
              >
                Merge PDF
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start text-foreground"
                onClick={() => handleNavigation("/split-pdf")}
              >
                Split PDF
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start text-foreground"
                onClick={() => handleNavigation("/compress-pdf")}
              >
                Compress PDF
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start text-foreground"
                onClick={() => handleNavigation("/")}
              >
                All PDF tools
              </Button>
              <div className="flex gap-2 mt-4">
                {user ? (
                  <Button variant="outline" className="flex-1 gap-2" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1" onClick={() => handleNavigation('/auth')}>
                      Login
                    </Button>
                    <Button variant="default" className="flex-1" onClick={() => handleNavigation('/auth')}>
                      Sign up
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
