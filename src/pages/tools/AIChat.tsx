import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Bot, User, Loader2, LogIn } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIChat = () => {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to use the AI Chat feature.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke("ai-chat", {
        body: { messages: [...messages, userMessage] }
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to get response");
      }

      const data = response.data;
      
      if (data.error) {
        if (data.error.includes("Authentication") || data.error.includes("401")) {
          toast({
            title: "Login Required",
            description: "Please log in to use the AI Chat feature.",
            variant: "destructive",
          });
        } else if (data.error.includes("Rate limit") || data.error.includes("429")) {
          toast({
            title: "Rate Limited",
            description: "Too many requests. Please wait a moment and try again.",
            variant: "destructive",
          });
        } else if (data.error.includes("402") || data.error.includes("Payment")) {
          toast({
            title: "Usage Limit Reached",
            description: "AI usage limit reached. Please try again later.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      const assistantMessage: Message = { 
        role: "assistant", 
        content: data.response || "I couldn't generate a response. Please try again." 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("AI Chat error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Show login prompt if not authenticated
  if (!authLoading && !user) {
    return (
      <ToolLayout
        title="AI Chat Assistant"
        description="Ask any question and get instant AI-powered answers"
        icon={MessageCircle}
        colorClass="bg-gradient-to-r from-blue-500 to-purple-500"
      >
        <div className="max-w-3xl mx-auto">
          <div className="bg-card border rounded-xl overflow-hidden flex flex-col items-center justify-center h-[400px] p-8 text-center">
            <LogIn className="w-16 h-16 mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium text-xl mb-2">Login Required</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Please log in to use the AI Chat feature. This helps us provide you with a personalized experience and prevent abuse.
            </p>
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                <LogIn className="w-4 h-4" />
                Login to Chat
              </Button>
            </Link>
          </div>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout
      title="AI Chat Assistant"
      description="Ask any question and get instant AI-powered answers"
      icon={MessageCircle}
      colorClass="bg-gradient-to-r from-blue-500 to-purple-500"
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-card border rounded-xl overflow-hidden flex flex-col h-[600px]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Bot className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <h3 className="font-medium text-lg mb-2">Welcome to AI Chat!</h3>
                <p className="text-sm">Ask me anything - I&apos;m here to help with questions about any topic.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {["How to merge PDF files?", "What is SEO?", "Explain QR codes"].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4 bg-background">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              AI responses are generated. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default AIChat;
