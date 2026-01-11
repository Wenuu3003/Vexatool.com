import { Facebook, Twitter, Linkedin, Link2, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface SocialShareProps {
  title: string;
  url?: string;
  description?: string;
}

export const SocialShare = ({ title, url, description }: SocialShareProps) => {
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareText = description || `Check out ${title} - Free online tool at Mypdfs`;

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      color: "hover:bg-green-500 hover:text-white",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: "hover:bg-blue-600 hover:text-white",
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color: "hover:bg-sky-500 hover:text-white",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: "hover:bg-blue-700 hover:text-white",
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
      color: "hover:bg-red-500 hover:text-white",
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share this tool with your friends and colleagues.",
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually from the address bar.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-muted/30 rounded-xl p-6 border border-border">
      <h3 className="font-semibold text-foreground mb-3 text-center">
        Share this tool & help others!
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-4">
        Found this useful? Share it with friends, colleagues, or on social media.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {shareLinks.map((link) => (
          <Button
            key={link.name}
            variant="outline"
            size="sm"
            asChild
            className={`gap-2 transition-all ${link.color}`}
          >
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${link.name}`}
            >
              <link.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{link.name}</span>
            </a>
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={copyLink}
          className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <Link2 className="w-4 h-4" />
          <span className="hidden sm:inline">Copy Link</span>
        </Button>
      </div>
    </div>
  );
};
