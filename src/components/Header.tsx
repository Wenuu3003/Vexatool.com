import { ChevronDown, Menu, LogOut, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MegaMenu, MobileMegaMenu } from "@/components/MegaMenu";
import { cn } from "@/lib/utils";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (megaMenuOpen || mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [megaMenuOpen, mobileMenuOpen]);

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

  return <>
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border" role="banner">
      <div className="container mx-auto px-4">
        <div className="h-16 flex-row flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5" aria-label="VexaTool Home - Free Online Tools">
            <img alt="VexaTool logo" className="w-9 h-9 rounded-xl shadow-sm border-destructive" width={36} height={36} src="/lovable-uploads/97cc1afe-04ea-4acc-a508-3956be412371.jpg" />
            <span className="text-xl font-bold text-foreground">
              Vexa<span className="text-primary">Tool</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            <Button variant="ghost" size="sm" className={cn("text-foreground hover:text-primary flex items-center gap-1 text-sm", megaMenuOpen && "bg-muted")} onClick={() => setMegaMenuOpen(!megaMenuOpen)} aria-expanded={megaMenuOpen} aria-label="Open all tools menu">
              All Tools
              <ChevronDown className={cn("w-4 h-4 transition-transform", megaMenuOpen && "rotate-180")} aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="sm" className="text-foreground hover:text-primary text-sm" onClick={() => handleNavigation("/pdf-tools")}>
              PDF Tools
            </Button>
            <Button variant="ghost" size="sm" className="text-foreground hover:text-primary text-sm" onClick={() => handleNavigation("/image-tools")}>
              Image Tools
            </Button>
            <Button variant="ghost" size="sm" className="text-foreground hover:text-primary text-sm" onClick={() => handleNavigation("/qr-tools")}>
              QR Tools
            </Button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Button size="sm" className="bg-[hsl(142,71%,45%)] hover:bg-[hsl(142,71%,40%)] text-white" onClick={() => handleNavigation("/pdf-tools")}>
              Explore Tools
            </Button>
            {user ?
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    <span className="max-w-[100px] truncate">{user.email?.split("@")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut} className="gap-2">
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> :

            <>
                <Button variant="ghost" size="sm" className="text-foreground" onClick={() => handleNavigation("/auth")}>
                  Login
                </Button>
                <Button variant="default" size="sm" onClick={() => handleNavigation("/auth")}>
                  Sign up
                </Button>
              </>
            }
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Desktop Mega Menu */}
        {megaMenuOpen &&
        <div className="hidden lg:block absolute left-0 right-0 top-16 bg-card border-b border-border shadow-xl animate-fade-in z-50">
            <div className="container mx-auto">
              <MegaMenu onNavigate={() => setMegaMenuOpen(false)} />
            </div>
          </div>
        }
      </div>

      {megaMenuOpen && <div className="fixed inset-0 top-16 bg-black/20 z-40 hidden lg:block pointer-events-auto" onClick={() => setMegaMenuOpen(false)} />}
    </header>

    {/* Mobile Navigation */}
    {mobileMenuOpen &&
    <div className="lg:hidden fixed inset-0 top-16 bg-card z-[60] overflow-y-auto animate-fade-in overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <MobileMegaMenu onNavigate={closeMobileMenu} />
        <div className="p-4 border-t border-border">
          {user ?
        <Button variant="outline" className="w-full gap-2" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
              Sign out
            </Button> :

        <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => handleNavigation("/auth")}>
                Login
              </Button>
              <Button variant="default" className="flex-1" onClick={() => handleNavigation("/auth")}>
                Sign up
              </Button>
            </div>
        }
        </div>
      </div>
    }
  </>;
};