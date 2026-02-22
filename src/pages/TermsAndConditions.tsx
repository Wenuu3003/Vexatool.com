import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CanonicalHead } from "@/components/CanonicalHead";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <CanonicalHead
        title="Terms & Conditions | VexaTool - Usage Guidelines"
        description="Read VexaTool's Terms & Conditions. Understand your rights and responsibilities when using our free online tools."
        keywords="terms of service, terms and conditions, usage policy, VexaTool terms"
      />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Terms & Conditions</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 2026</p>
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">By accessing or using VexaTool, you agree to be bound by these Terms & Conditions. If you do not agree, you should not use our website or services.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Description of Services</h2>
            <p className="text-muted-foreground leading-relaxed">VexaTool provides free online tools including:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>PDF manipulation tools (merge, split, compress, convert, rotate, etc.)</li>
              <li>Image conversion and editing tools</li>
              <li>QR code generation and scanning</li>
              <li>Various calculators and utility tools</li>
              <li>Document conversion tools</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">We reserve the right to modify, suspend, or discontinue any service at any time.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Use of Website and Tools</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use our services only for lawful purposes</li>
              <li>Not upload malicious files, viruses, or harmful content</li>
              <li>Not attempt to gain unauthorized access to our systems</li>
              <li>Not use automated tools or bots to access our services excessively</li>
              <li>Comply with all applicable laws</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">The VexaTool website, including its design, logo, content, features, and functionality, is owned by VexaTool and is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute any part of our website without permission.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">File Ownership and Rights</h2>
            <p className="text-muted-foreground leading-relaxed">You retain full ownership of all files you upload to VexaTool. We do not claim any ownership or intellectual property rights over your files. By uploading, you confirm that you own or have authorization to use the files.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">VexaTool provides its services without any express or implied warranties. We do not guarantee uninterrupted, error-free operation, accuracy of results, or fitness for a particular purpose. You use our services at your own risk.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">To the maximum extent permitted by law, VexaTool shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services, including loss of data or files during processing.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts located in India.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">If you have questions about these Terms & Conditions:</p>
            <ul className="list-none mt-4 space-y-2 text-muted-foreground">
              <li><strong>Website:</strong> vexatool.com</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
