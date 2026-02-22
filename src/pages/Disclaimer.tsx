import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CanonicalHead } from "@/components/CanonicalHead";

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-background">
      <CanonicalHead
        title="Disclaimer | VexaTool - Free Online Tools"
        description="Read the disclaimer for VexaTool. Understand the limitations and terms of using our free online tools."
        keywords="disclaimer, VexaTool disclaimer, tool accuracy, terms of use"
      />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Disclaimer</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 2026</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">General Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              The information and tools provided on VexaTool (vexatool.com) are offered on an "as is" basis for general informational and personal use purposes only. While we strive to ensure accuracy and reliability, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the tools, information, or services provided on this website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Tool Accuracy Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              The tools available on VexaTool, including but not limited to PDF tools, image tools, calculators, and QR code tools, are designed to assist you with common tasks. However, the results produced by these tools may not always be perfectly accurate. We recommend verifying important outputs independently, especially for professional, legal, financial, or medical purposes.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Calculators on this platform (including BMI, EMI, percentage, and age calculators) provide estimates based on standard formulas. They should not be used as a substitute for professional advice from qualified experts in the relevant field.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">No Professional Advice</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nothing on VexaTool constitutes professional advice. The tools and content on this website should not be treated as:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Financial or investment advice</li>
              <li>Medical or health advice</li>
              <li>Legal counsel</li>
              <li>Professional document certification or validation</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Always consult with a qualified professional for specific advice related to your situation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">External Links Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              VexaTool may contain links to external websites or resources. These links are provided for convenience and informational purposes only. We have no control over the content, privacy policies, or practices of third-party websites and assume no responsibility for them. Visiting external links is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Advertisement Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              VexaTool may display advertisements provided by third-party advertising networks such as Google AdSense. We do not endorse or have control over the products, services, or content advertised by third parties. Any interaction with advertisements is solely between you and the advertiser. We are not responsible for any transactions, claims, or issues arising from third-party advertisements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">File Processing Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              While our tools are designed to process files securely and accurately, we cannot guarantee that every file conversion, compression, or edit will produce perfect results. We strongly recommend keeping backup copies of your original files before using any processing tools. VexaTool is not liable for any data loss, file corruption, or unexpected results that may occur during file processing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall VexaTool, its operators, or contributors be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of your access to or use of this website and its tools. This includes, without limitation, damages for loss of data, profits, or business opportunities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions or concerns about this Disclaimer, please contact us at:
            </p>
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

export default Disclaimer;
