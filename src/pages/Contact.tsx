import { Helmet } from "react-helmet";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCanonicalUrl } from "@/hooks/useCanonicalUrl";
import { Mail, MessageCircle, Send, MapPin, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const Contact = () => {
  const canonicalUrl = useCanonicalUrl();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create mailto link with form data
    const mailtoLink = `mailto:mypdfs3003@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`;
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
      value: "mypdfs3003@gmail.com",
      link: "mailto:mypdfs3003@gmail.com"
    },
    {
      icon: Send,
      title: "Telegram",
      description: "Join our Telegram channel",
      value: "@mypdfs5",
      link: "https://t.me/mypdfs5"
    },
    {
      icon: MessageCircle,
      title: "Twitter/X",
      description: "Follow us on Twitter",
      value: "@Mypdfs5",
      link: "https://x.com/Mypdfs5"
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is Mypdfs really free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! All our 50+ tools are 100% free to use with no hidden charges, no premium tiers, and no registration required. We are supported by non-intrusive advertisements."
        }
      },
      {
        "@type": "Question",
        "name": "Is my data safe with Mypdfs?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. Most file processing happens directly in your browser using client-side JavaScript, meaning your files never leave your device."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use Mypdfs for commercial purposes?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can use our tools for both personal and commercial purposes without any restrictions."
        }
      },
      {
        "@type": "Question",
        "name": "How do I report a bug or suggest a feature?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use the contact form, email us at mypdfs3003@gmail.com, or reach out via our Telegram channel @mypdfs5."
        }
      },
      {
        "@type": "Question",
        "name": "What types of tools does Mypdfs offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Mypdfs offers 50+ free tools including PDF editing, image tools, AI-powered tools, calculators, and utilities like QR code generator and currency converter."
        }
      },
      {
        "@type": "Question",
        "name": "What is the typical response time for support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We typically respond to all inquiries within 24-48 hours during business days."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Mypdfs | Get in Touch for Support</title>
        <meta name="description" content="Contact Mypdfs for support, feedback, or business inquiries. Reach us via email, Telegram, or Twitter. We typically respond within 24 hours." />
        <meta name="keywords" content="contact mypdfs, mypdfs support, pdf tools support, contact us, help desk, customer service" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Contact Us - Mypdfs" />
        <meta property="og:description" content="Get in touch with Mypdfs team for support, feedback, or business inquiries." />
        <meta property="og:url" content={canonicalUrl} />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Contact Us - Mypdfs" />
        <meta name="twitter:description" content="Contact Mypdfs for support and inquiries." />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact Mypdfs",
            "description": "Contact page for Mypdfs - Free Online PDF Tools",
            "url": canonicalUrl,
            "mainEntity": {
              "@type": "Organization",
              "name": "Mypdfs",
              "email": "mypdfs3003@gmail.com",
              "url": "https://mypdfs.in",
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "mypdfs3003@gmail.com",
                "contactType": "customer support",
                "availableLanguage": ["English", "Hindi"]
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
        <main className="flex-1">
          <section className="py-12 md:py-20 bg-gradient-to-b from-primary/5 to-background">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Contact Us
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Have questions, feedback, or need support? We're here to help. 
                Reach out to us through any of the channels below.
              </p>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Methods */}
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Get in Touch</h2>
                  <div className="space-y-6">
                    {contactMethods.map((method, index) => (
                      <a
                        key={index}
                        href={method.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <method.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{method.title}</h3>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                          <p className="text-primary font-medium mt-1">{method.value}</p>
                        </div>
                      </a>
                    ))}
                  </div>

                  <div className="mt-8 p-6 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Response Time</h3>
                    </div>
                    <p className="text-muted-foreground">
                      We typically respond within <strong>24-48 hours</strong> during business days. 
                      For urgent matters, please mention "URGENT" in your subject line.
                    </p>
                  </div>

                  <div className="mt-6 p-6 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Location</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Mypdfs is based in <strong>India</strong>. We serve users globally with our free online tools.
                    </p>
                  </div>
                </div>

                {/* Contact Form */}
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="How can we help you?"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Describe your question, feedback, or issue in detail..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Opening Email..." : "Send Message"}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By submitting this form, you agree to our{" "}
                      <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-12 md:py-16 bg-muted/20">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Frequently Asked Questions
              </h2>
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="p-6 bg-background rounded-lg border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Is Mypdfs really free?</h3>
                  <p className="text-muted-foreground">Yes! All our 50+ tools are 100% free to use with no hidden charges, no premium tiers, and no registration required. We are supported by non-intrusive advertisements that help us keep the service free for everyone.</p>
                </div>
                <div className="p-6 bg-background rounded-lg border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Is my data safe with Mypdfs?</h3>
                  <p className="text-muted-foreground">Absolutely. Most file processing happens directly in your browser using client-side JavaScript, meaning your files never leave your device. For tools requiring server processing, files are encrypted and automatically deleted immediately after processing.</p>
                </div>
                <div className="p-6 bg-background rounded-lg border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Can I use Mypdfs for commercial purposes?</h3>
                  <p className="text-muted-foreground">Yes, you can use our tools for both personal and commercial purposes without any restrictions. The processed files belong entirely to you with no watermarks or limitations.</p>
                </div>
                <div className="p-6 bg-background rounded-lg border border-border">
                  <h3 className="font-semibold text-foreground mb-2">How do I report a bug or suggest a feature?</h3>
                  <p className="text-muted-foreground">Use the contact form above, email us at mypdfs3003@gmail.com, or reach out via our Telegram channel @mypdfs5. We actively review all feedback and continuously improve our tools based on user suggestions.</p>
                </div>
                <div className="p-6 bg-background rounded-lg border border-border">
                  <h3 className="font-semibold text-foreground mb-2">What types of tools does Mypdfs offer?</h3>
                  <p className="text-muted-foreground">Mypdfs offers 50+ free tools including PDF editing (merge, split, compress, convert), image tools (compress, resize, background removal), AI-powered tools (chat, text generator, resume builder), calculators (EMI, GST, BMI, age), and utilities (QR code generator, currency converter, SEO analyzer).</p>
                </div>
                <div className="p-6 bg-background rounded-lg border border-border">
                  <h3 className="font-semibold text-foreground mb-2">What is the typical response time for support?</h3>
                  <p className="text-muted-foreground">We typically respond to all inquiries within 24-48 hours during business days. For urgent matters, please include "URGENT" in your subject line and we will prioritize your request.</p>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Contact;
