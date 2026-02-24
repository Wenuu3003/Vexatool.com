import { useState } from "react";
import { Helmet } from "react-helmet";
import { Mail, Send, MessageCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCanonicalUrl } from "@/hooks/useCanonicalUrl";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const canonicalUrl = useCanonicalUrl();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const mailtoLink = `mailto:support@vexatool.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`;
    window.open(mailtoLink, '_blank');
    
    toast({
      title: "Email client opened!",
      description: "Your default email app has opened with your message. Please send the email to complete your contact request.",
    });
    
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Get in touch via email",
      value: "support@vexatool.com",
      link: "mailto:support@vexatool.com"
    },
    {
      icon: Send,
      title: "Telegram",
      description: "Join our Telegram channel",
      value: "@VexaTool",
      link: "https://t.me/VexaTool"
    },
    {
      icon: MessageCircle,
      title: "Twitter/X",
      description: "Follow us on Twitter",
      value: "@VexaTool",
      link: "https://x.com/VexaTool"
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is VexaTool really free?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes! All our tools are 100% free to use with no hidden charges, no premium tiers, and no registration required." }
      },
      {
        "@type": "Question",
        "name": "Is my data safe with VexaTool?",
        "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. Most file processing happens directly in your browser using client-side JavaScript, meaning your files never leave your device." }
      },
      {
        "@type": "Question",
        "name": "Can I use VexaTool for commercial purposes?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes, you can use our tools for both personal and commercial purposes without any restrictions." }
      },
      {
        "@type": "Question",
        "name": "How do I report a bug or suggest a feature?",
        "acceptedAnswer": { "@type": "Answer", "text": "Use the contact form, email us at support@vexatool.com, or reach out via our Telegram channel @VexaTool." }
      },
      {
        "@type": "Question",
        "name": "What types of tools does VexaTool offer?",
        "acceptedAnswer": { "@type": "Answer", "text": "VexaTool offers free tools including PDF editing, image tools, calculators, and utilities like QR code generator." }
      },
      {
        "@type": "Question",
        "name": "What is the typical response time for support?",
        "acceptedAnswer": { "@type": "Answer", "text": "We typically respond to all inquiries within 24-48 hours during business days." }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - VexaTool | Get in Touch for Support</title>
        <meta name="description" content="Contact VexaTool for support, feedback, or business inquiries. Reach us via email, Telegram, or Twitter. We typically respond within 24 hours." />
        <meta name="keywords" content="contact vexatool, vexatool support, pdf tools support, contact us, help desk" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Contact Us - VexaTool" />
        <meta property="og:description" content="Get in touch with VexaTool team for support, feedback, or business inquiries." />
        <meta property="og:url" content={canonicalUrl} />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Contact Us - VexaTool" />
        <meta name="twitter:description" content="Contact VexaTool for support and inquiries." />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact VexaTool",
            "description": "Contact page for VexaTool - Free Online PDF Tools",
            "url": canonicalUrl,
            "mainEntity": {
              "@type": "Organization",
              "name": "VexaTool",
              "url": "https://vexatool.com",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer support",
                "email": "support@vexatool.com",
                "availableLanguage": ["English"]
              }
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Contact Us</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Have a question, suggestion, or need support? We would love to hear from you. Our team typically responds within 24 hours.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {contactMethods.map((method) => (
                <a key={method.title} href={method.link} target="_blank" rel="noopener noreferrer"
                  className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <method.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{method.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                  <p className="text-sm text-primary font-medium">{method.value}</p>
                </a>
              ))}
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="bg-card border border-border rounded-xl p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><Label htmlFor="name">Name</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
                    <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
                  </div>
                  <div><Label htmlFor="subject">Subject</Label><Input id="subject" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required /></div>
                  <div><Label htmlFor="message">Message</Label><Textarea id="message" rows={5} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required /></div>
                  <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Sending..." : "Send Message"}</Button>
                </form>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Contact;
