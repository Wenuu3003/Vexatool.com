import { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LucideIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
  children: ReactNode;
}

export const ToolLayout = ({
  title,
  description,
  icon: Icon,
  colorClass,
  children,
}: ToolLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-8 md:py-12 bg-background">
          <div className="container mx-auto px-4">
            <Link to="/">
              <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
                Back to all tools
              </Button>
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center",
                  colorClass
                )}
              >
                <Icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {title}
                </h1>
                <p className="text-muted-foreground mt-1">{description}</p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">{children}</div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
