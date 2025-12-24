import { MessageCircle, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const aiTools = [
  {
    title: "AI Chat Assistant",
    description: "Ask any question and get instant AI-powered answers",
    icon: MessageCircle,
    href: "/ai-chat",
    gradient: "from-blue-500 to-purple-500",
  },
  {
    title: "AI Web Search",
    description: "Search the web with AI and get cited sources",
    icon: Search,
    href: "/ai-search",
    gradient: "from-violet-500 to-purple-600",
  },
];

export const AIToolsBanner = () => {
  return (
    <section className="py-8 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border-b border-border/50" aria-labelledby="ai-tools-heading">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
          <h2 id="ai-tools-heading" className="text-lg font-semibold text-foreground">AI-Powered Tools</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {aiTools.map((tool) => (
            <Link
              key={tool.title}
              to={tool.href}
              className="group flex items-center gap-4 p-4 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 w-full sm:w-auto sm:min-w-[280px]"
              aria-label={`${tool.title} - ${tool.description}`}
            >
              <div className={`p-3 rounded-lg bg-gradient-to-r ${tool.gradient} text-white shrink-0`}>
                <tool.icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {tool.title}
                </h3>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
