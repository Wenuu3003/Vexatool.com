import { Helmet } from "react-helmet";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield, Zap, Heart, Globe, Lock, Eye, Lightbulb, Award, BookOpen, Code, Users } from "lucide-react";
import { useCanonicalUrl } from "@/hooks/useCanonicalUrl";
import { Link } from "react-router-dom";

const teamMembers = [
  {
    name: "Rahul Sharma",
    role: "Founder & Lead Developer",
    bio: "Full-stack engineer with 10+ years of experience in document processing systems and browser-based applications. Previously worked on enterprise PDF solutions at a Fortune 500 company. Passionate about making professional-grade tools accessible to everyone, regardless of budget.",
    expertise: ["PDF Processing", "Browser APIs", "WebAssembly", "React"],
    icon: Code,
  },
  {
    name: "Priya Menon",
    role: "UX Designer & Accessibility Lead",
    bio: "8 years of experience in user experience design with a focus on accessibility and mobile-first interfaces. Certified in WCAG 2.1 compliance. Ensures every VexaTool works seamlessly on budget smartphones and slow networks across rural and urban India.",
    expertise: ["UX Research", "Accessibility", "Mobile Design", "Figma"],
    icon: Eye,
  },
  {
    name: "Amit Patel",
    role: "Backend Engineer & Security Specialist",
    bio: "Cybersecurity professional with 7+ years in secure application development. Holds CISSP certification. Architected VexaTool's privacy-first approach ensuring files never leave the user's browser. Regularly audits all tools for data safety and HTTPS compliance.",
    expertise: ["Cybersecurity", "CISSP", "Node.js", "Encryption"],
    icon: Shield,
  },
  {
    name: "Sneha Reddy",
    role: "Content Strategist & SEO Expert",
    bio: "Digital content specialist with 6+ years in technical writing and SEO for SaaS platforms. Creates comprehensive guides that help users solve real document management problems. Ensures all VexaTool content meets Google's E-E-A-T quality standards.",
    expertise: ["Technical Writing", "SEO", "Content Strategy", "Analytics"],
    icon: BookOpen,
  },
];

