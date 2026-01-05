import { Helmet } from "react-helmet";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FileText, Shield, Zap, Users, Heart, Globe } from "lucide-react";

const AboutUs = () => {
  return (
    <>
      <Helmet>
        <title>About Us | MyPDFs - Free Online PDF & Document Tools</title>
        <meta 
          name="description" 
          content="Learn about MyPDFs, our mission to provide free, secure, and easy-to-use PDF tools for everyone. Discover our team and values." 
        />
        <meta name="keywords" content="about MyPDFs, PDF tools company, free PDF tools, document management, online tools" />
        <link rel="canonical" href="https://mypdfs.lovable.app/about-us" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <section className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              About MyPDFs
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We are on a mission to make document management simple, secure, and accessible to everyone. 
              Our free online tools help millions of users work with PDFs and documents effortlessly.
            </p>
          </section>

          {/* Mission Section */}
          <section className="max-w-4xl mx-auto mb-16">
            <div className="bg-card border rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6 text-foreground">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                At MyPDFs, we believe that everyone deserves access to powerful document tools without 
                the burden of expensive software subscriptions or complicated installations. Our mission 
                is to democratize document management by providing free, easy-to-use tools that work 
                directly in your browser.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We are committed to protecting your privacy. Your files are processed securely and 
                automatically deleted after use. We never store, share, or access your documents 
                beyond what is necessary to provide our services.
              </p>
            </div>
          </section>

          {/* Values Section */}
          <section className="max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card border rounded-xl p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Simplicity</h3>
                <p className="text-muted-foreground">
                  We design our tools to be intuitive and straightforward. No learning curve, no 
                  complicated settings – just upload your file and get results.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Security</h3>
                <p className="text-muted-foreground">
                  Your documents contain sensitive information. We use encryption, secure processing, 
                  and automatic file deletion to keep your data safe.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Free Access</h3>
                <p className="text-muted-foreground">
                  We believe essential tools should be free. Our core features are available to 
                  everyone without registration, payment, or hidden limitations.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Accessibility</h3>
                <p className="text-muted-foreground">
                  Our tools work on any device with a browser. No downloads, no installations – 
                  just open the website and start working with your documents.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Quality</h3>
                <p className="text-muted-foreground">
                  We continuously improve our tools to provide the best results. Whether compressing, 
                  converting, or editing, quality is never compromised.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">User Focus</h3>
                <p className="text-muted-foreground">
                  Every feature we build starts with user needs. We listen to feedback and 
                  constantly evolve to better serve our community.
                </p>
              </div>
            </div>
          </section>

          {/* What We Offer Section */}
          <section className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-foreground">What We Offer</h2>
            <div className="bg-card border rounded-2xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">PDF Tools</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Merge and split PDF files</li>
                    <li>• Compress PDFs without quality loss</li>
                    <li>• Convert PDFs to and from various formats</li>
                    <li>• Edit, sign, and watermark documents</li>
                    <li>• Protect and unlock PDF files</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Image Tools</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Compress images efficiently</li>
                    <li>• Convert between image formats</li>
                    <li>• Resize images for any purpose</li>
                    <li>• Remove image backgrounds</li>
                    <li>• Convert images to PDF</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">AI Tools</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• AI-powered text generation</li>
                    <li>• Grammar and writing assistance</li>
                    <li>• Resume builder with AI suggestions</li>
                    <li>• Hashtag and content generators</li>
                    <li>• Intelligent search capabilities</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Utility Tools</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• QR code generator and scanner</li>
                    <li>• Various calculators (EMI, GST, BMI)</li>
                    <li>• Currency and unit converters</li>
                    <li>• Word counter and SEO tools</li>
                    <li>• Pin code finder</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Our Team</h2>
            <div className="bg-card border rounded-2xl p-8 text-center">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                MyPDFs is built by a passionate team of developers, designers, and document experts 
                who share a common goal: making document management accessible to everyone. We combine 
                technical expertise with user-centered design to create tools that truly help people.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Based in India, we serve users worldwide and are committed to continuous improvement. 
                Our small but dedicated team works tirelessly to add new features, improve performance, 
                and ensure the security of every file processed through our platform.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="max-w-4xl mx-auto">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Get in Touch</h2>
              <p className="text-muted-foreground mb-6">
                Have questions, suggestions, or feedback? We would love to hear from you.
              </p>
              <p className="text-lg">
                <a 
                  href="mailto:support@mypdfs.app" 
                  className="text-primary hover:underline font-medium"
                >
                  support@mypdfs.app
                </a>
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
