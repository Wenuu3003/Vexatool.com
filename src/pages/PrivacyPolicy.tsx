import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";
import { useCanonicalUrl } from "@/hooks/useCanonicalUrl";

const PrivacyPolicy = () => {
  const canonicalUrl = useCanonicalUrl();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy | MyPDFs</title>
        <meta
          name="description"
          content="Read the Privacy Policy of MyPDFs. Learn how we handle your data, protect your privacy, and manage uploaded files securely."
        />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

        <div className="prose prose-lg max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to MyPDFs. We are committed to protecting your privacy and ensuring the security of any
              information you share with us. This Privacy Policy explains how we collect, use, and safeguard your data
              when you use our website and online tools. By using MyPDFs, you agree to the terms outlined in this
              policy.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              MyPDFs provides free online tools for PDF manipulation, image conversion, document editing, calculators,
              and other utilities. Our goal is to offer convenient, secure, and user-friendly services without
              compromising your privacy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect minimal information necessary to provide and improve our services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Usage Data:</strong> We may collect anonymous information about how you interact with our
                website, including pages visited, tools used, and time spent on the site.
              </li>
              <li>
                <strong>Uploaded Files:</strong> When you use our tools, you may upload files such as PDFs, images, or
                documents. These files are processed temporarily to provide the requested service.
              </li>
              <li>
                <strong>Device Information:</strong> We may collect basic device information such as browser type,
                operating system, and screen resolution to optimize your experience.
              </li>
              <li>
                <strong>Account Information:</strong> If you create an account, we collect your email address and any
                profile information you choose to provide.
              </li>
            </ul>
          </section>

          {/* How Information Is Used */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The information we collect is used solely for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To provide and operate our online tools and services</li>
              <li>To process your uploaded files and deliver the requested output</li>
              <li>To improve our website functionality and user experience</li>
              <li>To analyze usage patterns and optimize performance</li>
              <li>To communicate important updates or changes to our services</li>
              <li>To respond to your inquiries or support requests</li>
            </ul>
          </section>

          {/* File Handling Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">File Handling Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your file security is our priority. Here is how we handle your uploaded files:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>
                <strong>Temporary Processing:</strong> Files are processed in your browser or on secure servers only for
                the duration needed to complete the requested task.
              </li>
              <li>
                <strong>Automatic Deletion:</strong> Uploaded files are automatically deleted from our servers after
                processing. We do not store your files permanently.
              </li>
              <li>
                <strong>No File Sharing:</strong> We do not share, sell, or distribute your uploaded files to any third
                parties.
              </li>
              <li>
                <strong>Client-Side Processing:</strong> Many of our tools process files directly in your browser,
                meaning your files never leave your device.
              </li>
            </ul>
          </section>

          {/* Cookies and Analytics */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies and Analytics</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your experience:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Essential Cookies:</strong> Required for basic website functionality and security.
              </li>
              <li>
                <strong>Analytics Cookies:</strong> We may use Google Analytics to understand how visitors interact with
                our website. This helps us improve our services.
              </li>
              <li>
                <strong>Preference Cookies:</strong> Used to remember your settings and preferences, such as dark mode
                or language selection.
              </li>
              <li>
                <strong>Advertising Cookies:</strong> We may display advertisements through Google AdSense. These
                cookies help show relevant ads based on your interests.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can manage cookie preferences through your browser settings. Disabling certain cookies may affect
              website functionality.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">We may use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Google Analytics:</strong> For website traffic analysis and usage statistics.
              </li>
              <li>
                <strong>Google AdSense:</strong> For displaying advertisements on our website.
              </li>
              <li>
                <strong>Hosting Providers:</strong> To host and deliver our website and services securely.
              </li>
              <li>
                <strong>Authentication Services:</strong> For secure user account management.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              These third-party services have their own privacy policies. We encourage you to review them for more
              information about their data practices.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Secure HTTPS encryption for all data transmission</li>
              <li>Regular security audits and updates</li>
              <li>Limited access to personal data by authorized personnel only</li>
              <li>Secure server infrastructure with industry-standard protections</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              While we strive to protect your data, no method of transmission over the internet is completely secure. We
              cannot guarantee absolute security but take all reasonable precautions.
            </p>
          </section>

          {/* Children's Information */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Children's Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              MyPDFs is not intended for children under 13 years of age. We do not knowingly collect personal
              information from children. If you believe we have inadvertently collected information from a child, please
              contact us immediately, and we will take steps to delete such information.
            </p>
          </section>

          {/* User Consent */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">User Consent</h2>
            <p className="text-muted-foreground leading-relaxed">
              By using MyPDFs, you consent to the collection and use of information as described in this Privacy Policy.
              If you do not agree with our practices, please do not use our website or services.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Request access to your personal data</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and associated data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal
              requirements. We will notify you of significant changes by posting the updated policy on this page with a
              new "Last updated" date. We encourage you to review this page periodically.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices,
              please contact us:
            </p>
            <ul className="list-none mt-4 space-y-2 text-muted-foreground">
              <li>
                <strong>Email:</strong> welovepdfs3003@gmail.com
              </li>
              <li>
                <strong>Website:</strong> mypdfs.in
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We will respond to your inquiries as soon as possible and within the timeframes required by applicable
              law.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
