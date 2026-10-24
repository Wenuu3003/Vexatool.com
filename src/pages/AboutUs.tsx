import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CanonicalHead } from "@/components/CanonicalHead";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

const faqs = [
  { question: "What is VexaTool?", answer: "VexaTool is a collection of free online tools for PDFs, images, QR codes, calculations and everyday text or unit-conversion tasks." },
  { question: "Do I need an account?", answer: "Core tools work without a VexaTool account. Accessing a private Google document may require signing in to Google. Supported formats and file-size limits vary by tool." },
  { question: "How are files processed?", answer: "Many file operations run locally in your browser. Some features require external services for data, model downloads or document export. Advertising and analytics also make network requests. Read the Privacy Policy and the tool instructions before handling sensitive documents." },
  { question: "Does VexaTool work on mobile?", answer: "The interface adapts to mobile and desktop screens. Processing depends on browser support, available memory and document complexity. Large files may work better on a desktop." },
  { question: "Will conversions preserve every detail?", answer: "No. Supported formats and conversion fidelity vary. Complex tables, fonts, scanned documents and presentation layouts may need manual correction. Keep your original file and inspect the downloaded result." },
  { question: "Does HTTPS mean a tool is certified or legally compliant?", answer: "HTTPS protects a connection in transit. It does not establish a security certification, regulatory compliance or suitability for confidential work. Check your organization's requirements before processing restricted information." },
];

const AboutUs = () => (
  <>
    <CanonicalHead title="About VexaTool | Free PDF, Image & Calculator Tools" description="Learn what VexaTool offers, how browser-based file processing works, and what to check before using conversions, photo presets and calculators." />
    <Helmet>
      <script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) })}</script>
    </Helmet>
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <section className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">About VexaTool</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">Free browser-based tools for common document, image and everyday calculation tasks.</p>
        </section>
        <section className="max-w-4xl mx-auto mb-12 bg-card border rounded-2xl p-6 md:p-10">
          <h2 className="text-2xl font-bold mb-4 text-foreground">What You Can Do</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">Combine or organize PDF pages, resize images, create QR codes and calculate useful values without installing a desktop application. Each tool explains its inputs and output format.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "PDF Tools", path: "/pdf-tools", text: "Merge, split, rotate, encrypt and convert supported documents." },
              { title: "Image Tools", path: "/image-tools", text: "Resize, compress and convert images." },
              { title: "Calculators", path: "/calculator-tools", text: "Calculate percentages, age, EMI, BMI and other estimates." },
              { title: "QR & Utility Tools", path: "/qr-tools", text: "Generate and scan QR codes; explore the tool directory for text and unit utilities." },
            ].map(item => <Link key={item.path} to={item.path} className="border rounded-xl p-4 hover:border-primary"><h3 className="font-semibold text-foreground mb-2">{item.title}</h3><p className="text-sm text-muted-foreground">{item.text}</p></Link>)}
          </div>
        </section>
        <section className="max-w-4xl mx-auto mb-12 bg-card border rounded-2xl p-6 md:p-10">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Choose the Right Tool for Your File</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">Keep a backup of your source file. Check the supported format and size, then compare the downloaded output with the original. Office conversion can simplify layouts. PDF-to-PowerPoint creates slide images in a ZIP, not an editable PPTX. A drawn signature is not a certificate-based digital signature.</p>
          <p className="text-muted-foreground leading-relaxed">Photo presets do not guarantee acceptance by a government portal. Calculator results are mathematical outputs or estimates, not professional medical, tax or financial advice. Follow the receiving organization’s requirements.</p>
        </section>
        <section className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Frequently Asked Questions</h2>
          <div className="space-y-4">{faqs.map(faq => <div key={faq.question} className="bg-card border rounded-xl p-6"><h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3><p className="text-muted-foreground leading-relaxed">{faq.answer}</p></div>)}</div>
        </section>
        <section className="max-w-4xl mx-auto bg-primary/5 border rounded-2xl p-6 md:p-10">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Questions or a Problem?</h2>
          <p className="text-muted-foreground leading-relaxed">Use the <Link to="/contact" className="text-primary underline">contact page</Link> to report a problem. Include the tool name, browser and a description of what happened; avoid sending passwords or confidential documents. Read the <Link to="/privacy-policy" className="text-primary underline">Privacy Policy</Link>, or browse the <Link to="/blog" className="text-primary underline">guides</Link> for help.</p>
        </section>
      </main>
      <Footer />
    </div>
  </>
);
export default AboutUs;