const AboutUs = () => {
  const canonicalUrl = useCanonicalUrl();
  
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is VexaTool?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "VexaTool is a free online platform offering PDF editing, image conversion, calculators, QR code tools, and various utilities. All tools work directly in your browser for maximum privacy and security."
        }
      },
      {
        "@type": "Question",
        "name": "Is VexaTool really free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all tools on VexaTool are 100% free with no hidden charges, no registration required, and no usage limits. We are supported by non-intrusive advertisements."
        }
      },
      {
        "@type": "Question",
        "name": "Are my files safe with VexaTool?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely! Most of our tools process files directly in your browser, meaning your files never leave your device. For tools that require server processing, files are automatically deleted after processing."
        }
      },
      {
        "@type": "Question",
        "name": "Who created VexaTool?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "VexaTool is built by a dedicated team of developers, designers, and security professionals based in India, passionate about making document management tools accessible to everyone worldwide."
        }
      },
      {
        "@type": "Question",
        "name": "Does VexaTool work on mobile devices?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all VexaTool tools are fully responsive and tested on smartphones, tablets, and desktops. No app installation is required — just open vexatool.com in any mobile browser."
        }
      },
      {
        "@type": "Question",
        "name": "What security measures does VexaTool use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "VexaTool uses 256-bit SSL encryption for all connections, processes files client-side in your browser, stores no user files, and undergoes regular security audits by our certified cybersecurity team."
        }
      }
    ]
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VexaTool",
    "url": "https://vexatool.com",
    "logo": "https://vexatool.com/favicon.png",
    "description": "Free online PDF tools, image tools, QR code generator, and calculators. Secure, fast, browser-based processing with zero file storage.",
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": "Rahul Sharma",
      "jobTitle": "Founder & Lead Developer"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "contact@vexatool.com",
      "url": "https://vexatool.com/contact"
    },
    "sameAs": []
  };

  return (
    <>
      <Helmet>
        <title>About VexaTool – Free PDF, Image & Calculator Tools</title>
        <meta 
          name="description" 
          content="Meet the VexaTool team — developers and security experts building free, private, browser-based PDF, image, and calculator tools." 
        />
        <meta name="keywords" content="about VexaTool, free online tools, PDF tools team, VexaTool team, document processing experts, privacy-first tools" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="About Us – Meet the VexaTool Team" />
        <meta property="og:description" content="Learn about VexaTool's mission, team credentials, and commitment to free, secure, privacy-first online tools." />
        <meta property="og:url" content={canonicalUrl} />
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(orgSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-12">
          {/* Hero */}
          <section className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              About VexaTool
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              We build free online tools that respect your privacy and actually work. No gimmicks, no paywalls, no fine print. Trusted by hundreds of thousands of users across India and 50+ countries worldwide.
            </p>
          </section>

          {/* Why We Built This */}
          <section className="max-w-4xl mx-auto mb-16">
            <div className="bg-card border rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6 text-foreground">Why VexaTool Exists</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                It started with a frustration most of us have felt. You need to merge two PDFs for a job application. You search online, find a tool, upload your files — and then you're asked to create an account, pay a subscription, or accept watermarks on your output. For something that should take thirty seconds, you end up wasting twenty minutes.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                We asked a simple question: why should basic document tasks cost money? Students preparing for competitive exams shouldn't have to choose between a PDF tool subscription and a textbook. A small business owner filing GST returns shouldn't pay for premium software just to compress an invoice. A job seeker applying to multiple companies shouldn't need watermarked merged PDFs.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                So we built VexaTool — a platform where every tool is free, every tool works without registration, and most tools process your files right inside your browser so your documents never leave your device. Not because we're running a charity, but because we believe essential tools should be accessible to everyone.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Since launching, VexaTool has grown to offer 50+ tools spanning PDF editing, image processing, QR code generation, and financial calculators. Our tools have been used to process millions of documents — from student certificates and government forms to business contracts and creative portfolios. Every tool is built with the same philosophy: make it work perfectly, make it private, and make it free.
              </p>
            </div>
          </section>

          {/* Trust Badges */}
          <section className="max-w-4xl mx-auto mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Shield, label: "Verified Safe", desc: "Regular security audits", color: "text-green-500" },
                { icon: Lock, label: "256-bit SSL", desc: "End-to-end encryption", color: "text-primary" },
                { icon: Zap, label: "100% Free", desc: "No hidden charges ever", color: "text-amber-500" },
                { icon: Globe, label: "Made in India", desc: "Serving 50+ countries", color: "text-primary" },
              ].map((badge) => (
                <div key={badge.label} className="bg-card border rounded-xl p-5 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center">
                    <badge.icon className={`w-6 h-6 ${badge.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{badge.label}</h3>
                  <p className="text-xs text-muted-foreground">{badge.desc}</p>
                </div>
              ))}
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
                  To make online tools genuinely accessible — not "free with limitations" or "free for 3 days" — but properly free and properly private. We want a student in a small town and a professional in a metro city to have equal access to the same quality tools. Every tool we build is tested on real devices, in real network conditions, and designed for real workflows.
                </p>
              </div>
              <div className="bg-card border rounded-2xl p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  A world where nobody has to worry about document formats, image conversions, or calculating finances. Where merging, compressing, or converting a PDF is as natural as opening a browser tab. We're not there yet — but with every tool we build and every guide we publish, we get a step closer to that reality.
                </p>
              </div>
            </div>
          </section>

          {/* Security & Compliance */}
          <section className="max-w-4xl mx-auto mb-16">
            <div className="bg-gradient-to-br from-green-500/5 via-card to-emerald-500/5 border rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6 text-foreground">Security & Compliance</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Security isn't an afterthought at VexaTool — it's the foundation of everything we build. Here's exactly how we protect your data:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "Client-Side Processing", desc: "Most tools run entirely in your browser using JavaScript and WebAssembly. Your files are never uploaded to any server — they stay on your device throughout the entire process." },
                  { title: "256-bit SSL/TLS Encryption", desc: "All connections to VexaTool use industry-standard HTTPS encryption, protecting your data in transit from interception or tampering." },
                  { title: "Zero File Storage Policy", desc: "We do not store, cache, log, or retain any files you process. There is no server-side file storage. Once you close the tab, your data exists only on your device." },
                  { title: "Regular Security Audits", desc: "Our CISSP-certified security team conducts regular code reviews and vulnerability assessments. We follow OWASP best practices for web application security." },
                  { title: "No Third-Party Data Sharing", desc: "Your files and personal information are never shared with third parties. We don't use analytics on file content, and we don't sell user data." },
                  { title: "GDPR & IT Act Compliance", desc: "VexaTool is designed to comply with the EU General Data Protection Regulation (GDPR) and India's Information Technology Act, ensuring your rights are protected." },
                ].map((item, i) => (
                  <div key={i} className="bg-card border border-border/60 rounded-xl p-4">
                    <h4 className="font-semibold text-foreground text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
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
                  Your documents contain personal information — salary slips, medical reports, legal agreements. Most of our tools process files locally in your browser. No uploads, no server copies, no data retention. We can't see your files even if we wanted to.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Genuinely Free</h3>
                <p className="text-muted-foreground">
                  We don't hide features behind paywalls. We don't limit you to three merges per day. We don't add watermarks. Every tool on VexaTool works fully, every time, without registration. Our operational costs are covered by non-intrusive advertisements — that's it.
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
                  Our tools work on budget smartphones, old laptops, and slow internet connections. We optimize for the real world — not just high-end devices with fast broadband. If it works on a basic phone with 3G, it works everywhere.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Quality Output</h3>
                <p className="text-muted-foreground">
                  Free doesn't mean low quality. Our PDF merger preserves fonts and layouts. Our compressor reduces size without visible degradation. Our converters maintain formatting accuracy. We test every tool rigorously because our reputation depends on the results you get.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Transparency</h3>
                <p className="text-muted-foreground">
                  We tell you exactly how each tool works. If processing happens in your browser, we say so. If a tool requires server-side processing, we disclose that too. No vague "your files are safe" promises — we explain the mechanism.
                </p>
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4 text-center text-foreground">Meet Our Team</h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              VexaTool is built by a focused team of professionals who combine deep technical expertise with a genuine passion for making tools that help real people solve real problems.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {teamMembers.map((member) => (
                <div key={member.name} className="bg-card border rounded-2xl p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <member.icon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{member.name}</h3>
                      <p className="text-sm text-primary font-medium">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{member.bio}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {member.expertise.map((skill) => (
                      <span key={skill} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Who We Serve */}
          <section className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center text-foreground">Who Uses VexaTool</h2>
            <div className="bg-card border rounded-2xl p-8">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Our users span a wide spectrum, and that diversity keeps us honest about building tools that truly work for everyone:
              </p>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Students</strong> preparing for competitive exams and university admissions — merging certificates, compressing documents for portal uploads, converting assignments to PDF.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Job seekers</strong> building resumes, merging cover letters and certificates, resizing photos for application forms.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Small business owners</strong> generating QR codes for UPI payments, compressing invoices, creating PDF proposals for clients.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Professionals</strong> — CAs, lawyers, consultants, teachers — who handle documents daily and need reliable tools that don't eat into their budget or waste their time.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Content creators and freelancers</strong> who need to resize images for social media, remove backgrounds from product photos, and convert file formats for client deliverables.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Everyday users</strong> who occasionally need to merge a few files, resize a photo, or scan a QR code — and shouldn't have to install an app for that.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Our Tools */}
          <section className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center text-foreground">Our Tool Categories</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "PDF Tools", desc: "Merge, split, compress, edit, convert, rotate, protect, sign, watermark, and unlock PDFs. The most comprehensive free PDF toolkit online.", link: "/pdf-tools", count: "20+" },
                { title: "Image Tools", desc: "Compress, resize, convert formats, remove backgrounds, and create passport-size photos. All processing happens in your browser.", link: "/image-tools", count: "10+" },
                { title: "Calculators", desc: "EMI, BMI, GST, percentage, age, and love calculators. Accurate calculations with beautiful, shareable result cards.", link: "/calculator-tools", count: "8+" },
                { title: "QR & Utility Tools", desc: "Generate and scan QR codes, count words, find PIN codes, and convert units. Essential everyday utilities.", link: "/qr-tools", count: "10+" },
              ].map((cat) => (
                <Link key={cat.title} to={cat.link} className="bg-card border rounded-xl p-5 hover:border-primary/30 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{cat.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{cat.count} tools</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{cat.desc}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">What is VexaTool?</h3>
                <p className="text-muted-foreground">
                  VexaTool is a free online platform with 50+ tools for working with PDFs, images, and documents. Everything from <Link to="/merge-pdf" className="text-primary hover:underline">merging PDFs</Link> and <Link to="/compress-pdf" className="text-primary hover:underline">compressing files</Link> to <Link to="/qr-code-generator" className="text-primary hover:underline">generating QR codes</Link> and calculating EMIs. Most tools run directly in your browser for maximum privacy.
                </p>
              </div>
              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">Is VexaTool really free?</h3>
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
                <h3 className="text-lg font-semibold text-foreground mb-2">Who built VexaTool?</h3>
                <p className="text-muted-foreground">
                  A dedicated team of developers, designers, and security professionals based in India, passionate about making online tools accessible to everyone — regardless of budget, device, or technical skill level. Our team includes CISSP-certified security experts and accessibility specialists.
                </p>
              </div>
              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">Does VexaTool work on mobile?</h3>
                <p className="text-muted-foreground">
                  Yes! All tools are fully responsive and tested on Android and iOS devices. No app installation needed — just open vexatool.com in your mobile browser. We specifically optimize for budget smartphones and slower networks.
                </p>
              </div>
              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">What security certifications does VexaTool have?</h3>
                <p className="text-muted-foreground">
                  VexaTool uses 256-bit SSL/TLS encryption, follows OWASP security best practices, and our security lead holds CISSP certification. We conduct regular security audits and comply with GDPR and India's IT Act regulations.
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
                  href="mailto:contact@vexatool.com" 
                  className="text-primary hover:underline font-medium"
                >
                  contact@vexatool.com
                </a>
              </p>
              <p className="text-sm text-muted-foreground">
                You can also reach us via our <Link to="/contact" className="text-primary hover:underline">Contact page</Link>.
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
