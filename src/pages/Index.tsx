import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AIToolsBanner } from "@/components/AIToolsBanner";
import { ToolsGrid } from "@/components/ToolsGrid";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <AIToolsBanner />
        <ToolsGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
