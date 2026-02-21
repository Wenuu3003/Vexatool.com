import { Helmet } from "react-helmet";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FileText, Shield, Zap, Users, Heart, Globe, Lock, Eye, Lightbulb } from "lucide-react";
import { useCanonicalUrl } from "@/hooks/useCanonicalUrl";
import { Link } from "react-router-dom";

const AboutUs = () => {
  const canonicalUrl = useCanonicalUrl();
  
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is MyPDFs?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "MyPDFs is a free online platform offering 50+ tools for PDF editing, image conversion, AI-powered assistance, and various utilities. All tools work directly in your browser for maximum privacy and security."
        }
      },
      {
        "@type": "Question",
        "name": "Is MyPDFs really free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all tools on MyPDFs are 100% free with no hidden charges, no registration required, and no usage limits. We are supported by non-intrusive advertisements."
        }
      },
      {
        "@type": "Question",
        "name": "Are my files safe with MyPDFs?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely! Most of our tools process files directly in your browser, meaning your files never leave your device. For tools that require server processing, files are automatically deleted after processing."
        }
      },
      {
        "@type": "Question",
        "name": "Who created MyPDFs?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "MyPDFs is built by a dedicated team of developers based in India who are passionate about making document management accessible to everyone worldwide."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>About Us | MyPDFs.in - Free Online PDF & Document Tools</title>
        <meta 
          name="description" 
          content="Learn about MyPDFs.in — why we built it, our commitment to privacy and free tools, and how we serve millions of users in India and worldwide." 
        />
        <meta name="keywords" content="about MyPDFs, PDF tools company, free PDF tools, document management, online tools India" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="About Us - MyPDFs.in" />
        <meta property="og:description" content="Learn about MyPDFs.in and our mission to provide free, secure PDF tools for everyone." />
        <meta property="og:url" content={canonicalUrl} />
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-12">
          {/* Hero */}
          <section className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              About MyPDFs.in
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We build free document tools that respect your privacy and actually work. No gimmicks, no paywalls, no fine print.
            </p>
          </section>

          {/* Why We Built This */}
          <section className="max-w-4xl mx-auto mb-16">
            <div className="bg-card border rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6 text-foreground">Why MyPDFs Exists</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                It started with a frustration most of us have felt. You need to merge two PDFs for a job application. You search online, find a tool, upload your files — and then you're asked to create an account, pay a subscription, or accept watermarks on your output. For something that should take thirty seconds, you end up wasting twenty minutes.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                We asked a simple question: why should basic document tasks cost money? Students preparing for competitive exams shouldn't have to choose between a PDF tool subscription and a textbook. A small business owner filing GST returns shouldn't pay ₹1,500 a month just to compress an invoice. A job seeker applying to twenty companies shouldn't need twenty watermarked merged PDFs.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                So we built MyPDFs — a platform where every tool is free, every tool works without registration, and most tools process your files right inside your browser so your documents never leave your device. Not because we're running a charity, but because we believe essential tools should be accessible to everyone.
              </p>
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="max-w-4xl mx-auto mb-16">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border rounded-2xl p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To make document management genuinely accessible — not "free with limitations" or "free for 3 days" — but properly free and properly private. We want a student in a small town and a professional in a metro city to have equal access to the same quality tools.
                </p>
              </div>
              <div className="bg-card border rounded-2xl p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  A world where nobody has to worry about document formats. Where converting, compressing, merging, or editing a PDF is as natural as opening a browser tab. We're not there yet — but with every tool we build and every user we help, we get a step closer.
                </p>
              </div>
            </div>
          </section>

          {/* What We Stand For */}
          <section className="max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-foreground">What We Stand For</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card border rounded-xl p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Privacy Without Compromise</h3>
                <p className="text-muted-foreground">
                  Your documents contain personal information — Aadhaar details, salary slips, medical reports, legal agreements. Most of our tools process files locally in your browser. No uploads, no server copies, no data retention. We can't see your files even if we wanted to.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Genuinely Free</h3>
                <p className="text-muted-foreground">
                  We don't hide features behind paywalls. We don't limit you to three merges per day. We don't add watermarks. Every tool on MyPDFs works fully, every time, without registration. Our operational costs are covered by non-intrusive advertisements — that's it.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Simplicity First</h3>
                <p className="text-muted-foreground">
                  We design for people who don't want to read manuals. Upload your file, click a button, get your result. If a tool needs more than three steps, we rethink it. Complexity might impress developers, but simplicity helps users.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Built for Everyone</h3>
                <p className="text-muted-foreground">
                  Our tools work on budget smartphones, old laptops, and slow internet connections. We optimize for the real world — not just high-end devices with fast broadband. If it works on a ₹8,000 phone with 3G, it works everywhere.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Quality Output</h3>
                <p className="text-muted-foreground">
                  Free doesn't mean low quality. Our PDF merger preserves fonts and layouts. Our compressor reduces size without visible degradation. Our converters maintain formatting accuracy. We test every tool rigorously because our reputation depends on the results you get.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Transparency</h3>
                <p className="text-muted-foreground">
                  We tell you exactly how each tool works. If processing happens in your browser, we say so. If a tool requires server-side processing, we disclose that too. No vague "your files are safe" promises — we explain the mechanism.
                </p>
              </div>
            </div>
          </section>

          {/* Who We Serve */}
          <section className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center text-foreground">Who Uses MyPDFs</h2>
            <div className="bg-card border rounded-2xl p-8">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Our users span a wide spectrum, and that diversity keeps us honest about building tools that truly work for everyone:
              </p>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Students</strong> preparing for UPSC, SSC, banking exams, and university admissions — merging certificates, compressing documents for portal uploads, converting assignments to PDF.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Job seekers</strong> across India building resumes with our AI tools, merging cover letters and certificates, resizing photos for application forms.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Small business owners</strong> generating QR codes for UPI payments, compressing invoices, creating PDF proposals for clients, and calculating GST.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Professionals</strong> — CAs, lawyers, consultants, teachers — who handle documents daily and need reliable tools that don't eat into their budget or waste their time.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Everyday users</strong> who occasionally need to merge a few files, resize a photo, or scan a QR code — and shouldn't have to install an app for that.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* The Team */}
          <section className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Our Team</h2>
            <div className="bg-card border rounded-2xl p-8">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                MyPDFs is built by a small, focused team of developers and designers based in India. We don't have a fancy office or a corporate org chart. What we do have is a shared obsession with making things work simply and reliably.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Each member brings something different to the table — frontend engineering, document processing expertise, UX design, and content writing. But we all share one principle: if a tool doesn't feel effortless for the person using it, it's not done yet.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We actively listen to user feedback. Many of our tools exist because someone emailed us saying "I wish I could do X." That direct line between users and builders is something we intend to maintain, no matter how much we grow.
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">What is MyPDFs?</h3>
                <p className="text-muted-foreground">
                  MyPDFs.in is a free online platform with 50+ tools for working with PDFs, images, and documents. Everything from <Link to="/merge-pdf" className="text-primary hover:underline">merging PDFs</Link> and <Link to="/compress-pdf" className="text-primary hover:underline">compressing files</Link> to <Link to="/qr-code-generator" className="text-primary hover:underline">generating QR codes</Link> and building resumes with AI. Most tools run directly in your browser for maximum privacy.
                </p>
              </div>
              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">Is MyPDFs really free?</h3>
                <p className="text-muted-foreground">
                  Yes — completely. No hidden charges, no daily limits, no watermarks, no registration required. We sustain operations through non-intrusive advertisements. That's the only revenue model.
                </p>
              </div>
              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">Are my files safe?</h3>
                <p className="text-muted-foreground">
                  Most of our tools process files entirely inside your browser using client-side JavaScript. Your files never leave your device — there's no upload to any server. For the few tools that require server processing, files are automatically deleted immediately after the task completes.
                </p>
              </div>
              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">Who built MyPDFs?</h3>
                <p className="text-muted-foreground">
                  A dedicated team of developers based in India who are passionate about making document tools accessible to everyone — regardless of budget, device, or technical skill level. We serve users across India and globally.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="max-w-4xl mx-auto">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Get in Touch</h2>
              <p className="text-muted-foreground mb-4">
                Have a suggestion, found a bug, or want to say hello? We genuinely read every message.
              </p>
              <p className="text-lg mb-4">
                <a 
                  href="mailto:mypdfs3003@gmail.com" 
                  className="text-primary hover:underline font-medium"
                >
                  mypdfs3003@gmail.com
                </a>
              </p>
              <p className="text-sm text-muted-foreground">
                You can also visit our <Link to="/contact" className="text-primary hover:underline">Contact page</Link> for more ways to reach us.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AboutUs;
