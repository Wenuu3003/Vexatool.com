import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";
import { useCanonicalUrl } from "@/hooks/useCanonicalUrl";

const TermsAndConditions = () => {
  const canonicalUrl = useCanonicalUrl();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms & Conditions | MyPDFs</title>
        <meta
          name="description"
          content="Read the Terms & Conditions of MyPDFs. Understand your rights and responsibilities when using our free online PDF tools and services."
        />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Terms & Conditions</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

        <div className="prose prose-lg max-w-none space-y-8">
          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to MyPDFs. By accessing or using our website and services, you agree to be bound by these Terms &
              Conditions. If you do not agree with any part of these terms, you should not use our website or services.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              These terms apply to all visitors, users, and others who access or use MyPDFs. Please read them carefully
              before using our tools and services.
            </p>
          </section>

          {/* Description of Services */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Description of Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              MyPDFs provides free online tools including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>PDF manipulation tools (merge, split, compress, convert, rotate, etc.)</li>
              <li>Image conversion and editing tools</li>
              <li>Document conversion tools</li>
              <li>QR code generation and scanning</li>
              <li>Various calculators and utility tools</li>
              <li>AI-powered tools and features</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We reserve the right to modify, suspend, or discontinue any service at any time without prior notice.
            </p>
          </section>

          {/* Use of Website and Tools */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Use of Website and Tools</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">By using MyPDFs, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use our services only for lawful purposes</li>
              <li>Not upload malicious files, viruses, or harmful content</li>
              <li>Not attempt to gain unauthorized access to our systems</li>
              <li>Not use automated tools or bots to access our services excessively</li>
              <li>Not reproduce, duplicate, or exploit our services for commercial purposes without permission</li>
              <li>Comply with all applicable local, national, and international laws</li>
            </ul>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">User Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">As a user of MyPDFs, you are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Ensuring you have the right to upload and process any files you submit</li>
              <li>Maintaining the confidentiality of your account credentials if you create an account</li>
              <li>Any activity that occurs under your account</li>
              <li>Backing up your original files before using our conversion or editing tools</li>
              <li>Verifying the output files meet your requirements before use</li>
            </ul>
          </section>

          {/* File Ownership and Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">File Ownership and Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain full ownership and rights to all files you upload to MyPDFs. We do not claim any ownership,
              copyright, or intellectual property rights over your files.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">By uploading files, you confirm that:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>You own the files or have proper authorization to use them</li>
              <li>The files do not infringe on any third-party rights</li>
              <li>The files do not contain illegal, harmful, or offensive content</li>
              <li>You grant us a temporary license to process your files solely to provide the requested service</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The MyPDFs website, including its design, logo, content, features, and functionality, is owned by MyPDFs
              and is protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You may not copy, modify, distribute, or create derivative works from any part of our website without our
              express written permission.
            </p>
          </section>

          {/* Service Availability and Limitations */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Service Availability and Limitations</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              While we strive to provide reliable services, please note:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Our services are provided on an "as is" and "as available" basis</li>
              <li>We do not guarantee uninterrupted or error-free operation</li>
              <li>File size limits and processing capabilities may vary</li>
              <li>We may impose usage limits to ensure fair access for all users</li>
              <li>Maintenance or updates may temporarily affect service availability</li>
            </ul>
          </section>

          {/* Disclaimer of Warranties */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              MyPDFs provides its services without any express or implied warranties. We disclaim all warranties
              including, but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Warranties of merchantability or fitness for a particular purpose</li>
              <li>Warranties that our services will meet your specific requirements</li>
              <li>Warranties regarding the accuracy or reliability of results</li>
              <li>Warranties that the service will be uninterrupted, secure, or error-free</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You use our services at your own risk. We recommend keeping backups of your original files.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, MyPDFs and its operators shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Your use or inability to use our services</li>
              <li>Any errors, mistakes, or inaccuracies in the output files</li>
              <li>Loss of data or files during processing</li>
              <li>Unauthorized access to your files or data</li>
              <li>Any third-party content or services linked from our website</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Our total liability for any claims shall not exceed the amount you paid to use our services (if any).
            </p>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our website may contain links to third-party websites or services. These links are provided for your
              convenience and do not signify our endorsement. We are not responsible for the content, privacy practices,
              or terms of any third-party websites.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">If you create an account on MyPDFs:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must notify us immediately of any unauthorized use</li>
              <li>We may suspend or terminate accounts that violate these terms</li>
            </ul>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify, defend, and hold harmless MyPDFs and its operators from any claims, damages,
              losses, liabilities, and expenses arising from your use of our services, your violation of these terms, or
              your infringement of any third-party rights.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms & Conditions at any time. Changes will be effective immediately
              upon posting on this page with an updated "Last updated" date. Your continued use of our services after
              any changes constitutes acceptance of the new terms.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We encourage you to review these terms periodically to stay informed about our policies.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms & Conditions shall be governed by and construed in accordance with the laws of India. Any
              disputes arising from these terms or your use of our services shall be subject to the exclusive
              jurisdiction of the courts located in India.
            </p>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Severability</h2>
            <p className="text-muted-foreground leading-relaxed">
              If any provision of these Terms & Conditions is found to be invalid or unenforceable, the remaining
              provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum
              extent necessary to make it valid and enforceable.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions or concerns about these Terms & Conditions, please contact us:
            </p>
            <ul className="list-none mt-4 space-y-2 text-muted-foreground">
              <li>
                <strong>Email:</strong> welovepdf3003@gmail.com
              </li>
              <li>
                <strong>Website:</strong> mypdfs.in
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We appreciate your trust in MyPDFs and are committed to providing you with reliable, free online tools for
              all your document needs.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;
